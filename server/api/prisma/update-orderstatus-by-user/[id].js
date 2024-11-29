import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const { orderId, newStatus } = await readBody(event);

    if (!orderId || !newStatus) {
      throw new Error("Invalid input: orderId and newStatus are required.");
    }

    // Update order status in the database
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
});
