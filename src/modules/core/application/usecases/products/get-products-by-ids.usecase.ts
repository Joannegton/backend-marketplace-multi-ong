import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';

@Injectable()
export class GetProductsByIdsUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: ProductRepository,
    ) {}

    async execute(ids: string[]) {
        if (!ids || ids.length === 0) {
            return [];
        }

        const products = await this.productRepository.findByIds(ids);

        return products.map((product) => product.toDto());
    }
}
