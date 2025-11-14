# Guia de Inicialização - Backend Marketplace Multi-ONG

Este documento descreve como iniciar o projeto backend com Docker.

## Pré-Requisitos

Você deve ter instalado:
- **Docker** e **Docker Compose** (versão 1.29+)
- Um terminal/PowerShell aberto na pasta raiz do projeto

## Passos para Iniciar

### 1. Clonar o Repositório (se necessário)

```bash
git clone <repositorio-url>
cd backend-marketplace-multi-ong
```

### 2. Criar o Arquivo `.env`

O projeto vem com um arquivo `.env.example` como referência. Você precisa criar o `.env`:

**Opção A: Copiar manualmente**
```bash
cp .env.example .env
```

**Opção B: Usar PowerShell (Windows)**
```powershell
Copy-Item .env.example .env
```

**Opção C: O Docker cria automaticamente**
Se você não criar, o Docker copiará `.env.example` para `.env` automaticamente na primeira execução.

**Conteúdo esperado do `.env`:**
```
DB_HOST=db
DB_PORT=5432
DB_USERNAME=marketplace_user
DB_PASSWORD=secure_password
DB_NAME=marketplace_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
REDIS_HOST=redis
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3001
PORT=3000
NODE_ENV=production ou development 
```

### 3. Iniciar os Containers

Execute o comando abaixo na pasta raiz do projeto:

```bash
docker-compose up -d
```

### 4. Aguardar a Inicialização

Os containers podem levar **30-60 segundos** para estar prontos na primeira execução. Use:

```bash
docker-compose logs -f app
```

**Sinais de sucesso:**
```
[OK] Database is ready!
[OK] Running migrations...
[OK] Starting application...
[Nest] 40 - 11/14/2025, 3:20:43 PM LOG [NestApplication] Nest application successfully started
```

## Como Funciona a Inicialização

Quando você executa `docker-compose up -d`, a sequência é:

1. PostgreSQL inicia - Cria banco marketplace_db automaticamente
2. Redis inicia - Cache disponível
3. NestJS inicia - Script entrypoint.sh executa:
   - Aguarda PostgreSQL estar pronto
   - Executa migracoes (npm run typeorm migration:run)
   - Executa seed (npm run seed) - Popula o banco com dados iniciais (2 ONGs, usuarios e 5 produtos por ONG)
   - Inicia servidor:
     - Se NODE_ENV=production: npm run start:prod
     - Se NODE_ENV=development: npm run start:dev (modo watch)

Apos a primeira inicializacao, o banco estara populado com dados de teste:
- Usuario admin@esperanca.org / senha123
- Usuario admin@vida.org / senha123

---