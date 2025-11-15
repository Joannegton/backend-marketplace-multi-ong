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
  GetOrderUseCase,
  GetOrganizationOrderUseCase,
  ListOrganizationOrdersUseCase,
} from './application/usecases';
import { DisableProductUseCase } from './application/usecases/products/disable-product.usecase';
import { AddItemToCartUseCase, CheckoutUseCase, GetCartUseCase, DeleteCartUseCase } from './application/usecases/cart';
import { ORGANIZATION_REPOSITORY, PRODUCT_REPOSITORY, ORDER_REPOSITORY, SHOPPING_CART_REPOSITORY, RESERVATION_SERVICE } from './core.tokens';
import { ProductController } from './controllers/product.controller';
import { OrdersProcessor } from './infra/services/processors/order-processor.service';
import { ShoppingCartProcessor } from './infra/services/processors/shopping-cart-processor.service';
import { ReservationService } from './infra/services/reservation.service';
import { ShoppingCartCacheService } from './infra/services/shopping-cart-cache.service';
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
        defaultJobOptions: { priority: 10 }
      },
      { 
        name: 'carts',
        defaultJobOptions: { priority: 1 }
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
    CreateProductUseCase,
    FindProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DisableProductUseCase,
    GetOrderUseCase,
    GetOrganizationOrderUseCase,
    ListOrganizationOrdersUseCase,
    AddItemToCartUseCase,
    CheckoutUseCase,
    GetCartUseCase,
    DeleteCartUseCase,
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
    CreateProductUseCase,
    FindProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DisableProductUseCase,
    GetOrderUseCase,
    GetOrganizationOrderUseCase,
    ListOrganizationOrdersUseCase,
    AddItemToCartUseCase,
    CheckoutUseCase,
    GetCartUseCase,
    DeleteCartUseCase,
  ],
})
export class CoreModule {}