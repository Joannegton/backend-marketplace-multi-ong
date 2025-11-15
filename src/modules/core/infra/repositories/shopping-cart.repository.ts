import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { ShoppingCart } from '../../domain/shopping-cart';
import { ShoppingCartRepository } from '../../domain/repositories/shopping-cart.repository';
import { ShoppingCartEntity } from '../entities/shopping-cart.entity';
import { ShoppingCartMapper } from '../mappers/shopping-cart.mapper';
import { PRODUCT_REPOSITORY } from '../../core.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { RepositoryException } from 'src/exceptions/repository.exception';

@Injectable()
export class ShoppingCartRepositoryImpl implements ShoppingCartRepository {
    constructor(
        @InjectRepository(ShoppingCartEntity)
        private readonly repository: Repository<ShoppingCartEntity>,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        private readonly dataSource: DataSource,
    ) {}

    async save(cart: ShoppingCart): Promise<ShoppingCart> {
        try {
            const entity = ShoppingCartMapper.toEntity(cart);
            const savedEntity = await this.repository.save(entity);
            
            const productIds = cart.items.map((item) => item.productId);
            const products = await this.productRepository.findByIds(productIds);
            
            return ShoppingCartMapper.toDomain(savedEntity, products);
        } catch (error) {
            throw new RepositoryException(
                `Failed to save shopping cart: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async findById(id: string): Promise<ShoppingCart | null> {
        try {
            const entity = await this.repository.findOne({
                where: { id },
            });

            if (!entity) {
                return null;
            }

            const productIds = entity.items.map((item) => item.productId);
            const products = await this.productRepository.findByIds(productIds);

            const cart = ShoppingCartMapper.toDomain(entity, products);
            return cart;
        } catch (error) {
            throw new RepositoryException(
                `Failed to find shopping cart by id: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.repository.delete(id);
        } catch (error) {
            throw new RepositoryException(
                `Failed to delete shopping cart: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async deleteWithQueryRunner(id: string, queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.manager.delete(ShoppingCartEntity, id);
        } catch (error) {
            throw new RepositoryException(
                `Failed to delete shopping cart: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }

    async persist(cart: ShoppingCart): Promise<void> {
        try {
            const query = `
                INSERT INTO shopping_carts (id, items, status, "expiresAt", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                    items = EXCLUDED.items,
                    status = EXCLUDED.status,
                    "expiresAt" = EXCLUDED."expiresAt",
                    "updatedAt" = EXCLUDED."updatedAt"
            `;
            const values = [
                cart.id,
                JSON.stringify(cart.items),
                cart.status,
                cart.expiresAt,
                cart.createdAt,
                cart.updatedAt,
            ];
            await this.dataSource.manager.query(query, values);
        } catch (error) {
            throw new RepositoryException(
                `Failed to persist shopping cart: ${error.message ? error.message : "Unknown error"}`,
            );
        }
    }
}
