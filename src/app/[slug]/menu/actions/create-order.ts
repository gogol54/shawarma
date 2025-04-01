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
  address: JSON; 
  products: Array<{
    id: string;
    quantity: number;
    dropIng: string[];
  }>;
  consumptionMethod: ConsumptionMethod; 
  slug: string;
}

export const createOrder = async (input: CreateOrderInput) => {
  try {
    console.log('Iniciando a criação do pedido...', input);
    const restaurant = await db.restaurant.findUnique({
      where: {
        slug: input.slug,
      },
    });

    if (!restaurant) {
      throw new Error("Restaurant Not Found!");
    }

    // Obter os preços dos produtos
    const productsWithPrices = await db.product.findMany({
      where: {
        id: {
          in: input.products.map((product) => product.id),
        },
      },
    });

    // Verificar estoque suficiente para os produtos
    for (const item of input.products) {
      const product = productsWithPrices.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Produto com id ${item.id} não encontrado.`);
      }

      if (product.inStock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto: ${item.id}. Disponível: ${product.inStock}`);
      }
    }

    // Mapear os produtos para a tabela de pedidos
    const orderProductsValues = input.products.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      dropIng: item.dropIng,
      price: productsWithPrices.find((p) => p.id === item.id)!.price,
    }));

    // Criar o pedido no banco de dados
    await db.order.create({
      data: {
        consumptionMethod: input.consumptionMethod,
        status: "PENDING",
        customerName: input.customerName,
        customerCpf: removePoints(input.customerCpf),
        customerPhone: removePoints(input.customerPhone),
        address: JSON.stringify(input.address),  // Convertendo o objeto em JSON
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

    console.log('Pedido criado com sucesso. Atualizando estoque...');

    // Atualizar o estoque de cada produto
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

    console.log('Estoque atualizado. Revalidando a página e redirecionando...');
  
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw new Error('Erro ao criar pedido. Tente novamente!');
  }
};

