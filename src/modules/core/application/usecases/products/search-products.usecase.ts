import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { OpenAiService } from '../../../infra/services/openai.service';
import type { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product, ProductDto } from '../../../domain/product';
import { SearchProductsDto } from '../../dtos/search-products.dto';
import {
    PRODUCT_REPOSITORY,
    PRODUCT_CACHE_SERVICE,
} from '../../../core.tokens';
import { ProductCacheService } from '../../../infra/services/product-cache.service';

export interface SearchResult {
    query: string;
    enhancedQuery: string;
    results: ProductDto[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
}

@Injectable()
export class SearchProductsUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        private readonly openAiService: OpenAiService,
        @Inject(PRODUCT_CACHE_SERVICE)
        private readonly cacheService: ProductCacheService,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    async execute(props: SearchProductsDto): Promise<SearchResult> {
        const startTime = Date.now();
        const hasQuery = props.query && props.query.trim().length > 0;

        const limit = props.limit || 10;
        const offset = props.offset || 0;

        const searchCacheKey = this.cacheService.generateSearchKey(
            props.query || '',
            props.minPrice,
            props.maxPrice,
            props.category,
            limit,
            offset,
        );

        const cachedResult = await this.cacheService.getSearch(searchCacheKey);
        if (cachedResult) {
            this.logger.debug('Search cache hit', {
                query: props.query,
                hasQuery,
                latency: `${Date.now() - startTime}ms`,
                category: 'cache',
            });
            return cachedResult;
        }

        if (hasQuery) {
            return this.executeWithAI(
                props,
                limit,
                offset,
                startTime,
                searchCacheKey,
            );
        } else {
            return this.executeWithFilters(
                props,
                limit,
                offset,
                startTime,
                searchCacheKey,
            );
        }
    }

    private async executeWithAI(
        props: SearchProductsDto,
        limit: number,
        offset: number,
        startTime: number,
        searchCacheKey: string,
    ): Promise<SearchResult> {
        try {
            const enhancedQuery = await this.openAiService.enhanceQuery(
                props.query!,
            );

            const latency = Date.now() - startTime;
            this.logger.info('Query enhanced successfully', {
                originalQuery: props.query,
                enhancedQuery,
                latency: `${latency}ms`,
            });

            const results = await this.productRepository.search(
                enhancedQuery,
                props.minPrice,
                props.maxPrice,
                limit,
                offset,
                props.category,
            );

            const total =
                results.length > 0
                    ? results[0]['__total__'] || results.length
                    : 0;

            const searchResult: SearchResult = {
                query: props.query!,
                enhancedQuery,
                results: results.map((product: Product) => product.toDto()),
                pagination: {
                    limit,
                    offset,
                    total,
                    hasMore: offset + limit < total,
                },
            };

            this.logger.info('AI search completed successfully', {
                query: props.query,
                resultsCount: results.length,
                totalLatency: `${Date.now() - startTime}ms`,
                usedAI: true,
                pagination: { limit, offset, total },
            });

            await this.cacheService.setSearch(searchCacheKey, searchResult);

            return searchResult;
        } catch (error) {
            this.logger.warn('AI enhancement failed, using fallback', {
                query: props.query,
                error: error.message,
                latency: `${Date.now() - startTime}ms`,
            });

            return this.executeWithFilters(
                props,
                limit,
                offset,
                startTime,
                searchCacheKey,
            );
        }
    }

    private async executeWithFilters(
        props: SearchProductsDto,
        limit: number,
        offset: number,
        startTime: number,
        searchCacheKey: string,
    ): Promise<SearchResult> {
        const results = await this.productRepository.search(
            '',
            props.minPrice,
            props.maxPrice,
            limit,
            offset,
            props.category,
        );

        const total =
            results.length > 0 ? results[0]['__total__'] || results.length : 0;

        const searchResult: SearchResult = {
            query: props.query || '',
            enhancedQuery: props.query || '',
            results: results.map((product: Product) => product.toDto()),
            pagination: {
                limit,
                offset,
                total,
                hasMore: offset + limit < total,
            },
        };

        this.logger.info('Filter search completed successfully', {
            filters: {
                minPrice: props.minPrice,
                maxPrice: props.maxPrice,
                category: props.category,
            },
            resultsCount: results.length,
            totalLatency: `${Date.now() - startTime}ms`,
            usedAI: false,
            pagination: { limit, offset, total },
        });

        await this.cacheService.setSearch(searchCacheKey, searchResult);

        return searchResult;
    }
}
