import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'marketplace_user'),
    password: configService.get('DB_PASSWORD', 'secure_password'),
    database: configService.get('DB_NAME', 'marketplace_db'),
    entities: isProduction
      ? [path.join(__dirname, '../**/*.entity{.js}')]
      : [path.join(__dirname, '../**/*.entity{.ts}')],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
    migrations: isProduction
      ? [path.join(__dirname, '../migrations/*.js')]
      : [path.join(__dirname, '../migrations/*.ts')],
    migrationsRun: true,
    migrationsTableName: 'typeorm_migrations',
  };
};
