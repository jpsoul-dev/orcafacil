import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export async function setupNewUser(userId: string, email: string) {
  // Usamos o Service Role Key para ignorar RLS, pois o usuário ainda não confirmou o e-mail
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Verificar se o usuário já tem um customer_id para evitar duplicidade
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profile?.stripe_customer_id) {
      return { success: true }
    }

    // 2. Criar Stripe Customer
    const customer = await stripe.customers.create({ email })

    // 2. Definir o fim do trial (15 dias a partir de agora)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 15)

    // 3. Atualizar o perfil que foi criado pela trigger no Supabase
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        stripe_customer_id: customer.id,
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao atualizar perfil com dados do Stripe:', error)
      return { error: 'Falha ao configurar assinatura do usuário.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Erro na integração com Stripe:', err)
    return { error: 'Falha na comunicação com o provedor de pagamentos.' }
  }
}
