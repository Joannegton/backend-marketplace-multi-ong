import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 Starting database seed...');

    // Criar organizações
    await dataSource.query(`
      INSERT INTO organizations (id, name, description, "isActive", "createdAt", "updatedAt")
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'ONG Esperança', 'Organização focada em educação', true, NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'ONG Vida', 'Organização focada em saúde', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Organizations created');

    // Criar usuários
    const hashedPassword = await bcrypt.hash('senha123', 10);
    await dataSource.query(
      `
      INSERT INTO users (id, email, password, name, "organizationId", "isActive", "createdAt", "updatedAt")
      VALUES 
        ('33333333-3333-3333-3333-333333333333', 'admin@esperanca.org', $1, 'Admin Esperança', '11111111-1111-1111-1111-111111111111', true, NOW(), NOW()),
        ('44444444-4444-4444-4444-444444444444', 'admin@vida.org', $1, 'Admin Vida', '22222222-2222-2222-2222-222222222222', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `,
      [hashedPassword],
    );
    console.log('✅ Users created');

    // Criar produtos para ONG Esperança
    await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Livro de Matemática', 'Livro didático de matemática para ensino fundamental', 45.90, 0.5, 100, 'https://example.com/math-book.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kit de Material Escolar', 'Kit completo com cadernos, lápis e canetas', 29.90, 1.2, 50, 'https://example.com/school-kit.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Mochila Escolar', 'Mochila resistente para estudantes', 79.90, 0.8, 30, 'https://example.com/backpack.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    // Criar produtos para ONG Vida
    await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, "imageUrl", "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Termômetro Digital', 'Termômetro digital de alta precisão', 35.50, 0.2, 200, 'https://example.com/thermometer.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Kit Primeiros Socorros', 'Kit completo para primeiros socorros', 89.90, 1.5, 75, 'https://example.com/first-aid.jpg', true, NOW(), NOW()),
        (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Máscara Cirúrgica (50un)', 'Caixa com 50 máscaras descartáveis', 25.00, 0.3, 500, 'https://example.com/masks.jpg', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Products created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: admin@esperanca.org | Password: senha123');
    console.log('   Email: admin@vida.org | Password: senha123');
    console.log('\n🔗 Organizations:');
    console.log('   ONG Esperança: 11111111-1111-1111-1111-111111111111');
    console.log('   ONG Vida: 22222222-2222-2222-2222-222222222222');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
