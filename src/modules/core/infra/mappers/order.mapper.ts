import { Order, OrderStatus } from "../../domain/order";
import { OrderEntity as OrderEntity } from "../entities/order.entity";
import { OrderItemMapper } from "./order-item.mapper";

export class OrderMapper {
    static toDomain(entity: OrderEntity): Order {
        const items = entity.items.map(item => OrderItemMapper.toDomain(item));
        
        return Order.load({
            cliente: entity.cliente ?? undefined,
            organizationIds: entity.organizationIds ?? [],
            items: items,
            total: parseFloat(entity.total.toString()),
            status: entity.status as OrderStatus,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        }, entity.id);
    }

    static toDomainList(entities: OrderEntity[]): Order[] {
        return entities.map(entity => this.toDomain(entity));
    }

    static toEntity(domain: Order): OrderEntity {
        const items = domain.items.map(item => OrderItemMapper.toEntity(item));

        const entity = OrderEntity.create({
            items: items,
            cliente: domain.cliente ?? null,
            organizationIds: domain.organizationIds,
            total: domain.total,
            status: domain.status,
        });

        return entity;
    }
}