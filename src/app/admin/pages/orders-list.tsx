// src/app/admin/pages/orders-list.tsx

import { db } from "@/lib/prisma"

import OrdersListComponent from "../components/tables/orders-list"
import Topbar from "../components/topbar"

export default async function OrdersList() {
  const orders = await db.order.findMany({
    select: {
      id: true,
      total: true,
      status: true,
      consumptionMethod: true,
      customerName: true,
      customerPhone: true,
      createdAt: true,
      orderProducts: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          dropIng: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  const ordersArray = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }))

  return (
    <div className="w-full">
      <Topbar />
      <OrdersListComponent orders={ordersArray} />
    </div>
  )
}
