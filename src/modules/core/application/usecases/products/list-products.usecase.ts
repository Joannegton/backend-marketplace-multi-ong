import { Injectable, Inject } from '@nestjs/common';
import { ProductDto } from '../../../domain/product';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';

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
    constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepository) {}

    async execute(organizationId: string): Promise<ProductDto[]> {
        if (!organizationId) {
            throw new InvalidPropsException('Organization ID is required');
        }

        const products = await this.productRepository.findAllByOrganizationId(organizationId);

        const productsDto = products.map((product) => product.toDto());

        return productsDto;
    }

    async executeCatalog(limit: number, offset: number): Promise<CatalogResult> {
        if (limit <= 0 || limit > 100) {
            limit = 10;
        }
        if (offset < 0) {
            offset = 0;
        }

        const allProducts = await this.productRepository.findAll(true);
        const total = allProducts.length;

        const products = allProducts.slice(offset, offset + limit);

        const resultsDto = products.map((product) => product.toDto());

        return {
            results: resultsDto,
            pagination: {
                limit,
                offset,
                total,
                hasMore: offset + limit < total,
            },
        };
    }
}
