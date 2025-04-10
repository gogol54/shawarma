// app/admin/dashboard/page.tsx
import { notFound } from "next/navigation"

import { Card, CardContent,CardHeader } from "@/components/ui/card"

import { getTopLanchesStatsByMonth } from '../actions/stats'
import TopLanchesChart from '../components/dashboard/top-stats-chart'
import Topbar from '../components/topbar'

const DashboardPage = async () => {
  try {
    const stats = await getTopLanchesStatsByMonth()
    if (!stats) return notFound()

    return (
      <div className="p-6 space-y-6 w-full">
        <Topbar />
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Gráfico de Lanches Mais Vendidos</h2>
          </CardHeader>
          <CardContent>
          <TopLanchesChart data={stats} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (e) {
    console.error("Erro ao carregar estatísticas:", e)
    return notFound()
  }
}

export default DashboardPage