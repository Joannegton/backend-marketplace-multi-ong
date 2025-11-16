import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { OpenAiService } from '../../../infra/services/openai.service';
import type { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/product';
import { SearchProductsDto } from '../../dtos/search-products.dto';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

export interface SearchResult {
    query: string;
    enhancedQuery: string;
    results: Product[];
}

@Injectable()
export class SearchProductsUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        private readonly openAiService: OpenAiService,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {}

    async execute(props: SearchProductsDto): Promise<SearchResult> {
        const startTime = Date.now();
        if (!props.query || props.query.trim().length === 0) {
            throw new InvalidPropsException('Query is required');
        }

        try {
            const enhancedQuery = await this.openAiService.enhanceQuery(
                props.query,
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
                props.limit,
            );

            this.logger.info('Search completed successfully', {
                query: props.query,
                resultsCount: results.length,
                totalLatency: `${Date.now() - startTime}ms`,
                usedAI: true,
            });

            return {
                query: props.query,
                enhancedQuery,
                results,
            };
        } catch (error) {
            this.logger.warn('Query enhancement failed, using fallback', {
                query: props.query,
                error: error.message,
                latency: `${Date.now() - startTime}ms`,
            });

            const results = await this.productRepository.search(
                props.query,
                props.minPrice,
                props.maxPrice,
                props.limit,
            );

            this.logger.info('Fallback search completed', {
                query: props.query,
                resultsCount: results.length,
                totalLatency: `${Date.now() - startTime}ms`,
                usedAI: false,
            });

            return {
                query: props.query,
                enhancedQuery: props.query,
                results,
            };
        }
    }
}
