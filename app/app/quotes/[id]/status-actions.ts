'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const statusSchema = z.enum(['draft', 'open', 'accepted', 'rejected', 'expired', 'vencido'])

export async function updateQuoteStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Validação com Zod
    const validation = statusSchema.safeParse(status)
    if (!validation.success) {
      return { success: false, error: 'Status inválido' }
    }

    const { error } = await supabase
      .from('quotes')
      .update({ status: validation.data })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/app/quotes/${id}`)
    revalidatePath('/app/quotes')
    return { success: true }
  } catch (error) {
    console.error('Error updating quote status:', error)
    return { success: false, error: 'Erro interno ao atualizar status do orçamento' }
  }
}

export async function updatePublicQuoteStatus(uuid: string, status: string) {
  try {
    const supabase = await createClient()

    // Validar se o status é permitido para o cliente (público)
    if (!['accepted', 'rejected'].includes(status)) {
      return { success: false, error: 'Ação não permitida para o link público' }
    }

    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('public_uuid', uuid)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/quote/${uuid}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating public quote status:', error)
    return { success: false, error: 'Erro interno ao processar sua resposta' }
  }
}
