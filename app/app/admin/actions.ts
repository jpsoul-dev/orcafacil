'use server'

import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

export async function syncUserSubscriptionAction(
  userId: string,
  stripeCustomerId: string | null
) {
  try {
    // 1. Validar inputs
    if (!userId) {
      return { error: 'ID de usuário inválido' }
    }

    if (!stripeCustomerId) {
      return { error: 'Usuário não possui Stripe Customer ID' }
    }

    // 2. Buscar assinaturas no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1, // Pega a mais recente
    })

    if (subscriptions.data.length === 0) {
      return { error: 'Nenhuma assinatura encontrada no Stripe para este usuário.' }
    }

    const subscription = subscriptions.data[0]

    // 3. Atualizar Supabase (usando Service Role para contornar RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_id: subscription.id,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      return { error: 'Falha ao atualizar banco de dados.' }
    }

    // 4. Revalidar a página para atualizar a tabela
    revalidatePath('/app/admin/users')

    return { success: true, status: subscription.status }
  } catch (error: any) {
    console.error('Erro na sincronização:', error)
    return { error: error.message || 'Erro desconhecido ao sincronizar.' }
  }
}
