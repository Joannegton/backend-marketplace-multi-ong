#!/bin/sh
set -e

echo "- Waiting for database to be ready..."
for i in {1..30}; do
  if pg_isready -h $DB_HOST -U $DB_USERNAME -d $DB_NAME > /dev/null 2>&1; then
    echo "✅ Database is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

echo "- Running migrations..."
npm run migration:run || echo "Migrations completed or tables already exist"

echo "- Seeding database..."
npm run seed || echo "Seed completed or already exists"

echo "- Starting application..."
if [ "$NODE_ENV" = "production" ]; then
  echo "Running in PRODUCTION mode"
  exec npm run start:prod
else
  echo "Running in DEVELOPMENT mode with watch"
  exec npm run start:dev
fi
