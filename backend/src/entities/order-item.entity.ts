import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Seller } from './seller.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSku: string;

  @Column({ type: 'json', nullable: true })
  productSnapshot: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  selectedOptions: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product, (product) => product.orderItems)
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => ProductVariant, { nullable: true })
  variant: ProductVariant;

  @Column({ nullable: true })
  variantId: string;

  @ManyToOne(() => Seller)
  seller: Seller;

  @Column()
  sellerId: string;

  // Virtual properties
  get totalPrice(): number {
    return this.price * this.quantity;
  }

  get discountAmount(): number {
    if (!this.originalPrice) return 0;
    return (this.originalPrice - this.price) * this.quantity;
  }
}
