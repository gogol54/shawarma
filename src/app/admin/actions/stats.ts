"use server";

import { db } from "@/lib/prisma";

export async function getTopLanchesStatsByMonth() {
  const orderProducts = await db.orderProduct.findMany({
    include: {
      product: { select: { id: true, name: true, price: true } },
      order: { select: { createdAt: true } }
    }
  });

  const result: {
    month: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }[] = [];

  for (const item of orderProducts) {
    const date = new Date(item.order.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

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

  // Resumo mensal
  const monthlySummary: Record<string, number> = {};

  for (const item of result) {
    if (!monthlySummary[item.month]) {
      monthlySummary[item.month] = 0;
    }
    monthlySummary[item.month] += item.totalRevenue;
  }

  // Resumo formatado
  const monthlySummaryFormatted = Object.entries(monthlySummary).map(([month, revenue]) => {
    return {
      month,
      revenue,
      formattedRevenue: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(revenue)
    };
  })
  .sort((a, b) => b.month.localeCompare(a.month));

  const totalSalesByMonth: { month: string; totalSales: number }[] = [];

  for (const item of result) {
    const existing = totalSalesByMonth.find(r => r.month === item.month);
    if (existing) {
      existing.totalSales += item.totalSold;
    } else {
      totalSalesByMonth.push({ month: item.month, totalSales: item.totalSold });
    }
  }

  const sortedStatsByProductAndMonth = result.sort((a, b) => {
    // Primeiro: ordenar por mês (descendente)
    if (a.month !== b.month) {
      return b.month.localeCompare(a.month);
    }

    // Segundo: ordenar por totalSold dentro do mesmo mês (descendente)
    return b.totalSold - a.totalSold;
  });
  
  return {
    statsByProductAndMonth: sortedStatsByProductAndMonth,
    summaryByMonth: monthlySummaryFormatted,
    totalSalesByMonth
  };
}
