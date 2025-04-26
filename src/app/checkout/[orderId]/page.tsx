import { Suspense } from 'react';
import CheckoutPage from '@/components/CheckoutPage';

export default async function CheckoutWrapper({ params }: { params: { orderId: string } }) {
  const { orderId } = params; // Desestruturado, mas pode ser await se vier de `generateStaticParams`

  console.log('chegou no checkoutWrapper', orderId);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CheckoutPage orderId={orderId} />
    </Suspense>
  );
}