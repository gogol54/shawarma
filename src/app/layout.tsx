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
  icons: {
    icon: '/public/other.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/facilitastorage.appspot.com/o/shawarma%2Ficon-none-resize.png?alt=media&token=4a604c9c-3d6e-4aab-b86d-384195f034e4" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="beforeInteractive" />
          <CartProvider>
            {/* <div className="max-w-screen-lg mx-auto"> */}
              {children}
            {/* </div> */}
          </CartProvider>
        <Toaster />

      </body>
      
    </html>
  );
}
