import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Extract the order item ID from the request parameters
    const { id } = event.context.params;

    // Ensure the ID is provided
    if (!id) {
      throw new Error("Order item ID is required.");
    }

    // Delete the order item from the database
    const deletedItem = await prisma.orderItem.delete({
      where: {
        id: parseInt(id), // Ensure ID is passed as an integer
      },
    });

    return { success: true, deletedItem };
  } catch (error) {
    console.error("Error deleting order item:", error);
    return { success: false, message: error.message };
  }
});
