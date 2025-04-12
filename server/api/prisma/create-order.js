import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    console.log("Creating Order...");

    const body = await readBody(event);

    const { userId, checkoutItem } = body;

    if (!userId || !checkoutItem || checkoutItem.length === 0) {
      return {
        status: "error",
        message: "Missing userId or checkout items.",
      };
    }

    // 1. Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found.",
      };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { cartItems: true },
    });

    if (!cart) {
      return {
        status: "error",
        message: "Cart not found for the user.",
      };
    }

    let totalPrice = 0;

    for (const item of checkoutItem) {
      const { productId, quantity } = item;

      const product = await prisma.products.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return {
          status: "error",
          message: `Product with id ${productId} not found.`,
        };
      }

      totalPrice += product.price * quantity;
    }

    const order = await prisma.orders.create({
      data: {
        userId: userId,
        totalPrice: totalPrice,
        orderItem: {
          create: checkoutItem.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItem: true,
      },
    });

    const cartItemsToDelete = checkoutItem.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    for (const item of cartItemsToDelete) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: item.productId,
        },
      });
    }

    return {
      status: "success",
      order: order,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      status: "error",
      message: error.message || "There was an issue creating your order.",
    };
  }
});
