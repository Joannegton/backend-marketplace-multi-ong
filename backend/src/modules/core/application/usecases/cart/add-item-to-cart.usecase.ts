import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
    PRODUCT_REPOSITORY,
    SHOPPING_CART_REPOSITORY,
    RESERVATION_SERVICE,
} from 'src/modules/core/core.tokens';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';
import type { ShoppingCartRepository } from 'src/modules/core/domain/repositories/shopping-cart.repository';
import {
    ShoppingCart,
    ShoppingCartDto,
} from 'src/modules/core/domain/shopping-cart';
import type { ReservationService } from 'src/modules/core/infra/services/reservation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

type AddItemToCartUsecaseProps = {
    productId: string;
    quantity: number;
};

@Injectable()
export class AddItemToCartUseCase {
    private readonly cartTtlMinutes: number;

    constructor(
        @Inject(SHOPPING_CART_REPOSITORY)
        private readonly cartRepository: ShoppingCartRepository,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(RESERVATION_SERVICE)
        private readonly reservationService: ReservationService,
        @InjectQueue('orders') private readonly ordersQueue: Queue,
        private readonly dataSource: DataSource,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly configService: ConfigService,
    ) {
        this.cartTtlMinutes = this.configService.get<number>(
            'CART_TTL_MINUTES',
            20,
        );
    }

    /**
     * adiciona item ao carrinho com lock pessimista e reserva no Redis
     *
     * fluxo:
     * 1. bloqueia a linha do produto no banco de dados (FOR UPDATE)
     * 2. valida a disponibilidade do estoque
     * 3. adiciona o item ao carrinho
     * 4. salva a reserva no Redis (com TTL)
     *
     * se o carrinho expirar, o TTL do Redis apaga automaticamente a reserva
     */
    async execute(
        dto: AddItemToCartUsecaseProps,
        cartId?: string,
    ): Promise<ShoppingCartDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let cart: ShoppingCart | null = null;

            if (cartId) {
                cart = await this.cartRepository.findById(cartId);
                if (!cart) {
                    throw new NotFoundException('Shopping cart not found');
                }
            } else {
                cart = ShoppingCart.create(this.cartTtlMinutes);
            }

            const product = await this.productRepository.findByIdWithLock(
                dto.productId,
                queryRunner,
            );

            if (!product) {
                throw new NotFoundException(
                    `Product ${dto.productId} not found`,
                );
            }

            cart.addItem(product, dto.quantity);

            await this.productRepository.saveWithQueryRunner(
                product,
                queryRunner,
            );

            const savedCart = await this.cartRepository.saveWithQueryRunner(
                cart,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            const cartItem = savedCart.items.find(
                (item) => item.productId === dto.productId,
            );
            const totalItemQuantity = cartItem?.quantity ?? 0;

            try {
                await this.reservationService.reserveStock(
                    dto.productId,
                    savedCart.id,
                    totalItemQuantity,
                );
            } catch (redisError) {
                this.logger.error('Failed to reserve stock in Redis', {
                    productId: dto.productId,
                    cartId: savedCart.id,
                    error: redisError.message,
                    stack: redisError.stack,
                    category: 'business',
                });

                const maxAttempts = 3;
                let reverted = false;

                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    const revertRunner = this.dataSource.createQueryRunner();
                    await revertRunner.connect();
                    await revertRunner.startTransaction();
                    try {
                        const prod = await this.productRepository.findByIdWithLock(
                            dto.productId,
                            revertRunner,
                        );
                        if (prod) {
                            prod.releaseReservation(totalItemQuantity);
                            await this.productRepository.saveWithQueryRunner(
                                prod,
                                revertRunner,
                            );
                        }
                        await revertRunner.commitTransaction();
                        reverted = true;
                        break;
                    } catch (compError) {
                        await revertRunner.rollbackTransaction();
                        this.logger.error(
                            'Failed to revert reservedStock after Redis error (attempt)',
                            {
                                attempt,
                                productId: dto.productId,
                                error: compError.message,
                                stack: compError.stack,
                                category: 'business',
                            },
                        );
                        if (attempt < maxAttempts) {
                            // eslint-disable-next-line no-await-in-loop
                            await new Promise((r) => setTimeout(r, 100 * attempt));
                        }
                    } finally {
                        await revertRunner.release();
                    }
                }

                if (!reverted) {
                    this.logger.error('Reversion of reservedStock failed after retries', {
                        productId: dto.productId,
                        cartId: savedCart.id,
                        totalItemQuantity,
                        category: 'business',
                    });
                    try {
                        await this.ordersQueue.add(
                            'reconcile-inventory',
                            {
                                productId: dto.productId,
                                cartId: savedCart.id,
                                quantity: totalItemQuantity,
                                reason: 'reserve_failed_revert',
                            },
                            {
                                attempts: 5,
                                backoff: { type: 'exponential', delay: 1000 },
                                removeOnComplete: true,
                            },
                        );
                        this.logger.info('Enqueued inventory reconciliation job', {
                            productId: dto.productId,
                            cartId: savedCart.id,
                            quantity: totalItemQuantity,
                        });
                    } catch (enqueueErr) {
                        this.logger.error('Failed to enqueue reconciliation job', {
                            productId: dto.productId,
                            cartId: savedCart.id,
                            error: enqueueErr?.message,
                            stack: enqueueErr?.stack,
                        });
                    }
                }

                throw new Error(
                    'Failed to reserve stock in cache; operation aborted',
                );
            }

            return savedCart.toDto();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to add item to cart', {
                error: error.message,
                productId: dto.productId,
                quantity: dto.quantity,
                category: 'business',
            });
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
