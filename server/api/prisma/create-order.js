import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    console.log("Creating Order...");

    // Read the request body
    const body = await readBody(event);
    console.log("Received body:", body);

    const { userId, checkoutItem } = body; // Assuming userId and checkoutItem are sent in the request body

    if (!userId || !checkoutItem || checkoutItem.length === 0) {
      console.log("Missing userId or checkoutItem.");
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
      console.log(`User not found with id: ${userId}`);
      return {
        status: "error",
        message: "User not found.",
      };
    }

    // 2. Check if the user's cart exists and contains the correct items
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { cartItems: true },
    });

    if (!cart) {
      console.log(`Cart not found for userId: ${userId}`);
      return {
        status: "error",
        message: "Cart not found for the user.",
      };
    }

    // 3. Validate and calculate the total price
    let totalPrice = 0;

    // Map through the checkoutItems to calculate the total price and validate the items
    for (const item of checkoutItem) {
      const { productId, quantity } = item;

      // Fetch the product details from the Products table
      const product = await prisma.products.findUnique({
        where: { id: productId },
      });

      if (!product) {
        console.log(`Product with id ${productId} not found.`);
        return {
          status: "error",
          message: `Product with id ${productId} not found.`,
        };
      }

      // Calculate the total price for the product in the cart
      totalPrice += product.price * quantity;
    }

    console.log("Total price calculated:", totalPrice);

    // 4. Create the order record in the Orders table
    const order = await prisma.orders.create({
      data: {
        userId: userId, // The user placing the order
        totalPrice: totalPrice, // The total price of the order
        orderItem: {
          create: checkoutItem.map((item) => ({
            productId: item.productId,
            quantity: item.quantity, // Correct placement of quantity
          })),
        },
      },
      include: {
        orderItem: true, // Include order items in the response
      },
    });

    console.log("Order created successfully:", order);

    // 5. Delete the specific cart items that were ordered
    const cartItemsToDelete = checkoutItem.map((item) => ({
      productId: item.productId, // Match based on productId
      quantity: item.quantity, // Match based on quantity
    }));

    for (const item of cartItemsToDelete) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id, // Ensure we're deleting from the correct cart
          productId: item.productId, // Match by productId
        },
      });
      console.log(`Deleted cart item with productId: ${item.productId}`);
    }

    // 6. Return the created order along with the items
    return {
      status: "success",
      order: order, // Return the order with its items
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      status: "error",
      message: error.message || "There was an issue creating your order.",
    };
  }
});
