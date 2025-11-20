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
        ('11111111-1111-1111-1111-111111111111', 'Instituto Educação para Todos', 'Instituto dedicado à educação de qualidade e desenvolvimento social', true, NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'Cooperativa Vida Saudável', 'Cooperativa de produtos orgânicos e bem-estar comunitário', true, NOW(), NOW()),
        ('33333333-3333-3333-3333-333333333333', 'Associação Criativa Local', 'Associação que promove artesanato local e economia solidária', true, NOW(), NOW())
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
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@educacao.org', $1, 'Admin Instituto Educação', '11111111-1111-1111-1111-111111111111', true, NOW(), NOW()),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@vida.org', $2, 'Admin Cooperativa Vida', '22222222-2222-2222-2222-222222222222', true, NOW(), NOW()),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin@criativa.org', $3, 'Admin Associação Criativa', '33333333-3333-3333-3333-333333333333', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `,
            [password1, password2, password3],
        );
        console.log('---------Users created------------');

        await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Curso Online de Programação', 'Curso completo de Python com certificado', 79.90, 0, 100, 'outros', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Curso Online de Programação');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Uniforme Escolar em Algodão', 'Uniforme escolar confortável para crianças', 45.90, 0.3, 80, 'vestuario', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Uniforme Escolar em Algodão');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Kit Artesanato Educativo para Crianças', 'Kit com 50 peças para trabalhos manuais', 34.50, 1.2, 45, 'infantil', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Kit Artesanato Educativo para Crianças');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Pulseira de Contas Feita à Mão', 'Pulseira artesanal com contas de vidro reciclado', 18.90, 0.05, 120, 'artesanato', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Pulseira de Contas Feita à Mão');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Tapete para Sala de Aula', 'Tapete antiderrapante para crianças', 89.90, 2.5, 30, 'casa', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Tapete para Sala de Aula');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Gravata de Madeira Artesanal', 'Gravata eco-friendly confeccionada em madeira', 52.00, 0.1, 40, 'acessorios', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Gravata de Madeira Artesanal');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Livro Infantil Ilustrado', 'Livro com histórias educativas para crianças', 29.90, 0.4, 60, 'infantil', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '11111111-1111-1111-1111-111111111111' AND name = 'Livro Infantil Ilustrado');
    `);
        console.log(
            '---------Instituto Educação products created (7 items - todas as categorias)------------',
        );

        await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Mel Orgânico Puro', 'Mel puro extraído de colmeias locais sustentáveis', 35.00, 0.5, 90, 'outros', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Mel Orgânico Puro');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Camiseta Básica de Algodão', 'Camiseta 100% algodão orgânico em 8 cores', 42.50, 0.25, 100, 'vestuario', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Camiseta Básica de Algodão');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Vela Aromática Natural', 'Vela com essência de plantas locais', 22.90, 0.3, 75, 'artesanato', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Vela Aromática Natural');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Almofada de Ervas para Relaxamento', 'Almofada com ervas aromáticas para terapia', 28.50, 0.4, 55, 'casa', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Almofada de Ervas para Relaxamento');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Bolsa Eco Tote Bag', 'Bolsa de tecido reciclado e resistente', 38.90, 0.2, 65, 'acessorios', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Bolsa Eco Tote Bag');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Kit Wellness para Crianças', 'Kit com chás naturais e mel para crianças', 32.00, 0.6, 50, 'infantil', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Kit Wellness para Crianças');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Sabonete Natural com Glycerina', 'Sabonete artesanal feito com ingredientes naturais', 16.90, 0.1, 150, 'artesanato', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '22222222-2222-2222-2222-222222222222' AND name = 'Sabonete Natural com Glycerina');
    `);
        console.log(
            '---------Cooperativa Vida products created (7 items - todas as categorias)------------',
        );

        await dataSource.query(`
      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Jarra de Cerâmica Artesanal', 'Jarra feita em cerâmica com acabamento manual', 95.00, 1.2, 25, 'artesanato', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Jarra de Cerâmica Artesanal');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Blusa de Tricô Fina', 'Blusa tricotada à mão com linha de qualidade', 68.90, 0.3, 50, 'vestuario', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Blusa de Tricô Fina');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Doce de Leite Premium', 'Doce de leite caseiro feito com leite fresco da região', 32.50, 0.4, 70, 'outros', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Doce de Leite Premium');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Piscina Portátil para Crianças', 'Piscina infantil com cores vibrantes', 85.00, 2.5, 35, 'infantil', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Piscina Portátil para Crianças');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Cortina Estampada para Sala', 'Cortina em tecido sustentável com estampa exclusiva', 72.00, 1.5, 40, 'casa', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Cortina Estampada para Sala');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Óculos de Sol Handmade', 'Óculos artesanais com armação de madeira', 55.90, 0.15, 45, 'acessorios', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Óculos de Sol Handmade');

      INSERT INTO products (id, "organizationId", name, description, price, weight, stock, category, "imageUrl", "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Kit de Pintura para Crianças', 'Kit completo com tintas e pincéis para pequenos artistas', 25.50, 0.8, 80, 'infantil', 'https://raw.githubusercontent.com/Joannegton/backend-marketplace-multi-ong/7d541cf0a058af427840c88dc2c70e544ce1be64/frontend/public/placeholder.svg', true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM products WHERE "organizationId" = '33333333-3333-3333-3333-333333333333' AND name = 'Kit de Pintura para Crianças');
    `);
        console.log(
            '---------Associação Criativa products created (7 items - todas as categorias)------------',
        );

        console.log('\nSeed completed successfully!');
        console.log('\nTest Credentials:');
        console.log('   Email: admin@educacao.org | Password: Senha@123');
        console.log('   Email: admin@vida.org | Password: Segura#456');
        console.log('   Email: admin@criativa.org | Password: Admin!789');
        console.log('\nOrganizations:');
        console.log(
            '   Instituto Educação para Todos: 11111111-1111-1111-1111-111111111111 (7 produtos: todas as categorias)',
        );
        console.log(
            '   Cooperativa Vida Saudável: 22222222-2222-2222-2222-222222222222 (7 produtos: todas as categorias)',
        );
        console.log(
            '   Associação Criativa Local: 33333333-3333-3333-3333-333333333333 (7 produtos: todas as categorias)',
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
