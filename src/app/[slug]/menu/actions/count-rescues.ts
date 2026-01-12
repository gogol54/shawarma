"use server"

import { db } from "@/lib/prisma"

export async function registerLoyaltyRedeem(
  phone: string,
  restaurantId: string
) {
  const totalOrders = await db.order.count({
    where: {
      customerPhone: phone,
      isPaid: true,
      status: "FINISHED",
      restaurantId,
    },
  })

  const totalRedeems = await db.loyaltyRedeem.count({
    where: {
      customerPhone: phone,
      restaurantId,
    },
  })

  if (totalOrders < (totalRedeems + 1) * 10) {
    throw new Error("Resgate indisponível")
  }

  await db.loyaltyRedeem.create({
    data: {
      customerPhone: phone,
      restaurantId,
    },
  })
}