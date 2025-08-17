"use server"

import { ConsumptionMethod } from "@prisma/client";
import { MercadoPagoConfig, Preference } from "mercadopago";

import { handleDownloadReceiptBack } from "@/app/helpers/cupom";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

import { db } from "@/lib/prisma";

import { generateOrderCode } from "../helpers/codeFunction";  
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
    description: string;
    menuCategoryId: string;
    quantity: number;
    dropIng: string[];
  }>;
  consumptionMethod: ConsumptionMethod; 
  slug: string;
  control: boolean;
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

  // Obter os preços dos produtos
  const productsWithPrices = await db.product.findMany({
    where: {
      id: {
        in: input.products.map((product) => product.id),
      },
    },
    select: {
      id: true,
      price: true,
      offer: true,
      inStock: true,
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

  // Mapear os produtos para a tabela de pedidos, aplicando desconto
  const orderProductsValues = input.products.map((item) => {
    const product = productsWithPrices.find((p) => p.id === item.id)!;
    const discount = product.offer > 0 ? product.price * (product.offer / 100) : 0;
    const finalPrice = Number((product.price - discount).toFixed(2));

    return {
      productId: item.id,
      quantity: item.quantity,
      dropIng: item.dropIng,
      price: finalPrice,
    };
  });

  // Para envio no e-mail (mantém a consistência)
  const orderProductsValuesToMail = input.products.map((item) => {
    const product = productsWithPrices.find((p) => p.id === item.id)!;
    const discount = product.offer > 0 ? product.price * (product.offer / 100) : 0;
    const finalPrice = Number((product.price - discount).toFixed(2));

    return {
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      dropIng: item.dropIng,
      price: finalPrice,
    };
  });

  // Calcular total com desconto e possível taxa de entrega
  const subtotal = orderProductsValues.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee = input.consumptionMethod === 'entrega' ? 8 : 0;
  const total = subtotal + deliveryFee;

  // Criar o pedido
  const orderResponse = await db.order.create({
    data: {
      code: generateOrderCode(Math.round(Math.random() * 900000)),
      consumptionMethod: input.consumptionMethod,
      status: "PENDING",
      customerName: input.customerName,
      customerCpf: removePoints(input.customerCpf),
      customerPhone: removePoints(input.customerPhone),
      address: input.address,
      orderProducts: {
        createMany: {
          data: orderProductsValues,
        },
      },
      total,
      restaurantId: restaurant.id,
    },
    include: {
      orderProducts: {
        include: {
          product: true, // garante que product.name estará disponível
        },
      },
    },
  });

  // Enviar e-mail (sem alteração necessária)
if (orderResponse) {
  // Retorna base64 puro do PDF
  const pdfBase64 = handleDownloadReceiptBack(orderResponse);

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: orderResponse.customerName,
        orderId: orderResponse.id,
        total: orderResponse.total,
        products: orderProductsValuesToMail,
        control: input.control,
        consumptionMethod: input.consumptionMethod,
        receiptBase64: pdfBase64, // enviar base64 puro
      }),
    });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
  }
}

  // Atualizar estoque
  for (const item of input.products) {
    await db.product.update({
      where: { id: item.id },
      data: {
        inStock: {
          decrement: item.quantity,
        },
      },
    });
  }

  // Redirecionamento se for controle (sem pagamento)
  if (input.control) {
    return {
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${input.slug}/orders?phone=${removePoints(input.customerPhone)}`
    };
  }

  // Caso contrário, criar preferência no MercadoPago
  const preference = new Preference(mercadopago);
  const response = await preference.create({
    body: {
      items: [
        ...input.products.map((item) => {
          const product = productsWithPrices.find((p) => p.id === item.id)!;
          const discount = product.offer > 0 ? product.price * (product.offer / 100) : 0;
          const finalPrice = Number((product.price - discount).toFixed(2));

          return {
            id: item.id,
            title: `Produto: ${item.quantity} ${item.name}`,
            description: item.description,
            category_id: item.menuCategoryId,
            quantity: item.quantity,
            currency_id: "BRL",
            unit_price: finalPrice,
          };
        }),
        ...(input.consumptionMethod === "entrega"
          ? [
              {
                id: "frete",
                title: "Taxa de entrega",
                quantity: 1,
                currency_id: "BRL",
                unit_price: deliveryFee,
              },
            ]
          : []),
      ],
      metadata: { internal_order_id: orderResponse.id.toString() },
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
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago-webhooks`,
      external_reference: JSON.stringify(orderResponse.id)
    },
  });

  // Atualizar pedido com ID da preferência
  await db.order.update({
    where: { id: orderResponse.id },
    data: { preferenceId: response.id }
  });

  return { orderId: orderResponse.id };
}