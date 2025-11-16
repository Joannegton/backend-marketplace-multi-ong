import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

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
        ('33333333-3333-3333-3333-333333333333', 'admin@esperanca.org', $1, 'Admin Esperança', '11111111-1111-1111-1111-111111111111', true, NOW(), NOW()),
        ('44444444-4444-4444-4444-444444444444', 'admin@vida.org', $2, 'Admin Vida', '22222222-2222-2222-2222-222222222222', true, NOW(), NOW()),
        ('55555555-5555-5555-5555-555555555555', 'admin@artesanato.org', $3, 'Admin Artesanato', '33333333-3333-3333-3333-333333333333', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `,
      [password1, password2, password3],
    );
    console.log('---------Users created------------');

    await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Livro de Matemática', 'Livro didático de matemática para ensino fundamental', 45.90, 0.5, 100, 'Educação', 'https://example.com/math-book.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kit de Material Escolar', 'Kit completo com cadernos, lápis e canetas', 29.90, 1.2, 50, 'Educação', 'https://example.com/school-kit.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Mochila Escolar', 'Mochila resistente para estudantes', 79.90, 0.8, 30, 'Educação', 'https://example.com/backpack.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Estojo de Lápis', 'Estojo de madeira com 12 lápis de cor premium', 24.50, 0.3, 75, 'Educação', 'https://example.com/pencil-case.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Enciclopédia Infantil', 'Enciclopédia ilustrada com 3 volumes', 89.90, 2.5, 20, 'Educação', 'https://example.com/encyclopedia.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('---------ONG Esperança products created (5 items)------------');

    await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Termômetro Digital', 'Termômetro digital de alta precisão com alarme', 35.50, 0.2, 200, 'Saúde', 'https://example.com/thermometer.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Kit Primeiros Socorros', 'Kit completo para primeiros socorros com manual', 89.90, 1.5, 75, 'Saúde', 'https://example.com/first-aid.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Máscara Cirúrgica (50un)', 'Caixa com 50 máscaras descartáveis aprovadas', 25.00, 0.3, 500, 'Saúde', 'https://example.com/masks.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Álcool em Gel 500ml', 'Álcool em gel desinfetante premium com hidratação', 18.90, 0.5, 300, 'Saúde', 'https://example.com/alcohol-gel.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Tensiómetro Analógico', 'Aparelho para medir pressão arterial manual', 45.00, 0.4, 50, 'Saúde', 'https://example.com/tensiometer.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Atadura Elástica 10cm', 'Rolo de atadura elástica de 10cm x 5 metros', 12.50, 0.15, 150, 'Saúde', 'https://example.com/bandage.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('---------ONG Vida products created (6 items)------------');

    await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Bolsa de Tecido Artesanal', 'Bolsa feita à mão com tecido sustentável', 65.00, 0.6, 40, 'Artesanato', 'https://example.com/bag.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Camiseta de Algodão Orgânico', 'Camiseta 100% algodão orgânico em várias cores', 39.90, 0.25, 80, 'Vestuário', 'https://example.com/tshirt.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Pulseira de Miçangas', 'Pulseira artesanal com miçangas coloridas', 19.90, 0.05, 120, 'Artesanato', 'https://example.com/bracelet.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Lenço de Seda Estampado', 'Lenço de seda natural com estampa exclusiva', 52.00, 0.1, 45, 'Vestuário', 'https://example.com/scarf.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Jarra de Cerâmica Decorativa', 'Jarra feita em cerâmica com acabamento manual', 95.00, 1.2, 25, 'Artesanato', 'https://example.com/pottery.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('---------ONG Artesanato Social products created (5 items)------------');

    console.log('\nSeed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('   Email: admin@esperanca.org | Password: Senha@123');
    console.log('   Email: admin@vida.org | Password: Segura#456');
    console.log('   Email: admin@artesanato.org | Password: Admin!789');
    console.log('\nOrganizations:');
    console.log('   ONG Esperança: 11111111-1111-1111-1111-111111111111 (5 produtos de Educação)');
    console.log('   ONG Vida: 22222222-2222-2222-2222-222222222222 (6 produtos de Saúde)');
    console.log('   ONG Artesanato Social: 33333333-3333-3333-3333-333333333333 (5 produtos de Artesanato/Vestuário)');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
