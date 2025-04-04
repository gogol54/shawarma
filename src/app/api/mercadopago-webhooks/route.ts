import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("data.id"); // O Mercado Pago envia como 'data.id'
  const topic = searchParams.get("type"); // O Mercado Pago envia como 'type'


  if (!id || !topic) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    if (topic === "payment") {
      const paymentInfo = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }).then((res) => res.json());

      if (paymentInfo.status === "approved") {
        console.log("✅ Pagamento aprovado!");

        const orderId = parseInt(paymentInfo.external_reference); // Pega o ID direto da preferência
      
        const order = await db.order.findUnique({
          where: { id: orderId },
        });
      
        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: { status: "IN_PREPARATION" },
          });
      
          console.log(`📦 Pedido ${order.id} atualizado para IN_PREPARATION`);
        } else {
          console.log("⚠️ Nenhum pedido encontrado com esse ID.");
        }
      }

      return NextResponse.json({ status: "success", paymentInfo }, { status: 200 });
    } 
    else if (topic === "merchant_order") {
      // Trata merchant_order
      const orderInfo = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }).then((res) => res.json());

      console.log("✅ Merchant Order Info:", orderInfo);

      const externalReference = orderInfo.external_reference || null;

      if (!externalReference) {
        console.error("❌ external_reference não encontrado na merchant_order!");
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
      }

      console.log(`📦 Pedido ${externalReference} associado ao merchant_order`);

      return NextResponse.json({ status: "success" }, { status: 200 });

    } else {
      console.error("❌ Webhook desconhecido:", topic);
      return NextResponse.json({ error: "Tipo de webhook desconhecido" }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
  