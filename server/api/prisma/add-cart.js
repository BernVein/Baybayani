// server/api/prisma/add-cart.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Parse the request body
  const { productId, userId } = await readBody(event);

  // Validate required fields
  if (!productId || !userId) {
    return {
      success: false,
      message: "Product ID and User ID are required"
    };
  }

  try {
    // Check if the user already has a cart
    let cart = await prisma.cart.findFirst({
      where: { userId: userId },
      include: { cartItems: true },
    });

    if (!cart) {
      // If no cart exists, create a new cart for the user
      cart = await prisma.cart.create({
        data: {
          userId: userId,
        },
        include: {
          cartItems: true,
        },
      });
    }

    // Check if the product already exists in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingItem) {
      // If the product exists, update the quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + 1,
        },
      });
    } else {
      // If the product does not exist, add it as a new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: 1,
        },
      });
    }

    // Return the updated cart with cart items
    const updatedCart = await prisma.cart.findFirst({
      where: { userId: userId },
      include: { 
        cartItems: {
          include: {
            product: true
          }
        }
      },
    });

    return { success: true, cart: updatedCart };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { 
      success: false, 
      message: "Failed to add item to cart",
      error: error.message
    };
  }
});
