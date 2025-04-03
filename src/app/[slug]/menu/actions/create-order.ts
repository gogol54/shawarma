"use server"
import { ConsumptionMethod } from "@prisma/client";
import { MercadoPagoConfig, Preference } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

import { db } from "@/lib/prisma";

import { removePoints } from "../helpers/cpf";

interface CreateOrderInput {
  customerName: string;
  customerCpf: string;
  customerPhone: string;
  address: { 
    street: string; 
    number: string; 
    complement: string; 
    zone: string; 
  },
  products: Array<{
    id: string;
    name: string;
    menuCategoryId: string;
    quantity: number;
    dropIng: string[];
  }>;
  consumptionMethod: ConsumptionMethod; 
  slug: string;
}

export const createOrder = async (input: CreateOrderInput) => {
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
  const orderResponse = await db.order.create({
    data: {
      consumptionMethod: input.consumptionMethod,
      status: "PENDING",
      customerName: input.customerName,
      customerCpf: removePoints(input.customerCpf),
      customerPhone: removePoints(input.customerPhone),
      address: input.address,  // Convertendo o objeto em JSON
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

  if(orderResponse)
    console.log('Pedido criado com sucesso. Atualizando estoque...', orderResponse);

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

  const preference = new Preference(mercadopago);
  const response = await preference.create({
    body: {
      items: [
        ...input.products.map((item) => {
          const product = productsWithPrices.find((p) => p.id === item.id);
          if (!product) throw new Error(`Produto com id ${item.id} não encontrado.`);
          return {
            id: item.id,
            title: `Produto: ${item.quantity} ${item.name}`,
            category_id: item.menuCategoryId,
            quantity: item.quantity,
            currency_id: "BRL",
            unit_price: product.price,
          };
        }),
        ...(input.consumptionMethod === "takeaway"
          ? [
              {
                id: "frete",
                title: "Taxa de entrega",
                quantity: 1,
                currency_id: "BRL",
                unit_price: 8, // Valor fixo da taxa de retirada
              },
            ]
          : []),
      ],

      payer: {
        name: input.customerName,
        phone: {
          area_code: "55",
          number: removePoints(input.customerPhone),
        },
        identification: {
          number: input.customerCpf,
          type: 'CPF'
        },
        address: {
          zip_code: '97590-000',
          street_name: input.address.street,
          street_number: input.address.complement ? 
            input.address.number.concat(', ').concat(input.address.complement) :
            input.address.number
        },
        date_created: JSON.stringify(orderResponse.createdAt)
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/${input.slug}/orders?phone=${removePoints(input.customerPhone)}&clean=true`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/${input.slug}/checkout?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/${input.slug}/checkout?status=pending&phone=${removePoints(input.customerPhone)}&clean=true`, 
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago-webhoock`,
      external_reference: JSON.stringify(orderResponse.id)
    },
  });

  console.log("Preferência criada com sucesso:", response);

  return { redirectUrl: response.init_point };
};