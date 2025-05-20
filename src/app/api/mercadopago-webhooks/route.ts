// src/app/api/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderUpdateEmail(orderId: number, paymentMethod: string) {
  const subject = `📦 Pedido ${orderId} foi PAGO`;
  const message = `📦 Pedido ${orderId} atualizado para EM PREPARO e método ${paymentMethod}`;

  try {
    await transporter.sendMail({
      from: `"Sistema de Pedidos" <${process.env.EMAIL_USER}>`,
      to: [process.env.ADMIN_MAIL!, process.env.DEV_MAIL!],
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });
    console.log(`📨 Email enviado sobre o pedido ${orderId}`);
  } catch (error) {
    console.error(`Erro ao enviar email do pedido ${orderId}:`, error);
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("data.id") || searchParams.get("id");
  const topic = searchParams.get("type") || searchParams.get("topic");

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
        const description = paymentInfo.description || "";
        const preferenceId: string | undefined = description.split("Pedido ")[1]?.trim();

        if (!preferenceId) {
          console.error("❌ Não foi possível extrair o preferenceId da descrição.");
          return NextResponse.json({ error: "preferenceId inválido" }, { status: 400 });
        }

        const paymentMethod = paymentInfo.payment_method_id?.toUpperCase() || "NONE";

        const order = await db.order.findFirst({
          where: { preferenceId },
        });

        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "IN_PREPARATION",
              isPaid: true,
              paymentMethod,
            },
          });

          await sendOrderUpdateEmail(order.id, paymentMethod);
        } else {
          console.log("⚠️ Nenhum pedido encontrado com esse preferenceId.");
        }
      }

      return NextResponse.json({ status: "success", paymentInfo }, { status: 200 });

    } else if (topic === "merchant_order" || topic === "topic_merchant_order_wh") {
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
