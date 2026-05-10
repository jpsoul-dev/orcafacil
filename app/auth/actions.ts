'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setupNewUser } from '@/lib/services/user-service'
import { authSchema, passwordSchema } from '@/lib/validations/auth'

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

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  // Validação no servidor
  const validation = authSchema.safeParse(rawData)
  if (!validation.success) {
    const errorMessage = validation.error.issues[0].message
    return { error: errorMessage }
  }

  const data = validation.data

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}



export async function updatePassword(password: string) {
  // Validação no servidor
  const validation = passwordSchema.safeParse(password)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) {
    return { error: updateError.message }
  }

  // Invalida todas as outras sessões ativas por segurança
  await supabase.auth.signOut({ scope: 'others' })

  // Atualiza o estado na tabela profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ has_password: true })
    .eq('id', user.id)

  if (profileError) {
    console.error('Erro ao atualizar profiles:', profileError)
  }

  return { success: true }
}
