"use server";

import { db } from "@/lib/prisma";

export async function getTopLanchesStatsByMonth() {
  const orderProducts = await db.orderProduct.findMany({
    include: {
      product: { select: { id: true, name: true, price: true } },
      order: { select: { createdAt: true } }
    }
  });

  const totalByProduct: Record<string, { name: string; totalSold: number }> = {};

  for (const item of orderProducts) {
    const id = item.product.id;
    const name = item.product.name;

    if (!totalByProduct[id]) {
      totalByProduct[id] = { name, totalSold: 0 };
    }

    totalByProduct[id].totalSold += item.quantity;
  }

  const top5 = Object.entries(totalByProduct)
    .sort(([, a], [, b]) => b.totalSold - a.totalSold)
    .slice(0, 5)
    .map(([id]) => id);

  // Novo formato: array flat por mês + produto
  const result: {
    month: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }[] = [];

  for (const item of orderProducts) {
    const productId = item.product.id;
    if (!top5.includes(productId)) continue;

    const date = new Date(item.order.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`; // "2025-04"

    const name = item.product.name;
    const totalSold = item.quantity;
    const totalRevenue = Number(item.product.price) * totalSold;

    const existing = result.find(r => r.month === key && r.name === name);
    if (existing) {
      existing.totalSold += totalSold;
      existing.totalRevenue += totalRevenue;
    } else {
      result.push({ month: key, name, totalSold, totalRevenue });
    }
  }

  return result;
}
