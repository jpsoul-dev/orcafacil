"use client"

import { ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu } from "lucide-react"
import { FloatingSidebar } from "@/components/floating-sidebar"
import { NotificationBell } from "@/components/notification-bell"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import { cn } from "@/lib/utils"

interface NavigationWrapperProps {
  children: ReactNode
  companyName: string
  userData: {
    name: string
    email: string
    avatar: string
  }
  isAdmin: boolean
  hasPassword: boolean
  subscriptionStatus: string | null
  cancelAt: string | null
  trialEndsAt: string | null
  isExpired: boolean
}

function getPageTitle(pathname: string) {
  if (pathname === "/app") return "Início"
  if (pathname.startsWith("/app/quotes")) return "Orçamentos"
  if (pathname.startsWith("/app/receipts")) return "Recibos"
  if (pathname.startsWith("/app/customers")) return "Clientes"
  if (pathname.startsWith("/app/catalog")) return "Catálogo"
  if (pathname.startsWith("/app/settings")) return "Preferências"
  if (pathname.startsWith("/app/admin")) return "Administração"
  return "Painel"
}

export function NavigationWrapper({
  children,
  companyName,
  userData,
  isAdmin,
  hasPassword,
  subscriptionStatus,
  cancelAt,
  trialEndsAt,
  isExpired,
}: NavigationWrapperProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Subscription/Trial calculation
  const TRIAL_DURATION_DAYS = 15
  const now = new Date()
  const trialEnds = trialEndsAt ? new Date(trialEndsAt) : null
  const daysRemaining = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0
  const isTrialing = subscriptionStatus === 'trialing' && daysRemaining > 0 && !isExpired

  // Trial urgency semantic classes
  const isUrgent = daysRemaining <= 2
  const isWarning = daysRemaining > 2 && daysRemaining <= 5

  let bannerBgClass = "bg-muted/50 border-border text-muted-foreground"
  let dotBgClass = "bg-primary"
  let pingBgClass = "bg-primary/60"

  if (isUrgent) {
    bannerBgClass = "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
    dotBgClass = "bg-red-500"
    pingBgClass = "bg-red-500/60"
  } else if (isWarning) {
    bannerBgClass = "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
    dotBgClass = "bg-amber-500"
    pingBgClass = "bg-amber-500/60"
  }

  return (
    <div className="group flex min-h-screen w-full flex-col bg-background">
      {/* ── BOTÕES FLUTUANTES NO DESKTOP ──────────────────────────────────── */}
      {/* FAB do Menu Hambúrguer (Esquerda) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Abrir menu"
        className="fixed top-6 left-6 z-40 md:flex hidden items-center justify-center h-11 w-11 rounded-md border border-border bg-card shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-ds-fast cursor-pointer focus:outline-none"
      >
        <Menu className="h-5 w-5 text-primary stroke-[2.5]" />
      </button>

      {/* FAB do Bell de Notificações (Direita) */}
      <div className="fixed top-6 right-6 z-40 md:block hidden bg-card border border-border rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-ds-fast">
        <NotificationBell />
      </div>

      {/* ── HEADER MOBILE (TOP BAR) ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 md:hidden shrink-0 select-none max-sm:group-has-[.hide-global-header-mobile]:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menu"
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-ds-body-md font-bold text-foreground">
          {getPageTitle(pathname)}
        </h1>

        <div className="flex items-center gap-1">
          <NotificationBell />
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL DA PÁGINA ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 md:pt-6">
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 pb-20 md:pb-6 w-full max-w-5xl mx-auto">
          {isTrialing && pathname === "/app" && (
            <div className="w-full mb-4 shrink-0">
              <div className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-md border text-ds-body-sm font-medium shadow-sm select-none w-full transition-all duration-ds-normal",
                bannerBgClass
              )}>
                <div className="flex items-center gap-3 justify-center sm:justify-start min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pingBgClass)}></span>
                    <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", dotBgClass)}></span>
                  </span>
                  <div className="text-center sm:text-left">
                    <span className="font-semibold block sm:inline">Período de Teste Ativo</span>
                    <span className="hidden sm:inline mx-2 text-border">•</span>
                    <span className="text-muted-foreground dark:text-inherit">
                      Você tem <strong>{daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</strong> de {TRIAL_DURATION_DAYS} no seu período de avaliação gratuita.
                    </span>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className={cn(
                    "px-4 py-2 rounded-md font-semibold text-xs sm:text-ds-body-sm transition-all duration-ds-fast shadow-xs hover:shadow-sm shrink-0 w-full sm:w-auto text-center",
                    isUrgent 
                      ? "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600" 
                      : isWarning 
                        ? "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
                        : "bg-primary hover:bg-primary-hover text-primary-foreground"
                  )}
                >
                  Assinar agora
                </Link>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* ── BARRA DE ABAS INFERIOR NO MOBILE ───────────────────────────────── */}
      <div className="max-sm:group-has-[.hide-global-header-mobile]:hidden max-sm:group-has-[.hide-mobile-tabbar]:hidden md:hidden">
        <MobileTabBar user={userData} isExpired={isExpired} />
      </div>

      {/* ── SIDEBAR FLUTUANTE (SHEET) ──────────────────────────────────────── */}
      <FloatingSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        companyName={companyName}
        user={userData}
        isAdmin={isAdmin}
        hasPassword={hasPassword}
        subscriptionStatus={subscriptionStatus}
        cancelAt={cancelAt}
        trialEndsAt={trialEndsAt}
        isExpired={isExpired}
      />
    </div>
  )
}
