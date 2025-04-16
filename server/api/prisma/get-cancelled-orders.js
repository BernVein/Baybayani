import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  try {
    const cancelledOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        orderStatus: 'CANCELLED',
        modified_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        orderItem: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        modified_at: 'desc'
      }
    })

    return { orders: cancelledOrders }
  } catch (error) {
    console.error('Error fetching cancelled orders:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching cancelled orders'
    })
  }
}) 