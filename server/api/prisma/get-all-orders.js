import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Fetching all orders with their statuses
    const orders = await prisma.orders.findMany({
      select: {
        id: true,
        userId: true,
        created_at: true,
        modified_at: true,
        totalPrice: true,
        orderStatus: true, // Include the order status (enum field)
      },
      orderBy: {
        created_at: "desc", // Order by the most recent orders
      },
    });

    return orders; // Return the fetched orders as a JSON response
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Error fetching orders", message: error.message };
  }
});
