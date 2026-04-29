'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, Pencil, Copy, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export type Quote = {
  id: string
  public_uuid: string
  quote_number: number
  title: string
  total: number
  valid_until: string | null
  created_at: string
  status: 'draft' | 'completed'
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
        #{String(row.getValue('quote_number')).padStart(3, '0')}
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

      // Rascunho tem prioridade
      if (status === 'draft') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            Rascunho
          </span>
        )
      }

      // Verificar se expirou
      if (validUntil) {
        const validDate = new Date(validUntil)
        validDate.setHours(23, 59, 59, 999)
        if (new Date() > validDate) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Expirado
            </span>
          )
        }
      }

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Válido
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const uuid = row.original.public_uuid
      const id = row.original.id
      const isDraft = row.original.status === 'draft'

      const handleCopyLink = () => {
        const url = `${window.location.origin}/quote/${uuid}`
        navigator.clipboard.writeText(url)
        toast.success('Link do orçamento copiado!')
      }

      return (
        <div className="flex items-center justify-end gap-1">
          {!isDraft && (
            <>
              <Link href={`/app/quotes/${id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100" title="Ver Detalhes">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver Detalhes</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" 
                title="Copiar Link Público"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copiar Link Público</span>
              </Button>
            </>
          )}
          {isDraft ? (
            <Link href={`/app/quotes/${id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Editar Rascunho">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar Rascunho</span>
              </Button>
            </Link>
          ) : (
            <Link href={`/quote/${uuid}`} target="_blank">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-blue-50" title="Abrir Página Pública">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Abrir Página Pública</span>
              </Button>
            </Link>
          )}
        </div>
      )
    },
  },
]

