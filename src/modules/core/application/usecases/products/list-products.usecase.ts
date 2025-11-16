import { Injectable, Inject } from '@nestjs/common';
import { ProductDto } from '../../../domain/product';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { PRODUCT_REPOSITORY, PRODUCT_CACHE_SERVICE } from '../../../core.tokens';
import { ProductCacheService } from '../../../infra/services/product-cache.service';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';

export interface CatalogResult {
    results: ProductDto[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
}

@Injectable()
export class ListProductsUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
        @Inject(PRODUCT_CACHE_SERVICE) private readonly cacheService: ProductCacheService,
    ) {}

    async execute(organizationId: string): Promise<ProductDto[]> {
        if (!organizationId) {
            throw new InvalidPropsException('Organization ID is required');
        }

        const cachedProducts = await this.cacheService.getOrgProducts(organizationId);
        if (cachedProducts) {
            return cachedProducts;
        }

        const products = await this.productRepository.findAllByOrganizationId(organizationId);
        const productsDto = products.map((product) => product.toDto());

        await this.cacheService.setOrgProducts(organizationId, products);

        return productsDto;
    }

    async executeCatalog(limit: number, offset: number): Promise<CatalogResult> {
        if (limit <= 0 || limit > 100) {
            limit = 10;
        }
        if (offset < 0) {
            offset = 0;
        }

        const cachedResult = await this.cacheService.getCatalog(limit, offset);
        if (cachedResult) {
            return cachedResult;
        }

        const allProducts = await this.productRepository.findAll(true);
        const total = allProducts.length;

        const products = allProducts.slice(offset, offset + limit);

        const resultsDto = products.map((product) => product.toDto());

        const result: CatalogResult = {
            results: resultsDto,
            pagination: {
                limit,
                offset,
                total,
                hasMore: offset + limit < total,
            },
        };

        await this.cacheService.setCatalog(limit, offset, result);

        return result;
    }
}
