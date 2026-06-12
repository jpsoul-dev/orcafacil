import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ReceiptInput, StandaloneReceiptInput } from '@/app/app/quotes/schemas'
import { Receipt, ReceiptQuote, ReceiptQuoteItem } from '@/types/receipt'

export async function getReceiptByQuoteId(quoteId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quote_receipts')
      .select('*')
      .eq('quote_id', quoteId)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching receipt by quote ID:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('CRITICAL: getReceiptByQuoteId failed:', error)
    return null
  }
}

export async function getReceiptById(receiptId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quote_receipts')
      .select('*')
      .eq('id', receiptId)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching receipt by ID:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('CRITICAL: getReceiptById failed:', error)
    return null
  }
}

export async function saveReceipt(data: ReceiptInput, userId: string) {
  try {
    const supabase = await createClient()

    // 1. Validar a propriedade do orçamento (Evitar escalação de privilégios)
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, total, status')
      .eq('id', data.quoteId)
      .eq('user_id', userId)
      .single()

    if (quoteError || !quote) {
      logger.error('Orçamento não encontrado ou usuário sem permissão:', quoteError)
      return { success: false, error: 'Orçamento não encontrado ou permissão negada.' }
    }

    // 2. Verificar se já existe um recibo para este orçamento
    const { data: existingReceipt } = await supabase
      .from('quote_receipts')
      .select('id, receipt_number')
      .eq('quote_id', data.quoteId)
      .maybeSingle()

    if (existingReceipt) {
      // Modo Edição: atualiza dados do recibo existente
      const { error: updateError } = await supabase
        .from('quote_receipts')
        .update({
          title: data.title,
          amount: quote.total, // Proteção backend: ignora input de amount do cliente e usa o total real do banco
          payment_method: data.paymentMethod,
          services_description: data.servicesDescription,
          issued_at: data.issuedAt,
        })
        .eq('id', existingReceipt.id)
        .eq('user_id', userId)

      if (updateError) {
        logger.error('Error updating receipt:', updateError)
        return { success: false, error: 'Erro ao atualizar o recibo.' }
      }

      return { success: true, id: existingReceipt.id }
    } else {
      // Modo Criação: conta recibos do usuário para obter o número sequencial
      const { count, error: countError } = await supabase
        .from('quote_receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (countError) {
        logger.error('Error counting user receipts:', countError)
        return { success: false, error: 'Erro ao gerar o sequencial do recibo.' }
      }

      const nextNumber = (count || 0) + 1
      const receiptNumber = `REC-${String(nextNumber).padStart(3, '0')}`

      const { data: newReceipt, error: insertError } = await supabase
        .from('quote_receipts')
        .insert({
          user_id: userId,
          quote_id: data.quoteId,
          receipt_number: receiptNumber,
          title: data.title,
          amount: quote.total, // Proteção backend: ignora input de amount do cliente e usa o total real do banco
          payment_method: data.paymentMethod,
          services_description: data.servicesDescription,
          issued_at: data.issuedAt,
        })
        .select('id')
        .single()

      if (insertError || !newReceipt) {
        logger.error('Error inserting receipt:', insertError)
        return { success: false, error: 'Erro ao salvar o novo recibo.' }
      }

      return { success: true, id: newReceipt.id }
    }
  } catch (error) {
    logger.error('CRITICAL: saveReceipt failed:', error)
    return { success: false, error: 'Ocorreu um erro inesperado ao processar o recibo.' }
  }
}

export async function deleteReceipt(receiptId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('quote_receipts')
      .delete()
      .eq('id', receiptId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Error deleting receipt:', error)
      return { success: false, error: 'Erro ao excluir o recibo.' }
    }

    return { success: true }
  } catch (error) {
    logger.error('CRITICAL: deleteReceipt failed:', error)
    return { success: false, error: 'Ocorreu um erro inesperado ao excluir o recibo.' }
  }
}

export async function saveStandaloneReceipt(data: StandaloneReceiptInput, userId: string) {
  try {
    const supabase = await createClient()

    const { data: result, error: rpcError } = await supabase.rpc('upsert_receipt_with_items', {
      p_receipt_id: data.id || null,
      p_customer_id: data.customerId,
      p_title: data.title,
      p_amount: data.amount,
      p_payment_method: data.paymentMethod,
      p_services_description: data.servicesDescription,
      p_issued_at: data.issuedAt,
      p_items: data.items,
      p_user_id: userId
    })

    if (rpcError) {
      logger.error('Error executing RPC upsert_receipt_with_items:', rpcError)
      return { success: false, error: rpcError.message || 'Erro ao salvar o recibo avulso no banco de dados.' }
    }

    return { success: true, id: result.id }
  } catch (error) {
    logger.error('CRITICAL: saveStandaloneReceipt failed:', error)
    return { success: false, error: 'Ocorreu um erro inesperado ao salvar o recibo avulso.' }
  }
}

