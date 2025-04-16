import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { openingHour, openingMinute, closingHour, closingMinute } = body;

    // Validate input
    if (openingHour === undefined || openingMinute === undefined || 
        closingHour === undefined || closingMinute === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      });
    }

    // Find existing config or create new one
    let storeConfig = await prisma.storeConfig.findFirst({
      where: {
        key: 'store_hours'
      }
    });

    if (storeConfig) {
      // Update existing config
      storeConfig = await prisma.storeConfig.update({
        where: {
          id: storeConfig.id
        },
        data: {
          openingHour: parseInt(openingHour),
          openingMinute: parseInt(openingMinute),
          closingHour: parseInt(closingHour),
          closingMinute: parseInt(closingMinute)
        }
      });
    } else {
      // Create new config
      storeConfig = await prisma.storeConfig.create({
        data: {
          key: 'store_hours',
          openingHour: parseInt(openingHour),
          openingMinute: parseInt(openingMinute),
          closingHour: parseInt(closingHour),
          closingMinute: parseInt(closingMinute)
        }
      });
    }

    return { 
      success: true, 
      message: 'Store hours updated successfully',
      data: storeConfig 
    };
  } catch (error) {
    console.error('Error updating store config:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Error updating store configuration',
    });
  }
}); 