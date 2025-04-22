import { ConsumptionMethod, OrderStatus } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { jsPDF } from "jspdf";

import { formatCurrency } from "./format-currency";

type AddressData = {
  street: string;
  number: string;
  complement?: string;
  zone: string;
};

type OrdersListComponentProps = {
  orders: {
    id: number;
    code: string | null;
    total: number;
    status: OrderStatus;
    consumptionMethod: ConsumptionMethod;
    customerName: string;
    customerPhone: string;
    isPaid: boolean;
    address: JsonValue | null;
    paymentMethod: string | null;
    createdAt: string;
    orderProducts: {
      id: string;
      productId: string;
      quantity: number;
      price: number;
      dropIng: JsonValue | null;
      product: {
        name: string;
      };
    }[];
  }[];
};

type Order = OrdersListComponentProps["orders"][0];

const handleDownloadReceipt = (order: Order) => {
  function getFormattedAddress(address: unknown): string {
    try {
      const { street, number, complement, zone } = address as AddressData;
      return `${street}, ${number}${complement ? ', ' + complement : ''} - ${zone}`;
    } catch {
      return "Retirada no local";
    }
  }

  const wrapText = (text: string, maxLength: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
  
    words.forEach((word) => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
  
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const MAX_LINE_WIDTH = 32;

  const center = (text: string) => {
    const padding = Math.max(0, (MAX_LINE_WIDTH - text.length) / 2);
    return " ".repeat(Math.floor(padding)) + text;
  };

  const address = getFormattedAddress(order.address);

  const receiptLines = [
    "=".repeat(MAX_LINE_WIDTH),
    center("SHAWARMA ROSUL"),
    "=".repeat(MAX_LINE_WIDTH),

    center("CNPJ: 60.457.577/0001-59"),
    center("Rua Amaro Souto, 3023"),  
    center("Apto 210 - Centro"),
    center("Tel: (55) 99683-8707"),
    "=".repeat(MAX_LINE_WIDTH),
    center(`PEDIDO #${order.code}`),
    `Data/Hora: ${formatDate(order.createdAt)}`,
    `Cliente: ${order.customerName}`,
    `Contato: ${order.customerPhone}`,
    `Local: ${order.consumptionMethod === "entrega" ? wrapText(address, MAX_LINE_WIDTH) : "Retirada no local"}`,
    "-".repeat(MAX_LINE_WIDTH),
    `Itens do Pedido:`,

    ...order.orderProducts.flatMap((p) => {
      const name = p.product.name.length > 20
        ? p.product.name.substring(0, 20) + "..."
        : p.product.name;

      const priceStr = formatCurrency(p.price);
      const line = `${p.quantity}x ${name}`.padEnd(MAX_LINE_WIDTH - priceStr.length) + priceStr;

      const extras = Array.isArray(p.dropIng) && p.dropIng.length > 0
        ? [`* Sem: ${p.dropIng.join(", ")}`]
        : [];

      return [line, ...extras];
    }),

    "-".repeat(MAX_LINE_WIDTH),

    ...(order.consumptionMethod === "entrega"
      ? [`Entrega:`.padEnd(MAX_LINE_WIDTH - 8) + `R$ 8,00`]
      : []),

    `TOTAL:`.padEnd(MAX_LINE_WIDTH - formatCurrency(order.total).length) +
      formatCurrency(order.total),

    `Status:`.padEnd(MAX_LINE_WIDTH - (order.isPaid ? "PAGO".length : "A PAGAR".length)) +
      (order.isPaid ? "PAGO" : "A PAGAR"),

    "=".repeat(MAX_LINE_WIDTH),
    center("Obrigado pela preferência!"),
    center("Volte sempre!"),
    "=".repeat(MAX_LINE_WIDTH),
  ];

  const lineHeight = 3.5;
  const margin = 1;
  const totalHeight = receiptLines.length * lineHeight + 20;

  const doc = new jsPDF({
    unit: "mm",
    format: [57, totalHeight],
  });

  doc.setFont("Courier", "normal");
  doc.setFontSize(8);

  let y = 10;

  receiptLines.forEach((line) => {
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(`comprovante_pedido_${order.id}.pdf`);
};

export default handleDownloadReceipt;
