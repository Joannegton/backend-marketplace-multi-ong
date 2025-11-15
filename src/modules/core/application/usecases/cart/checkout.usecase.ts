import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { DataSource } from 'typeorm';
import type { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ORDER_REPOSITORY, SHOPPING_CART_REPOSITORY, PRODUCT_REPOSITORY, RESERVATION_SERVICE } from 'src/modules/core/core.tokens';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import type { ShoppingCartRepository } from 'src/modules/core/domain/repositories/shopping-cart.repository';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';
import type { ReservationService } from 'src/modules/core/infra/services/reservation.service';
import { Order, OrderDto } from 'src/modules/core/domain/order';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { CheckoutDto } from '../../dtos/checkout.dto';

@Injectable()
export class CheckoutUseCase {
    constructor(
        @Inject(SHOPPING_CART_REPOSITORY)
        private readonly cartRepository: ShoppingCartRepository,
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(RESERVATION_SERVICE)
        private readonly reservationService: ReservationService,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        @InjectQueue('orders')
        private readonly ordersQueue: Queue,
        private readonly dataSource: DataSource,
    ) {}

    async execute(cartId: string, dto: CheckoutDto): Promise<OrderDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            /**
             * finaliza o checkout do carrinho com lock pessimista e processamento assíncrono
             * 
             * fluxo:
             * 1. bloqueia as linhas dos produtos no banco de dados (FOR UPDATE)
             * 2. verifica se todas as reservas estão válidas no Redis
             *    - se alguma expirou, rejeita o checkout com erro BadRequest
             *    - cliente deve criar novo carrinho para tentar novamente
             * 3. valida que o estoque ainda está disponível
             * 4. cria o pedido com os itens do carrinho (isAlreadyReserved = true)
             * 5. confirma estoque reservado (diminui stock e reservedStock)
             * 6. salva produtos e pedido no banco (em transação)
             * 7. remove o carrinho
             * 8. limpa as reservas do Redis
             * 9. adiciona job na fila para processamento de pagamento
             * 
             * se falhar em qualquer etapa, o rollback garante consistência
             * se reserva expirou, cliente recebe erro claro para refazer o carrinho
             */
            const cart = await this.cartRepository.findById(cartId);

            if (!cart) {
                throw new NotFoundException('Shopping cart not found');
            }

            if (cart.items.length === 0) {
                throw new InvalidPropsException('Shopping cart is empty');
            }

            cart.confirmCheckout();

            const productIds = cart.items.map(item => item.productId);
            const lockedProducts = await this.productRepository.findByIdsWithLock(
                productIds,
                queryRunner,
            );

            if (lockedProducts.length !== productIds.length) {
                throw new NotFoundException('One or more products no longer available');
            }

            const quantitiesMap = new Map(cart.items.map((item) => [item.productId, item.quantity]));

            for (const productId of productIds) {
                const quantity = quantitiesMap.get(productId)!;
                const product = lockedProducts.find(p => p.id === productId);
                
                if (!product) {
                    throw new InvalidPropsException(`Product ${productId} not found`);
                }

                const isReserved = await this.reservationService.verifyReservation(
                    productId,
                    cartId,
                    quantity,
                );

                if (!isReserved) {
                    this.logger.warn('Cart item reservation expired - checkout rejected', {
                        cartId,
                        productId,
                        quantity,
                        reason: 'Reservation expired in Redis',
                    });

                    throw new BadRequestException(
                        `Reservation for product "${product.name}" has expired. Please add items to a new cart and try again.`,
                    );
                }

                // Validar que o estoque ainda está disponível
                if (!product.canReserveStock(quantity)) {
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

            // Confirmar o estoque reservado (diminui stock e reservedStock)
            for (const product of lockedProducts) {
                const quantity = quantitiesMap.get(product.id)!;
                product.confirmReservedStock(quantity);
            }

            for (const product of lockedProducts) {
                await this.productRepository.saveWithQueryRunner(product, queryRunner);
            }

            const savedOrder = await (this.orderRepository as any).saveWithQueryRunner(order, queryRunner);

            await (this.cartRepository as any).deleteWithQueryRunner(cart.id, queryRunner);

            await queryRunner.commitTransaction();

            try {
                await this.reservationService.clearCartReservations(cartId, productIds);
            } catch (redisError) {
                this.logger.error('Failed to clear cart reservations from Redis', {
                    error: redisError.message,
                    stack: redisError.stack,
                });
            }

            await this.ordersQueue.add(
                'process-payment',
                {
                    orderId: savedOrder.id,
                    organizationIds: savedOrder.organizationIds,
                    total: savedOrder.total,
                },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                },
            );

            this.logger.info('Order created from checkout', {
                orderId: savedOrder.id,
                cartId: cart.id,
                organizationIds: savedOrder.organizationIds,
                total: savedOrder.total,
                itemsCount: order.items.length,
                clienteName: savedOrder.cliente?.name,
            });

            return savedOrder.toDto();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to checkout', {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
