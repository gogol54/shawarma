"use client";

import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const phone = searchParams.get("phone");

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
      description: "Seu pagamento está sendo processado. Você será notificado em breve.",
      color: "text-yellow-600",
    },
  };

  const statusMessage = messages[status as keyof typeof messages];

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      {statusMessage ? (
        <>
          <h1 className={`text-2xl font-bold ${statusMessage.color}`}>{statusMessage.title}</h1>
          <p>{statusMessage.description}</p>
        </>
      ) : (
        <h1 className="text-2xl font-bold text-gray-600">Status desconhecido 😕</h1>
      )}
      <button 
        onClick={
          () => window.location.href = `/rosul/orders?phone=${phone}`
        } 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Voltar para a loja
      </button>
    </div>
  );
}
