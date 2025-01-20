import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { userId, productId } = event.context.params; // Get userId and productId from the request params
  console.log("productIDDDDDD", productId);
  console.log("userIDDDDDD", userId);

  try {
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId: userId }, // Check cart belonging to the userId
        productId: Number(productId), // Ensure productId is a number, as Prisma expects the correct type
      },
      include: {
        product: true, // Include product details in the cart item response
      },
    });

    // If no cart item is found, return a message or an empty object
    if (!cartItem) {
      return { success: false, message: "Cart item not found" };
    }

    return cartItem; // Return the found cart item
  } catch (error) {
    console.error("Error fetching cart item:", error);
    return { success: false, message: "Failed to fetch cart item" };
  }
});
