import { InvalidPropsException } from "src/exceptions/invalidProps.exception";

export type ProductDto = {
    id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    stock: number;
    imageUrl?: string;
    organizationId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type ProductProps = {
    name: string;
    description: string;
    price: number;
    weight: number;
    stock: number;
    reservedStock: number;
    imageUrl?: string;
    organizationId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type CreateProductProps = Omit<ProductProps, 'isActive' | 'createdAt' | 'updatedAt' | 'reservedStock'>;

type UpdateProductProps = {
    name?: string;
    description?: string;
    price?: number;
    weight?: number;
    stock?: number;
    imageUrl?: string;
    organizationId: string;
}

export class Product {
    private readonly _id: string;
    private readonly props: ProductProps;
    
    constructor(id?: string) {
        if (id) {
            this._id = id;
        }
        this.props = {} as ProductProps;
    }

    static create(props: CreateProductProps): Product {
        const product = new Product();
        product.setName(props.name);
        product.setDescription(props.description);
        product.setPrice(props.price);
        product.setWeight(props.weight);
        product.setStock(props.stock);
        product.setReservedStock(0);
        product.setImageUrl(props.imageUrl);
        product.setOrganizationId(props.organizationId);
        product.setIsActive(true);
        return product;
    }

    static load(props: ProductProps, id: string): Product {
        const product = new Product(id);
        product.setName(props.name);
        product.setDescription(props.description);
        product.setPrice(props.price);
        product.setWeight(props.weight);
        product.setStock(props.stock);
        product.setReservedStock(props.reservedStock);
        product.setImageUrl(props.imageUrl);
        product.setOrganizationId(props.organizationId);
        product.setIsActive(props.isActive);
        product.setCreatedAt(props.createdAt);
        product.setUpdatedAt(props.updatedAt);
        return product;
    }

    public update(id: string, props: UpdateProductProps) {
        if (this._id !== id) {
            throw new InvalidPropsException('Product ID mismatch');
        }
        if (this.props.organizationId !== props.organizationId) {
            throw new InvalidPropsException('Organization ID cannot be changed');
        }
        
        if (props.name !== undefined) this.setName(props.name);
        if (props.description !== undefined) this.setDescription(props.description);
        if (props.price !== undefined) this.setPrice(props.price);
        if (props.weight !== undefined) this.setWeight(props.weight);
        if (props.stock !== undefined) this.setStock(props.stock);
        if (props.imageUrl !== undefined) this.setImageUrl(props.imageUrl);
        return;
    }

    
    updateStock(quantity: number): void {
        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new InvalidPropsException('Stock quantity must be a positive integer');
        }
        this.props.stock = quantity;
    }

    decreaseStock(quantity: number): void {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidPropsException('Quantity to decrease must be a positive integer');
        }
        if (this.props.stock < quantity) {
            throw new InvalidPropsException('Insufficient stock available');
        }
        this.props.stock -= quantity;
    }

    increaseStock(quantity: number): void {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidPropsException('Quantity to increase must be a positive integer');
        }
        this.props.stock += quantity;
    }

    isOutOfStock(): boolean {
        return this.props.stock === 0;
    }

    getAvailableStock(): number {
        return this.props.stock - this.props.reservedStock;
    }

    canReserveStock(quantity: number): boolean {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidPropsException('Quantity must be a positive integer');
        }
        if (this.getAvailableStock() < quantity) {
            return false;
        }
        return true;
    }

    reserveStock(quantity: number): void {
        if (!this.canReserveStock(quantity)) {
            throw new InvalidPropsException(
                `Insufficient stock for product ${this.props.name}. Available: ${this.getAvailableStock()}, Requested: ${quantity}`,
            );
        }
        this.props.reservedStock += quantity;
    }
    releaseReservation(quantity: number): void {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidPropsException('Quantity to release must be a positive integer');
        }
        if (this.props.reservedStock < quantity) {
            throw new InvalidPropsException('Cannot release more stock than reserved');
        }
        this.props.reservedStock -= quantity;
    }

    confirmReservedStock(quantity: number): void {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidPropsException('Quantity to confirm must be a positive integer');
        }
        if (this.props.reservedStock < quantity) {
            throw new InvalidPropsException('Cannot confirm more stock than reserved');
        }
        if (this.props.stock < quantity) {
            throw new InvalidPropsException('Insufficient stock to confirm');
        }
        this.props.stock -= quantity;
        this.props.reservedStock -= quantity;
    }

    disable(): void {
        this.setIsActive(false);
    }

    private setName(name: string) {
        if (!name || name.trim().length === 0) {
            throw new InvalidPropsException('Product name is required');
        }
        if (name.length > 255) {
            throw new InvalidPropsException('Product name must not exceed 255 characters');
        }
        this.props.name = name;
    }

    private setDescription(description: string) {
        if (!description || description.trim().length === 0) {
            throw new InvalidPropsException('Product description is required');
        }
        this.props.description = description;
    }

    private setPrice(price: number) {
        if (price === undefined || price === null) {
            throw new InvalidPropsException('Price is required');
        }
        if (price < 0) {
            throw new InvalidPropsException('Price must be greater than or equal to 0');
        }
        this.props.price = price;
    }

    private setWeight(weight: number) {
        if (weight === undefined || weight === null) {
            weight = 0;
        }
        if (weight < 0) {
            throw new InvalidPropsException('Weight must be greater than or equal to 0');
        }
        this.props.weight = weight;
    }

    private setStock(stock: number) {
        if (stock === undefined || stock === null) {
            stock = 0;
        }
        if (stock < 0 || !Number.isInteger(stock)) {
            throw new InvalidPropsException('Stock must be a positive integer');
        }
        this.props.stock = stock;
    }

    private setReservedStock(reservedStock: number) {
        if (reservedStock === undefined || reservedStock === null) {
            reservedStock = 0;
        }
        if (reservedStock < 0 || !Number.isInteger(reservedStock)) {
            throw new InvalidPropsException('Reserved stock must be a positive integer');
        }
        this.props.reservedStock = reservedStock;
    }

    private setImageUrl(imageUrl?: string) {
        if (imageUrl && imageUrl.length > 500) {
            throw new InvalidPropsException('Image URL must not exceed 500 characters');
        }
        this.props.imageUrl = imageUrl;
    }

    private setOrganizationId(organizationId: string) {
        if (!organizationId) {
            throw new InvalidPropsException('Organization ID is required');
        }
        this.props.organizationId = organizationId;
    }

    private setIsActive(isActive: boolean) {
        this.props.isActive = isActive;
    }

    private setCreatedAt(createdAt: Date) {
        this.props.createdAt = createdAt;
    }

    private setUpdatedAt(updatedAt: Date) {
        this.props.updatedAt = updatedAt;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string {
        return this.props.description;
    }

    get price(): number {
        return this.props.price;
    }

    get weight(): number {
        return this.props.weight;
    }

    get stock(): number {
        return this.props.stock;
    }

    get imageUrl(): string | undefined {
        return this.props.imageUrl;
    }

    get organizationId(): string {
        return this.props.organizationId;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get reservedStock(): number {
        return this.props.reservedStock;
    }

    public toDto(): ProductDto {
        return {
            id: this._id,
            name: this.props.name,
            description: this.props.description,
            price: this.props.price,
            weight: this.props.weight,
            stock: this.props.stock,
            imageUrl: this.props.imageUrl,
            organizationId: this.props.organizationId,
            isActive: this.props.isActive,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
