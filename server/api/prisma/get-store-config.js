import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get store config or create default if it doesn't exist
    let storeConfig = await prisma.storeConfig.findFirst({
      where: {
        key: 'store_hours'
      }
    });

    // If store config doesn't exist, create it with default values
    if (!storeConfig) {
      storeConfig = await prisma.storeConfig.create({
        data: {
          key: 'store_hours',
          openingHour: 6,
          openingMinute: 0,
          closingHour: 22,
          closingMinute: 0
        }
      });
    }

    return storeConfig;
  } catch (error) {
    console.error('Error fetching store config:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching store configuration',
    });
  }
}); 