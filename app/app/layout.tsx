import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

import { redirect } from "next/navigation"
import { NotificationBell } from "@/components/notification-bell"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const [{ data: { user } }, { data: company }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('companies').select('name').single()
  ])

  if (user && !company) {
    redirect('/onboarding')
  }

  const userEmail = user?.email ?? ''
  const companyName = company?.name ?? 'Minha Empresa'

  const userData = {
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário',
    email: userEmail,
    avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''
  }

  // Lógica de Paywall no Layout
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at, is_admin, has_password')
    .eq('id', user?.id || '')
    .single()

  const isActive = profile?.subscription_status === 'active'
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
  const now = new Date()
  const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const isTrialing = profile?.subscription_status === 'trialing' && daysRemaining > 0
  
  const isExpired = !isActive && !isTrialing
  const isAdmin = profile?.is_admin === true
  return (
    <>
      {isExpired && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-xl max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
               <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Tempo Esgotado</h2>
            <p className="text-muted-foreground text-base">
              Seu período de teste chegou ao fim ou sua assinatura foi cancelada. 
              Para continuar criando e gerenciando seus orçamentos, você precisa assinar o plano Pro.
            </p>
            <div className="pt-4">
              <Link href="/pricing">
                <Button size="lg" className="w-full font-bold text-base h-12">
                  Ver Planos e Assinar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <SidebarProvider>
        <AppSidebar user={userData} isAdmin={isAdmin} hasPassword={profile?.has_password ?? false} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 print:hidden">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4" />
            <AppBreadcrumb />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-right hidden sm:block">
                <p className="text-lg font-bold text-foreground leading-none">{companyName}</p>
              </div>
            </div>
          </header>
          <div className={cn("flex flex-1 flex-col gap-4 p-4 lg:p-6", isExpired ? "pointer-events-none select-none blur-sm opacity-50" : "")}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
