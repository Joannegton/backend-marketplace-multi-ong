import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import type { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ORDER_REPOSITORY } from 'src/modules/core/core.tokens';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import { OrderDto, OrderStatus } from 'src/modules/core/domain/order';
import { CheckoutPaymentDto } from '../../dtos/checkout-payment.dto';

/**
 * CheckoutPaymentUseCase
 *
 *
 * Fluxo:
 * 1. Busca o pedido pelo ID
 * 2. Valida se o pedido está em status PENDING (aguardando pagamento)
 * 3. Processa o pagamento com o gateway configurado
 * 4. Atualiza o status do pedido para PROCESSING
 * 5. Adiciona job na fila para processamento assíncrono do pagamento
 * 6. Retorna o pedido atualizado
 */
@Injectable()
export class CheckoutPaymentUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        @InjectQueue('orders')
        private readonly ordersQueue: Queue,
    ) {}

    async execute(orderId: string, dto: CheckoutPaymentDto): Promise<OrderDto> {
        try {
            const order = await this.orderRepository.findById(orderId);

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(
                    `Order cannot be paid. Current status: ${order.status}. Only PENDING orders can be paid.`,
                );
            }

            this.logger.info('Processing payment for order', {
                orderId: order.id,
                provider: dto.paymentProvider,
                total: order.total,
            });

            order.updateStatus(OrderStatus.PROCESSING);
            const updatedOrder = await this.orderRepository.save(order);

            await this.ordersQueue.add(
                'process-payment',
                {
                    orderId: updatedOrder.id,
                    organizationIds: updatedOrder.organizationIds,
                    total: updatedOrder.total,
                    paymentProvider: dto.paymentProvider,
                    paymentToken: dto.paymentToken,
                    reference: dto.reference,
                },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                },
            );

            this.logger.info('Payment job queued', {
                orderId: updatedOrder.id,
                organizationIds: updatedOrder.organizationIds,
            });

            return updatedOrder.toDto();
        } catch (error) {
            this.logger.error('Failed to process payment checkout', {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}
