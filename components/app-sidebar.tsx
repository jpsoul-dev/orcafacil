"use client"

import { LayoutDashboard, Users, Package, FileText, Settings, LogOut, ChevronRight, Zap, CreditCard, ShieldCheck } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
import { createPortalAction } from "@/app/pricing/server-actions"
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

  // Lógica de prazos e rótulos de assinatura
  const now = new Date()
  const cancelDate = cancelAt ? new Date(cancelAt) : null
  const trialDate = trialEndsAt ? new Date(trialEndsAt) : null

  let billingLabel = ""
  let warningType: 'none' | 'trial' | 'cancel' = 'none'
  let daysRemaining = 0

  if (subscriptionStatus === 'trialing' && trialDate) {
    daysRemaining = Math.max(0, Math.ceil((trialDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    billingLabel = `${daysRemaining}d`
    warningType = 'trial'
  } else if (cancelDate) {
    daysRemaining = Math.max(0, Math.ceil((cancelDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    billingLabel = `${daysRemaining}d`
    warningType = 'cancel'
  }

  return (
    <Sidebar collapsible="icon" className="print:hidden">
      {/* Logo */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/app" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-sm shrink-0">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sidebar-foreground text-base tracking-tight">OrçaFácil</span>
            <span className="text-[10px] text-sidebar-foreground/50 font-medium">Orçamentos profissionais</span>
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
                      className="h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm font-medium"
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
                      className="h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm font-medium"
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
                    className="h-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm font-medium mt-1"
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
                <Avatar className="h-8 w-8 rounded-lg after:rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} className="rounded-lg" />
                  <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.name}</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="truncate text-xs text-sidebar-foreground/50">{user.email}</span>
                    {warningType !== 'none' && (
                      <span className={cn(
                        "text-xs font-extrabold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider",
                        warningType === 'trial'
                          ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20"
                          : "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20"
                      )}>
                        {billingLabel}
                      </span>
                    )}
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
                <div className="px-3 py-2.5 border-b border-sidebar-border bg-sidebar-accent/30 rounded-t-md mb-1.5 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs uppercase font-bold text-sidebar-foreground/40 tracking-wider">Assinatura</span>
                    {subscriptionStatus === 'active' && !cancelAt && (
                      <span className="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 text-xs font-bold px-1.5 py-0.5 rounded-full">Pro</span>
                    )}
                    {subscriptionStatus === 'trialing' && (
                      <span className="bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 text-xs font-bold px-1.5 py-0.5 rounded-full">Trial</span>
                    )}
                    {cancelAt && (
                      <span className="bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 text-xs font-bold px-1.5 py-0.5 rounded-full">Pendente</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-sidebar-foreground leading-normal">
                    {cancelDate
                      ? `Expira em: ${cancelDate.toLocaleDateString('pt-BR')}`
                      : trialDate && subscriptionStatus === 'trialing'
                        ? `Período grátis até: ${trialDate.toLocaleDateString('pt-BR')}`
                        : "Renovação Automática"}
                  </p>
                </div>
                <DropdownMenuItem
                  render={
                    <form action={createPortalAction} className="w-full" />
                  }
                >
                  <button type="submit" className="flex w-full items-center gap-2 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground">
                    <CreditCard className="size-4" />
                    <span>Gerenciar Assinatura</span>
                  </button>
                </DropdownMenuItem>
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
      />
    </Sidebar>
  )
}
