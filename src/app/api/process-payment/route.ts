// app/api/process-payment/route.ts
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Body recebido no servidor:', JSON.stringify(body, null, 2));
    const paymentMethod = body.formData.payment_method_id;
    console.log(paymentMethod)
    console.log(body)
    const isPix = paymentMethod === 'pix';

    const paymentPayload: any = {
      transaction_amount: body.formData.transaction_amount,
      payment_method_id: paymentMethod,
      description: `Pedido ${body.preferenceId}`,
      external_reference: body.external_reference,
      payer: {
        email: body.formData.payer.email,
        first_name: body.customerName,
        last_name: 'Bolonha',
        identification: {
          type:'CPF',
          number: body.customerCpf,
        },
      },
    };
  
    if (!isPix) {
      // Adiciona apenas para cartão
      paymentPayload.token = body.formData.token;
      paymentPayload.installments = body.formData.installments;
      paymentPayload.issuer_id = body.formData.issuer_id;
    }
   
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': uuidv4(),
      },
      body: JSON.stringify(paymentPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da API do MP:', data);
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
