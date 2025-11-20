FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --silent

COPY --from=builder /app/dist ./dist
COPY . .

RUN apk add --no-cache postgresql-client \
    && mkdir -p logs 

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "-c", "npm run migration:run && node dist/src/seed.js && npm run start:prod"]
