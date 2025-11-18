import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const getBaseDatabaseConfig = () => ({
    type: 'postgres' as const,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'marketplace_user',
    password: process.env.POSTGRES_PASSWORD || 'secure_password',
    database: process.env.POSTGRES_DB || 'marketplace_db',
    synchronize: false,
    migrationsTableName: 'typeorm_migrations',
});

export const getDatabaseConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    const isProduction = configService.get('NODE_ENV') === 'production';
    const baseConfig = getBaseDatabaseConfig();

    return {
        ...baseConfig,
        entities: isProduction
            ? [path.join(__dirname, '../**/*.entity{.js}')]
            : [path.join(__dirname, '../**/*.entity{.ts}')],
        logging: configService.get('NODE_ENV') === 'development',
        migrations: isProduction
            ? [path.join(__dirname, '../migrations/*.js')]
            : [path.join(__dirname, '../migrations/*.ts')],
        migrationsRun: true,
    };
};
