import prisma from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
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
    return products;
  } catch (error) {
    return { error: "Error fetching products", message: error.message };
  }
});
