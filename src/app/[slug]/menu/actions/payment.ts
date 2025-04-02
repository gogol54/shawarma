"use server"
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { query, body } = req;

    if (query.topic === "payment") {
      const paymentId = body.data.id;

      try {
        const paymentInfo = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }).then((res) => res.json());

        if (paymentInfo.status === "approved") {
          const order = await db.order.findFirst({
            where: { customerPhone: paymentInfo.payer.phone.number },
          });
        
          if (order) {
            await db.order.update({
              where: { id: order.id },
              data: { status: "IN_PREPARATION" },
            });
          }
        }
        return res.status(200).json({ status: "success" });
      } catch (error) {
        console.error("Erro ao processar pagamento:", error);
        return res.status(400).json({ error: "Erro ao processar pagamento" });
      }
    }
  }
  return res.status(405).end();
}

