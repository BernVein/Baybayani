import { PrismaClient, OrderStatus } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // First get all pending orders from buyers (for reference)
    const pendingOrders = await prisma.orders.findMany({
      where: {
        orderStatus: OrderStatus.PENDING,
        user: {
          role: "BUYER" // Only get orders from buyers, regardless of date
        }
      },
      include: {
        user: true,
        orderItem: {
          include: {
            product: true
          }
        }
      }
    });

    if (pendingOrders.length === 0) {
      return {
        success: true,
        message: "No pending orders to cancel.",
        cancelledOrders: []
      };
    }

    // Cancel ALL pending orders from buyers
    const cancelledOrders = await prisma.orders.updateMany({
      where: {
        orderStatus: OrderStatus.PENDING,
        user: {
          role: "BUYER"
        }
      },
      data: {
        orderStatus: OrderStatus.CANCELED,
        modified_at: new Date()
      }
    });

    console.log(`Cancelled ${cancelledOrders.count} pending orders at ${new Date().toISOString()}`);

    return {
      success: true,
      message: `Successfully cancelled ${cancelledOrders.count} pending orders from buyers.`,
      cancelledOrders: pendingOrders
    };
  } catch (error) {
    console.error("Error cancelling pending orders:", error);
    return {
      success: false,
      message: "Failed to cancel pending orders.",
      error: error.message
    };
  }
}); 