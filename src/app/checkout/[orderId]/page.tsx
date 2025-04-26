import { Suspense } from 'react';

import CheckoutPage from '@/components/CheckoutPage';

interface CheckoutWrapperProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutWrapper({ params }: CheckoutWrapperProps) {
  const { orderId } = await params;  // Desestruturado, mas pode ser await se vier de `generateStaticParams`
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CheckoutPage orderId={orderId} />
    </Suspense>
  );
}