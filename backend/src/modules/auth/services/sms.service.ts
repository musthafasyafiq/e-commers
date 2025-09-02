import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async sendOtp(phoneNumber: string, otp: string) {
    if (!this.twilioClient) {
      console.log(`SMS Service not configured. OTP for ${phoneNumber}: ${otp}`);
      return;
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: `Your ModernShop verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });

      console.log(`SMS sent successfully. SID: ${message.sid}`);
      return message;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendOrderNotification(phoneNumber: string, orderNumber: string, status: string) {
    if (!this.twilioClient) {
      console.log(`SMS Service not configured. Order notification for ${phoneNumber}: Order ${orderNumber} is ${status}`);
      return;
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: `ModernShop: Your order #${orderNumber} is now ${status}. Track your order at ${this.configService.get('FRONTEND_URL')}/orders/${orderNumber}`,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });

      return message;
    } catch (error) {
      console.error('Failed to send order notification SMS:', error);
      throw error;
    }
  }

  async sendPromotionSms(phoneNumber: string, promoCode: string, discount: string) {
    if (!this.twilioClient) {
      console.log(`SMS Service not configured. Promotion SMS for ${phoneNumber}: ${discount} off with code ${promoCode}`);
      return;
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: `🎉 ModernShop Special Offer! Get ${discount} off your next purchase with code: ${promoCode}. Shop now!`,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });

      return message;
    } catch (error) {
      console.error('Failed to send promotion SMS:', error);
      throw error;
    }
  }
}
