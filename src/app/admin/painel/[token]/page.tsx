// app/admin/painel/[token]/page.tsx

import { redirect } from 'next/navigation'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { verifyToken } from '../../actions/verify-token'
import { AppSidebar } from '../../components/sidebar-admin'
import DashboardPage from '../../pages/dashboard'
import OrdersList from '../../pages/orders-list'
import CreateProducts from '../../pages/products-create'
import ProductsList from '../../pages/products-list'
import ProductsUpdate from '../../pages/products-put'

type Props = {
  params: { token?: string | string[] }
  searchParams: { route?: string }
}

const getComponent = (route?: string) => {
  switch (route) {
    case 'pedidos':
      return <OrdersList />
    case 'produtos':
      return <ProductsList />
    case 'cadastrar': 
      return <CreateProducts />
    case 'alterar':
      return <ProductsUpdate />
    case 'dashboard':
      return <DashboardPage />
    default:
      return <DashboardPage />
  }
}
export default async function PanelPage({ params, searchParams }: Props) {
  const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token

  // redireciona se não tiver token
  if (!tokenParam) {
    redirect('/admin')
  }

  const result = await verifyToken(tokenParam)

  if (!result.valid) {
    redirect('/admin')
  }

  const Content = getComponent(searchParams.route)

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar token={tokenParam} />
        <SidebarTrigger />
        <div className="w-full">{Content}</div>
      </div>
    </SidebarProvider>
  )
}
