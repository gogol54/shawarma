"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { formatCurrency } from "@/app/helpers/format-currency";

import { 
  createExpense, 
  deleteExpense, 
  updateExpenseData 
} from "../actions/expense-actions";

type SummaryItem = {
  month: string; // "2025-07"
  revenue: number;
  formattedRevenue: string;
};

type ExpenseByMonth = {
  month: string;
  total: number;
};

type ExpenseItem = {
  id: string;
  description: string;
  amount: number;
  reference: string; // precisa estar aqui para filtrar no frontend
  createdAt: Date;
}

type FinanceStatsProps = {
  summaryByMonth: SummaryItem[];
  expensesByMonth: ExpenseByMonth[];
  expenseValues: ExpenseItem[];
  totalSales: { month: string; totalSales: number }[]; // ⬅️ novo
};
// Função utilitária para calcular % de variação
function calcPercentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// Formatar mês para exibição, ex: "2025-07" => "jul/25"
function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-");
  const monthNames = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  const formattedMonth = monthNames[parseInt(monthNumber, 10) - 1];
  return `${formattedMonth}/${year.slice(2)}`;
}

// Gera o campo reference "YYYY-MM" a partir da string date "YYYY-MM-DD"
function getReferenceFromDate(dateString: string): string {
  return dateString?.slice(0, 7) || "";
}

