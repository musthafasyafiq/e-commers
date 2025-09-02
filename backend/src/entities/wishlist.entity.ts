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
import { WishlistItem } from './wishlist-item.entity';

@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'My Wishlist' })
  name: string;

  @Column({ default: true })
  isDefault: boolean;

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.wishlist)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.wishlist, { cascade: true })
  items: WishlistItem[];

  // Virtual properties
  get itemCount(): number {
    return this.items?.length || 0;
  }
}
