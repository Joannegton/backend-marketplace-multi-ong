import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './infra/entities/organization.entity';
import { Product } from './infra/entities/product.entity';
import { UserEntity } from './infra/entities/user.entity';
import { OrganizationRepositoryImpl } from './infra/repositories/organization.repository';

export const ORGANIZATION_REPOSITORY = Symbol('ORGANIZATION_REPOSITORY');

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Product, UserEntity]),
  ],
  providers: [
    {
      provide: ORGANIZATION_REPOSITORY,
      useClass: OrganizationRepositoryImpl,
    },
  ],
  exports: [
    TypeOrmModule,
    ORGANIZATION_REPOSITORY,
  ],
})
export class CoreModule {}