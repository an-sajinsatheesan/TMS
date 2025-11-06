/**
 * Manual migration runner
 * This script reads the migration SQL file and executes it against the database
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

async function runMigration() {
  const migrationPath = path.join(__dirname, '../prisma/migrations/20251106_consolidate_options_and_add_status_priority/migration.sql');

  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    await prisma.$executeRawUnsafe(migrationSQL);

    console.log('✓ Migration executed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = runMigration;
