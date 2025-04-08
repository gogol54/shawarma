// src/app/api/admin/route.ts
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
dotenv.config()
export async function POST(request: Request): Promise<NextResponse> {
  const { email, password } = await request.json();

  console.log("Email do env:", process.env.ADMIN_EMAIL);
  console.log("Hash do env:", process.env.ADMIN_PASSWORD_HASH);
  console.log("Email recebido:", email);
  console.log("Senha recebida:", password);

  // Apenas pra testar se a senha 'pipokadoce123' bate com o hash do .env
  const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);

  console.log("Senha confere?", isMatch);
  try{

  if (
    email !== process.env.ADMIN_EMAIL ||
    !isMatch
  ) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }
    // Cria o token e o link para acesso
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/painel?token=${token}`;

    // Configura o nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ajuste se necessário
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envia o email com o link de acesso
    await transporter.sendMail({
      from: `"Painel Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Seu link de acesso ao Painel Admin",
      html: `<p>Clique no link abaixo para acessar:</p>
             <a href="${link}">${link}</a>
             <br/><small>O link expira em 15 minutos.</small>`,
    });

    return NextResponse.json({ message: 'Email enviado' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}
