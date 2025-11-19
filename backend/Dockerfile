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

COPY . .
COPY --from=builder /app/dist ./dist

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && apk add --no-cache postgresql-client \
    && mkdir -p logs

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
