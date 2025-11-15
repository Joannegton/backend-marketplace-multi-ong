import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { BullModule } from '@nestjs/bull';
import { getRedisConfig } from './config/redis.config';
import { WinstonModule } from 'nest-winston';
import { getLoggerConfig } from './config/logger.config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { LoggingInterceptor } from './common/logging.interceptor';
import { OrganizationMiddleware } from './common/organization.middleware';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { Organization } from './modules/core/infra/entities/organization.entity';
import { ProductEntity } from './modules/core/infra/entities/product.entity';
import { UserEntity } from './modules/core/infra/entities/user.entity';
import { OrderEntity } from './modules/core/infra/entities/order.entity';
import { OrderItemEntity } from './modules/core/infra/entities/order-item.entity';
import { ShoppingCartEntity } from './modules/core/infra/entities/shopping-cart.entity';
import { ProductController } from './modules/core/controllers/product.controller';
import { OrderController } from './modules/core/controllers/order.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                ...getDatabaseConfig(configService),
                entities: [Organization, ProductEntity, UserEntity, OrderEntity, OrderItemEntity, ShoppingCartEntity],
            }),
        }),
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: getRedisConfig,
        }),
        WinstonModule.forRoot(getLoggerConfig()),
        AuthModule,
        CoreModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        }
    ],
})

export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(OrganizationMiddleware).forRoutes(ProductController, OrderController);
    }
}
