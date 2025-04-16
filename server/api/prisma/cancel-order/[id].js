import { PrismaClient, OrderStatus } from "@prisma/client"; // Import enum from Prisma
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const orderID = event.context.params.id; // Extract the orderID from the event params
  // console.log("Printing order ID");
  // console.log(orderID);

  try {
    // First, check the current order status
    const orderToCancel = await prisma.orders.findUnique({
      where: {
        id: orderID,
      },
    });

    if (!orderToCancel) {
      return { success: false, message: "Order not found." };
    }

    // Only allow cancellation if order is in PENDING status
    if (orderToCancel.orderStatus !== OrderStatus.PENDING) {
      return { 
        success: false, 
        message: "Only orders with PENDING status can be cancelled." 
      };
    }

    // Update the order status to CANCELED
    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderID, // Update the order by orderID
      },
      data: {
        orderStatus: OrderStatus.CANCELED, // Set the order status to CANCELED using the enum value
      },
    });

    // console.log("UPDATED SUCCESSFULLY");

    // Return a success message
    return { 
      success: true,
      message: "Order status updated to CANCELED successfully." 
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { 
      success: false,
      message: "Failed to update order status." 
    };
  }
});
