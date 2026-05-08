import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CatalogForm } from './catalog-form'
import { Package } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

import { CatalogFilter } from './components/catalog-filter'

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase.from('catalog_items').select('*').eq('user_id', user.id).order('name')

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data: items } = await query

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Gerenciar Catálogo
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Cadastre e gerencie seus produtos e serviços.
          </p>
        </div>
        <CatalogForm />
      </div>

      <CatalogFilter />

      {/* Tabela ou Empty State */}
      {items && items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          searchKey="name"
          searchPlaceholder="Buscar por nome ou valor..."
        />
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Catálogo vazio</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Adicione produtos ou serviços ao catálogo.
          </p>
          <div className="mt-5">
            <CatalogForm />
          </div>
        </div>
      )}
    </div>
  )
}
