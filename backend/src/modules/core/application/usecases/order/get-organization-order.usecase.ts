import { ORDER_REPOSITORY } from 'src/modules/core/core.tokens';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import { OrganizationOrderDto } from 'src/modules/core/domain/order';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetOrganizationOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute(orderId: string, organizationId: string): Promise<OrganizationOrderDto> {
        if (!orderId || !organizationId) {
            throw new InvalidPropsException('Order ID and Organization ID are required');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.organizationIds.includes(organizationId)) {
            throw new InvalidPropsException('This order does not belong to your organization');
        }

        return order.toOrganizationDto(organizationId);
    }
}