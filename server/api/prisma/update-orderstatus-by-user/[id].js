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

    // Handle stock adjustments based on status changes
    const oldStatus = currentOrder.orderStatus;
    
    // Case 1: Moving to PROCESSING or FULFILLED from PENDING - Deduct stock
    if ((newStatus === "PROCESSING" || newStatus === "FULFILLED") && 
        (oldStatus === "PENDING")) {
      
      // Check if there's enough stock for all items
      for (const item of currentOrder.orderItem) {
        const product = await prisma.products.findUnique({
          where: { id: item.productId },
        });
        
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.title}. Available: ${product.stock}, Required: ${item.quantity}`);
        }
      }
      
      // Deduct stock for all items
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
    
    // Case 2: Changing from PROCESSING or FULFILLED to CANCELED - Add stock back
    if (newStatus === "CANCELED" && 
        (oldStatus === "PROCESSING" || oldStatus === "FULFILLED")) {
      
      // Add back stock for all items
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

    // Update the order status
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
