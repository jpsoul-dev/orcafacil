'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Eye, Printer, Trash2, MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState } from 'react'
import { deleteReceiptAction, deleteStandaloneReceiptAction } from '@/app/app/quotes/receipt-actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export interface ReceiptRow {
  id: string
  user_id: string
  receipt_number: string
  title: string
  amount: number
  payment_method: string
  services_description: string | null
  issued_at: string
  quote_id: string | null
  quote_number: number | null
  customer_id: string | null
  customer_name: string
  receipt_type: 'standalone' | 'quote'
  created_at: string
}

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

const printViaIframe = (url: string) => {
  if (typeof window === 'undefined') return

  const oldIframe = document.getElementById('print-iframe')
  if (oldIframe) {
    document.body.removeChild(oldIframe)
  }

  const iframe = document.createElement('iframe')
  iframe.id = 'print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  iframe.src = url

  document.body.appendChild(iframe)

  setTimeout(() => {
    const activeIframe = document.getElementById('print-iframe')
    if (activeIframe) {
      document.body.removeChild(activeIframe)
    }
  }, 60000)
}

export const columns: ColumnDef<ReceiptRow>[] = [
  {
    accessorKey: 'receipt_number',
    header: 'Recibo',
    cell: ({ row }) => {
      const receipt = row.original
      const targetUrl = receipt.receipt_type === 'standalone'
        ? `/app/receipts/${receipt.id}`
        : `/app/quotes/${receipt.quote_id}/receipt`
      return (
        <Link href={targetUrl} target="_blank">
          <Badge variant="secondary" className="font-semibold rounded-sm cursor-pointer">
            {receipt.receipt_number}
          </Badge>
        </Link>
      )
    },
  },
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }) => (
      <div className="font-semibold text-foreground line-clamp-1 max-w-[200px] text-ds-body-md">
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'receipt_type',
    header: 'Origem',
    cell: ({ row }) => {
      const type = row.original.receipt_type
      const quoteNumber = row.original.quote_number
      return type === 'standalone' ? (
        <Badge variant="outline" className="rounded-sm">
          Avulso
        </Badge>
      ) : (
        <Badge variant="secondary" className="rounded-sm">
          Orçamento #{quoteNumber}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'customer_name',
    header: 'Cliente',
    cell: ({ row }) => (
      <div className="text-muted-foreground font-medium truncate max-w-[150px] text-ds-body-md">
        {row.getValue('customer_name')}
      </div>
    ),
  },
  {
    accessorKey: 'issued_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Emissão
          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue('issued_at') as string
      if (!dateStr) return <span className="text-slate-400">-</span>
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return (
        <div className="text-foreground text-ds-body-md font-medium">{date.toLocaleDateString('pt-BR')}</div>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: 'Valor Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      return <div className="font-semibold text-foreground text-ds-body-md">{brl(amount)}</div>
    },
  },
  {
    id: 'actions',
    header: '',
    cell: function ActionCell({ row }) {
      const receipt = row.original
      const [isUpdating, setIsUpdating] = useState(false)

      const handleDelete = async () => {
        if (!window.confirm('Deseja realmente excluir este recibo? Esta ação removerá definitivamente todos os itens associados e não pode ser desfeita.')) return
        setIsUpdating(true)
        try {
          const res = receipt.receipt_type === 'standalone'
            ? await deleteStandaloneReceiptAction(receipt.id)
            : await deleteReceiptAction(receipt.id, receipt.quote_id || '')
            
          if (res.success) {
            toast.success('Recibo excluído com sucesso!')
          } else {
            toast.error(res.error || 'Erro ao excluir recibo.')
          }
        } catch (err) {
          toast.error('Erro ao excluir recibo.')
        } finally {
          setIsUpdating(false)
        }
      }

      const viewUrl = receipt.receipt_type === 'standalone'
        ? `/app/receipts/${receipt.id}`
        : `/app/quotes/${receipt.quote_id}/receipt`

      const editUrl = receipt.receipt_type === 'standalone'
        ? `/app/receipts/${receipt.id}/edit`
        : `/app/quotes/${receipt.quote_id}/receipt/edit`

      return (
        <div className="flex items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating} />}
            >
              <span className="sr-only">Abrir menu</span>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ações</DropdownMenuLabel>
              </DropdownMenuGroup>
              
              <DropdownMenuItem
                render={
                  <Link
                    href={viewUrl}
                    target="_blank"
                    className="cursor-pointer flex items-center gap-2"
                  />
                }
              >
                <Eye className="h-4 w-4" /> Visualizar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => printViaIframe(`${viewUrl}?print=true`)}
                className="cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Imprimir
              </DropdownMenuItem>

              <DropdownMenuItem
                render={
                  <Link
                    href={editUrl}
                    className="cursor-pointer flex items-center gap-2"
                  />
                }
              >
                <Pencil className="h-4 w-4 text-slate-500" /> Editar
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 font-medium"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
