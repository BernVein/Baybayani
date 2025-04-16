import { PrismaClient, OrderStatus } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Find all pending orders
    const pendingOrders = await prisma.orders.findMany({
      where: {
        orderStatus: OrderStatus.PENDING
      }
    });

    if (pendingOrders.length === 0) {
      return {
        success: true,
        message: "No pending orders to cancel.",
        cancelledOrders: []
      };
    }

    // Cancel all pending orders
    const cancelledOrders = await prisma.orders.updateMany({
      where: {
        orderStatus: OrderStatus.PENDING
      },
      data: {
        orderStatus: OrderStatus.CANCELED,
        modified_at: new Date() // Update modification time
      }
    });

    return {
      success: true,
      message: `Successfully cancelled ${cancelledOrders.count} pending orders.`,
      cancelledOrders: pendingOrders // Return the original pending orders for reference
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