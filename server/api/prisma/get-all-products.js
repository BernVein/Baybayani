import prisma from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    console.log("Fetching products from database...");
    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        price: true,
        url: true,
        description: true,
        stock: true,
        hidden: true,
        isDeleted: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    
    console.log(`Successfully fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error in get-all-products:", error);
    
    // Check if it's a Prisma error
    if (error.code) {
      console.error("Prisma error code:", error.code);
    }
    
    // Return a more detailed error response
    return {
      error: "Error fetching products",
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
});
