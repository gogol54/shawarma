"use server"

import { OrderStatus, Prisma } from "@prisma/client";
import { ScrollTextIcon } from "lucide-react";
import Image from "next/image";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { GoBackBtn, TrackOrderButton } from "./back-btn";

interface OrdersListProps {
  orders: Prisma.OrderGetPayload<{
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true
        },
        
      },
      orderProducts: {
        include: {
          product: true,
          dropIng: true
        },
      },
    },
  }>[]
}

const statusLabel = (status: OrderStatus) => {
  // if(status === 'DELIVERY') return "Saiu para entrega"
  if(status === "APPROVED") return "Pagamento Aprovado"
  if(status === "FINISHED") return "Entregue"
  if(status === "DELIVERY") return "Saiu para entrega"
  if(status === "IN_PREPARATION") return "Em preparo"
  if(status === "PENDING") return "Pendente" 
  if(status === "CANCELLED") return "Cancelado"
  return ""
}
const OrdersList = ({ orders }: OrdersListProps) => {
  return (
    <div className="space-y-6 p-6">
      <GoBackBtn />
      <div className="flex items-center gap-3">
        <ScrollTextIcon />
        <h2 className="text-lg font-semibold">Meus Pedidos</h2>
      </div>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-4 p-5">
            <div
              className={`w-fit rounded-full px-2 py-1 text-xs font-semibold text-[#434343] ${
                order.status === OrderStatus.FINISHED || order.status === OrderStatus.APPROVED
                  ? "bg-green-500 text-white"
                  : order.status === OrderStatus.IN_PREPARATION
                  ? "bg-yellow-300"
                  : order.status === OrderStatus.CANCELLED
                  ? "bg-red-400"
                  : order.status === OrderStatus.DELIVERY 
                  ? "bg-[#5D58EB] text-white" 
                  : "bg-gray-700 text-white"
              }`}
            >
              {statusLabel(order.status)}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5">
                <Image
                  src={order.restaurant.avatarImageUrl}
                  alt={order.restaurant.name}
                  fill
                  className="rounded-lg"
                />
              </div>
              <p className="text-sm font-semibold">{order.restaurant.name}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              {order.orderProducts.map((orderProduct) => {
                const removedIngredients = Array.isArray(orderProduct.dropIng) && orderProduct.dropIng.length > 0
                  ? ` S/ ${orderProduct.dropIng.join(", ")}`
                  : "";

                return (
                  <div key={orderProduct.id} className="flex items-center gap-2">
                    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white bg-muted text-xs font-semibold">
                      {orderProduct.quantity}
                    </div>
                    <p className="text-sm">
                      {orderProduct.product.name}
                      {removedIngredients && <span className="text-red-500">{removedIngredients}</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            <Separator />
            <p className="text-sm font-medium">{formatCurrency(order.total)}</p>

            {/* Botão de acompanhamento do pedido */}
            <TrackOrderButton orderId={order.code} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersList;
 
