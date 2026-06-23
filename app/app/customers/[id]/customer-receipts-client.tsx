'use client'

import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Receipt, Link2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type ReceiptData = {
  id: string
  receipt_number: string
  title: string | null
  amount: number | string
  payment_method: string | null
  issued_at: string
  quote_id: string | null
}

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

const columns: ColumnDef<ReceiptData>[] = [
  {
    accessorKey: 'receipt_number',
    header: 'Recibo',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          href={`/app/receipts/${row.original.id}`}
          target="_blank"
          className="font-bold text-foreground hover:underline font-display"
        >
          {row.original.title || 'Recibo sem título'}
        </Link>
        <span className="text-sm text-muted-foreground font-mono">
          #{row.original.receipt_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'quote_id',
    header: 'Origem',
    cell: ({ row }) => {
      const quoteId = row.original.quote_id
      if (quoteId) {
        return (
          <div className="flex items-center gap-1.5">
            <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-none font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase hover:bg-blue-500/15">
              Vinculado
            </Badge>
            <Link
              href={`/app/quotes/${quoteId}`}
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Ver orçamento de origem"
            >
              <Link2 className="h-3.5 w-3.5" />
            </Link>
          </div>
        )
      }
      return (
        <Badge className="bg-slate-500/10 text-slate-500 border border-slate-500/20 shadow-none font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase hover:bg-slate-500/15">
          Avulso
        </Badge>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: 'Valor Total',
    cell: ({ row }) => {
      const price = parseFloat(row.original.amount as string)
      return (
        <div className="font-semibold text-foreground tabular-nums">
          {brl(isNaN(price) ? 0 : price)}
        </div>
      )
    },
  },
  {
    accessorKey: 'payment_method',
    header: 'Forma de Pagamento',
    cell: ({ row }) => (
      <div className="text-muted-foreground font-medium">
        {row.original.payment_method || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'issued_at',
    header: 'Emitido em',
    cell: ({ row }) => {
      if (!row.original.issued_at) return <span className="text-slate-400">—</span>
      return (
        <div className="text-muted-foreground font-medium tabular-nums">
          {new Date(row.original.issued_at + 'T00:00:00').toLocaleDateString('pt-BR')}
        </div>
      )
    },
  },
]

export function CustomerReceiptsClient({ receipts }: { receipts: ReceiptData[] }) {
  if (!receipts || receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed rounded-xl border-border">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-semibold text-foreground font-display">
          Nenhum recibo encontrado
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          Este cliente ainda não possui recibos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl">
      <DataTable columns={columns} data={receipts} />
    </div>
  )
}
