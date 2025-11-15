import { ShoppingCart, ShoppingCartStatus } from "../../domain/shopping-cart";
import { ShoppingCartEntity } from "../entities/shopping-cart.entity";
import { OrderItem } from "../../domain/order-item";
import { Product } from "../../domain/product";

export class ShoppingCartMapper {
    static toDomain(entity: ShoppingCartEntity, products: Product[]): ShoppingCart {
        const productsMap = new Map(products.map((p) => [p.id, p]));

        const orderItems = entity.items.map((item) => {
            const product = productsMap.get(item.productId);
            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }

            return OrderItem.create({
                productId: product.id,
                organizationId: product.organizationId,
                productName: product.name,
                priceSnapshot: item.priceSnapshot,
                quantity: item.quantity,
            });
        });

        return ShoppingCart.load({
            items: orderItems,
            status: entity.status as ShoppingCartStatus,
            expiresAt: entity.expiresAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        }, entity.id);
    }

    static toDomainList(entities: ShoppingCartEntity[], products: Product[]): ShoppingCart[] {
        return entities.map((entity) => this.toDomain(entity, products));
    }

    static toEntity(domain: ShoppingCart): ShoppingCartEntity {
        return ShoppingCartEntity.create({
            items: domain.items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
                subtotal: item.subtotal,
            })),
            status: domain.status,
            expiresAt: domain.expiresAt,
        });
    }
}
