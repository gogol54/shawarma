// pages/api/check-payment.ts

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Telefone não fornecido" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: {
      customerPhone: phone,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!order) {
    return NextResponse.json({ status: "unknown" });
  }

  if (order.isPaid) {
    return NextResponse.json({ status: "approved" });
  }

  return NextResponse.json({ status: "pending" });
}
