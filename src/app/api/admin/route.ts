// src/app/api/admin/route.ts
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

dotenv.config();

// Transpiler compartilha o transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request): Promise<NextResponse> {
  const { email, password } = await request.json();
  const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);

  try {
    if (email !== process.env.EMAIL_USER || !isMatch) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '2d' });
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/painel/${token}`;

    await transporter.sendMail({
      from: `"Painel Admin" <${process.env.EMAIL_USER}>`,
      to: [email, process.env.ADMIN_MAIL, process.env.DEV_MAIL],
      subject: 'Seu link de acesso ao Painel Admin',
      html: `<p>Clique no link abaixo para acessar:</p>
             <a href="${link}">${link}</a>
             <br/><small>O link expira em 15 minutos.</small>`,
    });

    return NextResponse.json({ message: 'Email enviado' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }
}

// 👉 Função auxiliar para enviar email com status do pedido
export async function sendOrderUpdateEmail(orderId: number, paymentMethod: string) {
  const subject = `📦 Pedido ${orderId} foi PAGO`;
  const message = `📦 Pedido ${orderId} atualizado para EM PREPARO e método ${paymentMethod}`;

  try {
    await transporter.sendMail({
      from: `"Sistema de Pedidos" <${process.env.EMAIL_USER}>`,
      to: [process.env.ADMIN_MAIL!, process.env.DEV_MAIL!],
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });
    console.log(`📨 Email enviado sobre o pedido ${orderId}`);
  } catch (error) {
    console.error(`Erro ao enviar email do pedido ${orderId}:`, error);
  }
}
