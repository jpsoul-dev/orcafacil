import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { catalogItemSchema } from '@/lib/validations/catalog-schema'
import type { CatalogItemInput } from '@/lib/validations/catalog-schema'

export interface CatalogItem extends CatalogItemInput {
  id: string
  user_id: string
  created_at: string
}

export type CatalogServiceResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Service to handle Catalog Item operations (Principle I of the Constitution).
 * Encapsulates all direct database queries for items.
 */
export class CatalogService {
  /**
   * Fetch items with pagination, text search, filtering and sorting.
   */
  static async getCatalogItemsPaged(options: {
    userId: string
    page?: number
    size?: number
    limit?: number
    search?: string
    type?: string
    sort?: string
  }): Promise<CatalogServiceResult<{ items: CatalogItem[]; count: number }>> {
    try {
      const { userId, page = 0, size = 10, limit, search, type = 'all', sort = 'az' } = options

      // Early return if both filters are unchecked (type === 'none')
      if (type === 'none') {
        return {
          success: true,
          data: {
            items: [],
            count: 0,
          },
        }
      }

      const supabase = await createClient()
      let query = supabase
        .from('catalog_items')
        .select('id, type, name, unit_price, unit_measure, created_at', { count: 'exact' })
        .eq('user_id', userId)

      // Filtering by type
      if (type && type !== 'all') {
        query = query.eq('type', type)
      }

      // Filtering by name text search
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      // Sorting rules
      if (sort === 'za') {
        query = query.order('name', { ascending: false })
      } else if (sort === 'price_asc') {
        query = query.order('unit_price', { ascending: true })
      } else if (sort === 'price_desc') {
        query = query.order('unit_price', { ascending: false })
      } else if (sort === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true })
      } else {
        // Default is 'az'
        query = query.order('name', { ascending: true })
      }

      // Pagination limits
      let start = page * size
      let end = start + size - 1

      if (limit && limit > 0) {
        start = 0
        end = limit - 1
      }

      query = query.range(start, end)

      const { data, error, count } = await query

      if (error) {
        logger.error('CatalogService.getCatalogItemsPaged failed:', error)
        return { success: false, error: 'Falha ao buscar a lista de itens.' }
      }

      return {
        success: true,
        data: {
          items: (data as CatalogItem[]) || [],
          count: count || 0,
        },
      }
    } catch (error) {
      logger.error('CRITICAL: CatalogService.getCatalogItemsPaged critical error:', error)
      return { success: false, error: 'Erro inesperado ao processar a listagem de itens.' }
    }
  }

  /**
   * Save (create or update) a catalog item.
   */
  static async saveCatalogItem(
    data: CatalogItemInput,
    userId: string,
    id?: string
  ): Promise<CatalogServiceResult<CatalogItem>> {
    try {
      const validation = catalogItemSchema.safeParse(data)
      if (!validation.success) {
        const fieldErrors = validation.error.flatten().fieldErrors
        const firstError = Object.values(fieldErrors)[0]?.[0] || 'Dados inválidos'
        return { success: false, error: firstError }
      }

      const validatedData = validation.data
      const supabase = await createClient()

      const itemData = {
        ...validatedData,
        user_id: userId,
      }

      if (id) {
        const { data: updatedData, error } = await supabase
          .from('catalog_items')
          .update(itemData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          logger.error(`CatalogService.saveCatalogItem update failed for id ${id}:`, error)
          return { success: false, error: 'Falha ao atualizar o item do catálogo.' }
        }

        return { success: true, data: updatedData as CatalogItem }
      } else {
        const { data: insertedData, error } = await supabase
          .from('catalog_items')
          .insert(itemData)
          .select()
          .single()

        if (error) {
          logger.error('CatalogService.saveCatalogItem insert failed:', error)
          return { success: false, error: 'Falha ao salvar o item no catálogo.' }
        }

        return { success: true, data: insertedData as CatalogItem }
      }
    } catch (error) {
      logger.error('CRITICAL: CatalogService.saveCatalogItem critical error:', error)
      return { success: false, error: 'Erro inesperado ao salvar o item do catálogo.' }
    }
  }

  /**
   * Delete a catalog item.
   */
  static async deleteCatalogItem(id: string, userId: string): Promise<CatalogServiceResult<null>> {
    try {
      if (!id || typeof id !== 'string') {
        return { success: false, error: 'ID do item inválido.' }
      }

      const supabase = await createClient()
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        logger.error(`CatalogService.deleteCatalogItem failed for id ${id}:`, error)
        // Check for reference constraints
        if (error.code === '23503') {
          return {
            success: false,
            error: 'Este item não pode ser excluído pois está sendo utilizado em orçamentos ou recibos.',
          }
        }
        return { success: false, error: 'Falha ao excluir o item do catálogo.' }
      }

      return { success: true, data: null }
    } catch (error) {
      logger.error(`CRITICAL: CatalogService.deleteCatalogItem critical error for id ${id}:`, error)
      return { success: false, error: 'Erro inesperado ao excluir o item do catálogo.' }
    }
  }
}
