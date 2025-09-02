import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../../entities/payment.entity';
import { User } from '../../../entities/user.entity';
import { Order } from '../../../entities/order.entity';

interface EscrowHoldRequest {
  paymentId: string;
  amount: number;
  sellerId: string;
  buyerId: string;
}

interface EscrowTransaction {
  id: string;
  paymentId: string;
  amount: number;
  sellerId: string;
  buyerId: string;
  status: 'held' | 'released' | 'refunded';
  heldAt: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  releaseCondition?: string;
}

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private escrowTransactions: Map<string, EscrowTransaction> = new Map();

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async holdFunds(request: EscrowHoldRequest): Promise<EscrowTransaction> {
    try {
      // Validate payment exists
      const payment = await this.paymentRepository.findOne({
        where: { id: request.paymentId },
        relations: ['order', 'user'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Validate seller and buyer exist
      const seller = await this.userRepository.findOne({
        where: { id: request.sellerId },
      });

      const buyer = await this.userRepository.findOne({
        where: { id: request.buyerId },
      });

      if (!seller || !buyer) {
        throw new NotFoundException('Seller or buyer not found');
      }

      // Create escrow transaction
      const escrowTransaction: EscrowTransaction = {
        id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: request.paymentId,
        amount: request.amount,
        sellerId: request.sellerId,
        buyerId: request.buyerId,
        status: 'held',
        heldAt: new Date(),
        releaseCondition: 'delivery_confirmation',
      };

      // Store in memory (in production, this would be in database)
      this.escrowTransactions.set(escrowTransaction.id, escrowTransaction);

      // Update payment metadata
      payment.metadata = {
        ...payment.metadata,
        escrowTransactionId: escrowTransaction.id,
        escrowStatus: 'held',
      };

      await this.paymentRepository.save(payment);

      this.logger.log(`Funds held in escrow: ${escrowTransaction.id}`);

      return escrowTransaction;
    } catch (error) {
      this.logger.error('Failed to hold funds in escrow', error);
      throw error;
    }
  }

  async releaseFunds(escrowTransactionId: string, reason: string = 'delivery_confirmed'): Promise<EscrowTransaction> {
    try {
      const escrowTransaction = this.escrowTransactions.get(escrowTransactionId);

      if (!escrowTransaction) {
        throw new NotFoundException('Escrow transaction not found');
      }

      if (escrowTransaction.status !== 'held') {
        throw new BadRequestException('Funds are not currently held in escrow');
      }

      // Release funds to seller
      escrowTransaction.status = 'released';
      escrowTransaction.releasedAt = new Date();
      escrowTransaction.releaseCondition = reason;

      this.escrowTransactions.set(escrowTransactionId, escrowTransaction);

      // Update payment metadata
      const payment = await this.paymentRepository.findOne({
        where: { id: escrowTransaction.paymentId },
      });

      if (payment) {
        payment.metadata = {
          ...payment.metadata,
          escrowStatus: 'released',
          escrowReleasedAt: new Date().toISOString(),
          escrowReleaseReason: reason,
        };

        await this.paymentRepository.save(payment);
      }

      // In a real implementation, you would transfer funds to seller's account
      await this.transferFundsToSeller(escrowTransaction.sellerId, escrowTransaction.amount);

      this.logger.log(`Funds released from escrow: ${escrowTransactionId} to seller: ${escrowTransaction.sellerId}`);

      return escrowTransaction;
    } catch (error) {
      this.logger.error('Failed to release funds from escrow', error);
      throw error;
    }
  }

  async refundFunds(escrowTransactionId: string, reason: string = 'buyer_dispute'): Promise<EscrowTransaction> {
    try {
      const escrowTransaction = this.escrowTransactions.get(escrowTransactionId);

      if (!escrowTransaction) {
        throw new NotFoundException('Escrow transaction not found');
      }

      if (escrowTransaction.status !== 'held') {
        throw new BadRequestException('Funds are not currently held in escrow');
      }

      // Refund funds to buyer
      escrowTransaction.status = 'refunded';
      escrowTransaction.refundedAt = new Date();

      this.escrowTransactions.set(escrowTransactionId, escrowTransaction);

      // Update payment metadata
      const payment = await this.paymentRepository.findOne({
        where: { id: escrowTransaction.paymentId },
      });

      if (payment) {
        payment.metadata = {
          ...payment.metadata,
          escrowStatus: 'refunded',
          escrowRefundedAt: new Date().toISOString(),
          escrowRefundReason: reason,
        };

        await this.paymentRepository.save(payment);
      }

      // In a real implementation, you would refund to buyer's original payment method
      await this.refundToBuyer(escrowTransaction.buyerId, escrowTransaction.amount);

      this.logger.log(`Funds refunded from escrow: ${escrowTransactionId} to buyer: ${escrowTransaction.buyerId}`);

      return escrowTransaction;
    } catch (error) {
      this.logger.error('Failed to refund funds from escrow', error);
      throw error;
    }
  }

  async getEscrowTransaction(escrowTransactionId: string): Promise<EscrowTransaction> {
    const escrowTransaction = this.escrowTransactions.get(escrowTransactionId);

    if (!escrowTransaction) {
      throw new NotFoundException('Escrow transaction not found');
    }

    return escrowTransaction;
  }

  async getEscrowTransactionsByPayment(paymentId: string): Promise<EscrowTransaction[]> {
    const transactions = Array.from(this.escrowTransactions.values())
      .filter(transaction => transaction.paymentId === paymentId);

    return transactions;
  }

  async getEscrowTransactionsBySeller(sellerId: string): Promise<EscrowTransaction[]> {
    const transactions = Array.from(this.escrowTransactions.values())
      .filter(transaction => transaction.sellerId === sellerId);

    return transactions;
  }

  async autoReleaseExpiredEscrows(): Promise<void> {
    try {
      const now = new Date();
      const autoReleaseThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      for (const [id, transaction] of this.escrowTransactions.entries()) {
        if (
          transaction.status === 'held' &&
          now.getTime() - transaction.heldAt.getTime() > autoReleaseThreshold
        ) {
          await this.releaseFunds(id, 'auto_release_expired');
          this.logger.log(`Auto-released expired escrow: ${id}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to auto-release expired escrows', error);
    }
  }

  private async transferFundsToSeller(sellerId: string, amount: number): Promise<void> {
    // In a real implementation, this would integrate with banking APIs
    // to transfer funds to the seller's account
    this.logger.log(`Transferring ${amount} to seller ${sellerId}`);
    
    // Update seller's wallet balance
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });

    if (seller) {
      seller.walletBalance = (seller.walletBalance || 0) + amount;
      await this.userRepository.save(seller);
    }
  }

  private async refundToBuyer(buyerId: string, amount: number): Promise<void> {
    // In a real implementation, this would process refund through payment gateway
    this.logger.log(`Refunding ${amount} to buyer ${buyerId}`);
    
    // Update buyer's wallet balance as credit
    const buyer = await this.userRepository.findOne({
      where: { id: buyerId },
    });

    if (buyer) {
      buyer.walletBalance = (buyer.walletBalance || 0) + amount;
      await this.userRepository.save(buyer);
    }
  }
}
