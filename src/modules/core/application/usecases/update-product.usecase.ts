import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { ProductDto } from '../../domain/product';
import { PRODUCT_REPOSITORY } from '../../core.tokens';
import { UpdateProductDto } from '../dtos/products/updateProduct.dto';

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

        product.update(props.id,{
            ...props.product, 
            organizationId: props.organizationId
          });

        await this.productRepository.save(product);

        return product.toDto();
    }
}
