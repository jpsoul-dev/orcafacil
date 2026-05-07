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

export async function deleteUserAction(
  userId: string,
  stripeCustomerId: string | null
) {
  try {
    if (!userId) {
      return { error: 'ID de usuário inválido' }
    }

    // 1. Instanciar Supabase Admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. Apagar o cliente no Stripe (se existir)
    if (stripeCustomerId) {
      try {
        await stripe.customers.del(stripeCustomerId)
      } catch (stripeError) {
        console.error('Erro ao deletar cliente no Stripe:', stripeError)
        // Optamos por continuar a exclusão mesmo se o Stripe falhar, 
        // para garantir que o usuário seja removido do banco.
      }
    }

    // 3. Apagar usuário no Supabase
    // Isso vai acionar o ON DELETE CASCADE e limpar todas as tabelas (profiles, companies, quotes, etc)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Erro ao deletar usuário no Supabase:', deleteError)
      return { error: 'Falha ao deletar usuário do banco de dados.' }
    }

    // 4. Revalidar a página
    revalidatePath('/app/admin/users')

    return { success: true }
  } catch (error: any) {
    console.error('Erro na exclusão de usuário:', error)
    return { error: error.message || 'Erro desconhecido ao excluir usuário.' }
  }
}
