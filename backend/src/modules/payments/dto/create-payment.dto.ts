import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentProvider } from '../../../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID to pay for' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ 
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ 
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.MIDTRANS
  })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ description: 'Payment amount', example: 100000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'IDR', default: 'IDR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Payment description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Use escrow for this payment', default: false })
  @IsOptional()
  useEscrow?: boolean;
}
