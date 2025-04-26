// app/api/brick-preference/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    const numericOrderId = Number(orderId);

    if (isNaN(numericOrderId)) {
      return NextResponse.json({ error: 'orderId inválido' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: numericOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ amount: order.total });
  } catch (error) {
    console.error('Erro na API brick-preference:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
