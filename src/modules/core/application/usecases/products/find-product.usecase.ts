import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { ProductDto } from '../../../domain/product';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';

type FindProductUseCaseProps = {
    id: string;
    organizationId: string;
};

@Injectable()
export class FindProductUseCase {
    constructor(@Inject(PRODUCT_REPOSITORY) private productRepository) {}

    async execute(props: FindProductUseCaseProps): Promise<ProductDto> {
        if (!props.id || !props.organizationId) {
            throw new BadRequestException('ID and Organization ID are required');
        }

        const product = await this.productRepository.findByIdAndOrganizationId(
            props.id,
            props.organizationId,
        );

        if (!product) {
            throw new NotFoundException('Product not found in this organization');
        }

        return product.toDto();
    }
}
