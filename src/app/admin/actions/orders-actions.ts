"use server"

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

export async function updateOrderStatus(orderId: number, newStatus: OrderStatus) {
  if (!orderId || !newStatus) return { error: "Dados inválidos" }

  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    })

    revalidatePath("/admin/pages/orders-list") // 🔁 forçar recarregamento da lista
    return { success: true }
  } catch (err) {
    console.error("Erro ao atualizar pedido", err)
    return { error: "Erro ao atualizar pedido" }
  }
}

export async function updateOrderPaid(orderId: number, isPaid: boolean) {
  if (!orderId || !isPaid) return { error: "Dados inválidos" }

  try {
    await db.order.update({
      where: { id: orderId },
      data: { isPaid: isPaid }
    })

    revalidatePath("/admin/pages/orders-list") // 🔁 forçar recarregamento da lista
    return { success: true }
  } catch (err) {
    console.error("Erro ao atualizar pedido", err)
    return { error: "Erro ao atualizar pedido" }
  }
}

export async function deleteOrder(id: number) {
  try {
    await db.order.delete({ where: { id } })
    revalidatePath("/admin/pages/orders-list") 
    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar pedido:", error)
    return { success: false, error: "Erro ao deletar pedido" }
  }
}