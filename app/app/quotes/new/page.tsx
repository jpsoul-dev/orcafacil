import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from '../components/quote-form'

export default async function NewQuotePage() {
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Novo Orçamento</h2>
        <p className="text-muted-foreground text-sm mt-1">Preencha os dados abaixo para gerar um orçamento.</p>
      </div>
      <QuoteForm customers={customers || []} catalogItems={catalogItems || []} />
    </div>
  )
}
