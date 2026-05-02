'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Customer = {
  id: string
  name: string
  document: string
  email: string | null
  phone: string | null
  address_city: string | null
  address_state: string | null
  created_at: string
}

const SortButton = ({ column, label }: { column: any, label: string }) => {
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

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortButton column={column} label="Cliente" />,
    cell: ({ row }) => (
      <div className="font-bold text-foreground">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortButton column={column} label="Email" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email') || '—'}</div>,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <SortButton column={column} label="Telefone" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('phone') || '—'}</div>,
  },
  {
    accessorKey: 'document',
    header: ({ column }) => <SortButton column={column} label="Documento" />,
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('document') || '—'}</div>,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <SortButton column={column} label="Criado em" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-muted-foreground">
          {format(date, 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      )
    },
  },
]
