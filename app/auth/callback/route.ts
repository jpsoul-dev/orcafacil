import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setupNewUser } from '@/lib/services/user-service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // A. Segurança: Garante que 'next' seja uma rota relativa segura
  const nextParam = searchParams.get('next') ?? '/app'
  const isSafeRedirect =
    nextParam.startsWith('/') && !nextParam.startsWith('//')
  const next = isSafeRedirect ? nextParam : '/app'

  // B. Legibilidade: Early Returns
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Missing code`)
  }

  try {
    const supabase = await createClient()

    // Troca o código pela sessão
    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (error || !sessionData?.user) {
      console.error('Erro ao trocar código por sessão no Supabase:', error)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error?.message || 'Falha na autenticação')}`,
      )
    }

    // C. Tratamento de Erros no Setup do Usuário
    try {
      // Verifica se o perfil existe e se tem stripe_customer_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', sessionData.user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil do usuário:', profileError)
        return NextResponse.redirect(`${origin}/login?error=server_error`)
      }

      if ((!profile || !profile.stripe_customer_id) && sessionData.user.email) {
        const setupResult = await setupNewUser(
          sessionData.user.id,
          sessionData.user.email,
        )
        if (!setupResult.success) {
          console.error(
            'Erro durante o setup do novo usuário (Stripe/Database):',
            setupResult.error,
          )
          // Aqui poderíamos redirecionar para uma página de erro específica se o setup for crítico
        }
      }
    } catch (setupErr) {
      // Evita que erros no setup (como Stripe fora do ar) quebrem o login básico
      console.error('Exceção crítica no fluxo de setup do usuário:', setupErr)
    }

    // Determinar a URL base final
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    const baseUrl =
      !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin

    return NextResponse.redirect(`${baseUrl}${next}`)
  } catch (globalErr) {
    console.error('Erro global não tratado no Auth Callback:', globalErr)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Ocorreu um erro inesperado no servidor.')}`,
    )
  }
}


