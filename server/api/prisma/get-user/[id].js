import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id; // Extract user ID from the URL parameters
  //console.log("User ID:", userId); // Log the ID for debugging

  const user = await prisma.user.findUnique({
    where: { id: userId }, // Use the correct field to query
  });

  //console.log("User found:", user); // Log user data for debugging
  return user; // Return user data
});
