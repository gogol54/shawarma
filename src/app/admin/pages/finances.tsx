// pages/finances.tsx
import { getAllExpenses, getExpensesGroupedByMonth } from "../actions/expense-actions";
import { getTopLanchesStatsByMonth } from "../actions/stats";
import FinanceStats from "../components/finance-stats";

export default async function FinancesPage() {
  const stats = await getTopLanchesStatsByMonth();
  const expenses = await getExpensesGroupedByMonth();
  const list = await getAllExpenses();

  if (!stats || !expenses) {
    return <div>Erro ao carregar dados financeiros.</div>;
  }

  return (
    <FinanceStats
      totalSales={stats.totalSalesByMonth}
      summaryByMonth={stats.summaryByMonth}
      expensesByMonth={expenses}
      expenseValues={list}
    />
  );
}
