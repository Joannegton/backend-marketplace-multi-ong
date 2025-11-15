import { InvalidPropsException } from "src/exceptions/invalidProps.exception";
import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from '../../../core.tokens';

@Injectable()
export class DisableProductUseCase {
    constructor(@Inject(PRODUCT_REPOSITORY) private productRepository) {}

    async execute(id: string, organizationId: string): Promise<void> {
        if (!id || !organizationId) {
            throw new InvalidPropsException('ID and Organization ID are required');
        }

        const product = await this.productRepository.findByIdAndOrganizationId(
            id,
            organizationId,
        );

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        product.disable();

        await this.productRepository.disable(id, organizationId);
    }
}