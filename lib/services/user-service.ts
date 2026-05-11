import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export async function setupNewUser(userId: string, email: string) {
  // Usamos o Service Role Key para ignorar RLS, pois o usuário ainda não confirmou o e-mail
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

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
    console.log(`Realizando upsert no perfil do usuário: ${userId}`, updateData)
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
      console.error('Erro detalhado no upsert do perfil:', error)
      return { error: `Falha ao salvar dados de pagamento: ${error.message}` }
    }

    if (!updatedData || updatedData.length === 0) {
      console.error(
        'Upsert não retornou dados. Verifique as permissões da Service Role.',
      )
      return { error: 'Erro de consistência: Perfil não persistido.' }
    }

    console.log('Perfil atualizado com sucesso:', updatedData[0].id)
    return { success: true, customerId: customer.id }
  } catch (err: unknown) {
    console.error('Erro completo na integração com Stripe:', err)
    const message =
      err instanceof Error
        ? err.message
        : 'Falha na comunicação com o provedor de pagamentos.'
    return { error: message }
  }
}
