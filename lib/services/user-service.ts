import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function setupNewUser(userId: string, email: string) {
  const supabase = await createClient()

  try {
    // 1. Criar Stripe Customer
    const customer = await stripe.customers.create({ email })

    // 2. Definir o fim do trial (15 dias a partir de agora)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 15)

    // 3. Atualizar o perfil que foi criado pela trigger no Supabase
    const { error } = await supabase
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
