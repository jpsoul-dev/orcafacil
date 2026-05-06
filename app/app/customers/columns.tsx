'use client'

import { ColumnDef, Column } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

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

const SortButton = ({
  column,
  label,
}: {
  column: Column<Customer, unknown>
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

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortButton column={column} label="Cliente" />,
    cell: ({ row }) => (
      <Link
        href={`/app/customers/${row.original.id}`}
        className="font-bold text-foreground hover:text-blue-600 hover:underline transition-colors"
      >
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'email',
    header: () => <div className="font-bold text-foreground">Email</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue('email') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: () => <div className="font-bold text-foreground">Telefone</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue('phone') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'document',
    header: () => <div className="font-bold text-foreground">Documento</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue('document') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <SortButton column={column} label="Data cadastro" />
    ),
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
