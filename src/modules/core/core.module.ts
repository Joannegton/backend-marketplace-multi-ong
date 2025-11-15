import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './infra/entities/organization.entity';
import { ProductEntity } from './infra/entities/product.entity';
import { UserEntity } from './infra/entities/user.entity';
import { OrganizationRepositoryImpl } from './infra/repositories/organization.repository';
import { ProductRepositoryImpl } from './infra/repositories/product.repository';
import {
  CreateProductUseCase,
  FindProductUseCase,
  ListProductsUseCase,
  UpdateProductUseCase,
} from './application/usecases';
import { DisableProductUseCase } from './application/usecases/products/disable-product.usecase';
import { ORGANIZATION_REPOSITORY, PRODUCT_REPOSITORY } from './core.tokens';
import { ProductController } from './controllers/product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, ProductEntity, UserEntity]),
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
    CreateProductUseCase,
    FindProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DisableProductUseCase,
  ],
  controllers: [ProductController],
  exports: [
    TypeOrmModule,
    ORGANIZATION_REPOSITORY,
    PRODUCT_REPOSITORY,
    CreateProductUseCase,
    FindProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DisableProductUseCase,
  ],
})
export class CoreModule {}