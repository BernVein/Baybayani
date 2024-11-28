import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  console.log("Printing user ID");
  console.log(userId);

  let orders = await prisma.orders.findMany({
    where: {
      userId: userId,
      orderStatus: "PENDING",
    },
    orderBy: { id: "desc" },
    include: {
      orderItem: {
        include: {
          product: true,
        },
      },
    },
  });

  if (orders.length > 0) {
    // Cancel all the "PENDING" orders (you can also target specific orders by ID)
    await prisma.orders.updateMany({
      where: {
        id: {
          in: orders.map((order) => order.id), // Target all pending orders
        },
      },
      data: {
        orderStatus: "CANCELLED", // Update the status to "CANCELLED"
      },
    });
    console.log("Cancelled all pending orders for user", userId);
  } else {
    console.log("No pending orders found for user", userId);
  }

  // Return the updated orders (with CANCELLED status)
  return orders;
});
