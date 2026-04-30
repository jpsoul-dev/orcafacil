import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from '../components/quote-form'

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ clone?: string }> }) {
  const { clone: cloneId } = await searchParams
  const supabase = await createClient()

  // Buscar clientes do usuário logado
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, document, whatsapp')
    .order('name')

  // Buscar produtos/serviços
  const { data: catalogItems } = await supabase
    .from('catalog_items')
    .select('id, type, name, unit_price, unit_measure')
    .order('name')

  let initialData = null
  if (cloneId) {
    const { data: quote } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('id', cloneId)
      .single()

    if (quote) {
      // Removemos os campos de identificação para ser tratado como novo
      const { id, quote_number, public_uuid, created_at, ...rest } = quote
      initialData = rest
    }
  }

  return (
    <div className="w-[80%] mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {initialData ? 'Clonar Orçamento' : 'Novo Orçamento'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {initialData
            ? 'Ajuste os dados do orçamento clonado abaixo.'
            : 'Preencha os dados abaixo para gerar um orçamento.'}
        </p>
      </div>
      <QuoteForm
        customers={customers || []}
        catalogItems={catalogItems || []}
        initialData={initialData}
      />
    </div>
  )
}
