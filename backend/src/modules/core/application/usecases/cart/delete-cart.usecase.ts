import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { SHOPPING_CART_REPOSITORY } from 'src/modules/core/core.tokens';
import type { ShoppingCartRepository } from 'src/modules/core/domain/repositories/shopping-cart.repository';

@Injectable()
export class DeleteCartUseCase {
    constructor(
        @Inject(SHOPPING_CART_REPOSITORY)
        private readonly cartRepository: ShoppingCartRepository,
    ) {}

    async execute(cartId: string): Promise<void> {
        if (!cartId) {
            throw new InvalidPropsException('Shopping cartId is required');
        }
        const cart = await this.cartRepository.findById(cartId);

        if (!cart) {
            throw new NotFoundException('Shopping cart not found');
        }

        cart.clear();
        await this.cartRepository.delete(cartId);
    }
}
