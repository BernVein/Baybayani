import { PrismaClient, OrderStatus } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params.id;
    const { date } = await readBody(event);

    // Convert date string to Date objects for the start and end of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get cancelled orders for the user on the specified date
    const cancelledOrders = await prisma.orders.findMany({
      where: {
        userId: userId,
        orderStatus: OrderStatus.CANCELED,
        modified_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        orderItem: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        modified_at: 'desc'
      }
    });

    return {
      success: true,
      orders: cancelledOrders
    };
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
    return {
      success: false,
      message: "Failed to fetch cancelled orders.",
      error: error.message
    };
  }
}); 