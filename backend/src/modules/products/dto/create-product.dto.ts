import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
  MaxLength,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../../entities/product.entity';

class CreateProductVariantDto {
  @ApiProperty({ description: 'Variant name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Variant SKU' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Variant price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Variant compare price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiProperty({ description: 'Variant stock' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'Variant weight', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Variant image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Variant options (e.g., color, size)' })
  @IsOptional()
  options?: Record<string, string>;
}

class CreateProductImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Image alt text', required: false })
  @IsOptional()
  @IsString()
  altText?: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Short description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ description: 'Product SKU' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Compare price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiProperty({ description: 'Cost price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'Low stock threshold', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiProperty({ description: 'Product weight', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Product dimensions', required: false })
  @IsOptional()
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @ApiProperty({ description: 'Product status', enum: ProductStatus, required: false })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: 'Is featured product', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Is digital product', required: false })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiProperty({ description: 'Track quantity', required: false })
  @IsOptional()
  @IsBoolean()
  trackQuantity?: boolean;

  @ApiProperty({ description: 'Allow backorder', required: false })
  @IsOptional()
  @IsBoolean()
  allowBackorder?: boolean;

  @ApiProperty({ description: 'SEO metadata', required: false })
  @IsOptional()
  seoMetadata?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };

  @ApiProperty({ description: 'Product attributes', required: false })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiProperty({ description: 'Product tags', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Product variants', type: [CreateProductVariantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @ApiProperty({ description: 'Product images', type: [CreateProductImageDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
