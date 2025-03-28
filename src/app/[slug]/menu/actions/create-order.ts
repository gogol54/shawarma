"use server"
import { ConsumptionMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";

import { removePoints } from "../helpers/cpf";

interface CreateOrderInput {
  customerName: string;
  customerCpf: string;
  customerPhone: string;
  products: Array<{
    id: string;
    quantity: number;
    dropIng: string[];
  }>;
  consumptionMethod: ConsumptionMethod; 
  slug: string;
}

export const createOrder = async (input: CreateOrderInput) => {
  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: input.slug,
    },
  });

  if (!restaurant) {
    throw new Error("Restaurant Not Found!");
  }

  const productsWithPrices = await db.product.findMany({
    where: {
      id: {
        in: input.products.map((product) => product.id),
      },
    },
  });

  // Verificando se o estoque é suficiente para todos os produtos
  for (const item of input.products) {
    const product = productsWithPrices.find((p) => p.id === item.id);
    if (!product) {
      throw new Error(`Produto com id ${item.id} não encontrado.`);
    }

    // Se o estoque do produto for menor que a quantidade pedida, lança erro
    if (product.inStock < item.quantity) {
      throw new Error(`Estoque insuficiente para o produto: ${item.id}. Disponível: ${product.inStock}`);
    }
  }

  const orderProductsValues = input.products.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
    dropIng: item.dropIng,
    price: productsWithPrices.find((p) => p.id === item.id)!.price,
  }));

  // Criando o pedido
  await db.order.create({
    data: {
      consumptionMethod: input.consumptionMethod,
      status: "PENDING",
      customerName: input.customerName,
      customerCpf: removePoints(input.customerCpf),
      customerPhone: removePoints(input.customerPhone),
      orderProducts: {
        createMany: {
          data: orderProductsValues,
        },
      },
      total: input.consumptionMethod === 'takeaway' ? orderProductsValues.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ) + 8 : orderProductsValues.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
      restaurantId: restaurant.id,
    },
  });

  // Atualizando o estoque de cada produto
  for (const item of input.products) {
    await db.product.update({
      where: { id: item.id },
      data: {
        inStock: {
          decrement: item.quantity, // Subtrai a quantidade comprada
        },
      },
    });
  }

  // Revalidando a página e redirecionando para a lista de pedidos
  revalidatePath(`/${input.slug}/orders`);
  redirect(`/${input.slug}/orders?cpf=${removePoints(input.customerCpf)}`);
};
