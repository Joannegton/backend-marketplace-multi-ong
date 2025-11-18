import { InvalidPropsException } from "src/exceptions/invalidProps.exception";

type UserProps = {
    email: string;
    password: string;
    name: string;
    organizationId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

}

type CreateUserProps = Omit<UserProps, 'isActive' | 'createdAt' | 'updatedAt'> 

export class User {
    private readonly _id: string;
    private readonly props: UserProps;
    
    constructor(id?: string) {
        if (id) {
            this._id = id;
        }
        this.props = {} as UserProps;
    }

    static create(props: CreateUserProps): User {
        const user = new User();
        user.setEmail(props.email);
        user.setName(props.name);
        user.setPassword(props.password);
        user.setOrganizationId(props.organizationId);
        user.setIsActive(true);
        return user;
    }

    static load(props: UserProps, id: string): User {
        const user = new User(id);
        user.setEmail(props.email);
        user.setName(props.name);
        user.setPassword(props.password);
        user.setOrganizationId(props.organizationId);
        user.setIsActive(props.isActive);
        user.setCreatedAt(props.createdAt);
        user.setUpdatedAt(props.updatedAt);
        return user;
    }

    private setEmail(email: string) {
        if (!email) {
            throw new InvalidPropsException('Email is required');
        }
        this.props.email = email;
    }

    private setName(name: string) {
        if (!name) {
            throw new InvalidPropsException('Name is required');
        }
        this.props.name = name;
    }

    private setPassword(password: string) {
        if (!password) {
            throw new InvalidPropsException('Password is required');
        }
        if (password.length < 6) {
            throw new InvalidPropsException('Password must be at least 6 characters long');
        }
        if (!/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new InvalidPropsException('Password must contain at least one uppercase letter and one special character');
        }
        this.props.password = password;
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

    get email(): string {
        return this.props.email;
    }

    get name(): string {
        return this.props.name;
    }

    get password(): string {
        return this.props.password;
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

    get organizationId(): string {
        return this.props.organizationId;
    }
}