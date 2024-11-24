import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const { productId } = event.context.params;

    // Delete the product itself, which will also delete related cart items due to cascading delete
    await prisma.products.delete({
      where: {
        id: parseInt(productId, 10),
      },
    });

    return {
      statusCode: 200,
      body: {
        message: "Product deleted successfully",
      },
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      statusCode: 500,
      body: {
        message: "Error deleting product",
        error: error.message,
      },
    };
  }
});
