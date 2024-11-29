import { PrismaClient } from '@prisma/client'

let prisma;

// Check if we are in a development environment
if (process.env.NODE_ENV !== 'production') {
  // Use a global variable to store the PrismaClient instance
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Add connection handling
      __internal: {
        engine: {
          connectionTimeout: 5000,
          pollInterval: 100
        }
      }
    });
  }
  prisma = globalThis.prisma;
} else {
  // In production, create a new PrismaClient instance
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Add connection handling
    __internal: {
      engine: {
        connectionTimeout: 5000,
        pollInterval: 100
      }
    }
  });
}

export default prisma 