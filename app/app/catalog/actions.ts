'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CatalogService } from '@/lib/services/catalog-service'
import { catalogItemSchema } from '@/lib/validations/catalog-schema'
import type { CatalogItemInput } from '@/lib/validations/catalog-schema'

/**
 * Server Action to save or update an item in the catalog.
 * delegates database logic to CatalogService per Principle I.
 */
export async function saveCatalogItem(data: CatalogItemInput, id?: string) {
  try {
    const validation = catalogItemSchema.safeParse(data)
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Dados inválidos'
      return { success: false, error: firstError }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    const result = await CatalogService.saveCatalogItem(validation.data, user.id, id)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath('/app/catalog')
    return { success: true }
  } catch (error) {
    console.error('Error in saveCatalogItem Server Action:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao salvar o item do catálogo.',
    }
  }
}

/**
 * Server Action to delete an item from the catalog.
 * delegates database logic to CatalogService per Principle I.
 */
export async function deleteCatalogItem(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID do item inválido.' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' }
    }

    const result = await CatalogService.deleteCatalogItem(id, user.id)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath('/app/catalog')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteCatalogItem Server Action:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao excluir o item do catálogo.',
    }
  }
}
