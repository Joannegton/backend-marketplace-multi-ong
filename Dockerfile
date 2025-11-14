# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

COPY . .
COPY --from=builder /app/dist ./dist

RUN if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi

# Instalar postgresql-client para pg_isready
RUN apk add --no-cache postgresql-client

# Copiar e dar permissão ao script de inicialização
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p logs

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
