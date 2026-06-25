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
    <div className="max-w-5xl w-full space-y-4 md:space-y-6 mx-auto pb-32 md:pb-6">
      <div className="pt-2 md:pt-0 max-sm:hidden">
        <h2 className="text-ds-heading-md md:text-ds-heading-lg font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground text-ds-body-sm font-medium mt-1">{description}</p>
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
