import { ORDER_REPOSITORY } from 'src/modules/core/core.tokens';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import { OrderDto } from 'src/modules/core/domain/order';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute(orderId: string): Promise<OrderDto> {
        if (!orderId) {
            throw new InvalidPropsException('Order ID is required');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order.toDto();
    }
}
