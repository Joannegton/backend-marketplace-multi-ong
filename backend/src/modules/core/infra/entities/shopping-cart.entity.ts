import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ShoppingCartStatus {
  ACTIVE = 'active',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
}

export type CartItemType = {
  productId: string;
  productName: string;
  quantity: number;
  priceSnapshot: number;
  subtotal: number;
};

@Entity('shopping_carts')
export class ShoppingCartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'json',
    default: [],
  })
  items: CartItemType[];

  @Column({
    type: 'enum',
    enum: ShoppingCartStatus,
    default: ShoppingCartStatus.ACTIVE,
  })
  status: ShoppingCartStatus;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static create(props: Partial<ShoppingCartEntity>): ShoppingCartEntity {
    const cart = new ShoppingCartEntity();
    Object.assign(cart, props);
    return cart;
  }
}
