import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    let exitCode = 0;
    try {
        console.log('---------Starting database seed...-----------');

        await dataSource.query(`
      INSERT INTO organizations (id, name, description, "isActive", "createdAt", "updatedAt")
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'ONG Esperança', 'Organização focada em educação e desenvolvimento social', true, NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'ONG Vida', 'Organização focada em saúde e bem-estar comunitário', true, NOW(), NOW()),
        ('33333333-3333-3333-3333-333333333333', 'ONG Artesanato Social', 'Organização de promoção de artesanato e comércio justo', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
        console.log('---------Organizations created------------');

        const password1 = await bcrypt.hash('Senha@123', 10);
        const password2 = await bcrypt.hash('Segura#456', 10);
        const password3 = await bcrypt.hash('Admin!789', 10);

        await dataSource.query(
            `
      INSERT INTO users (id, email, password, name, "organizationId", "isActive", "createdAt", "updatedAt")
      VALUES 
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@esperanca.org', $1, 'Admin Esperança', '11111111-1111-1111-1111-111111111111', true, NOW(), NOW()),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@vida.org', $2, 'Admin Vida', '22222222-2222-2222-2222-222222222222', true, NOW(), NOW()),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin@artesanato.org', $3, 'Admin Artesanato', '33333333-3333-3333-3333-333333333333', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `,
            [password1, password2, password3],
        );
        console.log('---------Users created------------');

        await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Livro de Matemática', 'Livro didático de matemática para ensino fundamental', 45.90, 0.5, 100, 'outros', 'https://example.com/math-book.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kit de Material Escolar', 'Kit completo com cadernos, lápis e canetas', 29.90, 1.2, 50, 'outros', 'https://example.com/school-kit.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Mochila Escolar', 'Mochila resistente para estudantes', 79.90, 0.8, 30, 'vestuario', 'https://example.com/backpack.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Estojo de Lápis', 'Estojo de madeira com 12 lápis de cor premium', 24.50, 0.3, 75, 'artesanato', 'https://example.com/pencil-case.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Enciclopédia Infantil', 'Enciclopédia ilustrada com 3 volumes', 89.90, 2.5, 20, 'outros', 'https://example.com/encyclopedia.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Caderno Artesanal', 'Caderno feito à mão com capa de tecido reciclado', 15.90, 0.4, 60, 'artesanato', 'https://example.com/notebook.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Camiseta Educativa', 'Camiseta com mensagens motivacionais para estudantes', 35.00, 0.2, 40, 'vestuario', 'https://example.com/edu-shirt.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
        console.log(
            '---------ONG Esperança products created (5 items)------------',
        );

        await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Sabonete Artesanal', 'Sabonete natural feito com óleos essenciais', 12.50, 0.1, 200, 'artesanato', 'https://example.com/soap.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Mel Orgânico', 'Mel puro extraído de colmeias locais', 25.00, 0.5, 80, 'outros', 'https://example.com/honey.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Cesta de Frutas', 'Cesta com frutas frescas da estação', 35.90, 2.0, 25, 'outros', 'https://example.com/fruit-basket.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Vela Aromática', 'Vela artesanal com aroma de lavanda', 18.90, 0.3, 60, 'artesanato', 'https://example.com/candle.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Pão Caseiro', 'Pão integral assado diariamente', 8.50, 0.4, 150, 'outros', 'https://example.com/bread.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Bolsa de Tecido', 'Bolsa feita de tecido reciclado', 42.00, 0.2, 35, 'vestuario', 'https://example.com/bag.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Queijo Artesanal', 'Queijo maturado por 6 meses', 55.00, 0.8, 40, 'outros', 'https://example.com/cheese.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Cachecol de Lã', 'Cachecol tricotado à mão com lã natural', 65.00, 0.3, 20, 'vestuario', 'https://example.com/scarf.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
        console.log('---------ONG Vida products created (6 items)------------');

        await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Bolsa de Tecido Artesanal', 'Bolsa feita à mão com tecido sustentável', 65.00, 0.6, 40, 'artesanato', 'https://example.com/bag.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Camiseta de Algodão Orgânico', 'Camiseta 100% algodão orgânico em várias cores', 39.90, 0.25, 80, 'vestuario', 'https://example.com/tshirt.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Pulseira de Miçangas', 'Pulseira artesanal com miçangas coloridas', 19.90, 0.05, 120, 'artesanato', 'https://example.com/bracelet.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Lenço de Seda Estampado', 'Lenço de seda natural com estampa exclusiva', 52.00, 0.1, 45, 'vestuario', 'https://example.com/scarf.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Jarra de Cerâmica Decorativa', 'Jarra feita em cerâmica com acabamento manual', 95.00, 1.2, 25, 'artesanato', 'https://example.com/pottery.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Doce de Leite Artesanal', 'Doce de leite caseiro feito com leite fresco', 28.50, 0.4, 60, 'outros', 'https://example.com/dulce-de-leche.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Kit de Costura Básico', 'Kit completo com agulhas, linhas e botões', 22.90, 0.3, 35, 'outros', 'https://example.com/sewing-kit.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Caderno de Receitas', 'Caderno com receitas tradicionais da região', 16.50, 0.5, 70, 'outros', 'https://example.com/recipe-book.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
        console.log(
            '---------ONG Artesanato Social products created (5 items)------------',
        );

        console.log('\nSeed completed successfully!');
        console.log('\nTest Credentials:');
        console.log('   Email: admin@esperanca.org | Password: Senha@123');
        console.log('   Email: admin@vida.org | Password: Segura#456');
        console.log('   Email: admin@artesanato.org | Password: Admin!789');
        console.log('\nOrganizations:');
        console.log(
            '   ONG Esperança: 11111111-1111-1111-1111-111111111111 (7 produtos: Outros, Artesanato, Vestuário)',
        );
    } catch (error) {
        console.error(' Seed failed:', error);
        exitCode = 1;
    } finally {
        try {
            await app.close();
        } catch (e) {
            console.warn(' Error while closing app after seed:', e);
        }
        console.log('Seed finished, exiting process with code', exitCode);
        process.exit(exitCode);
    }
}

seed();
