import { Injectable, Inject } from '@nestjs/common';
import { ProductDto } from '../../../domain/product';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { PRODUCT_REPOSITORY } from '../../../core.tokens';

@Injectable()
export class ListProductsUseCase {
    constructor(@Inject(PRODUCT_REPOSITORY) private productRepository) {}

    async execute(organizationId: string): Promise<ProductDto[]> {
        if (!organizationId) {
            throw new InvalidPropsException('Organization ID is required');
        }

        const products = await this.productRepository.findAllByOrganizationId(organizationId);

        const productsDto = products.map((product) => product.toDto());

        return productsDto;
    }
}
