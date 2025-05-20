// src/app/api/order-status-check/route.ts

import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { code },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
