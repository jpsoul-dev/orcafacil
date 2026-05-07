'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    // Retorna erros comuns como rate limit ("email rate limit exceeded")
    return { error: error.message }
  }

  if (authData.user) {
    // Se a confirmação de e-mail está ativa e o usuário já existe, o Supabase
    // retorna um "fake user" por segurança. Uma forma de detectar isso é
    // verificar se o array de identities está vazio.
    if (authData.user.identities && authData.user.identities.length === 0) {
      return { error: 'Este e-mail já está cadastrado. Por favor, faça login.' }
    }

    try {
      // 1. Criar Stripe Customer
      const { stripe } = await import('@/lib/stripe')
      const customer = await stripe.customers.create({
        email: data.email,
      })

      // 2. Definir o fim do trial (15 dias a partir de agora)
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 15)

      // 3. Inserir o perfil no banco
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        stripe_customer_id: customer.id,
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
      })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        // Não falhamos o signup inteiro, mas logamos
      }
    } catch (err) {
      console.error('Erro na integração do Stripe/Perfil:', err)
      // Como o usuário já foi criado no auth, podemos apenas logar o erro
    }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}
