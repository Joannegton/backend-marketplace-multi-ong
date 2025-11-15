import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PRODUCT_REPOSITORY, SHOPPING_CART_REPOSITORY, RESERVATION_SERVICE } from 'src/modules/core/core.tokens';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';
import type { ShoppingCartRepository } from 'src/modules/core/domain/repositories/shopping-cart.repository';
import { ShoppingCart, ShoppingCartDto } from 'src/modules/core/domain/shopping-cart';
import type { ReservationService } from 'src/modules/core/infra/services/reservation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

type AddItemToCartUsecaseProps = {
    productId: string;
    quantity: number;
}

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
        private readonly dataSource: DataSource,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly configService: ConfigService,
    ) {
        this.cartTtlMinutes = this.configService.get<number>('CART_TTL_MINUTES', 20);
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
                throw new NotFoundException(`Product ${dto.productId} not found`);
            }

            cart.addItem(product, dto.quantity);

            await this.productRepository.saveWithQueryRunner(product, queryRunner);

            const savedCart = await this.cartRepository.save(cart);

            await queryRunner.commitTransaction();

            const cartItem = savedCart.items.find(item => item.productId === dto.productId);
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
