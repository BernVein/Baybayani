import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log("DELETE PRODUCT FROM CART RUNNING");

  // Get userId and productId from the URL path parameters
  const { userId, productId } = event.context.params;
  //console.log("User ID:", userId);
  //console.log("Product ID:", productId);

  // If userId or productId is missing, return an error response
  if (!userId || !productId) {
    return { success: 0, message: "Missing userId or productId" };
  }

  try {
    // Find the cart for the user
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      return { success: 0, message: "Cart not found for user" };
    }

    // Find the specific cart item to delete
    const cartItem = cart.cartItems.find(
      (item) => item.productId === parseInt(productId) // Convert productId to integer for comparison
    );

    if (!cartItem) {
      console.log("Product not found in cart.");
      return { success: 0, message: "Product not found in cart" };
    }

    // Remove the item from the cart
    await prisma.cartItem.delete({
      where: {
        id: cartItem.id, // Delete by cartItem ID
      },
    });

    console.log("Product successfully removed from cart!");
    return { success: 1 }; // Successfully deleted
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return { success: 0, message: "Error removing product from cart" };
  }
});
