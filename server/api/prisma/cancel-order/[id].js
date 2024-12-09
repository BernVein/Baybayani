import { PrismaClient, OrderStatus } from "@prisma/client"; // Import enum from Prisma
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const orderID = event.context.params.id; // Extract the orderID from the event params
  // console.log("Printing order ID");
  // console.log(orderID);

  try {
    // Update the order status to CANCELED
    const updatedOrder = await prisma.orders.updateMany({
      where: {
        id: orderID, // Update the order by orderID
      },
      data: {
        orderStatus: OrderStatus.CANCELED, // Set the order status to CANCELED using the enum value
      },
    });

    // console.log("UPDATED SUCCESSFULLY");

    // Return a success message
    return { message: "Order status updated to CANCELED successfully." };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { message: "Failed to update order status." };
  }
});
