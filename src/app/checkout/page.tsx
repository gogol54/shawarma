"use client";

import { useRouter,useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get("phone");
  const status = searchParams.get("status") || "unknown";
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
    // Caso seja pending, pode aguardar ou fazer polling se quiser
    if (status === "pending") {
      setIsLoading(true);
      return;
    }

    // Redireciona para home após 5 segundos
    const timer = setTimeout(() => {
      router.push(`/rosul/orders?phone=${phone}`)
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, router]);

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

          {status !== "pending" && (
            <p className="mt-4 text-sm text-gray-500">Redirecionando para o shawarma...</p>
          )}
        </>
      )}
      <button
        onClick={() => router.push(`/rosul/orders?phone=${phone}`)}
        className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded"
      >
        Voltar para o shawarma
      </button>
    </div>
  );
}
