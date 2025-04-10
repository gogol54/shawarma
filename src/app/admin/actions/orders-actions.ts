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
