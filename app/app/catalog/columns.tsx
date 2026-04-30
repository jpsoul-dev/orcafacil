'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Box, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CatalogForm } from './catalog-form'
import { Badge } from '@/components/ui/badge'
import { DeleteItemDialog } from './delete-item-dialog'

export type CatalogItem = {
  id: string
  name: string
  type: 'product' | 'service'
  unit_price: number
  unit_measure: string | null
  created_at: string
}

const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export const columns: ColumnDef<CatalogItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      if (type === 'product') {
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 hover:text-blue-600 border-blue-500/20 font-medium">
            <Box className="mr-1 h-3 w-3" /> Produto
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600 border-orange-500/20 font-medium">
          <Wrench className="mr-1 h-3 w-3" /> Serviço
        </Badge>
      )
    },
  },
  {
    accessorKey: 'unit_price',
    header: 'Valor Unitário',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('unit_price'))
      return <div className="text-foreground">{brl(price)}</div>
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const item = row.original

      return (
        <div className="flex items-center justify-end gap-2">
          <CatalogForm initialData={item} asMenuItem={true} />
          <DeleteItemDialog id={item.id} name={item.name} />
        </div>
      )
    },
  },
]
