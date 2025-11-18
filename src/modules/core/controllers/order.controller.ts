import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateOrderUseCase } from '../application/usecases/order/create-order.usecase';
import { GetOrderUseCase } from '../application/usecases/order/get-order.usecase';
import { GetOrderByCpfUseCase } from '../application/usecases/order/get-order-by-cpf.usecase';
import { GetOrganizationOrderUseCase } from '../application/usecases/order/get-organization-order.usecase';
import { ListOrganizationOrdersUseCase } from '../application/usecases/order/list-organization-orders.usecase';
import { CheckoutPaymentUseCase } from '../application/usecases/cart/checkout.usecase';
import { Public } from 'src/common/decorators/public.decorator';
import { OrganizationId } from 'src/common/decorators/organization-id.decorator';
import { CartId } from 'src/common/decorators/cart-id.decorator';
import { CreateOrderDto } from '../application/dtos/create-order.dto';
import { CheckoutPaymentDto } from '../application/dtos/checkout-payment.dto';

@Controller('orders')
export class OrderController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
        private readonly checkoutPaymentUseCase: CheckoutPaymentUseCase,
        private readonly getOrderUseCase: GetOrderUseCase,
        private readonly getOrderByCpfUseCase: GetOrderByCpfUseCase,
        private readonly getOrganizationOrderUseCase: GetOrganizationOrderUseCase,
        private readonly listOrganizationOrdersUseCase: ListOrganizationOrdersUseCase,
    ) {}

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@CartId() cartId: string, @Body() dto: CreateOrderDto) {
        return await this.createOrderUseCase.execute(cartId, dto);
    }

    @Post(':orderId/checkout')
    @Public()
    @HttpCode(HttpStatus.OK)
    async checkoutPayment(
        @Param('orderId') orderId: string,
        @Body() dto: CheckoutPaymentDto,
    ) {
        return await this.checkoutPaymentUseCase.execute(orderId, dto);
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
        return await this.getOrganizationOrderUseCase.execute(
            orderId,
            organizationId,
        );
    }

    @Get(':orderId')
    @HttpCode(HttpStatus.OK)
    @Public()
    async getOrder(
        @Param('orderId') orderId: string,
        @Query('cpf') cpf: string,
    ) {
        return await this.getOrderByCpfUseCase.execute(orderId, cpf);
    }
}
