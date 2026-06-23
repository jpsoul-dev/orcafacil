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
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground">
            Gerenciar Catálogo
          </h2>
          <p className="text-muted-foreground text-ds-body-sm font-medium mt-1">
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
                className="bg-card border border-border p-4 rounded-md flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CatalogForm
                      initialData={item}
                      trigger={
                        <button className="font-semibold text-foreground cursor-pointer hover:text-primary transition-all duration-ds-fast text-left text-ds-body-md">
                          {item.name}
                        </button>
                      }
                    />
                    <Badge variant={item.type === 'product' ? 'outline' : 'secondary'} className="rounded-sm font-semibold text-[10px] uppercase">
                      {item.type === 'product' ? 'Prod' : 'Serv'}
                    </Badge>
                  </div>
                  <p className="text-ds-body-sm text-muted-foreground font-medium">
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
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-ds-heading-xs text-foreground">Catálogo vazio</h3>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
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
