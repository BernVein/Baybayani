import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const { email, status } = body;

  if (!email || !status) {
    return {
      success: false,
      message: 'Email and status are required'
    };
  }

  try {
    const user = await prisma.user.update({
      where: {
        email: email
      },
      data: {
        status: status
      }
    });

    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      message: 'Error updating user status: ' + error.message
    };
  }
}); 