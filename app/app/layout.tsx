import { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import { redirect } from "next/navigation"
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
      <NavigationWrapper
        companyName={companyName}
        userData={userData}
        isAdmin={isAdmin}
        hasPassword={profile?.has_password ?? false}
        subscriptionStatus={profile?.subscription_status ?? null}
        cancelAt={profile?.cancel_at ?? null}
        trialEndsAt={profile?.trial_ends_at ?? null}
        isExpired={isExpired}
      >
        {children}
      </NavigationWrapper>
    </SubscriptionProvider>
  )
}

