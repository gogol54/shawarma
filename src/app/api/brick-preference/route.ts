import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

import { db } from '@/lib/prisma';

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  const { orderId } = await req.json();
  const order = await db.order.findUnique({
    where: { id: parseInt(orderId, 10) },
    include: { orderProducts: { include: { product: true } } }
  });

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  const preference = new Preference(mercadopago);
  const response = await preference.create({
    body: {
      items: order.orderProducts.map((item) => ({
        id: item.productId,
        title: item.product.name,
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: item.price,
      })),
      metadata: { orderId: order.id },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?status=success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago-webhooks`,
      external_reference: order.id.toString(),
    },
  });

  return NextResponse.json({ preferenceId: response.id });
}
