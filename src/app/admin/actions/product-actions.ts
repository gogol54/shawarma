"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/prisma"

// Tipos que podem ser atualizados
type UpdatableProductFields = {
  name?: string
  description?: string
  price?: number
  inStock?: number
  imageUrl?: string
  menuCategoryId?: string
}

export async function updateProduct(id: string, newProduct: UpdatableProductFields) {
  if (!id || Object.keys(newProduct).length === 0) {
    return { error: "Dados inválidos" }
  }

  try {
    await db.product.update({
      where: { id },
      data: newProduct,
    })

    revalidatePath("/admin/pages/products-list")
    return { success: true }
  } catch (err) {
    console.error("Erro ao atualizar produto:", err)
    return { error: "Erro ao atualizar produto" }
  }
}

export async function deleteProduct(id: string) {
  if (!id) return { error: "ID inválido" }

  try {
    await db.product.delete({
      where: { id },
    })

    revalidatePath("/admin/pages/products-list")
    return { success: true }
  } catch (err) {
    console.error("Erro ao remover produto:", err)
    return { error: "Erro ao remover produto" }
  }
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
  inStock?: number
  imageUrl: string
  menuCategoryId: string
  restaurantId: string
  ingredients?: string[] // pode ser string[], string ou Json conforme quiser tratar
}) {
  const { name, description, price, imageUrl, menuCategoryId, restaurantId, inStock = 25, ingredients = [] } = data

  if (!name || !description || !price || !imageUrl || !menuCategoryId || !restaurantId) {
    return { error: "Dados obrigatórios ausentes" }
  }

  try {
    await db.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        inStock,
        menuCategoryId,
        restaurantId,
        ingredients,
      },
    })

    revalidatePath("/admin/pages/products-list")
    return { success: true }
  } catch (err) {
    console.error("Erro ao criar produto:", err)
    return { error: "Erro ao criar produto" }
  }
}