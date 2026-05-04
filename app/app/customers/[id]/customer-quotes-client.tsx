'use client'

import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { FileText, ArrowUpDown, Calendar, DollarSign, Eye } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Quote = {
  id: string
  hash_id: string
  title: string
  total: number
  valid_until: string | null
  created_at: string
  status: 'draft' | 'open' | 'accepted' | 'rejected' | 'expired' | 'vencido'
}

const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'quote_number',
    header: 'Orçamento',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          href={`/app/quotes/${row.original.id}`}
          target="_blank"
          className="font-bold text-slate-900 hover:underline"
        >
          {row.original.title}
        </Link>
        <span className="text-sm text-slate-400 font-mono">
          {row.original.hash_id}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const statusMap: Record<string, { label: string, className: string }> = {
        draft: { label: 'Rascunho', className: 'bg-slate-900 text-white' },
        open: { label: 'Pendente', className: 'bg-indigo-900 text-white' },
        accepted: { label: 'Aprovado', className: 'bg-emerald-900 text-white' },
        rejected: { label: 'Rejeitado', className: 'bg-red-900 text-white' },
        expired: { label: 'Expirado', className: 'bg-gray-950 text-white' },
        vencido: { label: 'Vencido', className: 'bg-slate-900 text-white' },
      }

      const config = statusMap[status] || { label: status, className: 'bg-slate-500 text-white' }

      // Custom check for expired if open
      let finalConfig = config
      if (status === 'open' && row.original.valid_until) {
        if (new Date() > new Date(row.original.valid_until)) {
          finalConfig = statusMap.expired
        }
      }

      return (
        <Badge className={`rounded-md px-3 py-0.5 text-[11px] font-bold border-none shadow-sm ${finalConfig.className}`}>
          {finalConfig.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Valor Total',
    cell: ({ row }) => (
      <div className="font-semibold text-slate-900">
        {brl(row.original.total)}
      </div>
    ),
  },
  {
    accessorKey: 'valid_until',
    header: 'Vencimento',
    cell: ({ row }) => {
      if (!row.original.valid_until) return <span className="text-slate-400">-</span>
      return (
        <div className="text-slate-600 text-sm">
          {new Date(row.original.valid_until + 'T00:00:00').toLocaleDateString('pt-BR')}
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Criado em',
    cell: ({ row }) => (
      <div className="text-slate-600 text-sm">
        {new Date(row.original.created_at).toLocaleDateString('pt-BR')}
      </div>
    ),
  },
]

export function CustomerQuotesClient({ quotes }: { quotes: any[] }) {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-dashed rounded-xl border-slate-200">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="font-medium text-slate-900">Nenhum orçamento encontrado</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
          Este cliente ainda não possui orçamentos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl">
      <DataTable
        columns={columns as any}
        data={quotes}
      />
    </div>
  )
}
