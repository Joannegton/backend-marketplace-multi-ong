#!/bin/sh
set -e

if [ ! -f /app/.env ] && [ -f /app/.env.example ]; then
  cp /app/.env.example /app/.env
  echo "Copied /app/.env.example -> /app/.env"
fi

exec npm run start
