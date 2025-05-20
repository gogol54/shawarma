import axios from 'axios';
import { type ClassValue,clsx } from "clsx"
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { twMerge } from "tailwind-merge"

dotenv.config();
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', 
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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