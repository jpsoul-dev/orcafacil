'use client'

import React, { useState } from 'react'
import { Pencil, Eye, Printer, Trash2, MoreHorizontal, Loader2, User, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteReceiptAction, deleteStandaloneReceiptAction } from '@/app/app/quotes/receipt-actions'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
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

interface ReceiptCardProps {
  receipt: ReceiptRow
  onDeleted?: () => void
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

export function ReceiptCard({ receipt, onDeleted }: ReceiptCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const viewUrl = receipt.receipt_type === 'standalone'
    ? `/app/receipts/${receipt.id}`
    : `/app/quotes/${receipt.quote_id}/receipt`

  const editUrl = receipt.receipt_type === 'standalone'
    ? `/app/receipts/${receipt.id}/edit`
    : `/app/quotes/${receipt.quote_id}/receipt/edit`

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('a') || target.closest('[role="button"]')) {
      return
    }
    // Abre a visualização em nova aba ao clicar no card, combinando com a UX de visualização do recibo
    window.open(viewUrl, '_blank')
  }

  const handleDelete = async () => {
    if (!window.confirm('Deseja realmente excluir este recibo? Esta ação removerá definitivamente todos os itens associados e não pode ser desfeita.')) return
    setIsUpdating(true)
    try {
      const res = receipt.receipt_type === 'standalone'
        ? await deleteStandaloneReceiptAction(receipt.id)
        : await deleteReceiptAction(receipt.id, receipt.quote_id || '')

      if (res.success) {
        toast.success('Recibo excluído com sucesso!')
        if (onDeleted) onDeleted()
      } else {
        toast.error(res.error || 'Erro ao excluir recibo.')
      }
    } catch {
      toast.error('Erro ao excluir recibo.')
    } finally {
      setIsUpdating(false)
    }
  }

  const formattedDate = React.useMemo(() => {
    if (!receipt.issued_at) return '—'
    try {
      const [year, month, day] = receipt.issued_at.split('-').map(Number)
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
    } catch {
      return '—'
    }
  }, [receipt.issued_at])

  const paymentLabels: Record<string, string> = {
    pix: 'Pix',
    money: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    bank_transfer: 'Transferência Bancária',
    boleto: 'Boleto',
    other: 'Outro',
  }

  return (
    <Card
      variant="interactive"
      size="sm"
      className="flex flex-col h-full min-h-47.5 justify-between p-4 relative"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between w-full">
        <span className="text-ds-caption font-bold text-muted-foreground uppercase">
          {receipt.receipt_number} - {formattedDate}
        </span>
        <div className="flex items-center gap-2">
          <Badge
            variant={receipt.receipt_type === 'standalone' ? 'outline' : 'secondary'}
            className="rounded-sm font-semibold text-[10px] uppercase shadow-none border border-border"
          >
            {receipt.receipt_type === 'standalone' ? 'Avulso' : `Orc. #${receipt.quote_number}`}
          </Badge>
          
          <div className="relative shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 hover:bg-muted/80 rounded-md cursor-pointer"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-md rounded-lg">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Ações
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuItem
                  render={
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-ds-body-sm text-foreground hover:bg-muted"
                    />
                  }
                >
                  <Eye className="h-4 w-4 text-muted-foreground" /> Visualizar
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => printViaIframe(`${viewUrl}?print=true`)}
                  className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-ds-body-sm text-foreground hover:bg-muted"
                >
                  <Printer className="h-4 w-4 text-muted-foreground" /> Imprimir
                </DropdownMenuItem>

                <DropdownMenuItem
                  render={
                    <Link
                      href={editUrl}
                      className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-ds-body-sm text-foreground hover:bg-muted"
                    />
                  }
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" /> Editar
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-ds-body-sm text-destructive hover:bg-destructive/5 font-semibold"
                >
                  <Trash2 className="h-4 w-4 text-destructive" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 mt-3 grow space-y-3">
        <CardTitle className="text-ds-body-md font-bold text-foreground line-clamp-2 leading-ds-normal font-display">
          {receipt.title || 'Sem título'}
        </CardTitle>

        <div className="space-y-2">
          {/* Cliente */}
          <div className="flex items-center gap-2 text-ds-body-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground font-medium truncate">
              {receipt.customer_name || 'Não informado'}
            </span>
          </div>

          {/* Método de Pagamento */}
          {receipt.payment_method && (
            <div className="flex items-center gap-2 text-ds-caption text-muted-foreground">
              <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">
                Pagamento: {paymentLabels[receipt.payment_method] || receipt.payment_method}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-0 pt-3 border-t border-border mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Valor Recebido</span>
        <span className="text-ds-body-md font-bold text-foreground">
          {brl(Number(receipt.amount) || 0)}
        </span>
      </CardFooter>
    </Card>
  )
}
