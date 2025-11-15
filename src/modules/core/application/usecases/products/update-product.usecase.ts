import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { UpdateProductDto } from '../../dtos/products/updateProduct.dto';
import { ProductDto } from '../../../domain/product';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

type UpdateProductUseCaseProps = {
    id: string;
    organizationId: string;
    product: UpdateProductDto;
};

@Injectable()
export class UpdateProductUseCase {
    constructor(@Inject(PRODUCT_REPOSITORY) private productRepository) {}

    async execute(
        props: UpdateProductUseCaseProps,
    ): Promise<ProductDto> {
        if (!props.id || !props.organizationId) {
            throw new InvalidPropsException('Product ID and Organization ID are required');
        }
        if (!props.product) {
            throw new InvalidPropsException('Product data is required for update');
        }
        const product = await this.productRepository.findByIdAndOrganizationId(
            props.id,
            props.organizationId,
        );

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (props.product.name !== undefined) {
            const existing = await this.productRepository.findByNameAndOrganizationId(
                props.product.name,
                props.organizationId,
            );
            if (existing && existing.id !== props.id) {
                throw new ConflictException('Product with this name already exists');
            }
        }

        product.update(props.id, {
            ...props.product,
            organizationId: props.organizationId
        });

        const updatedProduct = await this.productRepository.save(product);

        return updatedProduct.toDto();
    }
}
