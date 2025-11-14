import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { getBaseDatabaseConfig } from './src/config/database.config';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();
const baseConfig = getBaseDatabaseConfig(configService);

export default new DataSource({
  ...baseConfig,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  logging: process.env.NODE_ENV !== 'production',
});