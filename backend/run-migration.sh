#!/bin/bash
set -e

echo "🔄 Running complete schema refactor migration..."
echo ""
echo "⚠️  WARNING: This will drop and recreate all tables!"
echo "⚠️  Existing data will be lost (safe for dummy data)"
echo ""

# Load database URL from .env
if [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
fi

# Run migration SQL
psql "$DATABASE_URL" -f prisma/migrations/20251110_complete_schema_refactor/migration.sql

echo ""
echo "✅ Migration completed successfully!"
