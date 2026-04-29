'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomerForm } from './customer-form'

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

export const columns: ColumnDef<Customer>[] = [
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
    accessorKey: 'document',
    header: 'CPF/CNPJ',
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('document') || '—'}</div>,
  },
  {
    id: 'contato',
    header: 'Contato',
    cell: ({ row }) => {
      const phone = row.original.phone
      const email = row.original.email
      return (
        <div className="flex flex-col gap-0.5">
          {phone && (
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {phone}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {email}
            </div>
          )}
          {!phone && !email && <span className="text-muted-foreground">—</span>}
        </div>
      )
    },
  },
  {
    id: 'local',
    header: 'Local',
    cell: ({ row }) => {
      const city = row.original.address_city
      const state = row.original.address_state
      if (!city && !state) return <span className="text-muted-foreground">—</span>
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {city}{city && state ? '/' : ''}{state}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const customer = row.original

      return (
        <div className="flex items-center justify-end">
          <CustomerForm initialData={customer} asMenuItem={true} />
        </div>
      )
    },
  },
]
