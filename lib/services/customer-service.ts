import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { customerSchema } from '@/lib/validations/customer-schema'
import type { CustomerInput } from '@/lib/validations/customer-schema'

// Re-exporta para compatibilidade com imports existentes no servidor
export { customerSchema }
export type { CustomerInput }

export interface Customer extends CustomerInput {
  id: string
  user_id: string
  created_at: string
}

export type CustomerServiceResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/**
 * Service to handle customer operations.
 * Operações com o banco de dados são isoladas aqui seguindo o Princípio I (SRP) da Constituição.
 */
export class CustomerService {
  /**
   * Obtém a lista de clientes ordenada por nome para o usuário autenticado.
   */
  static async getCustomers(userId: string): Promise<CustomerServiceResult<Customer[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) {
        logger.error('CustomerService.getCustomers failed:', error)
        return { success: false, error: 'Falha ao buscar a lista de clientes.' }
      }

      return { success: true, data: data as Customer[] }
    } catch (error) {
      logger.error('CRITICAL: CustomerService.getCustomers critical error:', error)
      return { success: false, error: 'Erro inesperado ao processar a listagem de clientes.' }
    }
  }

  /**
   * Obtém um cliente específico pelo ID, garantindo a propriedade (user_id).
   */
  static async getCustomerById(id: string, userId: string): Promise<CustomerServiceResult<Customer>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        logger.error(`CustomerService.getCustomerById failed for id ${id}:`, error)
        return { success: false, error: 'Falha ao buscar os detalhes do cliente.' }
      }

      if (!data) {
        return { success: false, error: 'Cliente não encontrado ou permissão negada.' }
      }

      return { success: true, data: data as Customer }
    } catch (error) {
      logger.error(`CRITICAL: CustomerService.getCustomerById critical error for id ${id}:`, error)
      return { success: false, error: 'Erro inesperado ao carregar os detalhes do cliente.' }
    }
  }

  /**
   * Cria ou atualiza os dados do cliente no banco.
   */
  static async saveCustomer(
    data: CustomerInput,
    userId: string,
    id?: string
  ): Promise<CustomerServiceResult<Customer>> {
    try {
      const validation = customerSchema.safeParse(data)
      if (!validation.success) {
        const fieldErrors = validation.error.flatten().fieldErrors
        const firstError = Object.values(fieldErrors)[0]?.[0] || 'Dados inválidos'
        return { success: false, error: firstError }
      }

      const validatedData = validation.data
      const supabase = await createClient()

      const customerData = {
        ...validatedData,
        user_id: userId,
      }

      if (id) {
        // Atualização
        const { data: updatedData, error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          logger.error(`CustomerService.saveCustomer (update) failed for id ${id}:`, error)
          return { success: false, error: `Erro ao atualizar cliente: ${error.message}` }
        }

        return { success: true, data: updatedData as Customer }
      } else {
        // Criação
        const { data: insertedData, error } = await supabase
          .from('customers')
          .insert(customerData)
          .select()
          .single()

        if (error) {
          logger.error('CustomerService.saveCustomer (insert) failed:', error)
          return { success: false, error: `Erro ao cadastrar cliente: ${error.message}` }
        }

        return { success: true, data: insertedData as Customer }
      }
    } catch (error) {
      logger.error('CRITICAL: CustomerService.saveCustomer critical error:', error)
      return { success: false, error: 'Erro inesperado ao salvar os dados do cliente.' }
    }
  }

  /**
   * Deleta o cliente se pertencer ao usuário ativo.
   */
  static async deleteCustomer(id: string, userId: string): Promise<CustomerServiceResult<void>> {
    try {
      const supabase = await createClient()

      // Verificar primeiro se possui orçamentos ou recibos associados
      const hasRelationResult = await this.hasActiveBudgets(id, userId)
      if (!hasRelationResult.success) {
        return { success: false, error: hasRelationResult.error }
      }

      if (hasRelationResult.data) {
        return {
          success: false,
          error: 'Este cliente possui orçamentos ou recibos vinculados e não pode ser excluído.',
        }
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        logger.error(`CustomerService.deleteCustomer failed for id ${id}:`, error)
        return { success: false, error: `Erro ao excluir o cliente: ${error.message}` }
      }

      return { success: true, data: undefined }
    } catch (error) {
      logger.error(`CRITICAL: CustomerService.deleteCustomer critical error for id ${id}:`, error)
      return { success: false, error: 'Erro inesperado ao tentar excluir o cliente.' }
    }
  }

  /**
   * Verifica se o cliente tem orçamentos ou recibos vinculados.
   */
  static async hasActiveBudgets(customerId: string, userId: string): Promise<CustomerServiceResult<boolean>> {
    try {
      const supabase = await createClient()

      // 1. Contar orçamentos
      const { count: quotesCount, error: quotesError } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('user_id', userId)

      if (quotesError) {
        logger.error(`CustomerService.hasActiveBudgets (quotes check) failed for id ${customerId}:`, quotesError)
        return { success: false, error: 'Falha ao validar os orçamentos vinculados do cliente.' }
      }

      // 2. Contar recibos avulsos vinculados ao cliente
      const { count: receiptsCount, error: receiptsError } = await supabase
        .from('quote_receipts')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('user_id', userId)

      if (receiptsError) {
        logger.error(`CustomerService.hasActiveBudgets (receipts check) failed for id ${customerId}:`, receiptsError)
        return { success: false, error: 'Falha ao validar os recibos vinculados do cliente.' }
      }

      const hasVinc = (quotesCount || 0) > 0 || (receiptsCount || 0) > 0

      return { success: true, data: hasVinc }
    } catch (error) {
      logger.error(`CRITICAL: CustomerService.hasActiveBudgets critical error for id ${customerId}:`, error)
      return { success: false, error: 'Erro inesperado ao validar os vínculos do cliente.' }
    }
  }

  /**
   * Busca o histórico de orçamentos de um cliente específico.
   */
  static async getCustomerQuotes(customerId: string, userId: string): Promise<CustomerServiceResult<any[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('vw_quotes')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error(`CustomerService.getCustomerQuotes failed for id ${customerId}:`, error)
        return { success: false, error: 'Erro ao carregar orçamentos.' }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      logger.error(`CRITICAL: CustomerService.getCustomerQuotes critical error for id ${customerId}:`, error)
      return { success: false, error: 'Erro inesperado ao obter orçamentos.' }
    }
  }

  /**
   * Busca o histórico de recibos de um cliente específico.
   */
  static async getCustomerReceipts(customerId: string, userId: string): Promise<CustomerServiceResult<any[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('quote_receipts')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false })

      if (error) {
        logger.error(`CustomerService.getCustomerReceipts failed for id ${customerId}:`, error)
        return { success: false, error: 'Erro ao carregar recibos.' }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      logger.error(`CRITICAL: CustomerService.getCustomerReceipts critical error for id ${customerId}:`, error)
      return { success: false, error: 'Erro inesperado ao obter recibos.' }
    }
  }
}
