import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from '../../components/quote-form'
import { notFound } from 'next/navigation'

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Buscar o orçamento
  const { data: quote } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items (*)
    `)
    .eq('id', id)
    .single()

  if (!quote) {
    notFound()
  }

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Editar Orçamento</h2>
        <p className="text-muted-foreground text-sm mt-1">Altere os dados abaixo e conclua ou salve novamente como rascunho.</p>
      </div>
      <QuoteForm 
        customers={customers || []} 
        catalogItems={catalogItems || []} 
        initialData={quote}
      />
    </div>
  )
}
