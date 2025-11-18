import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    HttpCode,
    HttpStatus,
    Res,
    Patch,
    Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { AddItemToCartUseCase } from '../application/usecases/cart/add-item-to-cart.usecase';
import { GetCartUseCase } from '../application/usecases/cart/get-cart.usecase';
import { DeleteCartUseCase } from '../application/usecases/cart/delete-cart.usecase';
import { UpdateCartItemQuantityUseCase } from '../application/usecases/cart/update-cart-item-quantity.usecase';
import { RemoveCartItemUseCase } from '../application/usecases/cart/remove-cart-item.usecase';
import { Public } from 'src/common/decorators/public.decorator';
import { CartId } from 'src/common/decorators/cart-id.decorator';
import { AddItemToCartDto } from '../application/dtos/cart/add-item-cart.dto';
import { UpdateCartItemQuantityDto } from '../application/dtos/cart/update-cart-item-quantity.dto';
import { ConfigService } from '@nestjs/config';

@Controller('cart')
export class CartController {
    private readonly cartTtlMilliseconds: number;

    constructor(
        private readonly addItemToCartUseCase: AddItemToCartUseCase,
        private readonly getCartUseCase: GetCartUseCase,
        private readonly deleteCartUseCase: DeleteCartUseCase,
        private readonly updateCartItemQuantityUseCase: UpdateCartItemQuantityUseCase,
        private readonly removeCartItemUseCase: RemoveCartItemUseCase,
        private readonly configService: ConfigService,
    ) {
        const cartTtlMinutes = this.configService.get<number>(
            'CART_TTL_MINUTES',
            20,
        );
        this.cartTtlMilliseconds = cartTtlMinutes * 60 * 1000;
    }

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    async createCart(
        @Body() dto: AddItemToCartDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const cart = await this.addItemToCartUseCase.execute(dto);
        response.cookie('cartId', cart.id, {
            httpOnly: true,
            maxAge: this.cartTtlMilliseconds,
            path: '/',
        });
        return cart;
    }

    @Post('items')
    @Public()
    @HttpCode(HttpStatus.OK)
    async addItem(@CartId() cartId: string, @Body() dto: AddItemToCartDto) {
        const cart = await this.addItemToCartUseCase.execute(dto, cartId);
        return cart;
    }

    @Patch('items')
    @Public()
    @HttpCode(HttpStatus.OK)
    async updateItemQuantity(
        @CartId() cartId: string,
        @Body() dto: UpdateCartItemQuantityDto,
    ) {
        const cart = await this.updateCartItemQuantityUseCase.execute({
            cartId,
            productId: dto.productId,
            quantity: dto.quantity,
        });
        return cart;
    }

    @Delete('items/:id')
    @Public()
    @HttpCode(HttpStatus.OK)
    async removeItem(@CartId() cartId: string, @Param('id') productId: string) {
        const cart = await this.removeCartItemUseCase.execute({
            cartId,
            productId,
        });
        return cart;
    }

    @Get()
    @Public()
    @HttpCode(HttpStatus.OK)
    async getCart(@CartId() cartId: string) {
        return await this.getCartUseCase.execute(cartId);
    }

    @Delete()
    @Public()
    @HttpCode(HttpStatus.NO_CONTENT)
    async clearCart(
        @CartId() cartId: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.deleteCartUseCase.execute(cartId);
        response.clearCookie('cartId', { path: '/' });
    }
}
