'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Quote } from '@/types'

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'hash_id',
    header: 'Código',
    cell: ({ row }) => (
      <Link href={`/app/quotes/${row.original.id}`} target="_blank">
        <Badge variant="secondary">{row.original.hash_id}</Badge>
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
      return (
        <div className="text-slate-00 font-medium">
          {row.original.customers?.name}
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
      const date = new Date(dateStr + 'T00:00:00')
      return (
        <div className="text-slate-800">{date.toLocaleDateString('pt-BR')}</div>
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
          Data cadastro
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-slate-800">{date.toLocaleDateString('pt-BR')}</div>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Valor Total',
    cell: ({ row }) => {
      const total = parseFloat(row.getValue('total'))
      return <div className="font-semibold text-slate-800">{brl(total)}</div>
    },
  },
  {
    id: 'status',
    header: 'Situação',
    cell: ({ row }) => {
      const status = row.original.status
      const statusMap: Record<string, { label: string; className: string }> = {
        draft: { label: 'Rascunho', className: 'bg-slate-900 text-white' },
        open: { label: 'Em aberto', className: 'bg-indigo-900 text-white' },
        accepted: { label: 'Aprovado', className: 'bg-emerald-900 text-white' },
        rejected: { label: 'Rejeitado', className: 'bg-red-900 text-white' },
        expired: { label: 'Expirado', className: 'bg-slate-950 text-white' },
      }

      const config = statusMap[status] || {
        label: status,
        className: 'bg-slate-500 text-white',
      }

      return (
        <Badge
          className={`rounded-md px-3 py-0.5 text-xs font-bold border-none shadow-sm ${config.className}`}
        >
          {config.label.toUpperCase()}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                title="Ver Detalhes"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver orçameto</span>
              </Button>
            </Link>
          )}
          {isDraft && (
            <Link href={`/app/quotes/${id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                title="Editar Rascunho"
              >
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
