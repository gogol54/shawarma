"use client";

import { useRouter,useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TrackPaymentButton } from "../[slug]/orders/components/back-btn";

export default function CheckoutRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get("phone");
  const code = searchParams.get("code");
  const status = (searchParams.get("status") || "unknown").toLowerCase();
  const [statusResponse, setStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(false);
  console.log(code)
  const messages = {
    success: {
      title: "Pagamento Aprovado! 🎉",
      description: "Seu pedido foi confirmado. Logo entraremos em contato.",
      color: "text-green-600",
    },
    failure: {
      title: "Pagamento Falhou 😢",
      description: "Ocorreu um erro no pagamento. Tente novamente.",
      color: "text-red-600",
    },
    pending: {
      title: "Pagamento Pendente ⏳",
      description: (
        <>
          Seu pagamento está sendo processado. Verificando automaticamente...<br />
          Após efetuar o pagamento, envie o comprovante no WhatsApp Shawarma Rosul!
        </>
      ),
      color: "text-yellow-600",
    },
    unknown: {
      title: "Status desconhecido 😕",
      description: "Não conseguimos identificar o status do seu pagamento.",
      color: "text-gray-600",
    },
  };

  useEffect(() => {
    if (!code) return;
    setIsLoading(true)
    if (statusResponse === "pending" || statusResponse === "PENDING") {
      setIsLoading(true); // Liga logo o spinner

      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/order-status-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();
          if (data.status && data.status.toLowerCase() === "approved") {
            setStatus("success");
            clearInterval(interval);
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Erro ao consultar status do pedido:", err);
        }
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setIsLoading(false); // Garante spinner desligado pra outros status

      const timeout = setTimeout(() => {
        router.push(`/rosul/orders?phone=${phone}`);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [statusResponse, code, router, phone]);

  const statusMessage = messages[statusResponse as keyof typeof messages];

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      {statusMessage && (
        <>
          <h1 className={`text-2xl font-bold ${statusMessage.color}`}>
            {statusMessage.title}
          </h1>
          <p className="mt-2 text-gray-700">{statusMessage.description}</p>

          {status === "pending" && isLoading && (
            <div className="mt-4 animate-spin h-6 w-6 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          )}

          {(statusResponse !== "pending") && (
            <p className="mt-4 text-sm text-gray-500">Redirecionando para o shawarma...</p>
          )}
        </>
      )}
      {
        statusResponse === "pending" 
          ? <TrackPaymentButton orderId={code} />
          :
            <button
              onClick={() => router.push(`/rosul/orders?phone=${phone}`)}
              className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded"
            >
              Voltar para o shawarma
            </button>
      }
    </div>
  );
}
