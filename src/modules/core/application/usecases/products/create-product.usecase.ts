import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { Product, ProductDto } from '../../../domain/product';
import { CreateProductDto } from '../../dtos/products/createProduct.dto';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';

type CreateProductUsecaseProps = {
    organizationId: string;
} & CreateProductDto;

@Injectable()
export class CreateProductUseCase {
    constructor(@Inject(PRODUCT_REPOSITORY) private productRepository) {}

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
            organizationId: props.organizationId,
        });

        const createdProduct = await this.productRepository.create(product);

        return createdProduct.toDto();
    }
}
