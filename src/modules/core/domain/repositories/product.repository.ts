import { Product } from '../product';

export interface ProductRepository {
    save(product: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findByIdAndOrganizationId(id: string, organizationId: string): Promise<Product | null>;
    findByNameAndOrganizationId(name: string, organizationId: string): Promise<Product | null>;
    findAllByOrganizationId(organizationId: string, onlyActive?: boolean): Promise<Product[]>;
    findByIds(ids: string[], organizationId?: string): Promise<Product[]>;
    disable(id: string, organizationId: string): Promise<void>;
}
