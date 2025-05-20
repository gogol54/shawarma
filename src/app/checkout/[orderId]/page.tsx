
import CheckoutPage from '@/components/CheckoutPage';
import { db } from '@/lib/prisma';
interface CheckoutProps {
  params: Promise<{ orderId: string }>;
}

export default async function Checkout({ params }: CheckoutProps) {
  const { orderId } = await params;
  const order = await db.order.findUnique(
    { 
      where: { 
        id: parseInt(orderId, 10) 
      } 
    });

    if (!order || !order.preferenceId || order.total == null || !order.customerPhone || !order.customerCpf || !order.customerName) {
      // Você pode mostrar um loading, redirecionar ou lançar erro
      return <div>Pedido não encontrado ou incompleto.</div>;
    }
  return( 
  <CheckoutPage 
    orderId={order?.id.toString()} 
    preferenceId={order?.preferenceId} 
    amount={order?.total} 
    phone={order?.customerPhone}
    customerName={order?.customerName}
    customerCpf={order?.customerCpf}
  />);
}
