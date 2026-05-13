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
      .from('quotes')
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
        // Remover IDs para garantir que seja um novo orçamento
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, public_uuid: _pu, hash_id: _hi, ...rest } = quote
        initialData = rest as QuoteWithItems
      } else {
        initialData = quote as QuoteWithItems
      }
    } else if (mode === 'edit') {
      notFound()
    }
  }

  const titles: Record<
    QuotePageContentProps['mode'],
    { title: string; description: string }
  > = {
    new: {
      title: 'Novo Orçamento',
      description: 'Preencha os dados abaixo para gerar um orçamento.',
    },
    clone: {
      title: 'Clonar Orçamento',
      description: 'Ajuste os dados do orçamento clonado abaixo.',
    },
    edit: {
      title: 'Editar Orçamento',
      description:
        'Altere os dados abaixo e conclua ou salve novamente como rascunho.',
    },
  }

  const { title, description } = titles[mode]

  return (
    <div className="w-[80%] space-y-6 mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
      <QuoteForm
        customers={customers || []}
        catalogItems={catalogItems || []}
        initialData={initialData || undefined}
        mode={mode}
      />
    </div>
  )
}
