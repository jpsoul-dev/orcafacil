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
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SubscriptionProvider>
  )
}

