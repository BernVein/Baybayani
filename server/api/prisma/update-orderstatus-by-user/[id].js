import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { orderId, newStatus } = await readBody(event);

    if (!orderId || !newStatus) {
      throw new Error("Invalid input: orderId and newStatus are required");
    }

    const currentOrder = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    if (currentOrder.orderStatus !== newStatus) {
      if (newStatus === "PROCESSING" || newStatus === "FULFILLED") {
        if (
          currentOrder.orderStatus !== "PROCESSING" &&
          currentOrder.orderStatus !== "FULFILLED"
        ) {
          for (const item of currentOrder.orderItem) {
            await prisma.products.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      } else if (
        currentOrder.orderStatus === "PROCESSING" ||
        currentOrder.orderStatus === "FULFILLED"
      ) {
        for (const item of currentOrder.orderItem) {
          await prisma.products.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    return { success: true, updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
});

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// export default defineEventHandler(async (event) => {
//   try {
//     // Parse request body
//     const { orderId, newStatus, newTotalPrice } = await readBody(event);

//     if (!orderId || !newStatus) {
//       throw new Error("Invalid input: orderId and newStatus are required.");
//     }

//     // Prepare data object for update
//     const updateData = { orderStatus: newStatus };

//     // Include newTotalPrice if provided
//     if (newTotalPrice !== undefined) {
//       updateData.totalPrice = newTotalPrice;
//     }

//     // Update order status and total price in the database
//     const updatedOrder = await prisma.orders.update({
//       where: { id: orderId },
//       data: updateData,
//     });

//     return { success: true, updatedOrder };
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     return { success: false, message: error.message };
//   }
// });
