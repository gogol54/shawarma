
import CheckoutPage from '@/components/CheckoutPage';
import { db } from '@/lib/prisma';

interface CheckoutProps {
  params: { orderId: string };
}

export default async function Checkout({ params }: CheckoutProps) {
  const orderId = params.orderId;
  const order = await db.order.findUnique({ 
    where: { 
      id: parseInt(orderId, 10) 
    } 
  });

  if (!order || !order.preferenceId || order.total == null) {
    return <div>Pedido não encontrado ou incompleto.</div>;
  }

  return (
    <CheckoutPage
      orderId={order.id.toString()}
      preferenceId={order.preferenceId}
      amount={order.total}
    />
  );
}
