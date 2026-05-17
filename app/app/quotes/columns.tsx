'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Quote } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { ReopenQuoteDialog } from '@/components/reopen-quote-dialog'
import { QuoteStatusBadge } from '@/components/quote-status-badge'

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
      return <QuoteStatusBadge status={status} />
    },
  },
  {
    id: 'actions',
    header: '',
    cell: function ActionCell({ row }) {
      const quote = row.original
      const isDraft = quote.status === 'draft'
      const isExpired = quote.status === 'expired'
      const [reopenOpen, setReopenOpen] = useState(false)

      return (
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="h-8 w-8 p-0" />}
            >
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4 text-slate-700" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isDraft && (
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/app/quotes/${quote.id}`}
                      target="_blank"
                      className="cursor-pointer flex items-center gap-2"
                    />
                  }
                >
                  <Eye className="h-4 w-4" /> Ver detalhes
                </DropdownMenuItem>
              )}
              {isDraft && (
                <DropdownMenuItem
                  render={
                    <Link
                      href={`/app/quotes/${quote.id}/edit`}
                      className="cursor-pointer flex items-center gap-2 text-amber-600 focus:text-amber-600"
                    />
                  }
                >
                  <Pencil className="h-4 w-4" /> Editar rascunho
                </DropdownMenuItem>
              )}
              {isExpired && (
                <DropdownMenuItem
                  onClick={() => setReopenOpen(true)}
                  className="cursor-pointer flex items-center gap-2 text-indigo-600 focus:text-indigo-600"
                >
                  <RotateCcw className="h-4 w-4" /> Reabrir orçamento
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ReopenQuoteDialog
            quoteId={quote.id}
            open={reopenOpen}
            onOpenChange={setReopenOpen}
          />
        </div>
      )
    },
  },
]
