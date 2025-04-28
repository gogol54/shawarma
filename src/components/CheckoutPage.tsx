'use client';

import { useRouter } from 'next/navigation';  // Para redirecionamento
import { useEffect, useState } from 'react';

interface FormData {
  [key: string]: string | number | boolean;
}

interface PaymentMethod {
  [key: string]: string | number | boolean;
}

interface OnSubmitArgs {
  selectedPaymentMethod: PaymentMethod;
  formData: FormData;
}

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options: { locale: string }) => {
      bricks: () => {
        create: (
          type: string,
          containerId: string,
          config: {
            initialization: { amount: number; preferenceId: string };
            customization: { paymentMethods: Record<string, string> };
            callbacks: {
              onReady: () => void;
              onSubmit: (args: OnSubmitArgs) => void;
              onError: (error: Error) => void;
            };
          }
        ) => void;
      };
    };
  }
}

export default function CheckoutPage({ orderId, preferenceId }: { orderId: string, preferenceId: string }) {
  const [amount, setAmount] = useState<number | null>(null);
  const router = useRouter();  // Para redirecionamento de página
  console.log(router)

  console.log('chegou no checkoutPage', orderId);

  useEffect(() => {
    if (!orderId) return;

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
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!, {
        locale: 'pt-BR',
      });

      mp.bricks().create('payment', 'brick_container', {
        initialization: {
          amount,
          preferenceId,
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
          onSubmit: async ({ selectedPaymentMethod, formData }: OnSubmitArgs) => {
            try {
              const res = await fetch('/api/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  selectedPaymentMethod,
                  formData,
                  preferenceId,
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

              // Redirecionamento com base no status do pagamento
              if (data?.status === 'approved') {
                alert      ('approved') // Redireciona para a página de sucesso
              } else if (data?.status === 'rejected') {
                alert('rejected') // Redireciona para a página de falha
              } else {
                alert('failure') // Redireciona para a página de pendente
              }

            } catch (err) {
              console.error('Erro ao processar pagamento:', err);
              alert('Erro ao processar pagamento');
            }
          },
          onError: (error: Error) => {
            console.error('Erro no Brick:', error);
          },
        },
      });
    };

    document.body.appendChild(script);
  }, [amount, orderId, preferenceId]);

  if (amount === null) return <div>Carregando pagamento...</div>;

  return <div id="brick_container" className="min-h-[500px]" />;
}
