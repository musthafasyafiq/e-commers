import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '../../../entities/payment.entity';

interface MidtransPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
}

interface MidtransPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  redirectUrl: string;
  response: any;
}

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private readonly serverKey: string;
  private readonly clientKey: string;
  private readonly isProduction: boolean;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    this.clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    this.baseUrl = this.isProduction 
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2';
  }

  async createPayment(request: MidtransPaymentRequest): Promise<MidtransPaymentResponse> {
    try {
      const payload = {
        transaction_details: {
          order_id: request.orderId,
          gross_amount: request.amount,
        },
        customer_details: {
          first_name: request.customerDetails.firstName,
          last_name: request.customerDetails.lastName,
          email: request.customerDetails.email,
          phone: request.customerDetails.phone,
        },
        credit_card: {
          secure: true,
        },
        callbacks: {
          finish: `${this.configService.get('FRONTEND_URL')}/payment/finish`,
        },
      };

      const response = await fetch(`${this.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Midtrans API error: ${data.status_message}`);
      }

      return {
        transactionId: data.transaction_id,
        paymentUrl: data.redirect_url,
        redirectUrl: data.redirect_url,
        response: data,
      };
    } catch (error) {
      this.logger.error('Failed to create Midtrans payment', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<{
    transactionId: string;
    status: PaymentStatus;
    paidAt?: Date;
    response: any;
  }> {
    try {
      // Verify webhook signature
      const orderId = payload.order_id;
      const statusCode = payload.status_code;
      const grossAmount = payload.gross_amount;
      const serverKey = this.serverKey;
      
      const signatureKey = payload.signature_key;
      const expectedSignature = this.createSignature(orderId, statusCode, grossAmount, serverKey);
      
      if (signatureKey !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }

      // Map Midtrans status to our PaymentStatus
      let status: PaymentStatus;
      let paidAt: Date | undefined;

      switch (payload.transaction_status) {
        case 'capture':
        case 'settlement':
          status = PaymentStatus.COMPLETED;
          paidAt = new Date();
          break;
        case 'pending':
          status = PaymentStatus.PENDING;
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
          status = PaymentStatus.FAILED;
          break;
        case 'refund':
        case 'partial_refund':
          status = PaymentStatus.REFUNDED;
          break;
        default:
          status = PaymentStatus.PENDING;
      }

      return {
        transactionId: payload.transaction_id,
        status,
        paidAt,
        response: payload,
      };
    } catch (error) {
      this.logger.error('Failed to handle Midtrans webhook', error);
      throw error;
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ refundId: string }> {
    try {
      const payload = {
        refund_amount: amount,
        reason: 'Customer requested refund',
      };

      const response = await fetch(`${this.baseUrl}/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Midtrans refund error: ${data.status_message}`);
      }

      return {
        refundId: data.refund_id,
      };
    } catch (error) {
      this.logger.error('Failed to refund Midtrans payment', error);
      throw error;
    }
  }

  private createSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha512');
    hash.update(orderId + statusCode + grossAmount + serverKey);
    return hash.digest('hex');
  }
}
