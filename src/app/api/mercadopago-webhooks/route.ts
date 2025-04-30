import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("data.id") || searchParams.get("id");
  const topic = searchParams.get("type") || searchParams.get("topic");

  console.log("🔔 Webhook recebido:", { id, topic });

  if (!id || !topic) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    if (topic === "payment") {
      const paymentInfo = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }).then((res) => res.json());

      console.log("📄 PAYMENT INFO:", paymentInfo);

      if (paymentInfo.status === "approved") {
        // Usa metadata.orderId ao invés de external_reference
        const orderId = parseInt(paymentInfo.metadata?.orderId);
        if (isNaN(orderId)) {
          console.error("❌ Invalid metadata.orderId:", paymentInfo.metadata);
          return NextResponse.json({ error: "Invalid metadata.orderId" }, { status: 400 });
        }

        const paymentMethod = paymentInfo.payment_method_id?.toUpperCase() || "NONE";

        const order = await db.order.findUnique({ where: { id: orderId } });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "IN_PREPARATION",
              isPaid: true,
              paymentMethod,
            },
          });

          console.log(`✅ Order ${order.id} atualizada com método ${paymentMethod}`);
        } else {
          console.log("⚠️ Pedido não encontrado para o orderId:", orderId);
        }
      }

      return NextResponse.json({ status: "success", paymentInfo }, { status: 200 });

    } else if (topic === "merchant_order") {
      const orderInfo = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }).then((res) => res.json());

      console.log("📦 MERCHANT ORDER INFO:", orderInfo);

      // Tenta recuperar orderId pelo metadata
      const orderId = parseInt(orderInfo.metadata?.orderId);
      if (!orderId || isNaN(orderId)) {
        console.error("❌ orderId ausente em metadata de merchant_order");
        return NextResponse.json({ error: "Invalid orderId in metadata" }, { status: 400 });
      }

      return NextResponse.json({ status: "success" }, { status: 200 });
    }

    console.error("❌ Tipo de webhook não reconhecido:", topic);
    return NextResponse.json({ error: "Unknown webhook type" }, { status: 400 });

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
