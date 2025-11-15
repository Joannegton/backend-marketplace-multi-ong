import { InvalidPropsException } from "src/exceptions/invalidProps.exception";
import { Product } from "./product";

type OrderItemProps = {
    orderId: string;
    productId: string;
    product?: Product;
    organizationId: string;
    productName: string;
    priceSnapshot: number;
    quantity: number;
    subtotal: number;
}

type CreateOrderItemProps = {
    productId: string;
    organizationId: string;
    productName: string;
    priceSnapshot: number;
    quantity: number;
}

export type OrderItemDto = {
    orderId: string;
    productId: string;
    organizationId: string;
    productName: string;
    priceSnapshot: number;
    quantity: number;
    subtotal: number;
}

export class OrderItem {
    private readonly _id: string;
    private readonly props: OrderItemProps;

    constructor(id?: string) {
        if (id) {
            this._id = id;
        }
        this.props = {} as OrderItemProps;
    }

    static create(props: CreateOrderItemProps): OrderItem {
        const orderItem = new OrderItem();
        orderItem.setProductId(props.productId);
        orderItem.setOrganizationId(props.organizationId);
        orderItem.setProductName(props.productName);
        orderItem.setPriceSnapshot(props.priceSnapshot);
        orderItem.setQuantity(props.quantity);
        orderItem.calculateSubtotal();
        return orderItem;
    }

    static load(props: OrderItemProps, id: string): OrderItem {
        const orderItem = new OrderItem(id);
        orderItem.setProductId(props.productId);
        orderItem.setProduct(props.product);
        orderItem.setOrganizationId(props.organizationId);
        orderItem.setProductName(props.productName);
        orderItem.setPriceSnapshot(props.priceSnapshot);
        orderItem.setQuantity(props.quantity);
        orderItem.setSubtotal(props.subtotal);
        return orderItem;
    }

    
    private calculateSubtotal() {
        const subtotal = this.props.priceSnapshot * this.props.quantity;
        this.setSubtotal(subtotal);
    }

    private setProductId(productId: string) {
        if (!productId) {
            throw new InvalidPropsException('Product ID is required');
        }
        this.props.productId = productId;
    }

    private setProduct(product?: Product) {
        this.props.product = product;
    }

    private setOrganizationId(organizationId: string) {
        if (!organizationId) {
            throw new InvalidPropsException('Organization ID is required');
        }
        this.props.organizationId = organizationId;
    }

    private setProductName(productName: string) {
        if (!productName || productName.trim().length === 0) {
            throw new InvalidPropsException('Product name is required');
        }
        this.props.productName = productName;
    }

    private setPriceSnapshot(priceSnapshot: number) {
        if (priceSnapshot < 0) {
            throw new InvalidPropsException('Price snapshot must be greater than or equal to 0');
        }
        this.props.priceSnapshot = priceSnapshot;
    }

    private setQuantity(quantity: number) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidPropsException('Quantity must be a positive integer');
        }
        this.props.quantity = quantity;
    }

    private setSubtotal(subtotal: number) {
        if (subtotal < 0) {
            throw new InvalidPropsException('Subtotal must be greater than or equal to 0');
        }
        this.props.subtotal = subtotal;
    }

    get id(): string {
        return this._id;
    }

    get orderId(): string {
        return this.props.orderId;
    }

    get productId(): string {
        return this.props.productId;
    }

    get product(): Product | undefined {
        return this.props.product;
    }

    get organizationId(): string {
        return this.props.organizationId;
    }

    get productName(): string {
        return this.props.productName;
    }

    get priceSnapshot(): number {
        return this.props.priceSnapshot;
    }

    get quantity(): number {
        return this.props.quantity;
    }

    get subtotal(): number {
        return this.props.subtotal;
    }

    toDto(): OrderItemDto {
        return {
            orderId: this.orderId,
            productId: this.productId,
            organizationId: this.organizationId,
            productName: this.productName,
            priceSnapshot: this.priceSnapshot,
            quantity: this.quantity,
            subtotal: this.subtotal,
        };
    }
}