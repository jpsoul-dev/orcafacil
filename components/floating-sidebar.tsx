"use client"

import { Home, Users, Package, FileText, Settings, LogOut, ChevronRight, Zap, ShieldCheck, Receipt, X, Building2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { logout } from "@/app/auth/actions"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const ManageAccountModal = dynamic(() => import("@/components/manage-account-modal").then(mod => mod.ManageAccountModal), {
  ssr: false
})

interface FloatingSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyName: string
  user: { name: string; email: string; avatar?: string }
  isAdmin?: boolean
  hasPassword: boolean
  subscriptionStatus: string | null
  cancelAt: string | null
  trialEndsAt: string | null
  isExpired?: boolean
}

const mainItems = [
  { title: "Início", url: "/app", icon: Home, exact: true },
  { title: "Orçamentos", url: "/app/quotes", icon: FileText },
  { title: "Recibos", url: "/app/receipts", icon: Receipt },
  { title: "Clientes", url: "/app/customers", icon: Users },
  { title: "Catálogo", url: "/app/catalog", icon: Package },
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

export function FloatingSidebar({
  open,
  onOpenChange,
  companyName,
  user,
  isAdmin,
  hasPassword,
  subscriptionStatus,
  cancelAt,
  trialEndsAt,
  isExpired = false,
}: FloatingSidebarProps) {
  const pathname = usePathname()
  const [isManageAccountOpen, setIsManageAccountOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="p-0 border border-border bg-card shadow-2xl w-64! max-w-64! flex flex-col focus:outline-none !left-3 !top-3 !bottom-3 !h-[calc(100vh-1.5rem)] !rounded-md !border-border max-sm:!w-4/5 max-sm:!max-w-[320px] max-sm:!left-0 max-sm:!top-0 max-sm:!bottom-0 max-sm:!h-screen max-sm:!rounded-none max-sm:border-y-0 max-sm:border-l-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de Navegação</SheetTitle>
          </SheetHeader>

          {/* Cabeçalho do menu */}
          <div className="p-4 pl-5 pb-3 shrink-0 flex items-center justify-between">
            <h2 className="text-ds-body-lg font-bold text-foreground truncate select-none leading-none max-w-[150px]">
              {companyName}
            </h2>
            <SheetClose render={
              <button
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors shrink-0"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            } />
          </div>

          <Separator className="bg-border my-1 shrink-0" />

          {/* Links Principais de Navegação */}
          <div className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {mainItems.map((item) => {
              const active = isActive(pathname, item.url, item.exact)
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-ds-body-md font-medium transition-colors select-none cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary stroke-[2.5]" : "text-muted-foreground")} />
                  <span className="flex-1">{item.title}</span>
                </Link>
              )
            })}

            {/* Admin Menu Item */}
            {isAdmin && (
              <Link
                href="/app/admin/users"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-ds-body-md font-medium transition-colors select-none cursor-pointer",
                  isActive(pathname, '/app/admin/users')
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Users className={cn("h-4 w-4 shrink-0", isActive(pathname, '/app/admin/users') ? "text-primary stroke-[2.5]" : "text-muted-foreground")} />
                <span className="flex-1">Usuários (Admin)</span>
              </Link>
            )}

            <Separator className="bg-border my-3 shrink-0" />

            {/* Meu Negócio */}
            <Link
              href="/app/business"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-ds-body-md font-medium transition-colors select-none cursor-pointer",
                pathname.startsWith('/app/business')
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Building2 className={cn("h-4 w-4 shrink-0", pathname.startsWith('/app/business') ? "text-primary stroke-[2.5]" : "text-muted-foreground")} />
              <span className="flex-1">Meu Negócio</span>
            </Link>

            {/* Preferências */}
            <Link
              href="/app/settings"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-ds-body-md font-medium transition-colors select-none cursor-pointer",
                pathname.startsWith('/app/settings')
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Settings className={cn("h-4 w-4 shrink-0", pathname.startsWith('/app/settings') ? "text-primary stroke-[2.5]" : "text-muted-foreground")} />
              <span className="flex-1">Preferências</span>
            </Link>
          </div>

          {/* Banner de Upgrade Expirado */}
          {isExpired && (
            <div className="mx-3 my-2 p-4 rounded-xl gradient-primary text-white space-y-3 shadow-md shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300 shrink-0" />
                <span className="font-bold text-ds-caption tracking-wider uppercase">OrcaFácil Pro</span>
              </div>
              <p className="text-[11px] font-semibold text-white/95 leading-relaxed">
                Sua avaliação expirou. Continue criando orçamentos profissionais.
              </p>
              <Link href="/pricing" onClick={() => onOpenChange(false)} className="block w-full">
                <button className="w-full py-1.5 px-3 rounded-md bg-white text-primary hover:bg-white/95 font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  Ativar Minha Assinatura
                </button>
              </Link>
            </div>
          )}

          <Separator className="bg-border shrink-0" />

          {/* Rodapé com Dados do Usuário */}
          <div className="p-3 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex w-full items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer text-left focus:outline-none">
                    <Avatar className="h-9 w-9 rounded-full border border-border shrink-0">
                      <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                      <AvatarFallback className="rounded-full bg-muted text-muted-foreground font-semibold text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-ds-body-sm font-bold text-foreground truncate leading-none">{user.name}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-1 leading-none">{user.email}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  </button>
                }
              />
              <DropdownMenuContent
                className="w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
                side="right"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem
                  nativeButton={true}
                  render={
                    <button
                      onClick={() => {
                        onOpenChange(false)
                        setIsManageAccountOpen(true)
                      }}
                      className="flex w-full items-center gap-2 cursor-pointer text-sm text-foreground/80 hover:text-foreground p-2 rounded-lg"
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
                  <button type="submit" className="flex w-full items-center gap-2 text-red-500 cursor-pointer hover:text-red-600 p-2 rounded-lg text-sm w-full text-left">
                    <LogOut className="size-4" />
                    <span>Sair da conta</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>

      <ManageAccountModal
        open={isManageAccountOpen}
        onOpenChange={setIsManageAccountOpen}
        user={user}
        hasPasswordInitial={hasPassword}
        subscriptionStatus={subscriptionStatus}
        cancelAt={cancelAt}
        trialEndsAt={trialEndsAt}
      />
    </>
  )
}
