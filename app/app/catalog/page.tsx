import { createClient } from '@/lib/supabase/server'
import { CatalogForm } from './catalog-form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Box, Wrench } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu'

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from('catalog_items').select('*').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
          <p className="text-muted-foreground">Gerencie seus produtos e serviços.</p>
        </div>
        <CatalogForm />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome do Item</TableHead>
              <TableHead>Valor Unitário</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.type === 'product' ? (
                      <span className="flex items-center text-sm text-blue-600"><Box className="mr-1 h-4 w-4" /> Produto</span>
                    ) : (
                      <span className="flex items-center text-sm text-orange-600"><Wrench className="mr-1 h-4 w-4" /> Serviço</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                  </TableCell>
                  <TableCell>{item.type === 'product' ? item.unit_measure : '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <CatalogForm 
                            initialData={item} 
                            asMenuItem={true}
                          />
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum item cadastrado no catálogo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
