'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setupNewUser } from '@/lib/services/user-service'

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
    return { error: error.message }
  }

  if (authData.user) {
    if (authData.user.identities && authData.user.identities.length === 0) {
      return { error: 'Este e-mail já está cadastrado. Por favor, faça login.' }
    }

    const result = await setupNewUser(authData.user.id, data.email)
    if (result.error) {
      console.error(result.error)
    }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithGoogle(origin?: string) {
  const supabase = await createClient()
  const redirectUrl = origin
    ? `${origin}/auth/callback`
    : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}
