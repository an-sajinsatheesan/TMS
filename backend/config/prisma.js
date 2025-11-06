const { PrismaClient } = require('@prisma/client');
const { NODE_ENV } = require('./env');

/**
 * Prisma Client Singleton
 * Prevents multiple instances of Prisma Client in development
 */

let prisma;

if (NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve the client across module reloads (HMR)
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
