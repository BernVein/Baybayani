import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Fetching all orders with all related fields
    const orders = await prisma.orders.findMany({
      include: {
        orderItem: { // Include all fields for order items
          include: {
            product: true, // Include all fields for products
          },
        },
      },
      orderBy: {
        created_at: "desc", // Order by the most recent orders
      },
    });

    return orders; // Return the fetched orders with related data
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Error fetching orders", message: error.message };
  }
});
