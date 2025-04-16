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
      const { street, number, zone } = address as AddressData;
      return `${street}, ${number} - ${zone}`;
    } catch {
      return "Retirada no local";
    }
  }

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

  const address = getFormattedAddress(order.address);

  const receiptLines = [
    "===============================",
          "Shawarma Rosul",
    "===============================",
    "CNPJ: 00.000.000/0001-00",
    "Rua Amaro Souto, 3023, Apto 210 - Centro",
    "Tel: (55) 98118-0042",
    "===============================",
    `PEDIDO #${order.code}`,
    `Data/Hora: ${formatDate(order.createdAt)}`,
    `Nome: ${order.customerName}`,
    `Telefone: ${order.customerPhone}`,
    `Local: ${order.consumptionMethod === "entrega" ? "Entrega" : "Retirada no Shawarma"}`,
    `Endereço: ${address}`,
    "Itens do Pedido:",
    ...order.orderProducts.flatMap((p) => {
      const lines = [`${p.quantity}x ${p.product.name} (${formatCurrency(p.price)})`];
      if (Array.isArray(p.dropIng) && p.dropIng.length > 0) {
        lines.push(`  - Sem: ${p.dropIng.join(", ")}`);
      }
      return lines;
    }),
    `Total: ${formatCurrency(order.total)}`,
    `Status: ${order.isPaid ? "PAGO" : "A PAGAR"}`,
    `Pagamento: ${order.paymentMethod || "Não informado"}`,
    "",
    "===============================",
    " Obrigado pela preferência!",
    " Volte sempre! S2",
    "===============================",
  ];

  const lineHeight = 3;
  const margin = 3;
  const pageWidth = 57;
  const maxLineWidth = pageWidth - margin * 2;

  // Simular a altura total com quebras de linha e alinhamentos
  const simulateHeight = (): number => {
    let y = 0;
    const fakeDoc = new jsPDF({ unit: "mm" });
    fakeDoc.setFont("Courier", "normal");
    fakeDoc.setFontSize(8);

    receiptLines.forEach((line) => {
      const words = line.split(" ");
      let currentLine = "";

      words.forEach((word, i) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = fakeDoc.getTextWidth(testLine);

        if (testWidth > maxLineWidth) {
          y += lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }

        if (i === words.length - 1 && currentLine) {
          y += lineHeight;
        }
      });
    });

    return y + 16; // +10mm de margem superior
  };

  const finalHeight = simulateHeight();

  const doc = new jsPDF({
    unit: "mm",
    format: [57, finalHeight],
  });

  let y = 10;

  doc.setFont("Courier", "normal");
  doc.setFontSize(8);

  receiptLines.forEach((line) => {
    const isCentered =
      line.startsWith("=") ||
      line.includes("Shawarma") ||
      line.startsWith(" Obrigado") ||
      line.startsWith(" Volte") ||
      line.startsWith("CNPJ") ||
      line.startsWith("Tel");

    const words = line.split(" ");
    let currentLine = "";

    words.forEach((word, i) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);

      if (testWidth > maxLineWidth) {
        if (isCentered) {
          doc.text(currentLine, pageWidth / 2, y, { align: "center" });
        } else {
          doc.text(currentLine, margin, y);
        }
        y += lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }

      if (i === words.length - 1 && currentLine) {
        if (isCentered) {
          doc.text(currentLine, pageWidth / 2, y, { align: "center" });
        } else {
          doc.text(currentLine, margin, y);
        }
        y += lineHeight;
      }
    });
  });

  doc.save(`comprovante_pedido_${order.id}.pdf`);
};

export default handleDownloadReceipt;
