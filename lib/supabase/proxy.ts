import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register' ||
    request.nextUrl.pathname === '/forgot-password' ||
    request.nextUrl.pathname === '/reset-password' ||
    request.nextUrl.pathname === '/termos' ||
    request.nextUrl.pathname.startsWith('/auth/callback') ||
    request.nextUrl.pathname.startsWith('/api/webhook')

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages to /app
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  // Paywall Logic - Backend Protection and Read-Only Headers
  if (user && !isPublicRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', user.id)
        .single()

      const isActive = profile?.subscription_status === 'active'
      const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      const isTrialing = profile?.subscription_status === 'trialing' && daysRemaining > 0
      const isExpired = !isActive && !isTrialing

      if (isExpired) {
        const method = request.method
        const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
        const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
        const isAppRoute = request.nextUrl.pathname.startsWith('/app')
        
        const isExcludedApi = 
          request.nextUrl.pathname.startsWith('/api/webhook') || 
          request.nextUrl.pathname.startsWith('/api/auth')

        // Block writing actions on backend for expired users
        if (isMutation && (isApiRoute || isAppRoute) && !isExcludedApi) {
          return NextResponse.json(
            { 
              error: 'subscription_expired', 
              message: 'Sua assinatura ou período de teste expirou. Faça o upgrade para continuar.' 
            }, 
            { status: 403 }
          )
        }

        // Inject header to denote read-only state for Page rendering
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-subscription-status', 'trialing-expired')
        
        const responseWithHeader = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })

        // Preserve cookies set by Supabase during session refresh
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          responseWithHeader.cookies.set(cookie.name, cookie.value)
        })

        return responseWithHeader
      }
    } catch (error) {
      console.error('Error checking subscription in proxy:', error)
    }
  }

  return supabaseResponse
}

