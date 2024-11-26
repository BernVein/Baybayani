import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Fetch all users from the Users table
    const users = await prisma.user.findMany(); // Use your actual Prisma model name here
    
    // Return the data
    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});
