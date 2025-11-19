import {
    createParamDecorator,
    ExecutionContext,
    UnprocessableEntityException,
} from '@nestjs/common';

export const CartId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const cartId = request.cookies?.cartId;

        if (!cartId) {
            throw new UnprocessableEntityException(
                'CartId not found. Please create a cart first.',
            );
        }

        return cartId;
    },
);
