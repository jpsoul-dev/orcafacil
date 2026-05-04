'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export type Quote = {
  id: string
  public_uuid: string
  hash_id: string
  title: string
  total: number
  valid_until: string | null
  created_at: string
  status: 'draft' | 'open' | 'accepted' | 'rejected' | 'expired' | 'vencido'
  customers?: { name: string } | null
}

const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'hash_id',
    header: 'Código',
    cell: ({ row }) => (
      <Link
        href={`/app/quotes/${row.original.id}`}
        target="_blank"
        className="font-mono text-sm font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md hover:bg-slate-200 transition-colors"
      >
        {row.original.hash_id}
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
      return <div className="font-semibold">{brl(total)}</div>
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const validUntil = row.original.valid_until
      const statusMap: Record<string, { label: string, className: string }> = {
        draft: { label: 'Rascunho', className: 'bg-slate-900 text-white' },
        open: { label: 'Pendente', className: 'bg-indigo-900 text-white' },
        accepted: { label: 'Aprovado', className: 'bg-emerald-900 text-white' },
        rejected: { label: 'Rejeitado', className: 'bg-red-900 text-white' },
        expired: { label: 'Expirado', className: 'bg-gray-950 text-white' },
        vencido: { label: 'Vencido', className: 'bg-slate-900 text-white' },
      }

      const config = statusMap[status] || { label: status, className: 'bg-slate-500 text-white' }

      // Se estiver aberto mas a validade passou, mostrar como expirado
      let finalConfig = config
      if (status === 'open' && validUntil) {
        const validDate = new Date(validUntil + 'T23:59:59')
        if (new Date() > validDate) {
          finalConfig = statusMap.expired
        }
      }

      return (
        <Badge className={`rounded-md px-3 py-0.5 text-[10px] font-bold border-none shadow-sm ${finalConfig.className}`}>
          {finalConfig.label.toUpperCase()}
        </Badge>
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
            <Link href={`/app/quotes/${id}`} target="_blank">
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

