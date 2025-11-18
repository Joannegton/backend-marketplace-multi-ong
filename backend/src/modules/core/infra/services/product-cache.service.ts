import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';
import { Product } from '../../domain/product';

export type CachedCatalog = {
    results: any[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
};

export type CachedSearch = {
    query: string;
    enhancedQuery: string;
    results: any[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
};

@Injectable()
export class ProductCacheService {
    private readonly CATALOG_KEY = 'catalog:';
    private readonly SEARCH_KEY = 'search:';
    private readonly ORG_PRODUCTS_KEY = 'org-products:';
    private readonly catalogTtlSeconds: number;
    private readonly searchTtlSeconds: number;
    private readonly orgProductsTtlSeconds: number;

    constructor(
        @InjectQueue('carts') private readonly queue: Queue,
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        const catalogTtlMinutes = this.configService.get<number>('CATALOG_CACHE_TTL_MINUTES', 30);
        const searchTtlMinutes = this.configService.get<number>('SEARCH_CACHE_TTL_MINUTES', 15);
        const orgProductsTtlMinutes = this.configService.get<number>('ORG_PRODUCTS_CACHE_TTL_MINUTES', 20);

        this.catalogTtlSeconds = catalogTtlMinutes * 60;
        this.searchTtlSeconds = searchTtlMinutes * 60;
        this.orgProductsTtlSeconds = orgProductsTtlMinutes * 60;
    }

    async setCatalog(limit: number, offset: number, data: CachedCatalog): Promise<void> {
        try {
            const redis = this.queue.client;
            const key = this.getCatalogKey(limit, offset);
            await redis.setex(key, this.catalogTtlSeconds, JSON.stringify(data));
            this.logger.debug('Catalog cached', {
                key,
                limit,
                offset,
                ttl: this.catalogTtlSeconds,
                category: 'cache',
            });
        } catch (error) {
            this.logger.error('Failed to cache catalog', {
                error: error.message,
                category: 'cache',
            });
        }
    }

    async getCatalog(limit: number, offset: number): Promise<CachedCatalog | null> {
        try {
            const redis = this.queue.client;
            const key = this.getCatalogKey(limit, offset);
            const cachedData = await redis.get(key);

            if (cachedData) {
                this.logger.debug('Catalog cache hit', {
                    key,
                    category: 'cache',
                });
                return JSON.parse(cachedData);
            }

            this.logger.debug('Catalog cache miss', {
                key,
                category: 'cache',
            });
            return null;
        } catch (error) {
            this.logger.error('Failed to retrieve catalog from cache', {
                error: error.message,
                category: 'cache',
            });
            return null;
        }
    }

    async setSearch(searchKey: string, data: CachedSearch): Promise<void> {
        try {
            const redis = this.queue.client;
            const key = this.getSearchKey(searchKey);
            await redis.setex(key, this.searchTtlSeconds, JSON.stringify(data));
            this.logger.debug('Search cached', {
                key,
                ttl: this.searchTtlSeconds,
                category: 'cache',
            });
        } catch (error) {
            this.logger.error('Failed to cache search', {
                error: error.message,
                category: 'cache',
            });
        }
    }

    async getSearch(searchKey: string): Promise<CachedSearch | null> {
        try {
            const redis = this.queue.client;
            const key = this.getSearchKey(searchKey);
            const cachedData = await redis.get(key);

            if (cachedData) {
                this.logger.debug('Search cache hit', {
                    key,
                    category: 'cache',
                });
                return JSON.parse(cachedData);
            }

            this.logger.debug('Search cache miss', {
                key,
                category: 'cache',
            });
            return null;
        } catch (error) {
            this.logger.error('Failed to retrieve search from cache', {
                error: error.message,
                category: 'cache',
            });
            return null;
        }
    }

    async setOrgProducts(organizationId: string, products: Product[]): Promise<void> {
        try {
            const redis = this.queue.client;
            const key = this.getOrgProductsKey(organizationId);
            await redis.setex(
                key,
                this.orgProductsTtlSeconds,
                JSON.stringify(products.map(p => p.toDto())),
            );
            this.logger.debug('Organization products cached', {
                key,
                organizationId,
                count: products.length,
                ttl: this.orgProductsTtlSeconds,
                category: 'cache',
            });
        } catch (error) {
            this.logger.error('Failed to cache organization products', {
                organizationId,
                error: error.message,
                category: 'cache',
            });
        }
    }

    async getOrgProducts(organizationId: string): Promise<Product[] | null> {
        try {
            const redis = this.queue.client;
            const key = this.getOrgProductsKey(organizationId);
            const cachedData = await redis.get(key);

            if (cachedData) {
                this.logger.debug('Organization products cache hit', {
                    key,
                    organizationId,
                    category: 'cache',
                });
                return JSON.parse(cachedData);
            }

            this.logger.debug('Organization products cache miss', {
                key,
                organizationId,
                category: 'cache',
            });
            return null;
        } catch (error) {
            this.logger.error('Failed to retrieve organization products from cache', {
                organizationId,
                error: error.message,
                category: 'cache',
            });
            return null;
        }
    }

    async invalidateCatalog(): Promise<void> {
        try {
            const redis = this.queue.client;
            const pattern = `${this.CATALOG_KEY}*`;
            const keys = await redis.keys(pattern);

            if (keys.length > 0) {
                await redis.del(...keys);
                this.logger.info('Catalog cache invalidated', {
                    keysRemoved: keys.length,
                    category: 'cache',
                });
            }
        } catch (error) {
            this.logger.error('Failed to invalidate catalog cache', {
                error: error.message,
                category: 'cache',
            });
        }
    }

    async invalidateSearches(): Promise<void> {
        try {
            const redis = this.queue.client;
            const pattern = `${this.SEARCH_KEY}*`;
            const keys = await redis.keys(pattern);

            if (keys.length > 0) {
                await redis.del(...keys);
                this.logger.info('Search cache invalidated', {
                    keysRemoved: keys.length,
                    category: 'cache',
                });
            }
        } catch (error) {
            this.logger.error('Failed to invalidate search cache', {
                error: error.message,
                category: 'cache',
            });
        }
    }

    async invalidateOrgProducts(organizationId: string): Promise<void> {
        try {
            const redis = this.queue.client;
            const key = this.getOrgProductsKey(organizationId);
            const deleted = await redis.del(key);

            if (deleted > 0) {
                this.logger.info('Organization products cache invalidated', {
                    key,
                    organizationId,
                    category: 'cache',
                });
            }
        } catch (error) {
            this.logger.error('Failed to invalidate organization products cache', {
                organizationId,
                error: error.message,
                category: 'cache',
            });
        }
    }

    async invalidateAllProductCaches(organizationId?: string): Promise<void> {
        try {
            const redis = this.queue.client;

            const catalogPattern = `${this.CATALOG_KEY}*`;
            const searchPattern = `${this.SEARCH_KEY}*`;

            const catalogKeys = await redis.keys(catalogPattern);
            const searchKeys = await redis.keys(searchPattern);

            const keysToDelete = [...catalogKeys, ...searchKeys];

            if (organizationId) {
                const orgKey = this.getOrgProductsKey(organizationId);
                keysToDelete.push(orgKey);
            }

            if (keysToDelete.length > 0) {
                await redis.del(...keysToDelete);
                this.logger.info('All product caches invalidated', {
                    keysRemoved: keysToDelete.length,
                    organizationId,
                    category: 'cache',
                });
            }
        } catch (error) {
            this.logger.error('Failed to invalidate all product caches', {
                organizationId,
                error: error.message,
                category: 'cache',
            });
        }
    }

    private getCatalogKey(limit: number, offset: number): string {
        return `${this.CATALOG_KEY}limit:${limit}:offset:${offset}`;
    }

    private getSearchKey(searchKey: string): string {
        return `${this.SEARCH_KEY}${searchKey}`;
    }

    private getOrgProductsKey(organizationId: string): string {
        return `${this.ORG_PRODUCTS_KEY}${organizationId}`;
    }

    generateSearchKey(query: string, minPrice?: number, maxPrice?: number, category?: string, limit?: number, offset?: number): string {
        const parts = [query, minPrice, maxPrice, category, limit, offset]
            .map(p => (p !== undefined && p !== null ? String(p) : ''))
            .filter(p => p.length > 0);
        return parts.join(':');
    }
}
