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
  amount,
  phone,
  customerCpf,
  customerName
}: {
  orderId: string;
  preferenceId: string;
  amount: number;
  phone: string;
  customerName: string;
  customerCpf: string;
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
              bank_transfer: 'all', // habilita Pix
              debit_card: 'all',
              credit_card: 'all'
            },
          },
          callbacks: {
            onReady: () => {
              setIsLoading(false);
            },
            onSubmit: async ({ selectedPaymentMethod, formData }: OnSubmitArgs) => {
              console.log('Payload enviado:', {
                selectedPaymentMethod,
                formData,
                preferenceId,
                external_reference: orderId,
                customerName,
                customerCpf,
              });
              try {
                const res = await fetch('/api/process-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    selectedPaymentMethod,
                    formData,
                    preferenceId,
                    external_reference: orderId,
                    customerName,
                    customerCpf
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
                  router.push(`/checkout?status=success&phone=${phone}`);
                } else if (data.data.status === 'rejected') {
                  toast.error('Pagamento rejeitado, tente novamente!');
                  router.push(`/checkout?status=failure&phone=${phone}`);
                } else if(data.data.status === 'pending'){
                  toast.warning('Pagamento pendente...Verifique seu Email!');
                  router.push(`/checkout?status=pending&phone=${phone}`);
                }
                else{
                  toast.warning('Pagamento pendente ou falhou...Entre em contato conosco!');
                  router.push(`/checkout?status=unknown&phone=${phone}`);
                }
              } catch (err) {
                console.error('Erro ao processar pagamento:', err);
                router.push(`/checkout?status=unknown&phone=${phone}`);
              }
            },
            onError: (error: Error) => {
              console.error('Erro no Brick:', error);
            },
          },
        });

      } catch (err) {
        console.error('Erro ao carregar Brick ou preferenceId:', err);
        router.push(`/checkout?status=unknown&phone=${phone}`);
      }
    };
    document.body.appendChild(script);

    return () => {
      const scripts = document.querySelectorAll('script[src="https://sdk.mercadopago.com/js/v2"]');
      scripts.forEach((tag) => tag.remove());
    };
  }, [orderId, preferenceId, amount, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div id="brick_container" className="min-h-[500px]" />
      {isLoading ? "Carregando pagamento..." : null}
    </div>
  );
}
