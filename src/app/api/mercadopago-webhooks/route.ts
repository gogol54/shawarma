import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("data.id") || searchParams.get("id"); // Suporte para ambas as estruturas
  const topic = searchParams.get("type") || searchParams.get("topic"); // Suporte para ambas as estruturas

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
        const orderId = parseInt(paymentInfo.external_reference);
      
        const paymentMethod = paymentInfo.payment_method_id?.toUpperCase() || "NONE";
      
        const order = await db.order.findUnique({
          where: { id: orderId },
        });
      
        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "IN_PREPARATION",
              isPaid: true,
              paymentMethod: paymentMethod, // 👈 aqui salva PIX, CARD etc
            },
          });
      
          console.log(`📦 Pedido ${order.id} atualizado com status IN_PREPARATION e método ${paymentMethod}`);
        } else {
          console.log("⚠️ Nenhum pedido encontrado com esse ID.");
        }
      }

      return NextResponse.json({ status: "success", paymentInfo }, { status: 200 });
    } 
    else if (topic === "merchant_order" || topic === "topic_merchant_order_wh") {
      // Trata merchant_order
      const orderInfo = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }).then((res) => res.json());
      const externalReference = orderInfo.external_reference || null;
      if (!externalReference) {
        console.error("❌ external_reference não encontrado na merchant_order!");
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
      }
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
