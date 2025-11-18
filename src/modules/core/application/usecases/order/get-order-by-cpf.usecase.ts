import { ORDER_REPOSITORY } from 'src/modules/core/core.tokens';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import { OrderDto } from 'src/modules/core/domain/order';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class GetOrderByCpfUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute(orderId: string, cpf: string): Promise<OrderDto> {
        if (!orderId) {
            throw new InvalidPropsException('Order ID is required');
        }

        if (!cpf) {
            throw new InvalidPropsException('CPF is required');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.cliente?.cpf !== cpf) {
            throw new UnauthorizedException('Invalid CPF for this order');
        }

        return order.toDto();
    }
}
