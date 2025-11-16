import { Product } from '../product';
import { QueryRunner } from 'typeorm';

export interface ProductRepository {
    save(product: Product): Promise<Product>;
    saveWithQueryRunner(product: Product, queryRunner: QueryRunner): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findByIdAndOrganizationId(id: string, organizationId: string): Promise<Product | null>;
    findByNameAndOrganizationId(name: string, organizationId: string): Promise<Product | null>;
    findAll(onlyActive?: boolean): Promise<Product[]>;
    findAllByOrganizationId(organizationId: string, onlyActive?: boolean): Promise<Product[]>;
    findByIds(ids: string[], organizationId?: string): Promise<Product[]>;
    findByIdsWithLock(ids: string[], queryRunner: QueryRunner): Promise<Product[]>;
    findByIdWithLock(id: string, queryRunner: QueryRunner): Promise<Product | null>;
    search(
        query: string,
        minPrice?: number,
        maxPrice?: number,
        limit?: number,
        offset?: number,
        category?: string,
    ): Promise<Product[]>;
    disable(id: string, organizationId: string): Promise<void>;
}
