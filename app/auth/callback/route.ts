import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setupNewUser } from '@/lib/services/user-service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', sessionData.user.id)
        .single()

      if (!profile || !profile.stripe_customer_id) {
        if (sessionData.user.email) {
          await setupNewUser(sessionData.user.id, sessionData.user.email)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate user`,
  )
}
