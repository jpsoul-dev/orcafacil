'use client'

import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { QuoteStatusBadge } from '@/components/quote-status-badge'

type Quote = {
  id: string
  quote_number: number
  title: string
  total: number
  valid_until: string | null
  created_at: string
  status: string
}

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'quote_number',
    header: 'Orçamento',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          href={`/app/quotes/${row.original.id}`}
          target="_blank"
          className="font-bold text-foreground hover:text-primary hover:underline transition-colors font-display"
        >
          {row.original.title}
        </Link>
        <span className="text-sm text-muted-foreground font-mono">
          #{row.original.quote_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      let status = row.original.status

      // Map old statuses if they occur, or if status needs adjusting
      if (status === 'open') {
        status = 'pending'
      } else if (status === 'accepted') {
        status = 'approved'
      } else if (status === 'vencido') {
        status = 'expired'
      }

      // Check if expired if it's pending (open)
      if (status === 'pending' && row.original.valid_until) {
        if (new Date() > new Date(row.original.valid_until)) {
          status = 'expired'
        }
      }

      return <QuoteStatusBadge status={status} />
    },
  },
  {
    accessorKey: 'total',
    header: 'Valor Total',
    cell: ({ row }) => (
      <div className="font-semibold text-foreground tabular-nums">
        {brl(row.original.total)}
      </div>
    ),
  },
  {
    accessorKey: 'valid_until',
    header: 'Vencimento',
    cell: ({ row }) => {
      if (!row.original.valid_until)
        return <span className="text-muted-foreground">—</span>
      return (
        <div className="text-muted-foreground font-medium tabular-nums">
          {new Date(row.original.valid_until + 'T00:00:00').toLocaleDateString(
            'pt-BR',
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Criado em',
    cell: ({ row }) => (
      <div className="text-muted-foreground font-medium tabular-nums">
        {new Date(row.original.created_at).toLocaleDateString('pt-BR')}
      </div>
    ),
  },
]

export function CustomerQuotesClient({ quotes }: { quotes: Quote[] }) {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed rounded-xl border-border">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-semibold text-foreground font-display">
          Nenhum orçamento encontrado
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          Este cliente ainda não possui orçamentos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl">
      <DataTable columns={columns} data={quotes} />
    </div>
  )
}
