import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
    PRODUCT_REPOSITORY,
    PRODUCT_CACHE_SERVICE,
} from '../../../core.tokens';
import { ProductCacheService } from '../../../infra/services/product-cache.service';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';

@Injectable()
export class DeleteProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
        @Inject(PRODUCT_CACHE_SERVICE)
        private readonly cacheService: ProductCacheService,
    ) {}

    async execute(id: string, organizationId: string): Promise<void> {
        if (!id || !organizationId) {
            throw new InvalidPropsException(
                'ID and Organization ID are required',
            );
        }

        const product = await this.productRepository.findByIdAndOrganizationId(
            id,
            organizationId,
            false,
        );

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        await this.productRepository.delete(id, organizationId);

        await this.cacheService.invalidateAllProductCaches(organizationId);
    }
}
