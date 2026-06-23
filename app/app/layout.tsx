import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

import { redirect } from "next/navigation"
import { NotificationBell } from "@/components/notification-bell"
import { ThemeToggle } from "@/components/theme-toggle"
import { headers } from "next/headers"
import { SubscriptionProvider } from "@/components/subscription-provider"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: company } = await supabase.from('companies').select('name').single()

  if (!company) {
    redirect('/onboarding')
  }

  const userEmail = user?.email ?? ''
  const companyName = company?.name ?? 'Minha Empresa'

  const userData = {
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário',
    email: userEmail,
    avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''
  }

  // Get subscription status from Proxy header to prevent database duplicate queries
  const headersList = await headers()
  const isExpired = headersList.get('x-subscription-status') === 'trialing-expired'

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at, is_admin, has_password, cancel_at')
    .eq('id', user?.id || '')
    .single()

  const isAdmin = profile?.is_admin === true

  return (
    <SubscriptionProvider isExpired={isExpired}>
      <SidebarProvider>
        <AppSidebar 
          user={userData} 
          isAdmin={isAdmin} 
          hasPassword={profile?.has_password ?? false}
          subscriptionStatus={profile?.subscription_status ?? null}
          cancelAt={profile?.cancel_at ?? null}
          trialEndsAt={profile?.trial_ends_at ?? null}
          isExpired={isExpired}
        />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 backdrop-blur-sm px-4 print:hidden">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground md:inline-flex hidden transition-colors duration-ds-fast" />
            <Separator orientation="vertical" className="h-4 md:block hidden bg-border" />
            <AppBreadcrumb />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
              <Link href="/app/settings" title="Configurações">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground transition-all duration-ds-fast cursor-pointer rounded-md">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <div className="text-right hidden sm:block ml-2 border-l pl-3 border-border">
                <p className="text-ds-body-sm font-bold text-foreground leading-none">{companyName}</p>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 pb-20 md:pb-6">
            {children}
          </div>
          <MobileTabBar user={userData} />
        </SidebarInset>
      </SidebarProvider>
    </SubscriptionProvider>
  )
}

