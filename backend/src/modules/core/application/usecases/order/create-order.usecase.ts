import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
    SHOPPING_CART_REPOSITORY,
    PRODUCT_REPOSITORY,
    RESERVATION_SERVICE,
    ORDER_REPOSITORY,
    PRODUCT_CACHE_SERVICE,
} from 'src/modules/core/core.tokens';
import type { ShoppingCartRepository } from 'src/modules/core/domain/repositories/shopping-cart.repository';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';
import type { ReservationService } from 'src/modules/core/infra/services/reservation.service';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import type { ProductCacheService } from 'src/modules/core/infra/services/product-cache.service';
import { Order, OrderDto } from 'src/modules/core/domain/order';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { CreateOrderDto } from '../../dtos/create-order.dto';

/**
 * CreateOrderUseCase
 *
 *
 * Fluxo:
 * 1. Busca o carrinho pelo ID
 * 2. Busca os produtos com lock pessimista (FOR UPDATE)
 * 3. Verifica se as reservas estão válidas no Redis
 * 4. Valida estoque disponível
 * 5. Cria o pedido com status PENDING (aguardando pagamento)
 * 6. Confirma estoque reservado (diminui stock e reservedStock)
 * 7. Salva produtos e pedido em transação
 * 8. Remove o carrinho
 * 9. Limpa as reservas do Redis
 *
 */
@Injectable()
export class CreateOrderUseCase {
    constructor(
        @Inject(SHOPPING_CART_REPOSITORY)
        private readonly cartRepository: ShoppingCartRepository,
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(RESERVATION_SERVICE)
        private readonly reservationService: ReservationService,
        @Inject(PRODUCT_CACHE_SERVICE)
        private readonly productCacheService: ProductCacheService,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly dataSource: DataSource,
    ) {}

    async execute(cartId: string, dto: CreateOrderDto): Promise<OrderDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const cart = await this.cartRepository.findById(cartId);

            if (!cart) {
                throw new NotFoundException('Shopping cart not found');
            }

            if (cart.items.length === 0) {
                throw new InvalidPropsException('Shopping cart is empty');
            }

            cart.confirmCheckout();

            const productIds = cart.items.map((item) => item.productId);
            const lockedProducts =
                await this.productRepository.findByIdsWithLock(
                    productIds,
                    queryRunner,
                );

            if (lockedProducts.length !== productIds.length) {
                throw new NotFoundException(
                    'One or more products no longer available',
                );
            }

            const quantitiesMap = new Map(
                cart.items.map((item) => [item.productId, item.quantity]),
            );

            for (const productId of productIds) {
                const quantity = quantitiesMap.get(productId)!;
                const product = lockedProducts.find((p) => p.id === productId);

                if (!product) {
                    throw new InvalidPropsException(
                        `Product ${productId} not found`,
                    );
                }

                const isReserved =
                    await this.reservationService.verifyReservation(
                        productId,
                        cartId,
                        quantity,
                    );

                if (!isReserved) {
                    try {
                        const existingCartIds =
                            await this.reservationService.getProductReservations(
                                productId,
                            );
                        const currentReservation =
                            await this.reservationService.getReservation(
                                productId,
                                cartId,
                            );

                        this.logger.warn(
                            'Cart item reservation expired - order creation rejected',
                            {
                                cartId,
                                productId,
                                quantity,
                                reason: 'Reservation expired in Redis',
                                existingCartIds,
                                currentReservation,
                            },
                        );
                    } catch (dbgErr) {
                        this.logger.warn(
                            'Cart item reservation expired and debug fetch failed',
                            {
                                cartId,
                                productId,
                                quantity,
                                reason: 'Reservation expired in Redis',
                                debugError: dbgErr?.message ?? String(dbgErr),
                            },
                        );
                    }

                    throw new BadRequestException(
                        `Reservation for product "${product.name}" has expired. Please add items to a new cart and try again.`,
                    );
                }

                const canReserve = product.canReserveStock(quantity);
                const alreadyReservedEnough = product.reservedStock >= quantity;

                if (!canReserve && !alreadyReservedEnough) {
                    throw new InvalidPropsException(
                        `Product ${product.name} no longer has sufficient stock. Available: ${product.getAvailableStock()}, Requested: ${quantity}`,
                    );
                }
            }

            const order = Order.create({
                quantitiesMap,
                orderItems: lockedProducts,
                cliente: {
                    name: dto.name,
                    cpf: dto.cpf,
                    email: dto.email,
                    cep: dto.cep,
                    address: dto.address,
                    number: dto.number,
                },
                isAlreadyReserved: true,
            });

            for (const product of lockedProducts) {
                const quantity = quantitiesMap.get(product.id)!;
                product.confirmReservedStock(quantity);

                this.logger.info('Stock confirmed for product', {
                    productId: product.id,
                    productName: product.name,
                    quantityConfirmed: quantity,
                    newStock: product.stock,
                    organizationId: product.organizationId,
                });
            }

            for (const product of lockedProducts) {
                await this.productRepository.saveWithQueryRunner(
                    product,
                    queryRunner,
                );
            }

            const savedOrder = await (
                this.orderRepository as any
            ).saveWithQueryRunner(order, queryRunner);

            await (this.cartRepository as any).deleteWithQueryRunner(
                cart.id,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            try {
                await this.reservationService.clearCartReservations(
                    cartId,
                    productIds,
                );
            } catch (redisError) {
                this.logger.error(
                    'Failed to clear cart reservations from Redis',
                    {
                        error: redisError.message,
                        stack: redisError.stack,
                    },
                );
            }

            await this.invalidateAffectedOrganizationsCaches(lockedProducts);

            this.logger.info('Order created from shopping cart', {
                orderId: savedOrder.id,
                cartId: cart.id,
                organizationIds: savedOrder.organizationIds,
                total: savedOrder.total,
                itemsCount: order.items.length,
                clienteName: savedOrder.cliente?.name,
                status: savedOrder.status,
            });

            return savedOrder.toDto();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to create order from cart', {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async invalidateAffectedOrganizationsCaches(
        products: any[],
    ): Promise<void> {
        try {
            const organizationIds = new Set(
                products.map((p) => p.organizationId),
            );

            for (const orgId of organizationIds) {
                await this.productCacheService.invalidateOrgProducts(orgId);
            }

            this.logger.info('Organization product caches invalidated', {
                organizationIds: Array.from(organizationIds),
                productsCount: products.length,
            });
        } catch (error) {
            this.logger.error(
                'Failed to invalidate organization product caches',
                {
                    error: error.message,
                    stack: error.stack,
                },
            );
        }
    }
}
