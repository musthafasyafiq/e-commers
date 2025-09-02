import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(private configService: ConfigService) {}

  generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    
    return otp;
  }

  generateAlphanumericOtp(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return otp;
  }

  isValidOtp(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  isExpired(createdAt: Date, expiryMinutes: number = 10): boolean {
    const now = new Date();
    const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);
    return now > expiryTime;
  }
}
