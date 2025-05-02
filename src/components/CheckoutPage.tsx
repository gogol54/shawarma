'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

interface CheckoutPageProps {
  order: {
    id: number;
    preferenceId: string;
    total: number;
    customerName: string;
    customerCpf: string;
    customerPhone: string;
    // você pode adicionar mais campos se quiser usar depois
  };
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
            initialization: {
              amount: number;
              preferenceId: string;
              external_reference: string,
            };
            customization: {
              paymentMethods: Record<string, string>;
              enableReviewStep?: boolean;
              reviewCardsOrder?: string[];
            };
            callbacks: {
              onReady: () => void;
              onSubmit: (args: OnSubmitArgs) => void;
              onError: (error: Error) => void;
              onClickEditShippingData?: () => void;
              onClickEditBillingData?: () => void;
              onRenderNextStep?: (currentStep: string) => void;
              onRenderPreviousStep?: (currentStep: string) => void;
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
  amount
}: {
  orderId: string;
  preferenceId: string;
  amount: number
}) {  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const securityScript = document.createElement('script');
    securityScript.src = 'https://www.mercadopago.com/v2/security.js';
    securityScript.setAttribute('view', 'checkout');
    document.body.appendChild(securityScript);

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;

    script.onload = async () => {
      try {
        // Busca o preferenceId da API
        const mp = new window.MercadoPago(
          process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!,
          { locale: 'pt-BR' }
        );
      
        mp.bricks().create('payment', 'brick_container', {
          initialization: {
            preferenceId,
            amount,
            external_reference: orderId
          },
          customization: {
            paymentMethods: {
              ticket: 'all',
              bankTransfer: 'all',
              creditCard: 'all',
            },
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
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
                    external_reference: orderId,
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

      } catch (err) {
        console.error('Erro ao carregar Brick ou preferenceId:', err);
      }
    };
    document.body.appendChild(script);

    return () => {
      const scripts = document.querySelectorAll('script[src="https://sdk.mercadopago.com/js/v2"]');
      scripts.forEach((tag) => tag.remove());
    };
  }, [orderId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div id="brick_container" className="min-h-[500px]" />
      {isLoading ? "Carregando pagamento..." : null}
    </div>
  );
}
