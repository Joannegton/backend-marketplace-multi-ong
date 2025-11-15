import { InvalidPropsException } from "src/exceptions/invalidProps.exception";
import { OrderItem, OrderItemDto } from "./order-item";
import { Product } from "./product";

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type Cliente = {
    name: string;
    cpf: string;
    email: string;
    cep: string;
    address: string;
    number: string;
}

type QuantityMap = Map<string, number>;

type OrderProps = {
    cliente?: Cliente;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
    organizationIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

type CreateOrderProps = {
    orderItems: Product[];
    quantitiesMap: QuantityMap;
    cliente?: Cliente | null;
    isAlreadyReserved?: boolean;
}

export type OrderDto = {
    id: string;
    cliente?: Cliente;
    organizationIds: string[];
    total: number;
    status: OrderStatus;
    items: OrderItemDto[];
    createdAt: Date;
    updatedAt: Date;
}

export type OrganizationOrderDto = {
    id: string;
    cliente?: Cliente;
    total: number;
    items: OrderItemDto[];
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Order {
    private readonly _id: string;
    private readonly props: OrderProps;

    constructor(id?: string) {
        if (id) {
            this._id = id;
        }
        this.props = {} as OrderProps;
    }

    static create(props: CreateOrderProps): Order {
        const order = new Order();

        order.setStatus(OrderStatus.PENDING);
        if (props.cliente) {
            order.setCliente(props.cliente);
        }
        order.createOrderItems(props);
        order.refreshOrganizationIds();
        order.recalculateOrderTotal();
        return order;
    }

    static load(props: OrderProps, id: string): Order {
        const order = new Order(id);
        if (props.cliente) {
            order.setCliente(props.cliente);
        }
        order.setTotal(props.total);
        order.setStatus(props.status);
        order.setItems(props.items || []);
        order.setCreatedAt(props.createdAt);
        order.setUpdatedAt(props.updatedAt);

        return order;
    }

    createOrderItems(props: CreateOrderProps): void {
        if (!this.props.items) {
            this.props.items = [];
        }
        for (const product of props.orderItems) {
            const requestedQuantity = props.quantitiesMap.get(product.id)!;
            
            if (!props.isAlreadyReserved) {
                product.reserveStock(requestedQuantity);
            }

            const orderItem = OrderItem.create({
                productId: product.id,
                organizationId: product.organizationId,
                productName: product.name,
                priceSnapshot: product.price,
                quantity: requestedQuantity,
            });

            this.props.items.push(orderItem);
        }
    }

    recalculateOrderTotal() {
        const total = this.props.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.setTotal(Number(total.toFixed(2)));
    }

    private setCliente(cliente: Cliente) {
        this.props.cliente = cliente;
    }

    private setTotal(total: number) {
        if (total <= 0) {
            throw new InvalidPropsException('Total must be greater than 0');
        }
        this.props.total = total;
    }

    private setStatus(status: OrderStatus) {
        if (!Object.values(OrderStatus).includes(status)) {
            throw new InvalidPropsException('Invalid order status');
        }
        this.props.status = status;
    }

    private setItems(items: OrderItem[]) {
        if (items.length === 0) {
            throw new InvalidPropsException('Order must have at least one item');
        }
        this.props.items = items;
        this.refreshOrganizationIds();
    }

    private setCreatedAt(createdAt: Date) {
        this.props.createdAt = createdAt;
    }

    private setUpdatedAt(updatedAt: Date) {
        this.props.updatedAt = updatedAt;
    }

    private setOrganizationIds(ids: string[]): void {
        const uniqueIds = Array.from(new Set(ids));
        if (uniqueIds.length === 0) {
            throw new InvalidPropsException('Order must reference at least one organization');
        }

        const derived = this.extractOrganizationIdsFromItems();
        const mismatch = uniqueIds.length !== derived.length || uniqueIds.some((id) => !derived.includes(id));
        if (mismatch) {
            throw new InvalidPropsException('Organization IDs do not match order items');
        }

        this.props.organizationIds = uniqueIds;
    }

    private refreshOrganizationIds(): void {
        const ids = this.extractOrganizationIdsFromItems();
        if (ids.length === 0) {
            throw new InvalidPropsException('Order must have at least one organization');
        }
        this.props.organizationIds = ids;
    }

    private extractOrganizationIdsFromItems(): string[] {
        if (!this.props.items || this.props.items.length === 0) {
            return [];
        }

        const ids = this.props.items.map((item) => item.organizationId).filter((id) => !!id && id.trim() !== '');
        return Array.from(new Set(ids));
    }

    get id(): string {
        return this._id;
    }

    get organizationIds(): string[] {
        return this.props.organizationIds;
    }
    
    get cliente(): Cliente | undefined {
        return this.props.cliente;
    }

    get total(): number {
        return this.props.total;
    }

    get status(): OrderStatus {
        return this.props.status;
    }

    get items(): OrderItem[] {
        return this.props.items;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toDto(): OrderDto {
        return {
            id: this._id,
            cliente: this.props.cliente,
            organizationIds: this.props.organizationIds,
            total: this.props.total,
            status: this.props.status,
            items: this.props.items.map(item => item.toDto()),
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }

    toOrganizationDto(organizationId: string): OrganizationOrderDto {
        const orgItems = this.props.items.filter(item => item.organizationId === organizationId);
        const orgTotal = orgItems.reduce((sum, item) => sum + item.subtotal, 0);

        return {
            id: this._id,
            cliente: this.props.cliente,
            total: Number(orgTotal.toFixed(2)),
            items: orgItems.map(item => item.toDto()),
            status: this.props.status,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}