useEffect(() => {
  if (typeof window !== "undefined") {
    const mp = new window.MercadoPago("TEST-1459282990230699-022417-ee5014d4c8340d3ff0f25e603cdf5d2b-68188517", {
      locale: "pt-BR",
    });
  }
}, []);

const handlePagamento = async () => {
  try {
    // Fazendo a requisição para criar a preferência de pagamento
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer TEST-1459282990230699-022417-ee5014d4c8340d3ff0f25e603cdf5d2b-68188517`,  // Lembre-se de usar a PUBLIC_KEY aqui!
      },
      body: JSON.stringify({
        items: products.map((product) => ({
          title: product.name,
          quantity: product.quantity,
          unit_price: product.price,
          currency_id: "BRL",
        })),
        back_urls: {
          success: "https://seusite.com/sucesso",
          failure: "https://seusite.com/erro",
          pending: "https://seusite.com/pendente",
        },
        auto_return: "approved",
      }),
    });

    const data = await res.json();

    // Redirecionando para a URL do Mercado Pago
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      console.error("Erro ao gerar pagamento:", data);
    }
  } catch (error) {
    console.error("Erro ao processar pagamento", error);
  }
};