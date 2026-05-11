'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setupNewUser } from '@/lib/services/user-service'
import { authSchema, passwordSchema } from '@/lib/validations/auth'

const AUTH_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de fazer login.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters':
    'A senha deve ter pelo menos 6 caracteres.',
  'New password should be different from the old password':
    'A nova senha deve ser diferente da antiga.',
}

function getAuthErrorMessage(message: string): string {
  return AUTH_ERROR_MAP[message] ?? 'Erro inesperado. Tente novamente.'
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: getAuthErrorMessage(error.message) }
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
    return { error: getAuthErrorMessage(error.message) }
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
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erro ao encerrar sessão:', error)
      return { error: 'Falha ao encerrar sessão. Tente novamente.' }
    }

    // Limpa o cache de todas as rotas para evitar exibição de dados residuais
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (err) {
    // Caso ocorra um erro de redirecionamento (comportamento normal do Next.js), 
    // ou um erro real, garantimos que o usuário saiba.
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err
    }
    console.error('Exceção no logout:', err)
    return { error: 'Ocorreu um erro inesperado ao sair.' }
  }
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
    return { error: getAuthErrorMessage(error.message) }
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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) {
    return { error: getAuthErrorMessage(updateError.message) }
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
