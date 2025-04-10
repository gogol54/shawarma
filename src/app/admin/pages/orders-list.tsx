// src/app/admin/pages/orders-list.tsx

import { db } from "@/lib/prisma"

import OrdersListComponent from "../components/tables/orders-list"
import Topbar from "../components/topbar"

export default async function OrdersList() {
  const orders = await db.order.findMany({
    include: {
      orderProducts: {
        include: {
          product: true // <-- Isso traz o nome, descrição, etc
        }
      }
    }
  })
  return (
    <div className="w-full">
      <Topbar />
      <OrdersListComponent orders={orders} />
    </div>
  )
}
