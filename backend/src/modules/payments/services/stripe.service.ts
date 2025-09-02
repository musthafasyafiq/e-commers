import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '../../../entities/payment.entity';

interface StripePaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  paymentMethod: string;
}

interface StripePaymentResponse {
  transactionId: string;
  paymentUrl: string;
  redirectUrl: string;
  response: any;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly secretKey: string;
  private readonly publishableKey: string;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.publishableKey = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
  }

  async createPayment(request: StripePaymentRequest): Promise<StripePaymentResponse> {
    try {
      // Initialize Stripe (would normally use stripe npm package)
      const stripe = require('stripe')(this.secretKey);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: request.amount * 100, // Stripe uses cents
        currency: request.currency.toLowerCase(),
        metadata: {
          orderId: request.orderId,
        },
        receipt_email: request.customerEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create checkout session for hosted payment page
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: request.currency.toLowerCase(),
              product_data: {
                name: `Order ${request.orderId}`,
              },
              unit_amount: request.amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
        metadata: {
          orderId: request.orderId,
        },
      });

      return {
        transactionId: paymentIntent.id,
        paymentUrl: session.url,
        redirectUrl: session.url,
        response: {
          paymentIntent,
          session,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create Stripe payment', error);
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
      const stripe = require('stripe')(this.secretKey);
      
      // Verify webhook signature (payload should include headers)
      const sig = payload.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(payload.body, sig, this.webhookSecret);
      } catch (err) {
        throw new Error(`Webhook signature verification failed: ${err.message}`);
      }

      let status: PaymentStatus;
      let paidAt: Date | undefined;
      let transactionId: string;

      switch (event.type) {
        case 'payment_intent.succeeded':
          status = PaymentStatus.COMPLETED;
          paidAt = new Date(event.data.object.created * 1000);
          transactionId = event.data.object.id;
          break;
        case 'payment_intent.payment_failed':
          status = PaymentStatus.FAILED;
          transactionId = event.data.object.id;
          break;
        case 'payment_intent.canceled':
          status = PaymentStatus.CANCELLED;
          transactionId = event.data.object.id;
          break;
        case 'charge.dispute.created':
          status = PaymentStatus.DISPUTED;
          transactionId = event.data.object.payment_intent;
          break;
        default:
          this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
          return null;
      }

      return {
        transactionId,
        status,
        paidAt,
        response: event,
      };
    } catch (error) {
      this.logger.error('Failed to handle Stripe webhook', error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId: string, amount: number): Promise<{ refundId: string }> {
    try {
      const stripe = require('stripe')(this.secretKey);

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount * 100, // Stripe uses cents
        reason: 'requested_by_customer',
      });

      return {
        refundId: refund.id,
      };
    } catch (error) {
      this.logger.error('Failed to refund Stripe payment', error);
      throw error;
    }
  }

  async retrievePayment(paymentIntentId: string): Promise<any> {
    try {
      const stripe = require('stripe')(this.secretKey);
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to retrieve Stripe payment', error);
      throw error;
    }
  }
}
