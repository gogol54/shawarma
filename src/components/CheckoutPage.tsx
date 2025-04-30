'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
    MercadoPago: new (
      publicKey: string,
      options: { locale: string }
    ) => {
      bricks: () => {
        create: (
          type: string,
          containerId: string,
          config: {
            initialization: {amount:number, preferenceId: string };
            metadata?: Record<string, any>;
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

export default function CheckoutPage({
  orderId,
  preferenceId,
  amount,
}: {
  orderId: string;
  preferenceId: string;
  amount: number;
}) {
  const router = useRouter()
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;

    script.onload = () => {
      // Inicializa o MercadoPago SDK com a chave pública
      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!,
        { locale: 'pt-BR' }
      );

      // Cria o brick de pagamento
      mp.bricks().create('payment', 'brick_container', {
        initialization: {
          preferenceId, // ID da preferência do pagamento
          amount,        // Valor total da ordem (obrigatório)
        },
        metadata: {
          orderId: orderId.toString(), // 
        },
        customization: {
          paymentMethods: {
            ticket: 'all',        // Opções de pagamento
            bankTransfer: 'all',  // Opções de pagamento
            creditCard: 'all',    // Opções de pagamento
          },
        },
        callbacks: {
          onReady: () => {
            console.log('Brick iniciado');
          },
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
              if (data.data.status === 'approved') {
                toast.success('Pagamento aprovado com sucesso!');
                router.push('/checkout?status=success');
              } else if (data.data.status === 'rejected') {
                toast.error('Pagamento rejeitado, tente novamente!');
                router.push('/checkout?status=failure');
              } else {
                toast.warning('Pagamento pendente ou falhou, tente novamente!');
                router.push('/checkout?status=unknown');
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

    // Adiciona o script do Mercado Pago no DOM
    document.body.appendChild(script);

    // Limpeza do efeito quando o componente for desmontado
    return () => {
      const scriptTags = document.querySelectorAll('script[src="https://sdk.mercadopago.com/js/v2"]');
      scriptTags.forEach((tag) => tag.remove());
    };
  }, [orderId, preferenceId, amount]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div id="brick_container" className="min-h-[500px]" />
    </div>
  );
}