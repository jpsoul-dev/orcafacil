import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { Separator } from "@/components/ui/separator"

import { redirect } from "next/navigation"

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

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 print:hidden">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="h-4" />
          <AppBreadcrumb />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-foreground leading-none">{companyName}</p>
            </div>
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
              {companyName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
