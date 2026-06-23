'use client'

import { ColumnDef, Column } from '@tanstack/react-table'
import { ArrowUpDown, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { CustomerForm } from './customer-form'
import { DeleteCustomerDialog } from './components/delete-customer-dialog'
import type { Customer } from '@/lib/services/customer-service'

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

const CustomerActions = ({ customer }: { customer: Customer }) => {
  return (
    <div className="flex justify-end items-center gap-1.5">
      <CustomerForm initialData={customer} asMenuItem={true} />
      <DeleteCustomerDialog
        id={customer.id}
        name={customer.name}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0 cursor-pointer rounded-full"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        }
      />
    </div>
  )
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortButton column={column} label="Cliente" />,
    cell: ({ row }) => (
      <Link
        href={`/app/customers/${row.original.id}`}
        className="font-bold text-foreground hover:text-primary hover:underline transition-colors font-display"
      >
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'email',
    header: () => <div className="font-bold text-foreground">Email</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground font-medium">
        {row.getValue('email') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: () => <div className="font-bold text-foreground">Telefone</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground font-medium tabular-nums">
        {row.getValue('phone') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'document',
    header: () => <div className="font-bold text-foreground">Documento</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground font-medium tabular-nums">
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
        <div className="text-muted-foreground font-medium tabular-nums">
          {format(date, 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CustomerActions customer={row.original} />,
  },
]
