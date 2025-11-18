#!/bin/sh
set -e

if [ ! -f /app/.env ] && [ -f /app/.env.example ]; then
  cp /app/.env.example /app/.env
  echo "Copied /app/.env.example -> /app/.env"
fi

echo "- Waiting for database to be ready..."
for i in {1..30}; do
  if pg_isready -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; then
    echo "✅ Database is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

echo "- Running migrations..."
npm run migration:run || echo "Migrations completed or tables already exist"

echo "- Seeding database..."
if [ -f /app/dist/src/seed.js ]; then
  echo "Found compiled seed at /app/dist/src/seed.js — running it with node"
  node /app/dist/src/seed.js || echo "Compiled seed completed or failed"
elif command -v ts-node > /dev/null 2>&1; then
  npm run seed || echo "Seed completed or already exists"
else
  echo "No compiled seed and ts-node not found — skipping seed (you can run seed manually)"
fi

echo "- Starting application..."
if [ "$NODE_ENV" = "production" ]; then
  echo "Running in PRODUCTION mode"
  exec npm run start:prod
else
  if command -v nest > /dev/null 2>&1; then
    echo "Running in DEVELOPMENT mode with watch"
    exec npm run start:dev
  else
    echo "nest CLI not found — falling back to production start (node dist/main)"
    exec npm run start:prod
  fi
fi
