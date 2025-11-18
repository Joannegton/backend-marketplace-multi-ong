import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { Organization } from './infra/entities/organization.entity';
import { ProductEntity } from './infra/entities/product.entity';
import { UserEntity } from './infra/entities/user.entity';
import { OrderEntity } from './infra/entities/order.entity';
import { OrderItemEntity } from './infra/entities/order-item.entity';
import { ShoppingCartEntity } from './infra/entities/shopping-cart.entity';
import { OrganizationRepositoryImpl } from './infra/repositories/organization.repository';
import { ProductRepositoryImpl } from './infra/repositories/product.repository';
import { OrderRepositoryImpl } from './infra/repositories/order.repository';
import {
    CreateProductUseCase,
    FindProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    SearchProductsUseCase,
    GetOrderUseCase,
    GetOrderByCpfUseCase,
    GetOrganizationOrderUseCase,
    ListOrganizationOrdersUseCase,
} from './application/usecases';
import { ToggleProductStatusUseCase } from './application/usecases/products/toggle-product-status.usecase';
import { DeleteProductUseCase } from './application/usecases/products/delete-product.usecase';
import { FindPublicProductUseCase } from './application/usecases/products/find-public-product.usecase';
import { GetProductsByIdsUseCase } from './application/usecases/products/get-products-by-ids.usecase';
import { CreateOrderUseCase } from './application/usecases/order/create-order.usecase';
import {
    AddItemToCartUseCase,
    CheckoutPaymentUseCase,
    GetCartUseCase,
    DeleteCartUseCase,
} from './application/usecases/cart';
import { UpdateCartItemQuantityUseCase } from './application/usecases/cart/update-cart-item-quantity.usecase';
import { RemoveCartItemUseCase } from './application/usecases/cart/remove-cart-item.usecase';
import {
    ORGANIZATION_REPOSITORY,
    PRODUCT_REPOSITORY,
    ORDER_REPOSITORY,
    SHOPPING_CART_REPOSITORY,
    RESERVATION_SERVICE,
    PRODUCT_CACHE_SERVICE,
} from './core.tokens';
import { ProductController } from './controllers/product.controller';
import { OrdersProcessor } from './infra/services/processors/order-processor.service';
import { ShoppingCartProcessor } from './infra/services/processors/shopping-cart-processor.service';
import { ReservationService } from './infra/services/reservation.service';
import { ShoppingCartCacheService } from './infra/services/shopping-cart-cache.service';
import { ProductCacheService } from './infra/services/product-cache.service';
import { OpenAiService } from './infra/services/openai.service';
import { ExpireShoppingCartsJob } from './infra/jobs/expire-shopping-carts.job';
import { CartController } from './controllers/cart.controller';
import { OrderController } from './controllers/order.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organization,
            ProductEntity,
            UserEntity,
            OrderEntity,
            OrderItemEntity,
            ShoppingCartEntity,
        ]),
        BullModule.registerQueue(
            {
                name: 'orders',
                defaultJobOptions: { priority: 10 },
            },
            {
                name: 'carts',
                defaultJobOptions: { priority: 1 },
            },
        ),
        ScheduleModule.forRoot(),
    ],
    providers: [
        {
            provide: ORGANIZATION_REPOSITORY,
            useClass: OrganizationRepositoryImpl,
        },
        {
            provide: PRODUCT_REPOSITORY,
            useClass: ProductRepositoryImpl,
        },
        {
            provide: ORDER_REPOSITORY,
            useClass: OrderRepositoryImpl,
        },
        {
            provide: SHOPPING_CART_REPOSITORY,
            useClass: ShoppingCartCacheService,
        },
        {
            provide: RESERVATION_SERVICE,
            useClass: ReservationService,
        },
        {
            provide: PRODUCT_CACHE_SERVICE,
            useClass: ProductCacheService,
        },
        CreateProductUseCase,
        FindProductUseCase,
        FindPublicProductUseCase,
        GetProductsByIdsUseCase,
        ListProductsUseCase,
        UpdateProductUseCase,
        SearchProductsUseCase,
        ToggleProductStatusUseCase,
        DeleteProductUseCase,
        GetOrderUseCase,
        GetOrderByCpfUseCase,
        GetOrganizationOrderUseCase,
        ListOrganizationOrdersUseCase,
        CreateOrderUseCase,
        AddItemToCartUseCase,
        CheckoutPaymentUseCase,
        GetCartUseCase,
        DeleteCartUseCase,
        UpdateCartItemQuantityUseCase,
        RemoveCartItemUseCase,
        OpenAiService,
        OrdersProcessor,
        ShoppingCartProcessor,
        ExpireShoppingCartsJob,
    ],
    controllers: [ProductController, CartController, OrderController],
    exports: [
        TypeOrmModule,
        ORGANIZATION_REPOSITORY,
        PRODUCT_REPOSITORY,
        ORDER_REPOSITORY,
        SHOPPING_CART_REPOSITORY,
        RESERVATION_SERVICE,
        PRODUCT_CACHE_SERVICE,
        CreateProductUseCase,
        FindProductUseCase,
        FindPublicProductUseCase,
        GetProductsByIdsUseCase,
        ListProductsUseCase,
        UpdateProductUseCase,
        SearchProductsUseCase,
        ToggleProductStatusUseCase,
        DeleteProductUseCase,
        GetOrderUseCase,
        GetOrderByCpfUseCase,
        GetOrganizationOrderUseCase,
        ListOrganizationOrdersUseCase,
        CreateOrderUseCase,
        AddItemToCartUseCase,
        CheckoutPaymentUseCase,
        GetCartUseCase,
        DeleteCartUseCase,
        UpdateCartItemQuantityUseCase,
        RemoveCartItemUseCase,
    ],
})
export class CoreModule {}
