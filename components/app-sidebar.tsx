"use client"

import { LayoutDashboard, Users, Package, FileText, Settings, LogOut, ChevronRight, Zap, ShieldCheck, Receipt } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { logout } from "@/app/auth/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { ManageAccountModal } from "@/components/manage-account-modal"

const mainItems = [
  { title: "Painel", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Orçamentos", url: "/app/quotes", icon: FileText },
  { title: "Recibos", url: "/app/receipts", icon: Receipt },
  { title: "Clientes", url: "/app/customers", icon: Users },
  { title: "Catálogo", url: "/app/catalog", icon: Package },
]

const configItems = [
  { title: "Meu negócio", url: "/app/settings", icon: Settings },
]

function isActive(pathname: string, url: string, exact?: boolean) {
  if (exact) return pathname === url
  return pathname === url || pathname.startsWith(url + '/')
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  const single = parts[0]
  if (single.length >= 2) {
    return single.substring(0, 2).toUpperCase()
  }
  return single.toUpperCase() || 'U'
}

export function AppSidebar({
  user,
  isAdmin,
  hasPassword,
  subscriptionStatus,
  cancelAt,
  trialEndsAt,
  isExpired = false,
}: {
  user: { name: string; email: string; avatar?: string }
  isAdmin?: boolean
  hasPassword: boolean
  subscriptionStatus: string | null
  cancelAt: string | null
  trialEndsAt: string | null
  isExpired?: boolean
}) {
  const pathname = usePathname()
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false)


  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-start px-4 group-data-[collapsible=icon]:justify-center">
        <Link href="/app" className="flex items-center gap-2.5 group">
          {/* Logo Horizontal (Expandido) */}
          <div className="group-data-[collapsible=icon]:hidden">
            <img src="/logo-horizontal-claro.svg" alt="OrçaFácil" className="dark:hidden block h-8 w-auto" />
            <img src="/logo-horizontal-escuro.svg" alt="OrçaFácil" className="hidden dark:block h-8 w-auto" />
          </div>
          {/* Logo Símbolo (Colapsado) */}
          <div className="hidden group-data-[collapsible=icon]:block">
            <img src="/logo-simbolo-claro.svg" alt="OrçaFácil" className="dark:hidden block h-7 w-7" />
            <img src="/logo-simbolo-escuro.svg" alt="OrçaFácil" className="hidden dark:block h-7 w-7" />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-semibold px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainItems.map((item) => {
                const active = isActive(pathname, item.url, item.exact)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={active}
                      className="h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold relative pl-3 data-[active=true]:border-l-[3px] data-[active=true]:border-primary data-[active=true]:rounded-l-none transition-all duration-120"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      {active && <ChevronRight className="ml-auto h-3 w-3 opacity-60 group-data-[collapsible=icon]:hidden" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-sidebar-border my-2" />

        {/* Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-semibold px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {configItems.map((item) => {
                const active = isActive(pathname, item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={active}
                      className="h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold relative pl-3 data-[active=true]:border-l-[3px] data-[active=true]:border-primary data-[active=true]:rounded-l-none transition-all duration-120"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              {/* Admin Menu Item */}
              {isAdmin && (
                <SidebarMenuItem key="AdminUsers">
                  <SidebarMenuButton
                    render={<Link href="/app/admin/users" />}
                    isActive={isActive(pathname, '/app/admin/users')}
                    className="h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold relative pl-3 data-[active=true]:border-l-[3px] data-[active=true]:border-primary data-[active=true]:rounded-l-none transition-all duration-120 mt-1"
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden font-medium">Usuários (Admin)</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Banner de Upgrade Expirado */}
        {isExpired && (
          <div className="mx-2 my-2 p-4 rounded-xl gradient-primary text-white space-y-3 shadow-md group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300 shrink-0" />
              <span className="font-extrabold text-[10px] tracking-wider uppercase">OrcaFácil Pro</span>
            </div>
            <p className="text-xs font-semibold text-white/95 leading-relaxed">
              Sua avaliação expirou. Continue criando orçamentos profissionais.
            </p>
            <Link href="/pricing" className="block w-full">
              <button className="w-full py-1.5 px-3 rounded-lg bg-white text-primary hover:bg-white/95 font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                Ativar Minha Assinatura
              </button>
            </Link>
          </div>
        )}
      </SidebarContent>

      {/* Footer com usuário logado */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-full after:rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                  <AvatarFallback className="rounded-full bg-muted text-muted-foreground font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.name}</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="truncate text-xs text-sidebar-foreground/50">{user.email}</span>
                  </div>
                </div>
                <MoreVertical className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  nativeButton={true}
                  render={
                    <button
                      onClick={() => setIsManageAccountOpen(true)}
                      className="flex w-full items-center gap-2 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    />
                  }
                >
                  <ShieldCheck className="size-4" />
                  <span>Gerenciar conta</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={
                    <form action={async () => { await logout() }} className="w-full" />
                  }
                >
                  <button type="submit" className="flex w-full items-center gap-2 text-red-500 cursor-pointer hover:text-red-600">
                    <LogOut className="size-4" />
                    <span>Sair da conta</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <ManageAccountModal
        open={isManageAccountOpen}
        onOpenChange={setIsManageAccountOpen}
        user={user}
        hasPasswordInitial={hasPassword}
        subscriptionStatus={subscriptionStatus}
        cancelAt={cancelAt}
        trialEndsAt={trialEndsAt}
      />
    </Sidebar>
  )
}
