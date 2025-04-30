// /checkout/[orderId]/page.tsx
// sem 'use client' aqui

import CheckoutPage from '@/components/CheckoutPage';
import { db } from '@/lib/prisma';
interface CheckoutProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ preferenceId: string }>;
}

export default async function Checkout({ params, searchParams }: CheckoutProps) {
  const { orderId } = await params;
  const { preferenceId } = await searchParams;
  const orderIdInt = parseInt(orderId, 10);

  if (isNaN(orderIdInt)) {
    return <div>Erro: ID de pedido inválido!</div>;
  }

  const order = await db.order.findUnique({
    where: { id: orderIdInt },
  });

  if (!preferenceId) {
    return <div>Erro: preferenceId não encontrado!</div>;
  }

  return <CheckoutPage orderId={orderId} preferenceId={preferenceId} amount={order.total} />;
}
