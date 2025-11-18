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

type RemoveCartItemUseCaseProps = {
    cartId: string;
    productId: string;
};

@Injectable()
export class RemoveCartItemUseCase {
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

    async execute(dto: RemoveCartItemUseCaseProps): Promise<ShoppingCartDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const cart = await this.cartRepository.findById(dto.cartId);
            if (!cart) {
                throw new NotFoundException('Shopping cart not found');
            }

            const cartItem = cart.items.find(
                (item) => item.productId === dto.productId,
            );
            if (!cartItem) {
                throw new NotFoundException('Item not found in cart');
            }

            const product = await this.productRepository.findByIdWithLock(
                dto.productId,
                queryRunner,
            );
            if (product) {
                try {
                    product.releaseReservation(cartItem.quantity);
                    await this.productRepository.saveWithQueryRunner(
                        product,
                        queryRunner,
                    );
                } catch (err) {
                    this.logger.warn(
                        'Failed to update product reservedStock while removing cart item',
                        { productId: dto.productId, error: err.message },
                    );
                    throw err;
                }
            }

            cart.removeItem(dto.productId);

            const savedCart = await this.cartRepository.saveWithQueryRunner(
                cart,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            try {
                await this.reservationService.releaseReservation(
                    dto.productId,
                    savedCart.id,
                );
            } catch (redisError) {
                this.logger.error('Failed to release reservation in Redis', {
                    productId: dto.productId,
                    cartId: savedCart.id,
                    error: redisError.message,
                    category: 'business',
                });
            }

            return savedCart.toDto();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to remove item from cart', {
                error: error.message,
                cartId: dto.cartId,
                productId: dto.productId,
                category: 'business',
            });
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
