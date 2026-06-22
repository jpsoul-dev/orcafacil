import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CatalogForm } from './catalog-form'
import { Package } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

import { CatalogFilter } from './components/catalog-filter'
import { Badge } from '@/components/ui/badge'
import { DeleteItemDialog } from './delete-item-dialog'

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
        <>
          {/* Listagem Desktop/Tablet */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={items}
              searchKey="name"
              searchPlaceholder="Buscar por nome ou valor..."
            />
          </div>
          
          {/* Listagem Mobile */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CatalogForm
                      initialData={item}
                      trigger={
                        <button className="font-bold text-foreground cursor-pointer hover:text-primary transition-colors text-left text-sm">
                          {item.name}
                        </button>
                      }
                    />
                    {item.type === 'product' ? (
                      <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-none font-bold text-[8px] px-1.5 py-0 rounded uppercase">
                        Prod
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-none font-bold text-[8px] px-1.5 py-0 rounded uppercase">
                        Serv
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                    {item.unit_measure ? ` / ${item.unit_measure}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <CatalogForm initialData={item} asMenuItem={true} />
                  <DeleteItemDialog id={item.id} name={item.name} />
                </div>
              </div>
            ))}
          </div>
        </>
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
