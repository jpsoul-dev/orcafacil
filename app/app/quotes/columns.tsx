'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Eye, Printer, Receipt, Trash2, CheckCircle, XCircle, Ban, RotateCcw, MoreHorizontal, Loader2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Quote } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { ReopenQuoteDialog } from '@/components/reopen-quote-dialog'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { deleteQuote, updateQuoteStatus } from '@/app/app/quotes/actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

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

export const columns: ColumnDef<Quote>[] = [
  {
    accessorKey: 'quote_number',
    header: 'Código',
    cell: ({ row }) => {
      const isDraft = row.original.status === 'draft'
      const targetUrl = isDraft
        ? `/app/quotes/${row.original.id}/edit`
        : `/app/quotes/${row.original.id}`
      return (
        <Link href={targetUrl} target="_blank">
          <Badge variant="outline" className="text-ds-caption font-semibold rounded-sm border-border bg-muted/30 text-muted-foreground">#{row.original.quote_number}</Badge>
        </Link>
      )
    },
  },
  {
    accessorKey: 'title',
    header: 'Título',
    cell: ({ row }) => (
      <div className="text-ds-body-md font-semibold text-foreground line-clamp-1 max-w-[200px]">
        {row.getValue('title')}
      </div>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Cliente',
    cell: ({ row }) => {
      return (
        <div className="text-ds-body-md font-medium text-foreground">
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
      if (!dateStr) return <span className="text-ds-body-md text-ds-color-text-disabled">-</span>
      const date = new Date(dateStr + 'T00:00:00')
      return (
        <div className="text-ds-body-md text-foreground">{date.toLocaleDateString('pt-BR')}</div>
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
        <div className="text-ds-body-md text-foreground">{date.toLocaleDateString('pt-BR')}</div>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Valor Total',
    cell: ({ row }) => {
      const total = parseFloat(row.getValue('total'))
      return <div className="text-ds-body-md font-semibold text-foreground tabular-nums">{brl(total)}</div>
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
      const canReopen = ['expired', 'rejected', 'cancelled'].includes(quote.status)
      const [reopenOpen, setReopenOpen] = useState(false)
      const [cancelOpen, setCancelOpen] = useState(false)
      const [reason, setReason] = useState('')
      const [isUpdating, setIsUpdating] = useState(false)

      const handleUpdateStatus = async (status: string) => {
        setIsUpdating(true)
        try {
          const res = await updateQuoteStatus(quote.id, status)
          if (res.success) {
            toast.success('Situação do orçamento atualizada!')
          } else {
            toast.error(res.error || 'Erro ao atualizar situação.')
          }
        } catch (err) {
          toast.error('Erro ao atualizar situação.')
        } finally {
          setIsUpdating(false)
        }
      }

      const handleDelete = async () => {
        if (!window.confirm('Deseja realmente excluir este rascunho? Esta ação não pode ser desfeita.')) return
        setIsUpdating(true)
        try {
          const res = await deleteQuote(quote.id)
          if (res.success) {
            toast.success('Rascunho excluído com sucesso!')
          } else {
            toast.error(res.error || 'Erro ao excluir rascunho.')
          }
        } catch (err) {
          toast.error('Erro ao excluir rascunho.')
        } finally {
          setIsUpdating(false)
        }
      }

      const handleCancelConfirm = async () => {
        if (reason.trim().length < 5) {
          toast.error('O motivo deve ter no mínimo 5 caracteres.')
          return
        }
        setIsUpdating(true)
        setCancelOpen(false)
        try {
          const res = await updateQuoteStatus(quote.id, 'cancelled', reason)
          if (res.success) {
            toast.success('Orçamento cancelado!')
            setReason('')
          } else {
            toast.error(res.error || 'Erro ao cancelar orçamento.')
          }
        } catch (err) {
          toast.error('Erro ao cancelar orçamento.')
        } finally {
          setIsUpdating(false)
        }
      }

      const hasReceipt = !!quote.quote_receipts?.id

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
                <MoreHorizontal className="h-4 w-4 text-slate-700" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ações</DropdownMenuLabel>
              </DropdownMenuGroup>

              {!isDraft && (
                <>
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/app/quotes/${quote.id}`}
                        target="_blank"
                        className="cursor-pointer flex items-center gap-2"
                      />
                    }
                  >
                    <Eye className="h-4 w-4" /> Ver orçamento
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => printViaIframe(`/app/quotes/${quote.id}?print=true`)}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" /> Imprimir Orçamento
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/app/quotes/new?clone=${quote.id}`}
                        className="cursor-pointer flex items-center gap-2"
                      />
                    }
                  >
                    <Copy className="h-4 w-4 text-blue-500" /> Clonar Orçamento
                  </DropdownMenuItem>
                </>
              )}

              {isDraft && (
                <>
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/app/quotes/${quote.id}/edit`}
                        className="cursor-pointer flex items-center gap-2 text-amber-600 focus:text-amber-600 font-medium"
                      />
                    }
                  >
                    <Pencil className="h-4 w-4" /> Editar rascunho
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 font-medium"
                  >
                    <Trash2 className="h-4 w-4" /> Excluir rascunho
                  </DropdownMenuItem>
                </>
              )}

              {/* Opções de Recibo se concluído */}
              {quote.status === 'completed' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recibo</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  {hasReceipt ? (
                    <>
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/app/quotes/${quote.id}/receipt`}
                            target="_blank"
                            className="cursor-pointer flex items-center gap-2 text-teal-600 focus:text-teal-600 font-medium"
                          />
                        }
                      >
                        <Eye className="h-4 w-4" /> Ver Recibo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => printViaIframe(`/app/quotes/${quote.id}/receipt?print=true`)}
                        className="cursor-pointer flex items-center gap-2 text-teal-600 focus:text-teal-600"
                      >
                        <Printer className="h-4 w-4" /> Imprimir Recibo
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      render={
                        <Link
                          href={`/app/quotes/${quote.id}/receipt/edit`}
                          className="cursor-pointer flex items-center gap-2 text-teal-600 focus:text-teal-600 font-medium"
                        />
                      }
                    >
                      <Receipt className="h-4 w-4" /> Gerar Recibo
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* Status Transitions */}
              {(quote.status === 'draft' || quote.status === 'pending' || quote.status === 'approved') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mudar Status</DropdownMenuLabel>
                  </DropdownMenuGroup>

                  {quote.status === 'draft' && (
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus('pending')}
                      className="cursor-pointer flex items-center gap-2 font-medium"
                    >
                      <CheckCircle className="h-4 w-4 text-indigo-500" /> Ativar (Pendente)
                    </DropdownMenuItem>
                  )}

                  {quote.status === 'pending' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus('approved')}
                        className="cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500" /> Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus('rejected')}
                        className="cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <XCircle className="h-4 w-4 text-rose-500" /> Rejeitar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCancelOpen(true)}
                        className="cursor-pointer flex items-center gap-2 font-medium text-red-600 focus:text-red-600"
                      >
                        <Ban className="h-4 w-4" /> Cancelar
                      </DropdownMenuItem>
                    </>
                  )}

                  {quote.status === 'approved' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus('completed')}
                        className="cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <CheckCircle className="h-4 w-4 text-teal-500" /> Finalizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCancelOpen(true)}
                        className="cursor-pointer flex items-center gap-2 font-medium text-red-600 focus:text-red-600"
                      >
                        <Ban className="h-4 w-4" /> Cancelar
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}

              {canReopen && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setReopenOpen(true)}
                    className="cursor-pointer flex items-center gap-2 text-indigo-600 focus:text-indigo-600 font-medium"
                  >
                    <RotateCcw className="h-4 w-4" /> Reabrir orçamento
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ReopenQuoteDialog
            quoteId={quote.id}
            open={reopenOpen}
            onOpenChange={setReopenOpen}
          />

          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-lg bg-card border-border shadow-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-ds-heading-sm font-bold text-foreground">Cancelar Orçamento</DialogTitle>
                <DialogDescription className="text-ds-body-sm text-muted-foreground">
                  Por favor, informe o motivo do cancelamento deste orçamento. Esta justificativa ficará registrada no documento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="list-cancel-reason" className="text-ds-body-sm font-semibold text-foreground">
                    Motivo do Cancelamento <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="list-cancel-reason"
                    placeholder="Ex: Cliente fechou com outro concorrente / Orçamento fora do limite planejado"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[100px] resize-none border-border rounded-sm bg-card text-ds-body-md focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 duration-ds-fast"
                  />
                  <p className="text-ds-caption text-muted-foreground">
                    O motivo deve possuir no mínimo 5 caracteres.
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCancelOpen(false)
                    setReason('')
                  }}
                  className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={reason.trim().length < 5}
                  onClick={handleCancelConfirm}
                  className="rounded-md font-semibold bg-destructive text-destructive-foreground transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                >
                  Confirmar Cancelamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
]
