import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { User, UserStatus } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification tokens
    const emailVerificationToken = uuidv4();
    const phoneVerificationToken = this.otpService.generateOtp();

    // Create user
    const user = this.userRepository.create({
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken,
      phoneVerificationToken,
      status: UserStatus.PENDING_VERIFICATION,
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(email, emailVerificationToken);

    // Send SMS OTP
    if (phone) {
      await this.smsService.sendOtp(phone, phoneVerificationToken);
    }

    return {
      message: 'Registration successful. Please verify your email and phone.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    // Find user by email or phone
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active. Please verify your account.');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;

    // If both email and phone are verified, activate account
    if (user.isPhoneVerified || !user.phone) {
      user.status = UserStatus.ACTIVE;
    }

    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async verifyPhone(verifyOtpDto: VerifyOtpDto) {
    const { phone, otp } = verifyOtpDto;

    const user = await this.userRepository.findOne({
      where: { phone, phoneVerificationToken: otp },
    });

    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = null;

    // If both email and phone are verified, activate account
    if (user.isEmailVerified) {
      user.status = UserStatus.ACTIVE;
    }

    await this.userRepository.save(user);

    return { message: 'Phone verified successfully' };
  }

  async resendEmailVerification(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerificationToken = uuidv4();
    user.emailVerificationToken = emailVerificationToken;
    await this.userRepository.save(user);

    await this.emailService.sendVerificationEmail(email, emailVerificationToken);

    return { message: 'Verification email sent' };
  }

  async resendPhoneOtp(phone: string) {
    const user = await this.userRepository.findOne({ where: { phone } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone is already verified');
    }

    const phoneVerificationToken = this.otpService.generateOtp();
    user.phoneVerificationToken = phoneVerificationToken;
    await this.userRepository.save(user);

    await this.smsService.sendOtp(phone, phoneVerificationToken);

    return { message: 'OTP sent successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async googleLogin(profile: any) {
    const { email, firstName, lastName, picture } = profile;

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user from Google profile
      user = this.userRepository.create({
        email,
        firstName,
        lastName,
        avatar: picture,
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
        socialAccounts: { google: profile },
        password: await bcrypt.hash(uuidv4(), 12), // Random password
      });
      await this.userRepository.save(user);
    } else {
      // Update social accounts
      user.socialAccounts = { ...user.socialAccounts, google: profile };
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return this.sanitizeUser(user);
    }
    return null;
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    };
  }

  private sanitizeUser(user: User) {
    const { password, emailVerificationToken, phoneVerificationToken, passwordResetToken, ...sanitized } = user;
    return sanitized;
  }
}
