import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSellerDto {
  @ApiProperty({ description: 'Business name' })
  @IsString()
  businessName: string;

  @ApiProperty({ description: 'Business description' })
  @IsString()
  businessDescription: string;

  @ApiProperty({ description: 'Business email', required: false })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiProperty({ description: 'Business phone', required: false })
  @IsOptional()
  @IsPhoneNumber()
  businessPhone?: string;

  @ApiProperty({ description: 'Business address' })
  @IsString()
  businessAddress: string;

  @ApiProperty({ description: 'Business website', required: false })
  @IsOptional()
  @IsUrl()
  businessWebsite?: string;

  @ApiProperty({ description: 'Bank account number' })
  @IsString()
  bankAccountNumber: string;

  @ApiProperty({ description: 'Bank name' })
  @IsString()
  bankName: string;

  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  accountHolderName: string;
}
