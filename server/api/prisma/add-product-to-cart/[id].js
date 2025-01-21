// add-product-to-cart/[id].js
import { PrismaClient } from "@prisma/client";
import { readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log("add to cart falg ");
  const userId = event.context.params.id; // Get userId from the request params
  const { productId, quantity } = await readBody(event); // Get both productId and quantity

  if (!userId || !productId || quantity == null) {
    return { success: 0 }; // Return 0 if either userId, productId or quantity is missing
  }

  try {
    // Check if the cart exists for this user
    let cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      return { success: 0 }; // Return 0 if cart is not found for the user
    }

    // Check if the product already exists in the cart
    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId
    );

    if (!existingCartItem) {
      console.log("NOTT");
      // If the product isn't already in the cart, add it with the quantity from the request
      await prisma.cartItem.create({
        data: {
          cartId: cart.id, // Link the cart item to the cart
          productId: productId, // Link the product to the cart item
          quantity: quantity, // Use the quantity from the request
        },
      });

      return { success: 1 }; // Return 1 for success
    } else {
      console.log("EXISTING");

      // If the product is already in the cart, update the quantity
      const newQuantity = existingCartItem.quantity + quantity;

      // Ensure new quantity is greater than 0
      if (newQuantity <= 0) {
        return { success: 0 }; // Prevent negative or zero quantity
      }

      // Update the quantity in the cart
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity, // Increment the existing quantity
        },
      });

      return { success: 2 }; // Return 2 for existing success
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return { success: 0 }; // Return 0 for failure
  }
});

// import { PrismaClient } from "@prisma/client";
// import { readBody } from "h3"; // Import readBody from h3

// const prisma = new PrismaClient();

// export default defineEventHandler(async (event) => {
//   const userId = event.context.params.id; // Get userId from the request params
//   const { productId, quantity } = await readBody(event); // Use readBody to get the body of the request

//   if (!userId || !productId) {
//     return { success: 0 }; // Return 0 if either userId or productId is missing
//   }

//   try {
//     // First, check if the cart exists for this user
//     let cart = await prisma.cart.findUnique({
//       where: { userId: userId },
//       include: {
//         cartItems: true,
//       },
//     });

//     if (!cart) {
//       return { success: 0 }; // Return 0 if cart is not found for the user
//     }

//     // Check if the product already exists in the cart
//     const existingCartItem = cart.cartItems.find(
//       (item) => item.productId === productId
//     );

//     if (!existingCartItem) {
//       // If the product isn't already in the cart, add it with a quantity of 1
//       await prisma.cartItem.create({
//         data: {
//           cartId: cart.id, // Link the cart item to the cart
//           productId: productId, // Link the product to the cart item
//           quantity: quantity, // Initial quantity is set to 1
//         },
//       });

//       //console.log("Product successfully added to cart!");
//       return { success: 1 }; // Return 1 for success
//     } else {
//       // If the product is already in the cart, return 0
//       //  console.log("Product is already in the cart.");
//       return { success: 0 }; // Return 0 if product already exists in cart
//     }
//   } catch (error) {
//     console.error("Error adding product to cart:", error);
//     return { success: 0 }; // Return 0 for failure
//   }
// });
