import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  let orders = await prisma.orders.findMany({
    where: { userId: userId },
    orderBy: { created_at: "desc" },
    include: {
      orderItem: {
        include: {
          product: true,
        },
      },
    },
  });
  return orders;
});
