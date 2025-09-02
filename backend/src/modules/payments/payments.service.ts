import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { User } from '../../entities/user.entity';
import { MidtransService } from './services/midtrans.service';
import { StripeService } from './services/stripe.service';
import { EscrowService } from './services/escrow.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod, PaymentProvider } from '../../entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private midtransService: MidtransService,
    private stripeService: StripeService,
    private escrowService: EscrowService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const { orderId, method, provider, amount, currency = 'IDR' } = createPaymentDto;

    // Validate order exists and belongs to user
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      order,
      user: order.user,
      method,
      provider,
      amount,
      currency,
      status: PaymentStatus.PENDING,
      description: `Payment for order ${order.id}`,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Process payment based on provider
    let paymentResult;
    try {
      switch (provider) {
        case PaymentProvider.MIDTRANS:
          paymentResult = await this.midtransService.createPayment({
            orderId: order.id,
            amount,
            currency,
            customerDetails: {
              firstName: order.user.firstName,
              lastName: order.user.lastName,
              email: order.user.email,
              phone: order.user.phone,
            },
            paymentMethod: method,
          });
          break;

        case PaymentProvider.STRIPE:
          paymentResult = await this.stripeService.createPayment({
            orderId: order.id,
            amount,
            currency,
            customerEmail: order.user.email,
            paymentMethod: method,
          });
          break;

        default:
          throw new BadRequestException('Unsupported payment provider');
      }

      // Update payment with provider response
      savedPayment.providerTransactionId = paymentResult.transactionId;
      savedPayment.providerResponse = paymentResult.response;
      savedPayment.metadata = {
        ...savedPayment.metadata,
        paymentUrl: paymentResult.paymentUrl,
        redirectUrl: paymentResult.redirectUrl,
      };

      await this.paymentRepository.save(savedPayment);

      return savedPayment;
    } catch (error) {
      // Update payment status to failed
      savedPayment.status = PaymentStatus.FAILED;
      savedPayment.failureReason = error.message;
      await this.paymentRepository.save(savedPayment);
      throw error;
    }
  }

  async handleWebhook(provider: PaymentProvider, payload: any): Promise<void> {
    let paymentData;

    switch (provider) {
      case PaymentProvider.MIDTRANS:
        paymentData = await this.midtransService.handleWebhook(payload);
        break;
      case PaymentProvider.STRIPE:
        paymentData = await this.stripeService.handleWebhook(payload);
        break;
      default:
        throw new BadRequestException('Unsupported payment provider');
    }

    const payment = await this.paymentRepository.findOne({
      where: { providerTransactionId: paymentData.transactionId },
      relations: ['order', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    payment.status = paymentData.status;
    payment.paidAt = paymentData.paidAt;
    payment.providerResponse = paymentData.response;

    await this.paymentRepository.save(payment);

    // Update order status if payment is successful
    if (paymentData.status === PaymentStatus.COMPLETED) {
      payment.order.paymentStatus = 'paid';
      payment.order.status = 'processing';
      await this.orderRepository.save(payment.order);

      // Handle escrow if applicable
      if (payment.metadata?.useEscrow) {
        await this.escrowService.holdFunds({
          paymentId: payment.id,
          amount: payment.amount,
          sellerId: payment.metadata.sellerId,
          buyerId: payment.user.id,
        });
      }
    }
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['order', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is not eligible for refund');
    }

    const refundAmount = amount || payment.amount;

    let refundResult;
    switch (payment.provider) {
      case PaymentProvider.MIDTRANS:
        refundResult = await this.midtransService.refundPayment(
          payment.providerTransactionId,
          refundAmount,
        );
        break;
      case PaymentProvider.STRIPE:
        refundResult = await this.stripeService.refundPayment(
          payment.providerTransactionId,
          refundAmount,
        );
        break;
      default:
        throw new BadRequestException('Unsupported payment provider');
    }

    // Update payment record
    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAmount = refundAmount;
    payment.refundedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      refundTransactionId: refundResult.refundId,
    };

    await this.paymentRepository.save(payment);

    // Update order status
    payment.order.paymentStatus = 'refunded';
    payment.order.status = 'cancelled';
    await this.orderRepository.save(payment.order);

    return payment;
  }
}
