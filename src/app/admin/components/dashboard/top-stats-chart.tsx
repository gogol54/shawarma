"use client"

import { useEffect, useState } from "react";
import {
  Bar, BarChart, Legend,
ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

interface ChartData {
  month: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

interface ChartProps {
  data: ChartData[]
}

type GroupedChartData = {
  month: string;
  [productName: string]: number | string;
};

const TopLanchesChart = ({ data }: ChartProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Transforma [{month, name, totalSold}] em { month: "2025-04", "X-Burguer": 10, "X-Salada": 5, ... }
  const grouped = data.reduce<Record<string, GroupedChartData>>((acc, item) => {
    if (!acc[item.month]) {
      acc[item.month] = { month: item.month };
    }
    acc[item.month][item.name] = item.totalSold;
    return acc;
  }, {});

  const chartData = Object.values(grouped);

  const allNames = Array.from(new Set(data.map(d => d.name)));

  const colors = [
    "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="month"
          tickFormatter={(month) => {
            const [year, monthNumber] = month.split("-");
            const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
            return `${monthNames[parseInt(monthNumber, 10) - 1]}/${year.slice()}`;
          }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {allNames.map((name, index) => (
          <Bar key={name} dataKey={name} fill={colors[index % colors.length]} radius={[8, 8, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default TopLanchesChart;
