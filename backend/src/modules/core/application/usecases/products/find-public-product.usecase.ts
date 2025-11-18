import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';

@Injectable()
export class FindPublicProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(id: string) {
        if (!id) {
            throw new NotFoundException('Product ID is required');
        }

        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (!product.isActive) {
            throw new NotFoundException('Product not found');
        }

        return product.toDto();
    }
}
