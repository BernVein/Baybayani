import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validate the required fields
    if (!body.title || !body.description || !body.url || !body.price) {
      throw new Error('Missing required fields: title, description, url, or price.');
    }

    // Ensure price is an integer
    const price = parseInt(body.price, 10);
    if (isNaN(price)) {
      throw new Error('Price must be a valid number.');
    }

    // Create a new product in the database
    const newProduct = await prisma.products.create({
      data: {
        title: body.title,
        description: body.description,
        url: body.url,
        price: price,
        hidden: false,
        isDeleted: false
      },
    });

    // Return the same structure as update endpoint
    return {
      success: true,
      body: {
        message: 'Product added successfully!',
        product: newProduct,
      },
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      body: {
        message: error.message || 'An error occurred while adding the product.',
      },
    };
  }
});
