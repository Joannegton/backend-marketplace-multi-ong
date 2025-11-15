import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_REPOSITORY } from '../../core.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { ShoppingCartStatus } from '../../domain/shopping-cart';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ShoppingCartEntity } from '../entities/shopping-cart.entity';

@Injectable()
export class ExpireShoppingCartsJob {
    private readonly cartTtlMilliseconds: number;

    constructor(
        @InjectRepository(ShoppingCartEntity)
        private readonly cartRepository: Repository<ShoppingCartEntity>,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly configService: ConfigService,
    ) {
        const cartTtlMinutes = this.configService.get<number>('CART_TTL_MINUTES', 20);
        this.cartTtlMilliseconds = cartTtlMinutes * 60 * 1000;
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async expireShoppingCarts(): Promise<void> {
        try {
            const now = new Date();
            const expiryThreshold = new Date(now.getTime() - this.cartTtlMilliseconds);

            const expiredCarts = await this.cartRepository.find({
                where: {
                    status: ShoppingCartStatus.ACTIVE,
                    expiresAt: LessThan(expiryThreshold),
                },
            });

            if (expiredCarts.length === 0) {
                return;
            }

            let clearedCount = 0;

            for (const cartEntity of expiredCarts) {
                try {
                    const productIds = cartEntity.items.map(
                        (item: any) => item.productId,
                    );
                    const products = await this.productRepository.findByIds(
                        productIds,
                    );

                    for (const item of cartEntity.items) {
                        const product = products.find(
                            (p) => p.id === item.productId,
                        );
                        if (product) {
                            try {
                                product.releaseReservation(item.quantity);
                                await this.productRepository.save(product);
                            } catch (releaseError) {
                                this.logger.warn('Failed to release reservation for product', {
                                    productId: product.id,
                                    quantity: item.quantity,
                                    error: releaseError.message,
                                    category: 'business',
                                });
                            }
                        }
                    }

                    cartEntity.status = ShoppingCartStatus.EXPIRED;
                    await this.cartRepository.save(cartEntity);

                    clearedCount++;

                    this.logger.info('Expired shopping cart cleared', {
                        cartId: cartEntity.id,
                        itemsCount: cartEntity.items.length,
                        expiresAt: cartEntity.expiresAt,
                        category: 'business',
                    });
                } catch (error) {
                    this.logger.error('Failed to clear shopping cart', {
                        cartId: cartEntity.id,
                        error: error.message,
                        stack: error.stack,
                        category: 'business',
                    });
                }
            }

            if (clearedCount > 0) {
                this.logger.info('Shopping cart cleanup completed', {
                    clearedCount,
                    totalExpiredCarts: expiredCarts.length,
                    timestamp: now,
                    category: 'business',
                });
            }
        } catch (error) {
            this.logger.error('Shopping cart expiration job failed', {
                error: error.message,
                stack: error.stack,
                category: 'business',
            });
        }
    }
}
