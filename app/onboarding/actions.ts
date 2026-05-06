'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveOnboarding(data: { name: string; phone: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // Verificar se já existe uma empresa para este usuário
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { success: true } // Já existe, apenas prossegue
  }

  const { error } = await supabase.from('companies').insert({
    user_id: user.id,
    name: data.name,
    phone: data.phone,
  })

  if (error) {
    console.error('Erro ao salvar onboarding:', error)
    return { error: 'Erro ao salvar os dados do negócio' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
