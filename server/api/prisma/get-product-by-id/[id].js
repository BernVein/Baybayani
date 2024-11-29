// /server/api/prisma/get-product-by-id/[id].js
import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  let product = await prisma.products.findFirst({
    where: { id: Number(event.context.params.id) },
  });
  return product;
});
