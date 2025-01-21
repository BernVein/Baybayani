import prisma from "../../utils/prisma"; // Import Prisma client

export default defineEventHandler(async (event) => {
  //console.log("Called 1");

  try {
    // Extract data from the body of the request using readBody
    const { cartId, productId, isSelected } = await readBody(event);

    // console.log(cartId);
    // console.log(productId);
    // console.log(isSelected);

    // Ensure that isSelected is a boolean value
    if (typeof isSelected !== "boolean") {
      return {
        success: false,
        error: "Invalid value for 'isSelected'. Must be a boolean.",
      };
    }

    // Update the cart item based on cartId and productId
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      data: {
        checked: isSelected, // Update the 'checked' status in the cart item
      },
    });

    // Return success and updated cart item
    return { success: true, updatedCartItem };
  } catch (error) {
    console.error("Error updating cart item selection:", error);
    return {
      success: false,
      error: "Failed to update cart item selection.",
      details: error.message,
    };
  }
});
