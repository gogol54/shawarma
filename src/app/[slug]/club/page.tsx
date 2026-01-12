"use server"

import { db } from "@/lib/prisma"

import LoyaltyStatus from "../components/loyalty-status"
import RestaurantHeader from "../menu/components/header"
import { removePoints } from "../menu/helpers/cpf"
import PhoneForm from "../orders/components/phone-form"

interface OrdersPageProps {
  params: Promise<{slug: string}>
  searchParams: Promise<{phone?: string}>
}

const OrdersPage = async ({ params, searchParams }: OrdersPageProps) => {
  const { slug } = await params
  const { phone } = await searchParams
  const restaurant = await db.restaurant.findUnique({
      where: {slug},
      include: {
        menuCategories: {
          include: {
            products: true
          },
        },
      }
    })

  if (!phone) {
    return <PhoneForm />
  }

  const customerPhone = removePoints(phone)

  const totalOrders = await db.order.count({
    where: {
      customerPhone,
      isPaid: true,
      status: "FINISHED",
    },
  })

  if (totalOrders === 0) {
    return <PhoneForm />
  }

  const totalRedeems = await db.loyaltyRedeem.count({
    where: {
      customerPhone,
    },
  })

  // 👉 pedidos já "consumidos" por resgates
  const usedOrders = totalRedeems * 10

  // 👉 saldo real de pedidos
  const remainingOrders = totalOrders - usedOrders

  const canRedeem = remainingOrders >= 10

  // ⭐ REGRA DE OURO
  const ordersUntilNextReward = canRedeem
    ? 0
    : 10 - (remainingOrders % 10 || 10)

  return (<>
    <RestaurantHeader restaurant={restaurant!} slug={slug} />
    <LoyaltyStatus
      phone={customerPhone}
      data={{
        totalOrders,
        totalRedeems,
        availableRedeems: canRedeem ? 1 : 0,
        ordersUntilNextReward,
        canRedeem,
      }}
    /></>
  )
}

export default OrdersPage
