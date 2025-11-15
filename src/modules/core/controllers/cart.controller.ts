import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AddItemToCartUseCase } from '../application/usecases/cart/add-item-to-cart.usecase';
import { CheckoutUseCase } from '../application/usecases/cart/checkout.usecase';
import { GetCartUseCase } from '../application/usecases/cart/get-cart.usecase';
import { DeleteCartUseCase } from '../application/usecases/cart/delete-cart.usecase';
import { Public } from 'src/common/decorators/public.decorator';
import { CartId } from 'src/common/decorators/cart-id.decorator';
import { AddItemToCartDto } from '../application/dtos/cart/add-item-cart.dto';
import { ConfigService } from '@nestjs/config';

@Controller('cart')
export class CartController {
    private readonly cartTtlMilliseconds: number;

    constructor(
        private readonly addItemToCartUseCase: AddItemToCartUseCase,
        private readonly getCartUseCase: GetCartUseCase,
        private readonly deleteCartUseCase: DeleteCartUseCase,
        private readonly configService: ConfigService,
    ) {
        const cartTtlMinutes = this.configService.get<number>('CART_TTL_MINUTES', 20);
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
    }

    @Post('items')
    @Public()
    @HttpCode(HttpStatus.OK)
    async addItem(
        @CartId() cartId: string,
        @Body() dto: AddItemToCartDto,
    ) {
        const cart = await this.addItemToCartUseCase.execute(dto, cartId);
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
