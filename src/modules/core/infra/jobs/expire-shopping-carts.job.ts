import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_REPOSITORY } from '../../core.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { ShoppingCartStatus } from '../../domain/shopping-cart';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { ShoppingCartEntity } from '../entities/shopping-cart.entity';

@Injectable()
export class ExpireShoppingCartsJob implements OnModuleInit {
    constructor(
        @InjectRepository(ShoppingCartEntity)
        private readonly cartRepository: Repository<ShoppingCartEntity>,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        // Executa o job imediatamente quando a aplicação inicia
        this.logger.info(
            '🚀 Application started - running initial shopping cart cleanup',
            {
                category: 'business',
            },
        );
        await this.expireShoppingCarts();
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async expireShoppingCarts(): Promise<void> {
        this.logger.info('Shopping cart expiration job started', {
            timestamp: new Date().toISOString(),
            category: 'business',
        });

        try {
            const now = new Date();

            const expiredCarts = await this.cartRepository.find({
                where: {
                    status: ShoppingCartStatus.ACTIVE,
                    expiresAt: LessThan(now),
                },
            });

            if (expiredCarts.length === 0) {
                this.logger.debug('No expired shopping carts found', {
                    checkedAt: now,
                    category: 'business',
                });
                return;
            }

            let clearedCount = 0;

            for (const cartEntity of expiredCarts) {
                try {
                    for (const item of cartEntity.items) {
                        const productId = item.productId;
                        const quantity = item.quantity;
                        const queryRunner = this.dataSource.createQueryRunner();
                        await queryRunner.connect();
                        await queryRunner.startTransaction();
                        try {
                            const product =
                                await this.productRepository.findByIdWithLock(
                                    productId,
                                    queryRunner,
                                );
                            if (product) {
                                try {
                                    product.releaseReservation(quantity);
                                    await this.productRepository.saveWithQueryRunner(
                                        product,
                                        queryRunner,
                                    );
                                } catch (releaseError) {
                                    this.logger.warn(
                                        'Failed to release reservation for product',
                                        {
                                            productId: product.id,
                                            quantity,
                                            error: releaseError.message,
                                            category: 'business',
                                        },
                                    );
                                }
                            }

                            await queryRunner.commitTransaction();
                        } catch (err) {
                            await queryRunner.rollbackTransaction();
                            this.logger.error(
                                'Failed to release reservation for product (transaction)',
                                {
                                    productId,
                                    error: err.message,
                                    category: 'business',
                                },
                            );
                        } finally {
                            await queryRunner.release();
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