export async function getStandaloneReceiptDetails(receiptId: string, userId: string) {
  try {
    const supabase = await createClient()

    // 1. Busca o recibo avulso na tabela quote_receipts
    const { data: receipt, error: receiptError } = await supabase
      .from('quote_receipts')
      .select('*')
      .eq('id', receiptId)
      .eq('user_id', userId)
      .maybeSingle()

    if (receiptError || !receipt) {
      logger.error('Error fetching standalone receipt:', receiptError)
      return null
    }

    // 2. Busca os itens do recibo na tabela receipt_items
    const { data: items, error: itemsError } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('receipt_id', receiptId)
      .order('created_at', { ascending: true })

    if (itemsError) {
      logger.error('Error fetching standalone receipt items:', itemsError)
      return null
    }

    // 3. Busca o cliente associado ao recibo
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', receipt.customer_id)
      .maybeSingle()

    if (customerError || !customer) {
      logger.error('Error fetching standalone receipt customer:', customerError)
      return null
    }

    // 4. Busca a empresa do usuário
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (companyError || !company) {
      logger.error('Error fetching company details:', companyError)
      return null
    }

    return {
      receipt,
      items: items || [],
      customer,
      company
    }
  } catch (error) {
    logger.error('CRITICAL: getStandaloneReceiptDetails failed:', error)
    return null
  }
}

export async function getReceiptDetails(
  receiptId: string,
  userId: string
): Promise<{ receipt: Receipt; quote: ReceiptQuote } | null> {
  try {
    const supabase = await createClient()

    // 1. Buscar o recibo
    const { data: receipt, error: receiptError } = await supabase
      .from('quote_receipts')
      .select('*')
      .eq('id', receiptId)
      .eq('user_id', userId)
      .maybeSingle()

    if (receiptError || !receipt) {
      logger.error('getReceiptDetails: Recibo não encontrado ou acesso não autorizado:', receiptError)
      return null
    }

    const receiptData: Receipt = {
      id: receipt.id,
      receipt_number: receipt.receipt_number,
      title: receipt.title || '',
      amount: parseFloat(receipt.amount),
      payment_method: receipt.payment_method || 'Pix',
      services_description: receipt.services_description || '',
      issued_at: receipt.issued_at,
    }

    // 2. Se for recibo vinculado a orçamento
    if (receipt.quote_id) {
      const { data: quote, error: quoteError } = await supabase.rpc('get_quote_details', {
        p_quote_id: receipt.quote_id,
      })

      if (quoteError || !quote) {
        logger.error('getReceiptDetails: Erro ao obter orçamento detalhado para recibo:', quoteError)
        return null
      }

      const quoteData: ReceiptQuote = {
        id: quote.id,
        quote_number: quote.quote_number,
        title: quote.title,
        company: {
          name: quote.company?.name || 'Empresa',
          phone: quote.company?.phone || '',
          cnpj: quote.company?.cnpj || '',
          address_street: quote.company?.address_street,
          address_number: quote.company?.address_number,
          address_neighborhood: quote.company?.address_neighborhood,
          address_city: quote.company?.address_city,
          address_state: quote.company?.address_state,
          address_zip: quote.company?.address_zip,
          address_complement: quote.company?.address_complement,
        },
        customer: {
          name: quote.customer?.name || 'Cliente',
          document: quote.customer?.document || '',
          phone: quote.customer?.phone || '',
          address_street: quote.customer?.address_street,
          address_number: quote.customer?.address_number,
          address_neighborhood: quote.customer?.address_neighborhood,
          address_city: quote.customer?.address_city,
          address_state: quote.customer?.address_state,
          address_zip: quote.customer?.address_zip,
        },
        items: (quote.items || []).map((item: unknown) => {
          const qi = item as ReceiptQuoteItem
          return {
            item_name: qi.item_name,
            quantity: Number(qi.quantity),
            unit_price: Number(qi.unit_price),
            subtotal: Number(qi.subtotal),
            unit_measure: qi.unit_measure || null,
          }
        }),
      }

      return {
        receipt: receiptData,
        quote: quoteData,
      }
    }

    // 3. Se for recibo avulso (standalone)
    const standaloneDetails = await getStandaloneReceiptDetails(receiptId, userId)
    if (!standaloneDetails) {
      return null
    }

    const { items, customer, company } = standaloneDetails

    const quoteData: ReceiptQuote = {
      id: receipt.id,
      quote_number: 0,
      title: receipt.title,
      company: {
        name: company?.name || 'Empresa',
        phone: company?.phone || '',
        cnpj: company?.cnpj || '',
        address_street: company?.address_street,
        address_number: company?.address_number,
        address_neighborhood: company?.address_neighborhood,
        address_city: company?.address_city,
        address_state: company?.address_state,
        address_zip: company?.address_zip,
        address_complement: company?.address_complement,
      },
      customer: {
        name: customer?.name || 'Cliente',
        document: customer?.document || '',
        phone: customer?.phone || '',
        address_street: customer?.address_street,
        address_number: customer?.address_number,
        address_neighborhood: customer?.address_neighborhood,
        address_city: customer?.address_city,
        address_state: customer?.address_state,
        address_zip: customer?.address_zip,
      },
      items: items.map((item: unknown) => {
        const qi = item as ReceiptQuoteItem
        return {
          item_name: qi.item_name,
          quantity: Number(qi.quantity),
          unit_price: Number(qi.unit_price),
          subtotal: Number(qi.subtotal),
          unit_measure: qi.unit_measure || null,
        }
      }),
    }

    return {
      receipt: receiptData,
      quote: quoteData,
    }
  } catch (error) {
    logger.error('CRITICAL: getReceiptDetails failed:', error)
    return null
  }
}
