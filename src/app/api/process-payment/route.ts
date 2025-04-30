// app/api/process-payment/route.ts

import { NextResponse } from 'next/server';
import {v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Recebido na API:', body);

    const paymentPayload = {
      transaction_amount: body.formData.transaction_amount,
      token: body.formData.token,
      description: `Pedido ${body.preferenceId}`,
      installments: body.formData.installments,
      payment_method_id: body.formData.payment_method_id,
      issuer_id: body.formData.issuer_id,
      payer: {
        email: body.formData.payer.email,
        identification: {
          type: body.formData.payer.identification.type,
          number: body.formData.payer.identification.number,
        },
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': uuidv4(), // ✅ Header obrigatório
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
