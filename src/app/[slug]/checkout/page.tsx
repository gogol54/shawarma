"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const phone = searchParams.get("phone");

  const [status, setStatus] = useState(initialStatus || "unknown");
  const [isLoading, setIsLoading] = useState(false);

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
      description: "Seu pagamento está sendo processado. Verificando automaticamente...",
      color: "text-yellow-600",
    },
    unknown: {
      title: "Status desconhecido 😕",
      description: "Não conseguimos identificar o status do seu pagamento.",
      color: "text-gray-600",
    },
  };

  useEffect(() => {
    if (initialStatus !== "pending") return;

    let attempts = 0;
    const maxAttempts = 3;

    setIsLoading(true);

    const checkPayment = async () => {
      const res = await fetch(`/api/check-payment?phone=${phone}`);
      const data = await res.json();

      if (data.status === "approved") {
        setStatus("success");
        setIsLoading(false);
      } else if (data.status === "rejected") {
        setStatus("failure");
        setIsLoading(false);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 3000);
        } else {
          setIsLoading(false);
          setStatus("pending");
        }
      }
    };

    checkPayment();
  }, [initialStatus, phone]);

  const statusMessage = messages[status as keyof typeof messages];

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
        </>
      )}
      <button
        onClick={() =>
          window.location.href = `/rosul`
        }
        className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded"
      >
        Voltar para o shawarma
      </button>
    </div>
  );
}
