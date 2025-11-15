import { InvalidPropsException } from "src/exceptions/invalidProps.exception";
import { OrderItem } from "./order-item";
import { Product } from "./product";
import { randomUUID } from 'crypto';

export enum ShoppingCartStatus {
  ACTIVE = 'active',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
}

type ShoppingCartProps = {
    items: OrderItem[];
    status: ShoppingCartStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ShoppingCartDto = {
    id: string;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        priceSnapshot: number;
        subtotal: number;
    }>;
    total: number;
    status: ShoppingCartStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class ShoppingCart {
    private readonly _id: string;
    private readonly props: ShoppingCartProps;
    private readonly reservedProducts: Map<string, number> = new Map();

    constructor(id?: string) {
        if (id) {
            this._id = id;
        } else {
            this._id = randomUUID();
        }
        this.props = {} as ShoppingCartProps;
    }

    static create(ttlMinutes?: number): ShoppingCart {
        const cart = new ShoppingCart();
        const now = new Date();
        cart.setStatus(ShoppingCartStatus.ACTIVE);
        cart.setItems([]);
        cart.setExpiresAt(ttlMinutes || 20);
        cart.setCreatedAt(now);
        cart.setUpdatedAt(now);
        return cart;
    }

    static load(props: ShoppingCartProps, id: string): ShoppingCart {
        const cart = new ShoppingCart(id);
        cart.setItems(props.items);
        cart.setStatus(props.status);
        cart.setExpiresAtDirect(props.expiresAt);
        cart.setCreatedAt(props.createdAt);
        cart.setUpdatedAt(props.updatedAt);
        return cart;
    }

    addItem(product: Product, quantity: number): void {
        this.validateCartActive();
        this.validateProductActive(product);

        const currentQuantity = this.getItemQuantity(product.id);
        const newTotalQuantity = currentQuantity + quantity;

        if (!product.canReserveStock(newTotalQuantity)) {
            throw new InvalidPropsException(
                `Insufficient stock for product ${product.name}. Available: ${product.getAvailableStock()}`,
            );
        }

        if (currentQuantity > 0) {
            const existingItemIndex = this.props.items.findIndex(
                (item) => item.productId === product.id,
            );
            if (existingItemIndex !== -1) {
                const quantityIncrement = quantity;
                
                this.props.items[existingItemIndex] = OrderItem.create({
                    productId: product.id,
                    organizationId: product.organizationId,
                    productName: product.name,
                    priceSnapshot: product.price,
                    quantity: newTotalQuantity,
                });

                product.reserveStock(quantityIncrement);
                this.reservedProducts.set(product.id, newTotalQuantity);
                return;
            }
        }

        const orderItem = OrderItem.create({
            productId: product.id,
            organizationId: product.organizationId,
            productName: product.name,
            priceSnapshot: product.price,
            quantity: newTotalQuantity,
        });

        this.props.items.push(orderItem);

        product.reserveStock(newTotalQuantity);
        this.reservedProducts.set(product.id, newTotalQuantity);
    }

    removeItem(productId: string): void {
        const itemIndex = this.props.items.findIndex(
            (item) => item.productId === productId,
        );

        if (itemIndex === -1) {
            return;
        }

        const item = this.props.items[itemIndex];
        this.props.items.splice(itemIndex, 1);

        item.product?.releaseReservation(item.quantity);
        this.reservedProducts.delete(productId);
    }

    clear(): void {
        for (const item of this.props.items) {
            item.product?.releaseReservation(item.quantity);
        }
        this.props.items = [];
        this.reservedProducts.clear();
    }

    confirmCheckout(): void {
        if (this.isExpired()) {
            throw new InvalidPropsException('Shopping cart has expired');
        }
        this.setStatus(ShoppingCartStatus.CONFIRMED);
    }

    isExpired(): boolean {
        return new Date() > this.props.expiresAt;
    }

    calculateTotal(): number {
        return this.props.items.reduce((total, item) => total + item.subtotal, 0);
    }

    getOrganizationIds(): string[] {
        const organizationIdsSet = new Set<string>();
        for (const item of this.props.items) {
            organizationIdsSet.add(item.organizationId);
        }
        return Array.from(organizationIdsSet);
    }

    private validateCartActive(): void {
        if (this.props.status !== ShoppingCartStatus.ACTIVE) {
            throw new InvalidPropsException('Shopping cart is not active');
        }
        if (this.isExpired()) {
            throw new InvalidPropsException('Shopping cart has expired');
        }
    }

    private validateProductActive(product: Product): void {
        if (!product.isActive) {
            throw new InvalidPropsException('Product is not available');
        }
    }

    private getItemQuantity(productId: string): number {
        const item = this.props.items.find((i) => i.productId === productId);
        return item?.quantity || 0;
    }


    private setItems(items: OrderItem[]): void {
        this.props.items = items;
    }

    private setStatus(status: ShoppingCartStatus): void {
        this.props.status = status;
    }

    private setExpiresAt(ttlMinutes: number): void {
        this.props.expiresAt = new Date(Date.now() + ttlMinutes * 60000);
    }

    private setExpiresAtDirect(expiresAt: Date): void {
        this.props.expiresAt = expiresAt;
    }

    private setCreatedAt(createdAt: Date): void {
        this.props.createdAt = createdAt;
    }

    private setUpdatedAt(updatedAt: Date): void {
        this.props.updatedAt = updatedAt;
    }

    get id(): string {
        return this._id;
    }

    get items(): OrderItem[] {
        return this.props.items;
    }

    get status(): ShoppingCartStatus {
        return this.props.status;
    }

    get expiresAt(): Date {
        return this.props.expiresAt;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toDto(): ShoppingCartDto {
        return {
            id: this._id,
            items: this.props.items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
                subtotal: item.subtotal,
            })),
            total: this.calculateTotal(),
            status: this.props.status,
            expiresAt: this.props.expiresAt,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
