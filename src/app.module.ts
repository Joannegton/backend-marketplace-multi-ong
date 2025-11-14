import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { BullModule } from '@nestjs/bull';
import { getRedisConfig } from './config/redis.config';
import { WinstonModule } from 'nest-winston';
import { getLoggerConfig } from './config/logger.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { LoggingInterceptor } from './common/logging.interceptor';
import { OrganizationMiddleware } from './common/organization.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
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
    controllers: [AppController],
    providers: [
        AppService,
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
        consumer.apply(OrganizationMiddleware).forRoutes('*');
    }
}
