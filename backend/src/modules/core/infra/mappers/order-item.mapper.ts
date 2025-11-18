import { OrderItem } from "../../domain/order-item";
import { OrderItemEntity as OrderItemEntity } from "../entities/order-item.entity";

export class OrderItemMapper {
    static toDomain(entity: OrderItemEntity): OrderItem {
        return OrderItem.load({
            orderId: entity.orderId,
            productId: entity.productId,
            organizationId: entity.organizationId,
            productName: entity.productName,
            priceSnapshot: parseFloat(entity.priceSnapshot.toString()),
            quantity: entity.quantity,
            subtotal: parseFloat(entity.subtotal.toString()),
        }, entity.id);
    }

    static toDomainList(entities: OrderItemEntity[]): OrderItem[] {
        return entities.map(entity => this.toDomain(entity));
    }

    static toEntity(domain: OrderItem): OrderItemEntity {
        const entity = OrderItemEntity.create({
            orderId: domain.orderId,
            productId: domain.productId,
            organizationId: domain.organizationId,
            productName: domain.productName,
            priceSnapshot: domain.priceSnapshot,
            quantity: domain.quantity,
            subtotal: domain.subtotal,
        });

        return entity;
    }
}