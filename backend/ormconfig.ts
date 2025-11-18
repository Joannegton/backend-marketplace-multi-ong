import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'marketplace_user',
    password: process.env.POSTGRES_PASSWORD || 'secure_password',
    database: process.env.POSTGRES_DB || 'marketplace_db',
    entities: ['dist/src/modules/**/infra/entities/*.entity.{ts,js}'],
    migrations: ['dist/src/migrations/*.{ts,js}'],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    logging: !isProduction,
});
