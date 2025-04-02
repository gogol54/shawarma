"use server"

import { db } from "@/lib/prisma";

import { removePoints, validateCPF } from "../menu/helpers/cpf";
import PhoneForm from "./components/cpf-form";
import OrdersList from "./components/order-list";

interface OrdersPageProps {
  searchParams: Promise<{phone: string}>
}
const OrdersPage = async ({searchParams}: OrdersPageProps) => {
  const { phone } = await searchParams;
  if(!phone){
    return <PhoneForm/>
  }

  const orders = await db.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      customerPhone: removePoints(phone)
    },
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true,
        },
      },
      orderProducts: {
        include: {
          product: true,
        },
      },
    }
  })
  if(!orders.length){
    return <PhoneForm/>
  }
  return (<><OrdersList orders={orders} /></>)

}
 
export default OrdersPage;