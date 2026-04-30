'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export type Quote = {
  id: string
  public_uuid: string
  quote_number: number
  title: string
  total: number
  valid_until: string | null
  created_at: string
  status: 'draft' | 'open' | 'accepted' | 'rejected' | 'expired'
  customers?: { name: string } | null
}

const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'quote_number',
    header: '#',
    cell: ({ row }) => (
      <Link
        href={`/app/quotes/${row.original.id}`}
        className="font-mono text-xs font-bold text-blue-600 hover:underline"
      >
        ORC-{String(row.getValue('quote_number')).padStart(4, '0')}
      </Link>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }) => (
      <div className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]">
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Cliente',
    cell: ({ row }) => {
      const customerName = row.original.customers?.name
      return (
        <div className="text-slate-600 font-medium">
          {customerName || <span className="text-muted-foreground italic">Sem cliente</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'valid_until',
    header: 'Validade',
    cell: ({ row }) => {
      const dateStr = row.getValue('valid_until') as string | null
      if (!dateStr) return <span className="text-slate-400">-</span>
      const date = new Date(dateStr + 'T00:00:00') // Add time to avoid TZ shifts
      return (
        <div className="text-slate-600">
          {date.toLocaleDateString('pt-BR')}
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-muted-foreground">
          {date.toLocaleDateString('pt-BR')}
        </div>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Valor Total',
    cell: ({ row }) => {
      const total = parseFloat(row.getValue('total'))
      return <div className="font-semibold text-primary">{brl(total)}</div>
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const validUntil = row.original.valid_until
      const statusMap: Record<string, { label: string, color: string, dot: string }> = {
        draft: { label: 'Rascunho', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
        open: { label: 'Em Aberto', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
        accepted: { label: 'Aceito', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
        rejected: { label: 'Rejeitado', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
        expired: { label: 'Expirado', color: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
      }

      const config = statusMap[status] || { label: status, color: 'bg-slate-100', dot: 'bg-slate-500' }

      // Se estiver aberto mas a validade passou, mostrar como expirado (visual apenas se o banco não foi atualizado)
      let finalConfig = config
      if (status === 'open' && validUntil) {
        const validDate = new Date(validUntil)
        validDate.setHours(23, 59, 59, 999)
        if (new Date() > validDate) {
          finalConfig = statusMap.expired
        }
      }

      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${finalConfig.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${finalConfig.dot} inline-block`} />
          {finalConfig.label}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const id = row.original.id
      const isDraft = row.original.status === 'draft'

      return (
        <div className="flex items-center justify-end gap-1">
          {!isDraft && (
              <Link href={`/app/quotes/${id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100" title="Ver Detalhes">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver orçameto</span>
                </Button>
              </Link>
          )}
          {isDraft && (
            <Link href={`/app/quotes/${id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Editar Rascunho">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Rascunho</span>
              </Button>
            </Link>
          )}
        </div>
      )
    },
  },
]

