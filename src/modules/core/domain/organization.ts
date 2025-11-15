import { InvalidPropsException } from "src/exceptions/invalidProps.exception";
import { User } from "src/modules/core/domain/user";
import { Product } from "./product";

type OrganizationProps = {
    name: string;
    description: string;
    isActive: boolean;
    users?: User[];
    products?: Product[];
    createdAt: Date;
    updatedAt: Date;
}

export class Organization {
    private readonly _id: string;
    private readonly props: OrganizationProps;

    constructor(id: string) {
        this._id = id;
        this.props = {} as OrganizationProps;
    }

    static load(props: OrganizationProps, id: string): Organization {
        const organization = new Organization(id);
        organization.setName(props.name);
        organization.setDescription(props.description);
        organization.setIsActive(props.isActive);
        organization.setUsers(props.users || []);
        organization.setProducts(props.products || []);
        organization.setCreatedAt(props.createdAt);
        organization.setUpdatedAt(props.updatedAt);
        return organization;
    }

    private setName(name: string) {
        if (!name || name.trim().length === 0) {
            throw new InvalidPropsException('Organization name is required');
        }
        if (name.length > 255) {
            throw new InvalidPropsException('Organization name must not exceed 255 characters');
        }
        this.props.name = name;
    }

    private setDescription(description: string) {
        if (description && description.length > 1000) {
            throw new InvalidPropsException('Organization description must not exceed 1000 characters');
        }
        this.props.description = description;
    }

    private setIsActive(isActive: boolean) {
        this.props.isActive = isActive;
    }

    private setUsers(users: User[]) {
        this.props.users = users;
    }

    private setProducts(products: any[]) {
        this.props.products = products;
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

    get isActive(): boolean {
        return this.props.isActive;
    }

    get users(): User[] | undefined {
        return this.props.users;
    }

    get products(): any[] | undefined {
        return this.props.products;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
