import { 
  FileArchive,
  Home, 
  Pencil, 
  Plus,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,  
} from "../../../components/ui/sidebar"

const getPanelRoute = (token: string, route?: string) =>
  `/admin/painel/${token}${route ? `?route=${route}` : ''}`

export function AppSidebar({ token }: { token: string }) {
  const group_01 = [
    {
      title: "Dashboard",
      url: getPanelRoute(token, 'dashboard'),
      icon: Home,
    },
  ];

  const group_02 = [
    {
      title: "Listar",
      url: getPanelRoute(token, 'produtos'),
      icon: FileArchive,
    },
    {
      title: "Cadastrar",
      url: getPanelRoute(token, 'cadastrar'),
      icon: Plus,
    },
    {
      title: "Atualizar ou Remover",
      url: getPanelRoute(token, 'alterar'),
      icon: Pencil,
    },
  ];

  const group_03 = [
    {
      title: "Listar",
      url: getPanelRoute(token, 'pedidos'),
      icon: FileArchive,
    }
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group_01.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Produtos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group_02.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pedidos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group_03.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
