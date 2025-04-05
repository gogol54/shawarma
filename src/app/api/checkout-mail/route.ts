import nodemailer from 'nodemailer';

interface OrderProduct {
  productId: string;
  quantity: number;
  dropIng?: string[];
  price: number;
  name?: string; // Adiciona isso se quiser mostrar o nome no email
  control?: boolean;
  consumptionMethod: string,
}

export async function POST(req: Request) {
  const { name, orderId, total, products, control, consumptionMethod } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 🧾 Monta HTML com os produtos
  const productListHTML = products.map((item: OrderProduct) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}x</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.name ?? 'Produto'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.dropIng?.length ? item.dropIng.join(', ') : 'Completo'}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1>📦 Novo pedido!</h1>
      <p><strong>Cliente:</strong> ${name}</p>
      <p><strong>ID do Pedido:</strong> #${orderId}</p>

      <h2>Resumo:</h2>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd;">Qtd</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Produto</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Remover</th>
          </tr>
        </thead>
        <tbody>
          ${productListHTML}
        </tbody>
      </table>

      <p style="margin-top: 20px;"><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
      <p style="margin-top: 10px;"> Metodo de entrega: ${consumptionMethod === 'dine_in' ? ' retirada no local' : ' entrega/delivery.'} </p>
      <p style="margin-top: 10px;"> Método de Pagamento ${control === true ? ' na retirada.' : ' via mercado pago.'} </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Shawarma" <${process.env.EMAIL_USER}>`,
    to: 'jardelduarte594@gmail.com',
    subject: `Confirmação de Pedido #${orderId}`,
    html,
  });

  return new Response('E-mail enviado com sucesso!', { status: 200 });
}
