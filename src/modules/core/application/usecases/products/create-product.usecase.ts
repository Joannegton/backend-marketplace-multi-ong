import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { Product, ProductDto } from '../../../domain/product';
import { CreateProductDto } from '../../dtos/products/createProduct.dto';
import { PRODUCT_REPOSITORY, PRODUCT_CACHE_SERVICE } from '../../../core.tokens';
import { ProductCacheService } from '../../../infra/services/product-cache.service';
import type { ProductRepository } from 'src/modules/core/domain/repositories/product.repository';

type CreateProductUsecaseProps = {
    organizationId: string;
} & CreateProductDto;

@Injectable()
export class CreateProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
        @Inject(PRODUCT_CACHE_SERVICE) private readonly cacheService: ProductCacheService,
    ) {}

    async execute(props: CreateProductUsecaseProps): Promise<ProductDto> {
        if (!props.organizationId) {
            throw new BadRequestException('Organization ID is required');
        }
        const productExists = await this.productRepository.findByNameAndOrganizationId(
            props.name.trim(),
            props.organizationId,
        );

        if (productExists) {
            throw new ConflictException('Product with this name already exists in this organization');
        }

        const product = Product.create({
            name: props.name.trim(),
            description: props.description,
            price: props.price,
            weight: props.weight,
            stock: props.stock,
            imageUrl: props.imageUrl,
            category: props.category,
            organizationId: props.organizationId,
        });

        const createdProduct = await this.productRepository.save(product);

        await this.cacheService.invalidateAllProductCaches(props.organizationId);

        return createdProduct.toDto();
    }
}
