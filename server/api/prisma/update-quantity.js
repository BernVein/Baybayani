import prisma from "../../utils/prisma"; // Import Prisma client

export default defineEventHandler(async (event) => {
  //   console.log("Called 1");

  try {
    // Extract data from the body of the request using readBody
    const { cartId, productId, quantity } = await readBody(event);

    // console.log(cartId);
    // console.log(productId);
    // console.log(quantity);

    // Ensure quantity is a valid number
    if (isNaN(quantity) || quantity < 1) {
      return {
        success: false,
        error: "Invalid quantity. Must be a positive number.",
      };
    }

    // Find and update the cart item in the database based on cartId and productId
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        // Using a compound unique key (cartId + productId)
        cartId_productId: {
          cartId,
          productId,
        },
      },
      data: {
        quantity, // Update quantity in the cart item
      },
    });

    // Return success and updated cart item
    return { success: true, updatedCartItem };
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return {
      success: false,
      error: "Failed to update cart item quantity.",
      details: error.message,
    };
  }
});
