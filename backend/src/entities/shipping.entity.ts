import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum ShippingProvider {
  JNE = 'jne',
  JNT = 'jnt',
  SICEPAT = 'sicepat',
  POS = 'pos',
  TIKI = 'tiki',
  NINJA = 'ninja',
  ANTERAJA = 'anteraja',
  CUSTOM = 'custom',
}

export enum ShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
}

@Entity('shipping')
export class Shipping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  trackingNumber: string;

  @Column({ type: 'enum', enum: ShippingProvider })
  provider: ShippingProvider;

  @Column()
  serviceName: string;

  @Column({ type: 'enum', enum: ShippingStatus, default: ShippingStatus.PENDING })
  status: ShippingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'json', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Column({ type: 'int', nullable: true })
  estimatedDeliveryDays: number;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'json', nullable: true })
  trackingHistory: Array<{
    status: string;
    description: string;
    location?: string;
    timestamp: Date;
  }>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Order, (order) => order.shipping)
  @JoinColumn()
  order: Order;

  @Column()
  orderId: string;

  // Virtual properties
  get isDelivered(): boolean {
    return this.status === ShippingStatus.DELIVERED;
  }

  get isInTransit(): boolean {
    return [
      ShippingStatus.SHIPPED,
      ShippingStatus.IN_TRANSIT,
      ShippingStatus.OUT_FOR_DELIVERY,
    ].includes(this.status);
  }
}
