'use client'

import { ColumnDef, Column } from '@tanstack/react-table'
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

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

const SortButton = ({
  column,
  label,
}: {
  column: Column<CatalogItem, unknown>
  label: string
}) => {
  return (
    <Button
      variant="ghost"
      className="-ml-4 hover:bg-transparent font-bold text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />
    </Button>
  )
}

export const columns: ColumnDef<CatalogItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortButton column={column} label="Nome" />,
    cell: ({ row }) => (
      <div className="font-bold text-foreground">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: () => <div className="font-bold text-foreground">Tipo</div>,
    cell: ({ row }) => {
      const type = row.original.type
      if (type === 'product') {
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 hover:text-blue-600 border-blue-500/20 font-medium"
          >
            <Box className="mr-1 h-3 w-3" /> Produto
          </Badge>
        )
      }
      return (
        <Badge
          variant="outline"
          className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600 border-orange-500/20 font-medium"
        >
          <Wrench className="mr-1 h-3 w-3" /> Serviço
        </Badge>
      )
    },
  },
  {
    accessorKey: 'unit_price',
    header: ({ column }) => (
      <SortButton column={column} label="Valor Unitário" />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('unit_price'))
      return <div className="text-foreground font-medium">{brl(price)}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex justify-end items-center gap-2">
        <CatalogForm
          initialData={row.original}
          asMenuItem={true}
        />
        <DeleteItemDialog id={row.original.id} name={row.original.name} />
      </div>
    ),
  },
]
