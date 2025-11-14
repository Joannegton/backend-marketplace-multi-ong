import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'marketplace_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  database: process.env.DB_NAME || 'marketplace_db',
  entities: isProduction 
    ? [path.join(__dirname, 'dist/**/*.entity.js')]
    : ['src/**/*.entity.ts'],
  migrations: isProduction
    ? [path.join(__dirname, 'dist/migrations/*.js')]
    : ['src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: !isProduction,
});