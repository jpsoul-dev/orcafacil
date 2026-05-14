import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type SetupNewUserResult =
  | { success: true; customerId: string; error?: never }
  | { success: false; error: string; customerId?: never }

export async function setupNewUser(
  userId: string,
  email: string
): Promise<SetupNewUserResult> {
  // Usamos o Service Role Key para ignorar RLS, pois o usuário ainda não confirmou o e-mail


  try {
    // 1. Verificar dados atuais do perfil para evitar sobrescrever o trial
    interface ProfileData {
      stripe_customer_id: string | null
      trial_ends_at: string | null
      subscription_status: string | null
    }

    const { data } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, trial_ends_at, subscription_status')
      .eq('id', userId)
      .single()

    const profile = data as ProfileData | null

    if (profile?.stripe_customer_id) {
      return { success: true, customerId: profile.stripe_customer_id }
    }

    // 2. Criar Stripe Customer com Idempotency Key
    const customer = await stripe.customers.create(
      {
        email: email || undefined,
        metadata: { supabase_userId: userId },
      },
      { idempotencyKey: `cust_${userId}` },
    )

    // 3. Só define novo trial se o usuário ainda não tiver um
    interface ProfileUpdate {
      stripe_customer_id: string
      subscription_status: string
      trial_ends_at?: string
    }

    const updateData: ProfileUpdate = {
      stripe_customer_id: customer.id,
      subscription_status: profile?.subscription_status || 'trialing',
    }

    if (!profile?.trial_ends_at) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 15)
      updateData.trial_ends_at = trialEndsAt.toISOString()
    }

    // 4. Garantir a persistência usando upsert
    logger.info(`Realizando upsert no perfil do usuário: ${userId}`, updateData)
    const { error, data: updatedData } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          ...updateData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()

    if (error) {
      logger.error('Erro detalhado no upsert do perfil:', error)
      return { success: false, error: `Falha ao salvar dados de pagamento: ${error.message}` }
    }

    if (!updatedData || updatedData.length === 0) {
      logger.error(
        'Upsert não retornou dados. Verifique as permissões da Service Role.',
      )
      return { success: false, error: 'Erro de consistência: Perfil não persistido.' }
    }

    logger.info('Perfil atualizado com sucesso:', updatedData[0].id)
    return { success: true, customerId: customer.id }
  } catch (err: unknown) {
    logger.error('Erro completo na integração com Stripe:', err)
    const message =
      err instanceof Error
        ? err.message
        : 'Falha na comunicação com o provedor de pagamentos.'
    return { success: false, error: message }
  }
}
