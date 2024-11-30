// server/api/prisma/deleteUser.post.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Read the body of the request (assuming userEmail is sent in the request body)
    const body = await readBody(event);
    const userEmail = body.email;

    // Delete the user from the database using Prisma
    await prisma.user.delete({
      where: {
        email: userEmail,
      },
    });

    return { success: true, message: 'User deleted successfully.' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: error.message || 'Failed to delete user.' };
  }
});
