"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Receipt, Menu, Users, Package, Settings, LogOut, ChevronRight, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { logout } from "@/app/auth/actions"

interface MobileTabBarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  isExpired?: boolean;
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

export function MobileTabBar({ user }: MobileTabBarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const mainItems = [
    {
      title: "Painel",
      url: "/app",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Orçamentos",
      url: "/app/quotes",
      icon: FileText,
    },
    {
      title: "Recibos",
      url: "/app/receipts",
      icon: Receipt,
    },
  ]

  const secondaryItems = [
    {
      title: "Clientes",
      url: "/app/customers",
      icon: Users,
    },
    {
      title: "Catálogo",
      url: "/app/catalog",
      icon: Package,
    },
    {
      title: "Meu Negócio",
      url: "/app/business",
      icon: Building2,
    },
    {
      title: "Preferências",
      url: "/app/settings",
      icon: Settings,
    },
  ]

  function isActiveTab(url: string, exact?: boolean) {
    if (exact) return pathname === url
    return pathname === url || pathname.startsWith(url + '/')
  }

  const isSecondaryActive = secondaryItems.some(item => isActiveTab(item.url))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] h-[calc(4rem+env(safe-area-inset-bottom))] bg-card border-t border-border flex items-center justify-around px-2 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {mainItems.map((item) => {
        const active = isActiveTab(item.url, item.exact)

        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-2 gap-1 transition-all duration-ds-fast text-[10px] font-medium cursor-pointer min-w-11 min-h-11",
              active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", active ? "stroke-[2.5]" : "stroke-2")} />
            <span>{item.title}</span>
          </Link>
        )
      })}

      {/* Botão "Mais" que ativa o Drawer/Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          nativeButton={true}
          render={
            <button
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 gap-1 transition-all duration-ds-fast text-[10px] font-medium cursor-pointer min-w-11 min-h-11 border-none bg-transparent outline-none",
                isSecondaryActive || open ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Menu className={cn("h-5 w-5", isSecondaryActive || open ? "stroke-[2.5]" : "stroke-2")} />
              <span>Mais</span>
            </button>
          }
        />
        <SheetContent side="bottom" className="rounded-t-2xl pb-6 border-t border-border bg-card p-0" showCloseButton={false}>
          <div className="mx-auto my-2.5 h-1.5 w-12 rounded-full bg-muted-foreground/20" />

          <SheetHeader className="px-5 pt-2 pb-4 text-left border-b border-border shrink-0">
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 hover:bg-muted/30 p-2 rounded-xl transition-colors cursor-pointer text-left"
            >
              <Avatar className="h-11 w-11 rounded-full border border-border">
                <AvatarImage src={user.avatar} alt={user.name} className="rounded-full" />
                <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-sm font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{user.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/60 shrink-0" />
            </Link>
          </SheetHeader>

          <div className="p-4 space-y-1">
            {secondaryItems.map((item) => {
              const active = isActiveTab(item.url)
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3.5 rounded-md transition-all duration-ds-fast cursor-pointer text-ds-body-md font-semibold",
                    active
                      ? "bg-primary/10 text-primary border-l-3 border-primary rounded-l-none pl-3.5"
                      : "text-foreground hover:bg-muted/40"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="flex-1">{item.title}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </Link>
              )
            })}

            <Separator className="my-3 bg-border" />

            <form
              action={async () => {
                setOpen(false)
                await logout()
              }}
              className="w-full"
            >
              <button
                type="submit"
                className="flex w-full items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 active:bg-red-500/15 transition-all duration-120 cursor-pointer text-left font-semibold text-sm border-none bg-transparent outline-none"
              >
                <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                <span className="flex-1">Sair da conta</span>
                <ChevronRight className="h-4 w-4 text-red-500/50 shrink-0" />
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
