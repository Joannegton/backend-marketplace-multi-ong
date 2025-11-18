import { ORDER_REPOSITORY } from 'src/modules/core/core.tokens';
import type { OrderRepository } from 'src/modules/core/domain/repositories/order.repository';
import { OrganizationOrderDto } from 'src/modules/core/domain/order';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListOrganizationOrdersUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) {}

    async execute(organizationId: string): Promise<OrganizationOrderDto[]> {
        if (!organizationId) {
            throw new InvalidPropsException('Organization ID is required');
        }

        const orders = await this.orderRepository.findByOrganizationId(organizationId);

        return orders.map(order => order.toOrganizationDto(organizationId));
    }
}