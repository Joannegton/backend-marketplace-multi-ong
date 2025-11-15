import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const CartId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cartId = request.cookies?.cartId;

    if (!cartId) {
      throw new BadRequestException('CartId cookie not found. Please create a cart first.');
    }

    return cartId;
  },
);
