import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER', 'postgres'),
  password: configService.get('DB_PASS', 'postgres'),
  database: configService.get('DB_NAME', 'marketplace_ong'),
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: false, // Usar migrations em produção
  logging: configService.get('NODE_ENV') === 'development',
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsRun: true,
  migrationsTableName: 'typeorm_migrations',
});
