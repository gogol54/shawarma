'use client';

import { useEffect, useState } from 'react';

export default function CheckoutPage({ orderId }: { orderId: string }) {
  const [amount, setAmount] = useState<number | null>(null);
  console.log('chegou no checkoutPage', orderId)
  useEffect(() => {
    if (!orderId) return; // <-- adicione isso
  
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/brick-preference?orderId=${orderId}`);
        const data = await res.json();
        setAmount(data.amount);
      } catch (error) {
        console.error('Erro ao buscar dados da ordem:', error);
      }
    };
  
    fetchData();
  }, [orderId]);

  useEffect(() => {
    if (amount === null) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;

    script.onload = () => {
      const mp = new (window as any).MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
        locale: 'pt-BR',
      });

      mp.bricks().create('payment', 'brick_container', {
        initialization: {
          amount,
          preferenceId: orderId,
        },
        customization: {
          paymentMethods: {
            ticket: 'all',
            bankTransfer: 'all',
            creditCard: 'all',
          },
        },
        callbacks: {
          onReady: () => console.log('Brick pronto'),
          onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
            try {
              const res = await fetch('/api/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  selectedPaymentMethod,
                  formData,
                  preferenceId: orderId,
                  amount,
                }),
              });
          
              const data = await res.json();
          
              if (!res.ok) {
                console.error('Erro no processamento:', data);
                alert(data?.error || 'Erro ao processar pagamento');
                return;
              }
          
              console.log('Pagamento processado:', data);
            } catch (err) {
              console.error('Erro ao processar pagamento:', err);
              alert('Erro ao processar pagamento');
            }
          },
          onError: (error: any) => {
            console.error('Erro no Brick:', error);
          },
        },
      });
    };

    document.body.appendChild(script);
  }, [amount, orderId]);

  if (amount === null) return <div>Carregando pagamento...</div>;

  return <div id="brick_container" className="min-h-[500px]" />;
}
