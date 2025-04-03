import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  console.log("\n\n\n🔹 Webhook recebido!");
  console.log("req.url:", req.url);

  const { searchParams } = new URL(req.url);
  console.log("searchParams:", searchParams);

  // Corrigindo os parâmetros que vêm na URL
  const id = searchParams.get("data.id"); // O Mercado Pago envia como 'data.id'
  const topic = searchParams.get("type"); // O Mercado Pago envia como 'type'

  console.log("🔸 ID recebido:", id);
  console.log("🔸 Tipo recebido:", topic);

  if (!id || !topic) {
    console.log("❌ Parâmetros inválidos");
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  try {
    if (topic === "payment") {
      const paymentInfo = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }).then((res) => res.json());

      console.log("✅ Payment Info:", paymentInfo);

      if (paymentInfo.status === "approved") {
        console.log("✅ Pagamento aprovado!");

        const order = await db.order.findFirst({
          where: { customerPhone: paymentInfo.payer.phone.number },
        });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: { status: "IN_PREPARATION" },
          });

          console.log(`📦 Pedido ${order.id} atualizado para IN_PREPARATION`);
        } else {
          console.log("⚠️ Nenhum pedido encontrado para este telefone.");
        }
      }

      return NextResponse.json({ status: "success", paymentInfo }, { status: 200 });
    }
  } catch (error) {
    console.error("❌ Erro ao processar pagamento:", error);
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 });
  }

  console.log("📩 Webhook recebido sem ação necessária");
  return NextResponse.json({ message: "Webhook recebido, mas sem ação necessária" }, { status: 200 });
}
