import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
    PRODUCT_REPOSITORY,
    SHOPPING_CART_REPOSITORY,
    RESERVATION_SERVICE,
} from 'src/modules/core/core.tokens';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';
import type { ShoppingCartRepository } from 'src/modules/core/domain/repositories/shopping-cart.repository';
import { ShoppingCartDto } from 'src/modules/core/domain/shopping-cart';
import type { ReservationService } from 'src/modules/core/infra/services/reservation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

type UpdateCartItemQuantityUseCaseProps = {
    cartId: string;
    productId: string;
    quantity: number;
};

@Injectable()
export class UpdateCartItemQuantityUseCase {
    constructor(
        @Inject(SHOPPING_CART_REPOSITORY)
        private readonly cartRepository: ShoppingCartRepository,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(RESERVATION_SERVICE)
        private readonly reservationService: ReservationService,
        private readonly dataSource: DataSource,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    /**
     * atualiza a quantidade de um item no carrinho com lock pessimista e reserva no Redis
     *
     * fluxo:
     * 1. bloqueia a linha do produto no banco de dados (FOR UPDATE)
     * 2. calcula a diferença de quantidade
     * 3. se aumentou: valida e reserva apenas a diferença
     * 4. se diminuiu: libera apenas a diferença
     * 5. atualiza a reserva no Redis
     */
    async execute(
        dto: UpdateCartItemQuantityUseCaseProps,
    ): Promise<ShoppingCartDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const cart = await this.cartRepository.findById(dto.cartId);
            if (!cart) {
                throw new NotFoundException('Shopping cart not found');
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

            cart.updateItemQuantity(product, dto.quantity);

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
                    category: 'business',
                });

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
                } catch (compError) {
                    await revertRunner.rollbackTransaction();
                    this.logger.error(
                        'Failed to revert reservedStock after Redis error',
                        {
                            productId: dto.productId,
                            error: compError.message,
                            category: 'business',
                        },
                    );
                } finally {
                    await revertRunner.release();
                }

                throw new Error(
                    'Failed to reserve stock in cache; operation aborted',
                );
            }

            return savedCart.toDto();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to update cart item quantity', {
                error: error.message,
                cartId: dto.cartId,
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
