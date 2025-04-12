import { redirect } from 'next/navigation'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { verifyToken } from '../../actions/verify-token'
import { AppSidebar } from '../../components/sidebar-admin'
import DashboardPage from '../../pages/dashboard'
import OrdersList from '../../pages/orders-list'
import CreateProducts from '../../pages/products-create'
import ProductsList from '../../pages/products-list'

type PanelPageProps = {
  params: Promise<{ token?: string | string[] }>
  searchParams: Promise<{ route?: string }>
}

const getComponent = (route?: string) => {
  switch (route) {
    case 'pedidos':
      return <OrdersList />
    case 'produtos':
      return <ProductsList />
    case 'cadastrar':
      return <CreateProducts />
    case 'dashboard':
    default:
      return <DashboardPage />
  }
}

export default async function PanelPage({ params, searchParams }: PanelPageProps) {
  const { token } = await params
  const { route } = await searchParams

  const tokenParam = Array.isArray(token) ? token[0] : token

  if (!tokenParam) {
    redirect('/admin')
  }

  const result = await verifyToken(tokenParam)

  if (!result.valid) {
    redirect('/admin')
  }

  const Content = getComponent(route)

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar token={tokenParam} />
        <SidebarTrigger />
        <div className="w-full max-w-[100vw] overflow-x-auto px-2 sm:px-4 md:px-6 lg:px-10">
          {Content}
        </div>
      </div>
    </SidebarProvider>
  )
}
