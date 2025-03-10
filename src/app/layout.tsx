import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";

import { Toaster } from "@/components/ui/sonner";

import { CartProvider } from "./[slug]/menu/contexts/cart";
const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shawarma Rosul",
  description: "Apenas Alimentação!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="beforeInteractive" />
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
      
    </html>
  );
}
