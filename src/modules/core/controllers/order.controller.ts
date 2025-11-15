import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { GetOrderUseCase } from '../application/usecases/order/get-order.usecase';
import { GetOrganizationOrderUseCase } from '../application/usecases/order/get-organization-order.usecase';
import { ListOrganizationOrdersUseCase } from '../application/usecases/order/list-organization-orders.usecase';
import { CheckoutUseCase } from '../application/usecases/cart/checkout.usecase';
import { Public } from 'src/common/decorators/public.decorator';
import { OrganizationId } from 'src/common/decorators/organization-id.decorator';
import { CartId } from 'src/common/decorators/cart-id.decorator';
import { CheckoutDto } from '../application/dtos/checkout.dto';

@Controller('orders')
export class OrderController {
    constructor(
        private readonly checkoutUseCase: CheckoutUseCase,
        private readonly getOrderUseCase: GetOrderUseCase,
        private readonly getOrganizationOrderUseCase: GetOrganizationOrderUseCase,
        private readonly listOrganizationOrdersUseCase: ListOrganizationOrdersUseCase,
    ) {}

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    async checkout(@CartId() cartId: string, @Body() dto: CheckoutDto) {
        return await this.checkoutUseCase.execute(cartId, dto);
    }

    @Get('organization')
    @HttpCode(HttpStatus.OK)
    async listOrganizationOrders(@OrganizationId() organizationId: string) {
        return await this.listOrganizationOrdersUseCase.execute(organizationId);
    }

    @Get('organization/:orderId')
    @HttpCode(HttpStatus.OK)
    async getOrganizationOrder(
        @Param('orderId') orderId: string,
        @OrganizationId() organizationId: string,
    ) {
        return await this.getOrganizationOrderUseCase.execute(orderId, organizationId);
    }

    @Get(':orderId')
    @HttpCode(HttpStatus.OK)
    @Public()
    async getOrder(
        @Param('orderId') orderId: string,
    ) {
        return await this.getOrderUseCase.execute(orderId);
    }
}
