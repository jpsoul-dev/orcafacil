'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { receiptSchema, type ReceiptInput, standaloneReceiptSchema, type StandaloneReceiptInput } from './schemas'
import { saveReceipt, deleteReceipt, saveStandaloneReceipt } from '@/lib/services/receipt-service'

export async function saveReceiptAction(data: ReceiptInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    // Validação com Zod
    const validation = receiptSchema.safeParse(data)
    if (!validation.success) {
      logger.error('Validação do recibo falhou:', validation.error.format())
      return { success: false, error: 'Dados do recibo inválidos.' }
    }

    const validatedData = validation.data

    const result = await saveReceipt(validatedData, user.id)

    if (result.success) {
      try {
        revalidatePath(`/app/quotes/${validatedData.quoteId}`)
        revalidatePath(`/app/quotes/${validatedData.quoteId}/receipt`)
        revalidatePath(`/app/quotes/${validatedData.quoteId}/receipt/edit`)
        revalidatePath('/app/quotes')
        revalidatePath('/app/receipts') // Revalida listagem unificada também
      } catch (revalidateError) {
        logger.warn('Revalidation failed in saveReceiptAction:', revalidateError)
      }
    }

    return result
  } catch (error) {
    logger.error('Error in saveReceiptAction:', error)
    return { success: false, error: 'Erro interno ao salvar o recibo.' }
  }
}

export async function deleteReceiptAction(receiptId: string, quoteId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    if (!receiptId) {
      return { success: false, error: 'ID do recibo inválido.' }
    }

    const result = await deleteReceipt(receiptId, user.id)

    if (result.success) {
      try {
        revalidatePath(`/app/quotes/${quoteId}`)
        revalidatePath(`/app/quotes/${quoteId}/receipt`)
        revalidatePath('/app/quotes')
        revalidatePath('/app/receipts') // Revalida listagem unificada também
      } catch (revalidateError) {
        logger.warn('Revalidation failed in deleteReceiptAction:', revalidateError)
      }
    }

    return result
  } catch (error) {
    logger.error('Error in deleteReceiptAction:', error)
    return { success: false, error: 'Erro interno ao excluir o recibo.' }
  }
}

export async function saveStandaloneReceiptAction(data: StandaloneReceiptInput): Promise<
  | { success: true; id: string }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    // Validação com Zod
    const validation = standaloneReceiptSchema.safeParse(data)
    if (!validation.success) {
      logger.error('Validação do recibo avulso falhou:', validation.error.format())
      return { success: false, error: 'Dados do recibo inválidos.' }
    }

    const validatedData = validation.data

    const result = await saveStandaloneReceipt(validatedData, user.id)

    if (result.success) {
      try {
        revalidatePath('/app/receipts')
        if (validatedData.id) {
          revalidatePath(`/app/receipts/${validatedData.id}`)
          revalidatePath(`/app/receipts/${validatedData.id}/edit`)
        }
      } catch (revalidateError) {
        logger.warn('Revalidation failed in saveStandaloneReceiptAction:', revalidateError)
      }
      return { success: true, id: result.id as string }
    }

    return { success: false, error: result.error || 'Erro ao salvar o recibo avulso.' }
  } catch (error) {
    logger.error('Error in saveStandaloneReceiptAction:', error)
    return { success: false, error: 'Erro interno ao salvar o recibo avulso.' }
  }
}

export async function deleteStandaloneReceiptAction(receiptId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    if (!receiptId) {
      return { success: false, error: 'ID do recibo inválido.' }
    }

    const result = await deleteReceipt(receiptId, user.id)

    if (result.success) {
      try {
        revalidatePath('/app/receipts')
      } catch (revalidateError) {
        logger.warn('Revalidation failed in deleteStandaloneReceiptAction:', revalidateError)
      }
    }

    return result
  } catch (error) {
    logger.error('Error in deleteStandaloneReceiptAction:', error)
    return { success: false, error: 'Erro interno ao excluir o recibo avulso.' }
  }
}
