import { createClient } from '@/lib/supabase/server'
import { CatalogForm } from './catalog-form'
import { Package } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from('catalog_items').select('*').order('name')

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">Gerencie seus produtos e serviços.</p>
        </div>
        <CatalogForm />
      </div>

      {/* Tabela ou Empty State */}
      {items && items.length > 0 ? (
        <DataTable
          columns={columns}
          data={items}
          searchKey="name"
          searchPlaceholder="Buscar itens..."
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
