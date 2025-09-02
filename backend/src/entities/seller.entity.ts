import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';

export enum SellerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum SellerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column({ type: 'enum', enum: SellerType })
  type: SellerType;

  @Column({ type: 'enum', enum: SellerStatus, default: SellerStatus.PENDING })
  status: SellerStatus;

  @Column({ nullable: true })
  businessRegistrationNumber: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  businessLicense: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'json', nullable: true })
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ type: 'json', nullable: true })
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    routingNumber?: string;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.5 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSales: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'json', nullable: true })
  settings: {
    autoAcceptOrders: boolean;
    processingTime: number;
    returnPolicy: string;
    shippingPolicy: string;
  };

  @Column({ type: 'json', nullable: true })
  documents: {
    identityDocument: string;
    businessLicense?: string;
    taxCertificate?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  suspendedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.seller)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  // Virtual properties
  get isActive(): boolean {
    return this.status === SellerStatus.APPROVED;
  }

  get conversionRate(): number {
    if (this.totalOrders === 0) return 0;
    return (this.totalSales / this.totalOrders) * 100;
  }
}
