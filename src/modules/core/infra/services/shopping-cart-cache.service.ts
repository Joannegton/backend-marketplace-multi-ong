import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';
import { ShoppingCart } from '../../domain/shopping-cart';
import { ShoppingCartRepository } from '../../domain/repositories/shopping-cart.repository';
import { ShoppingCartEntity } from '../entities/shopping-cart.entity';
import { ShoppingCartMapper } from '../mappers/shopping-cart.mapper';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { PRODUCT_REPOSITORY } from '../../core.tokens';
import type { ProductRepository } from '../../domain/repositories/product.repository';

export type CachedCart = {
    id: string;
    items: any[];
    status: string;
    expiresAt: number;
    createdAt: number;
    updatedAt: number;
};

@Injectable()
export class ShoppingCartCacheService implements ShoppingCartRepository {
    private readonly CART_KEY_PREFIX = 'cart:';
    private readonly cartTtlSeconds: number;

    constructor(
        @InjectQueue('carts') private readonly cartsQueue: Queue,
        @InjectRepository(ShoppingCartEntity)
        private readonly cartRepository: Repository<ShoppingCartEntity>,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        const cartTtlMinutes = this.configService.get<number>('CART_TTL_MINUTES', 20);
        this.cartTtlSeconds = cartTtlMinutes * 60;
    }

    async save(cart: ShoppingCart): Promise<ShoppingCart> {
        try {
            const redis = this.cartsQueue.client;
            const cartKey = this.getCartKey(cart.id);

            const cachedCart = this.toCacheFormat(cart);

            await redis.setex(
                cartKey,
                this.cartTtlSeconds,
                JSON.stringify(cachedCart),
            );

            await this.cartsQueue.add(
                'persist-shopping-cart',
                {
                    cart: this.serializeCart(cart),
                    timestamp: Date.now(),
                },
                {
                    delay: 100,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                },
            );

            return cart;
        } catch (error) {
            this.logger.error('Failed to cache shopping cart', {
                cartId: cart.id,
                error: error.message,
                category: 'business',
            });
            throw new InvalidPropsException(
                `Failed to cache shopping cart: ${error.message}`,
            );
        }
    }

    async findById(id: string): Promise<ShoppingCart | null> {
        try {
            const redis = this.cartsQueue.client;
            const cartKey = this.getCartKey(id);

            const cachedData = await redis.get(cartKey);
            if (cachedData) {
                const cachedCart = JSON.parse(cachedData) as CachedCart;
                const products = await this.productRepository.findByIds(
                    cachedCart.items.map((item: any) => item.productId),
                );
                return ShoppingCartMapper.toDomain(
                    this.fromCacheFormat(cachedCart),
                    products,
                );
            }

            const entity = await this.cartRepository.findOne({
                where: { id },
            });

            if (!entity) {
                return null;
            }

            const cart = await this.restoreFromDB(entity, id);
            if (cart) {
                await redis.setex(
                    cartKey,
                    this.cartTtlSeconds,
                    JSON.stringify(this.toCacheFormat(cart)),
                );
            }

            return cart;
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to find shopping cart: ${error.message}`,
            );
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const redis = this.cartsQueue.client;
            const cartKey = this.getCartKey(id);

            await redis.del(cartKey);

            await this.cartsQueue.add(
                'delete-shopping-cart',
                { cartId: id },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                },
            );
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to delete shopping cart: ${error.message}`,
            );
        }
    }

    async deleteWithQueryRunner(id: string, queryRunner: QueryRunner): Promise<void> {
        try {
            const redis = this.cartsQueue.client;
            const cartKey = this.getCartKey(id);

            await redis.del(cartKey);

            await queryRunner.manager.delete(ShoppingCartEntity, id);

            await this.cartsQueue.add(
                'delete-shopping-cart',
                { cartId: id },
                {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                },
            );
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to delete shopping cart: ${error.message}`,
            );
        }
    }

    async exists(id: string): Promise<boolean> {
        try {
            const redis = this.cartsQueue.client;
            const cartKey = this.getCartKey(id);

            const exists = await redis.exists(cartKey);
            if (exists) {
                return true;
            }

            const dbCart = await this.cartRepository.findOne({
                where: { id },
            });

            return !!dbCart;
        } catch (error) {
            return false;
        }
    }

    async getAllFromCache(): Promise<ShoppingCart[]> {
        try {
            const redis = this.cartsQueue.client;
            const pattern = `${this.CART_KEY_PREFIX}*`;
            const keys = await redis.keys(pattern);

            const carts: ShoppingCart[] = [];

            for (const key of keys) {
                const cachedData = await redis.get(key);
                if (cachedData) {
                    const cachedCart = JSON.parse(cachedData) as CachedCart;
                    const products = await this.productRepository.findByIds(
                        cachedCart.items.map((item: any) => item.productId),
                    );
                    const cart = ShoppingCartMapper.toDomain(
                        this.fromCacheFormat(cachedCart),
                        products,
                    );
                    carts.push(cart);
                }
            }

            return carts;
        } catch (error) {
            throw new InvalidPropsException(
                `Failed to get carts from cache: ${error.message}`,
            );
        }
    }

    private getCartKey(id: string): string {
        return `${this.CART_KEY_PREFIX}${id}`;
    }

    private toCacheFormat(cart: ShoppingCart): CachedCart {
        return {
            id: cart.id,
            items: cart.items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
                subtotal: item.subtotal,
            })),
            status: cart.status,
            expiresAt: cart.expiresAt.getTime(),
            createdAt: cart.createdAt.getTime(),
            updatedAt: cart.updatedAt.getTime(),
        };
    }

    private fromCacheFormat(cached: CachedCart): ShoppingCartEntity {
        const entity = new ShoppingCartEntity();
        entity.id = cached.id;
        entity.items = cached.items;
        entity.status = cached.status as any;
        entity.expiresAt = new Date(cached.expiresAt);
        entity.createdAt = new Date(cached.createdAt);
        entity.updatedAt = new Date(cached.updatedAt);
        return entity;
    }

    private serializeCart(cart: ShoppingCart): any {
        return {
            id: cart.id,
            items: cart.items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                priceSnapshot: Number(item.priceSnapshot),
                subtotal: Number(item.subtotal),
            })),
            status: cart.status,
            expiresAt: cart.expiresAt,
            createdAt: cart.createdAt,
            updatedAt: new Date(),
        };
    }

    private async restoreFromDB(
        entity: ShoppingCartEntity,
        id: string,
    ): Promise<ShoppingCart | null> {
        try {
            const products = await this.productRepository.findByIds(
                entity.items.map((item: any) => item.productId),
            );
            return ShoppingCartMapper.toDomain(entity, products);
        } catch (error) {
            return null;
        }
    }
}
