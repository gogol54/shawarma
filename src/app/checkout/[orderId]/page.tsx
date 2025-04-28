// /checkout/[orderId]/page.tsx
// sem 'use client' aqui

import CheckoutPage from '@/components/CheckoutPage';
interface CheckoutProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ preferenceId: string }>;
}

export default async function Checkout({ params, searchParams }: CheckoutProps) {
  const { orderId } = await params;
  const { preferenceId } = await searchParams;

  if (!preferenceId) {
    return <div>Erro: preferenceId não encontrado!</div>;
  }

  return <CheckoutPage orderId={orderId} preferenceId={preferenceId} />;
}
