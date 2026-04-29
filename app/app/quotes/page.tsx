import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { QuotesFilter } from './components/quotes-filter'

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('quotes')
    .select(`
      *,
      customers ( name )
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: quotes } = await query

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Orçamentos</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">Crie e gerencie seus orçamentos.</p>
        </div>
        <Link href="/app/quotes/new">
          <Button className="gap-2 font-semibold shadow-sm">
            <Plus className="h-4 w-4" /> Novo Orçamento
          </Button>
        </Link>
      </div>

      <QuotesFilter />

      {/* Tabela ou Empty State */}
      {quotes && quotes.length > 0 ? (
        <DataTable
          columns={columns}
          data={quotes}
        />
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Nenhum orçamento</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Você não possui orçamentos nesta visualização.
          </p>
          <div className="mt-5">
            <Link href="/app/quotes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Criar Orçamento
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
