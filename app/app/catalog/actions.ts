'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const catalogItemSchema = z.object({
  type: z.enum(['product', 'service']),
  name: z.string().min(1, 'Nome é obrigatório'),
  unit_price: z.coerce.number().min(0),
  unit_measure: z.string().optional().nullable(),
})

export type CatalogItemInput = z.infer<typeof catalogItemSchema>


export async function saveCatalogItem(data: CatalogItemInput, id?: string) {
  try {
    const validation = catalogItemSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: 'Dados do item inválidos' }
    }

    const validatedData = validation.data
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const itemData = {
      ...validatedData,
      user_id: user.id,
    }


    if (id) {
      const { error } = await supabase
        .from('catalog_items')
        .update(itemData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    } else {
      const { error } = await supabase
        .from('catalog_items')
        .insert(itemData)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath('/app/catalog')
    return { success: true }
  } catch (error) {
    console.error('Error in saveCatalogItem:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao salvar o item do catálogo.',
    }
  }
}

export async function deleteCatalogItem(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID do item inválido' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('catalog_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/app/catalog')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteCatalogItem:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao excluir o item do catálogo.',
    }
  }
}
