import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/product';
import { ProductEntity } from '../entities/product.entity';
import { ProductMapper } from '../mappers/product.mapper';
import { RepositoryException } from 'src/exceptions/repository.exception';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) {}

    async save(product: Product): Promise<Product> {
        try {
            const entity = ProductMapper.toEntity(product);
            const result = await this.productRepository.save(entity);
            return ProductMapper.toDomain(result);
        } catch (error) {
            throw new RepositoryException(
                `Failed to create product: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async findById(id: string): Promise<Product | null> {
        try {
            const entity = await this.productRepository.findOne({
                where: { id, isActive: true },
            });
            if (!entity) {
                return null;
            }

            const product = ProductMapper.toDomain(entity);

            return product;
        } catch (error) {
            throw new RepositoryException(
                `Failed to find product by id: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async findByIdAndOrganizationId(
        id: string,
        organizationId: string,
    ): Promise<Product | null> {
        try {
            const entity = await this.productRepository.findOne({
                where: { id, organizationId, isActive: true },
            });
            if (!entity) {
                return null;
            }

            const product = ProductMapper.toDomain(entity);

            return product;
        } catch (error) {
            throw new RepositoryException(
                `Failed to find product by id and organization: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async findByNameAndOrganizationId(
        name: string,
        organizationId: string,
    ): Promise<Product | null> {
        try {
            const entity = await this.productRepository.findOne({
                where: { name, organizationId },
            });
            if (!entity) {
                return null;
            }

            const product = ProductMapper.toDomain(entity);

            return product;
        } catch (error) {
            throw new RepositoryException(
                `Failed to find product by name and organization: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async findAllByOrganizationId(
        organizationId: string,
        onlyActive: boolean = true,
    ): Promise<Product[]> {
        try {
            const query = this.productRepository.createQueryBuilder('product')
                .where('product.organizationId = :organizationId', { organizationId });

            if (onlyActive) {
                query.andWhere('product.isActive = :isActive', { isActive: true });
            }

            query.orderBy('product.createdAt', 'DESC');

            const entity = await query.getMany();
            if (entity.length === 0) {
                return [];
            }

            return entity.map(item => ProductMapper.toDomain(item));
        } catch (error) {
            throw new RepositoryException(
                `Failed to find all products by organization: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async findByIds(ids: string[], organizationId?: string): Promise<Product[]> {
        try {
            const query = this.productRepository.createQueryBuilder('product')
                .where('product.id IN (:...ids)', { ids })
                .andWhere('product.isActive = :isActive', { isActive: true });

            if (organizationId) {
                query.andWhere('product.organizationId = :organizationId', {
                    organizationId,
                });
            }

            const entity = await query.getMany();
            if (entity.length === 0) {
                return [];
            }

            return entity.map(item => ProductMapper.toDomain(item));
        } catch (error) {
            throw new RepositoryException(
                `Failed to find products by ids: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async disable(id: string, organizationId: string): Promise<void> {
        try {
            await this.productRepository.update(
                { id, organizationId },
                { isActive: false },
            );
        } catch (error) {
            throw new RepositoryException(
                `Failed to deactivate product: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }
}
