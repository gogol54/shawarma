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
  }>;
  consumptionMethod: ConsumptionMethod; // Corrigido para camelCase
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

  const orderProductsValues = input.products.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
    price: productsWithPrices.find((p) => p.id === item.id)!.price,
  }));

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
  revalidatePath(`/${input.slug}/orders`)
  redirect(`/${input.slug}/orders?cpf=${removePoints(input.customerCpf)}`)
};
