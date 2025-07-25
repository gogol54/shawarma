'use server'

import { revalidatePath } from 'next/cache'

import { db } from '@/lib/prisma'

export async function createExpense(data: {
  description: string
  amount: number
  reference?: string
}) {
  const { description, amount } = data

  if (!description || !amount) {
    return { error: 'Dados obrigatórios faltando' }
  }

  try {
    const today = new Date()
    const reference = data.reference ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

    // Supondo que só existe 1 restaurante
    const restaurant = await db.restaurant.findFirst()
    if (!restaurant) return { error: 'Restaurante não encontrado' }

    await db.expense.create({
      data: {
        description,
        amount,
        reference,
        restaurantId: restaurant.id,
      },
    })

    revalidatePath('/admin/pages/finances')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar gasto:', error)
    return { error: 'Erro ao criar gasto' }
  }
}

export async function getExpensesGroupedByMonth() {
  const expenses = await db.expense.groupBy({
    by: ['reference'],
    _sum: {
      amount: true,
    },
    orderBy: {
      reference: 'desc',
    },
  });

  return expenses.map((e) => ({
    month: e.reference,
    total: e._sum.amount || 0,
    formattedTotal: e._sum.amount?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }) || "R$ 0,00",
  }));
}

export async function getAllExpenses() {
  return await db.expense.findMany({
    orderBy: { createdAt: "desc" },
  });
}


export async function updateExpenseData(
    id: string, 
    payload: { 
      description?: string; 
      amount?: number;
      reference?: string;
    }) {
  if (!id) return { error: "Dados inválidos" }

  try {
    await db.expense.update(
      { 
        where: { id }, 
        data: {
          description: payload.description, 
          amount: payload.amount
        } 
      })
    revalidatePath("/admin/pages/finances") // 🔁 forçar recarregamento da lista
    return { success: true }
  } catch (err) {
    console.error("Erro ao atualizar pedido", err)
    return { error: "Erro ao atualizar pedido" }
  }
}

export async function deleteExpense(id: string) {
  if (!id) return { success: false, error: 'ID inválido' }

  try {
    await db.expense.delete({ where: { id } })
    revalidatePath('/admin/pages/finances')
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar despesa:', error)
    return { success: false, error: 'Erro ao deletar despesa' }
  }
}