import { createClient } from '@/lib/supabase/server'
import { QuoteForm, QuoteWithItems } from './quote-form'
import { notFound } from 'next/navigation'

interface QuotePageContentProps {
  id?: string
  cloneId?: string
  mode: 'new' | 'edit' | 'clone'
}

export async function QuotePageContent({
  id,
  cloneId,
  mode,
}: QuotePageContentProps) {
  const supabase = await createClient()

  // Buscar clientes do usuário logado
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  // Buscar produtos/serviços
  const { data: catalogItems } = await supabase
    .from('catalog_items')
    .select('*')
    .order('name')

  let initialData: QuoteWithItems | null = null
  const targetId = mode === 'edit' ? id : cloneId

  if (targetId) {
    const { data: quote } = await supabase
      .from('vw_quotes')
      .select(
        `
        *,
        quote_items (*)
      `,
      )
      .eq('id', targetId)
      .single()

    if (quote) {
      if (mode === 'clone') {
        // Remover IDs, número, título, cliente e validade para garantir que seja um novo orçamento limpo

        const {
          id: _id,
          public_uuid: _pu,
          hash_id: _hi,
          quote_number: _qn,
          title: _t,
          customer_id: _cid,
          valid_until: _vu,
          ...rest
        } = quote
        void _id
        void _pu
        void _hi
        void _qn
        void _t
        void _cid
        void _vu

        initialData = {
          ...rest,
          title: '',
          customer_id: '',
          valid_until: null,
        } as QuoteWithItems
      } else {
        initialData = quote as QuoteWithItems
      }
    } else if (mode === 'edit') {
      notFound()
    }
  }
  return (
    <div className="max-w-5xl w-full space-y-4 md:space-y-6 mx-auto pb-32 md:pb-6">
      <QuoteForm
        customers={customers || []}
        catalogItems={catalogItems || []}
        initialData={initialData || undefined}
        mode={mode}
      />
    </div>
  )
}