export default function FinanceStats({ 
  summaryByMonth, 
  expensesByMonth, 
  expenseValues,
  totalSales }: FinanceStatsProps) {
  const recentMonths = summaryByMonth.slice(0, 4);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const variations = recentMonths
    .map((item, idx) => {
      if (idx === recentMonths.length - 1) return null;
      const current = recentMonths[idx].revenue;
      const previous = recentMonths[idx + 1].revenue;
      const change = calcPercentChange(current, previous);
      return {
        monthCurrent: recentMonths[idx].month,
        monthPrevious: recentMonths[idx + 1].month,
        change,
      };
    })
    .filter(Boolean) as {
    monthCurrent: string;
    monthPrevious: string;
    change: number | null;
  }[];

  // Formulário
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");

  const merged = summaryByMonth.map((summary) => {
    const expense = expensesByMonth.find((e) => e.month === summary.month);
    const expenseTotal = expense?.total || 0;
    const lucro = summary.revenue - expenseTotal;

    const sales = totalSales.find((s) => s.month === summary.month);
    const totalSals = sales?.totalSales || 0;

    return {
      month: summary.month,
      formattedMonth: formatMonth(summary.month),
      revenue: summary.revenue,
      formattedRevenue: summary.formattedRevenue,
      expense: expenseTotal,
      formattedExpense: formatCurrency(expenseTotal),
      lucro,
      formattedLucro: formatCurrency(lucro),
      totalSals
    };
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const reference = getReferenceFromDate(date);
    if (!reference) {
      toast.error("Data inválida");
      return;
    }

    const res = await createExpense({
      description,
      amount: Number(amount),
      reference,
    });

    if (res?.success) {
      toast.success("Gasto registrado com sucesso!");
    } else {
      toast.error(res?.error || "Erro ao salvar gasto");
    }

    // Resetar form
    setDescription("");
    setAmount("");
    setType("");
    setDate("");
    setModalOpen(false);
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto ">

      {/* Variações de receita */}
      <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-md rounded-b-2xl justify-center px-10 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Finanças 🤑💼 </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {variations.map(({ monthCurrent, monthPrevious, change }) => {
          const isPositive = change !== null && change > 0;
          const isNegative = change !== null && change < 0;
          return (
            <div
              key={`${monthCurrent}-${monthPrevious}`}
              className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-[#FDECC9] to-[#ffffff] opacity-90 flex flex-col items-center justify-center"
            >
              <p className="text-lg font-light mb-2">
                De <strong>{formatMonth(monthPrevious)}</strong> para{" "}
                <strong>{formatMonth(monthCurrent)}</strong>
              </p>
              {change === null ? (
                <p className="text-gray-500">Sem dados suficientes</p>
              ) : (
                <p
                  className={`text-4xl font-semibold ${
                    isPositive
                      ? "text-green-600"
                      : isNegative
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)}%
                </p>
              )}
            </div>
          );
        })}
        </div>
       
      </div>
      {selectedMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setSelectedMonth(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              Fechar
            </button>

            <h3 className="text-xl font-bold mb-4">
              Gastos de {formatMonth(selectedMonth)}
            </h3>

            <ul className="space-y-2">
              {expenseValues
                .filter((item) => item.reference === selectedMonth) // filtra pelo mês
                .map((item, index) => (
                 <li key={item.id} className="flex gap-2 items-center">
                  <span className="w-[30px] font-bold">{index + 1}</span>
                  <span className="w-[200px] truncate">{item.description}</span>
                  <span className="w-[120px]">{item.createdAt.toLocaleDateString()}</span>
                  <span className="w-[100px] text-red-600">{formatCurrency(item.amount)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingExpense(item)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        const confirm = window.confirm("Deseja remover esse gasto?");
                        if (!confirm) return;
                        const res = await deleteExpense(item.id);
                        if (res.success) {
                          toast.success("Gasto removido com sucesso");
                        } else {
                          toast.error(res.error || "Erro ao remover");
                        }
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
              {expenseValues.filter((item) => item.reference === selectedMonth).length === 0 && (
                <p className="text-gray-500">Sem dados</p>
              )}
            </ul>
          </div>
        </div>
      )}
      {/* Ganhos Mensais */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Faturamento Mensal 💰</h2>
        <div className="border rounded-md overflow-hidden">
          {/* Cabeçalho */}
          <div className="hidden md:grid grid-cols-6 font-semibold bg-gray-100 p-3 text-center">
            <span>Mês</span>
            <span>Ganhos</span>
            <span>Gastos</span>
            <span>Lucro</span>
            <span>Qtd. Vendas</span>
            <span>Lista de Compras</span>
          </div>

          {/* Linhas de dados */}
          {merged.map((item) => (
            <div
              key={item.month}
              className="border-t p-3 text-lg items-center flex flex-col md:grid md:grid-cols-6 gap-2 md:gap-0 text-center"
            >
              <div className="w-full md:w-auto">{item.formattedMonth}</div>
              <div className="w-full md:w-auto whitespace-nowrap">{item.formattedRevenue}</div>
              <div className="w-full md:w-auto text-red-600 whitespace-nowrap">{item.formattedExpense}</div>
              <div
                className={`w-full md:w-auto whitespace-nowrap ${
                  item.lucro >= 0 ? "text-green-600" : "text-red-700"
                }`}
              >
                {item.formattedLucro}
              </div>
              <div className="w-full md:w-auto">{item.totalSals}</div>
              <div className="w-full md:w-auto flex justify-center">
                <button
                  onClick={() => setSelectedMonth(item.month)}
                  className="text-blue-600 hover:underline flex items-center justify-center gap-1"
                  title="Ver lista de compras"
                >
                  🧾 Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Botão para abrir modal */}
      <div className="mt-8">
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Adicionar Gastos
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              Fechar
            </button>

            <h3 className="text-xl font-bold mb-4">Adicionar Gastos</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2"
                required
              />

              <input
                type="number"
                placeholder="Valor (R$)"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="border border-gray-300 rounded px-4 py-2"
                required
                min={0}
                step="0.01"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2"
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="FOOD">Alimento</option>
                <option value="EQUIPMENT">Equipamento</option>
                <option value="OTHER">Outro</option>
              </select>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2"
                required
              />

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Salvar gasto
              </button>
            </form>
          </div>
        </div>
      )}
      {editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setEditingExpense(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              Fechar
            </button>

            <h3 className="text-xl font-bold mb-4">Editar Gasto</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                const newDescription = (e.currentTarget.elements.namedItem("description") as HTMLInputElement)?.value;
                const newAmount = parseFloat((e.currentTarget.elements.namedItem("amount") as HTMLInputElement)?.value);

                const payload: { description?: string; amount?: number } = {};
                if (newDescription !== editingExpense.description) payload.description = newDescription;
                if (!isNaN(newAmount) && newAmount !== editingExpense.amount) payload.amount = newAmount;

                if (Object.keys(payload).length === 0) {
                  toast.info("Nada foi alterado.");
                  return;
                }

                const res = await updateExpenseData(editingExpense.id, payload);
                if (res.success) {
                  toast.success("Gasto atualizado com sucesso!");
                  setEditingExpense(null);
                } else {
                  toast.error(res.error || "Erro ao atualizar gasto");
                }
              }}
              className="flex flex-col gap-4"
            >
              <input
                name="description"
                type="text"
                defaultValue={editingExpense.description}
                className="border border-gray-300 rounded px-4 py-2"
              />

              <input
                name="amount"
                type="number"
                step="0.01"
                defaultValue={editingExpense.amount}
                className="border border-gray-300 rounded px-4 py-2"
              />

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Salvar alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

