import prisma from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const { productId } = event.context.params;
    const requestBody = await readBody(event);

    // Check if productId is provided for update operations
    if (productId) {
      // Update the product details if productId is specified
      const updatedProduct = await prisma.products.update({
        where: {
          id: parseInt(productId, 10),
        },
        data: {
          title: requestBody.title || undefined,
          description: requestBody.description || undefined,
          price:
            requestBody.price !== undefined
              ? parseInt(requestBody.price)
              : undefined,
          url: requestBody.url || undefined,
          stock:
            requestBody.stock !== undefined
              ? parseInt(requestBody.stock)
              : undefined,
          hidden:
            requestBody.hidden !== undefined ? requestBody.hidden : undefined,
          isDeleted:
            requestBody.isDeleted !== undefined
              ? requestBody.isDeleted
              : undefined,
        },
      });

      return {
        success: true,
        body: {
          message: "Product updated successfully",
          product: updatedProduct,
        },
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      body: {
        message: "An error occurred",
        error: error.message,
      },
    };
  }
});
