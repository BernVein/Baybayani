import { PrismaClient, OrderStatus } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Find all pending orders from buyers only
    const pendingOrders = await prisma.orders.findMany({
      where: {
        orderStatus: OrderStatus.PENDING,
        user: {
          role: "BUYER" // Only get orders from buyers
        }
      },
      include: {
        user: true, // Include user info to verify role
        orderItem: {
          include: {
            product: true // Include product info for reference
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

    // Cancel all pending orders from buyers
    const cancelledOrders = await prisma.orders.updateMany({
      where: {
        id: {
          in: pendingOrders.map(order => order.id)
        },
        orderStatus: OrderStatus.PENDING,
        user: {
          role: "BUYER"
        }
      },
      data: {
        orderStatus: OrderStatus.CANCELED,
        modified_at: new Date() // Update modification time
      }
    });

    // Log the cancellation for monitoring
    console.log(`Cancelled ${cancelledOrders.count} pending orders at ${new Date().toISOString()}`);

    return {
      success: true,
      message: `Successfully cancelled ${cancelledOrders.count} pending orders from buyers.`,
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