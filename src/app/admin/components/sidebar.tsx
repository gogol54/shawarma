import { 
  FileArchive,
  Home, 
  Pencil, 
  Plus,
  Search 
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
// Menu items.
const group_01 = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
 
]
const group_02 = [
  {
    title: "Listar",
    url: "#",
    icon: FileArchive,
  },
  {
    title: "Cadastrar",
    url: "#",
    icon: Plus,
  },

  {
    title: "Atualizar ou Remover",
    url: "#",
    icon: Pencil,
  },
]
const group_03 = [
  {
    title: "Listar",
    url: "#",
    icon: FileArchive,
  },
  {
    title: "Buscar",
    url: "#",
    icon: Search,
  },
  {
    title: "Atualizar",
    url: "#", 
    icon: Pencil,
  },
]

export function AppSidebar() {
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
