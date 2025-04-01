import mercadopago from "mercadopago";

import { db } from "@/lib/prisma";

mercadopago.configurations.setAccessToken('TEST-1459282990230699-022417-ee5014d4c8340d3ff0f25e603cdf5d2b-68188517'); 

export const createPaymentPreference = async (orderId: string) => {
  const orderIdNumber = Number(orderId); // Outra forma de conversão

  // Recupera os dados do pedido a partir do seu banco de dados
  const order = await db.order.findUnique({
    where: { id: orderIdNumber },
    include: { orderProducts: true }, // Incluindo os produtos no pedido
  });

  if (!order) {
    throw new Error("Pedido não encontrado");
  }

  // Criação da preferência de pagamento
  const preference = {
    items: order.orderProducts.map(product => ({
      item: product.id, 
      unit_price: product.price,   
      quantity: product.quantity, 
    })),
    back_urls: {
      success: `https://www.seusite.com/success?orderId=${orderId}`, 
      failure: `https://www.seusite.com/failure?orderId=${orderId}`, 
      pending: `https://www.seusite.com/pending?orderId=${orderId}`, 
    },
    auto_return: 'approved',
  };

  try {
    const preferenceResponse = await mercadopago.preferences.create(preference);
    return preferenceResponse.response.init_point; 
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    throw new Error('Erro ao criar preferência de pagamento');
  }
};
