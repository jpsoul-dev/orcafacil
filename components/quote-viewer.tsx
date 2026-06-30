'use client'

import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { maskPhone } from '@/lib/masks'


import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SubscriptionGuard } from '@/components/subscription-guard'
import {
  Printer,
  RotateCcw,
  FileText,
  Receipt,
  Info,
  CloudDownload,
  Pencil,
  Trash2,
  Copy,
  CheckCircle,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  updateQuoteStatus,
  deleteQuote,
} from '@/app/app/quotes/actions'
import { triggerHaptic } from '@/lib/haptic'

import { ReopenQuoteDialog } from '@/components/reopen-quote-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  type QuoteStatus,
  type Quote,
} from '@/types/quote'

import { formatBRL } from '@/lib/utils'
const brl = formatBRL

interface QuoteViewerProps {
  quote: Quote
  receiptId?: string | null
}

const STATUS_MAP: Record<
  QuoteStatus,
  { label: string; color: string; dot: string }
> = {
  draft: {
    label: 'Rascunho',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-neutral-400',
  },
  pending: {
    label: 'Pendente',
    color: 'bg-status-pending-bg text-status-pending-fg border-status-pending/20',
    dot: 'bg-status-pending',
  },
  approved: {
    label: 'Aprovado',
    color: 'bg-status-approved-bg text-status-approved-fg border-status-approved/20',
    dot: 'bg-status-approved',
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-status-rejected-bg text-status-rejected-fg border-status-rejected/20',
    dot: 'bg-status-rejected',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-status-cancelled-bg text-status-cancelled-fg border-status-cancelled/20',
    dot: 'bg-status-cancelled',
  },
  completed: {
    label: 'Finalizado',
    color: 'bg-status-completed-bg text-status-completed-fg border-status-completed/20',
    dot: 'bg-status-completed',
  },
  expired: {
    label: 'Vencido',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-neutral-500',
  },
}


export function QuoteViewer({ quote, receiptId: initialReceiptId }: QuoteViewerProps) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<QuoteStatus>(quote.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isReopenOpen, setIsReopenOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [currentCancellationReason, setCurrentCancellationReason] = useState<string | null>(quote.cancellation_reason || null)
  const [receiptId] = useState<string | null>(initialReceiptId || null)

  const handleConfirmDelete = async () => {
    setIsUpdating(true)
    setDeleteDialogOpen(false)
    try {
      const res = await deleteQuote(quote.id)
      if (res.success) {
        triggerHaptic('success')
        toast.success('Rascunho excluído com sucesso!')
        router.push('/app/quotes')
      } else {
        triggerHaptic('error')
        toast.error(res.error || 'Erro ao excluir rascunho.')
        setIsUpdating(false)
      }
    } catch (err) {
      triggerHaptic('error')
      toast.error('Erro ao excluir rascunho.')
      setIsUpdating(false)
    }
  }

  const [prevQuote, setPrevQuote] = useState(quote)
  if (quote.id !== prevQuote.id || quote.status !== prevQuote.status || quote.cancellation_reason !== prevQuote.cancellation_reason) {
    setPrevQuote(quote)
    setCurrentStatus(quote.status)
    setCurrentCancellationReason(quote.cancellation_reason || null)
  }

  const handleStatusChange = async (newStatus: QuoteStatus | null) => {
    if (!newStatus || isUpdating) return
    if (newStatus === 'cancelled') {
      setCancelDialogOpen(true)
      return
    }
    const previousStatus = currentStatus
    setIsUpdating(true)
    setCurrentStatus(newStatus)
    try {
      const result = await updateQuoteStatus(quote.id, newStatus)
      if (result.error) {
        triggerHaptic('error')
        toast.error('Erro ao atualizar status: ' + result.error)
        setCurrentStatus(previousStatus)
      } else {
        triggerHaptic('success')
        toast.success(`Status alterado para ${STATUS_MAP[newStatus].label}`)
      }
    } catch (error) {
      triggerHaptic('error')
      console.error('CLIENT ERROR in updateQuoteStatus:', error)
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Ocorreu um erro ao atualizar o status: ' + message)
      setCurrentStatus(previousStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (cancellationReason.trim().length < 5) {
      triggerHaptic('light')
      toast.error('O motivo do cancelamento deve possuir no mínimo 5 caracteres.')
      return
    }
    const previousStatus = currentStatus
    setIsUpdating(true)
    setCurrentStatus('cancelled')
    setCancelDialogOpen(false)
    try {
      const result = await updateQuoteStatus(quote.id, 'cancelled', cancellationReason)
      if (result.error) {
        triggerHaptic('error')
        toast.error('Erro ao cancelar orçamento: ' + result.error)
        setCurrentStatus(previousStatus)
      } else {
        triggerHaptic('success')
        toast.success('Orçamento cancelado com sucesso!')
        setCurrentCancellationReason(cancellationReason)
      }
    } catch (error) {
      triggerHaptic('error')
      console.error(error)
      toast.error('Ocorreu um erro ao tentar cancelar o orçamento.')
      setCurrentStatus(previousStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 pb-12 sm:pb-8 px-0 sm:px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start justify-center print:block print:max-w-none">

        {/* DOCUMENT CONTAINER (ESQUERDA) */}
        <div className="w-full lg:max-w-[21cm] shrink-0 print:w-full print:max-w-none order-1 lg:order-0">
          {/* DOCUMENT CONTAINER */}
          <div className="max-w-[21cm] mx-auto bg-card border-x-0 sm:border border-border shadow-none sm:shadow-lg rounded-none sm:rounded-md min-h-0 sm:min-h-[29.7cm] p-4 sm:p-12 md:p-16 print:shadow-none print:max-w-none print:p-0 print:m-0 relative print:overflow-visible overflow-hidden flex flex-col justify-between print:block print:min-h-0 print:h-auto print:flex-none">
            <style dangerouslySetInnerHTML={{
              __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 1.5cm 1.5cm 2.2cm 1.5cm;
            }
            body {
              background-color: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-no-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            thead {
              display: table-header-group !important;
            }
            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .print-footer {
              margin-top: 3rem !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .print-system-footer {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              padding-left: 1.5cm !important;
              padding-right: 1.5cm !important;
              height: 1cm !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              font-size: 10px !important;
              color: #64748b !important;
              border-top: 1px solid #e2e8f0 !important;
              background-color: white !important;
              opacity: 1 !important;
            }
          }
        `}} />

            <div>


              {/* QUOTE IDENTIFICATION */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start my-6">
                <div>
                  <h1 className="text-ds-heading-lg font-bold text-foreground">Orçamento</h1>
                  {quote.title && (
                    <p className="text-ds-body-sm font-medium text-muted-foreground mt-1 italic">{quote.title}</p>
                  )}
                </div>
                <div className="text-left sm:text-right flex flex-col justify-between items-start sm:items-end min-h-12.5">
                  {quote.show_quote_number && (
                    <span className="text-ds-heading-sm font-bold text-foreground">N° {quote.quote_number}</span>
                  )}
                  <div className="text-ds-caption font-semibold text-muted-foreground mt-auto">
                    <span className="font-medium">Válido até: </span>
                    <span className="text-foreground font-bold">
                      {quote.valid_until
                        ? format(
                          parseISO(quote.valid_until),
                          "d 'de' MMMM 'de' yyyy",
                          { locale: ptBR },
                        )
                        : 'A combinar'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border my-4" />

              {/* CUSTOMER INFO */}
              <div className="text-ds-body-sm text-foreground space-y-1.5 my-6 leading-ds-relaxed">
                <div>
                  <span className="font-bold text-foreground">Orçamento para:</span>{' '}
                  <span className="text-muted-foreground">{quote.customer?.name || '---'}</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">CPF/CNPJ:</span>{' '}
                  <span className="text-muted-foreground">{quote.customer?.document || '---'}</span>
                </div>
                {(() => {
                  const customerContacts = [
                    quote.customer?.phone && maskPhone(quote.customer.phone),
                    quote.customer?.whatsapp && maskPhone(quote.customer.whatsapp),
                    quote.customer?.email,
                  ].filter(Boolean).join(' | ')

                  if (!customerContacts) return null
                  return (
                    <div>
                      <span className="font-bold text-foreground">Contatos:</span>{' '}
                      <span className="text-muted-foreground">{customerContacts}</span>
                    </div>
                  )
                })()}
              </div>

              {/* ITEMS TABLE */}
              {/* Mobile Item List (Exibida apenas no celular) */}
              <div className="sm:hidden space-y-3 my-6">
                {quote.items?.map((item, idx) => (
                  <div key={idx} className="border border-border rounded-md p-3 bg-card flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-foreground text-ds-body-sm wrap-break-word flex-1">
                        {item.item_name}
                      </span>
                      <span className="text-ds-body-sm font-bold text-foreground tabular-nums shrink-0">
                        {brl(item.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-ds-caption text-muted-foreground">
                      <span>Qtd: <strong className="text-foreground font-semibold">{item.quantity}</strong></span>
                      <span>Unit: <strong className="text-foreground font-semibold">{brl(item.unit_price)}</strong></span>
                    </div>
                    {Number(item.discount_value) > 0 && (
                      <div className="text-right text-ds-caption text-success font-semibold">
                        {(() => {
                          const discountInMoney = item.discount_type === 'percentage'
                            ? (item.quantity * item.unit_price) * ((item.discount_value || 0) / 100)
                            : (item.discount_value || 0)
                          return `Desconto: - ${brl(discountInMoney)}`
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table (Oculta no celular) */}
              <div className="hidden sm:block border border-border rounded-md my-6 w-full overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs min-w-125 sm:min-w-0">
                  <thead>
                    <tr className="bg-muted/50 text-foreground font-semibold uppercase tracking-wider text-ds-caption border-b border-border">
                      <th className="py-2 px-3 text-left w-[50%] border-r border-border">DESCRIÇÃO</th>
                      <th className="py-2 px-3 text-left w-[20%] border-r border-border">VALOR</th>
                      <th className="py-2 px-3 text-center w-[10%] border-r border-border">QTD.</th>
                      <th className="py-2 px-3 text-left w-[20%]">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground font-medium text-ds-body-sm">
                    {quote.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-3 text-left border-r border-border font-normal">
                          {item.item_name}
                        </td>
                        <td className="py-2 px-3 text-left border-r border-border tabular-nums font-semibold">
                          {brl(item.unit_price)}
                        </td>
                        <td className="py-2 px-3 text-center border-r border-border tabular-nums font-semibold">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-left tabular-nums font-bold text-foreground">
                          <div className="flex flex-col">
                            <span>{brl(item.subtotal)}</span>
                            {Number(item.discount_value) > 0 && (
                              <span className="text-ds-caption font-normal text-muted-foreground mt-0.5">
                                {(() => {
                                  const discountInMoney = item.discount_type === 'percentage'
                                    ? (item.quantity * item.unit_price) * ((item.discount_value || 0) / 100)
                                    : (item.discount_value || 0)
                                  return `(- ${brl(discountInMoney)})`
                                })()}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right text-ds-caption font-semibold text-muted-foreground mt-1 mb-8">
                Total de itens:{' '}
                <span className="text-foreground font-bold">
                  {quote.items?.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0) || 0}
                </span>
              </div>

              {/* CLOSING AND TOTALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 print:grid-cols-2 items-start">
                <div className="space-y-6 print-no-break">
                  {(() => {
                    const paymentMethodsString = (() => {
                      if (!quote.payment_method) return ''
                      if (Array.isArray(quote.payment_method)) {
                        return quote.payment_method.filter(Boolean).join(' | ')
                      }
                      return quote.payment_method
                    })()

                    if (!paymentMethodsString) return null
                    return (
                      <div>
                        <h4 className="text-ds-caption font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          FORMAS DE PAGAMENTO
                        </h4>
                        <p className="text-ds-body-sm text-foreground font-medium">
                          {paymentMethodsString}
                        </p>
                      </div>
                    )
                  })()}
                  {quote.notes && (
                    <div>
                      <h4 className="text-ds-caption font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        TERMOS E CONDIÇÕES
                      </h4>
                      <div
                        className="text-ds-body-sm text-muted-foreground leading-ds-relaxed font-medium prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                        dangerouslySetInnerHTML={{ __html: quote.notes }}
                      />
                    </div>
                  )}
                </div>

                <div className="border border-border rounded-md p-4 space-y-2.5 w-full sm:max-w-70 sm:ml-auto print-no-break">
                  <div className="flex justify-between items-center text-ds-body-sm">
                    <span className="text-muted-foreground font-medium">Valor itens</span>
                    <span className="font-semibold text-foreground tabular-nums">{brl(quote.subtotal)}</span>
                  </div>
                  {quote.discount_value > 0 && (
                    <div className="flex justify-between items-center text-ds-body-sm">
                      <span className="text-success font-semibold">Desconto</span>
                      <span className="font-semibold text-success tabular-nums">
                        - {brl(
                          quote.discount_type === 'percentage'
                            ? quote.subtotal * (quote.discount_value / 100)
                            : quote.discount_value
                        )}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between items-center">
                    <span className="font-bold text-foreground text-ds-body-md">Valor final</span>
                    <span className="font-bold text-foreground text-ds-heading-xs tabular-nums">{brl(quote.total)}</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* SIDEBAR DE STATUS E AÇÕES (DIREITA) */}
        <div className="w-full lg:w-70 shrink-0 sticky lg:top-8 print:hidden px-4 sm:px-0 order-2 lg:order-0">
          <div className="bg-card rounded-md border border-border p-6 shadow-sm flex flex-col gap-4">
            <div className="space-y-2">
              <span className="text-ds-caption font-bold text-muted-foreground uppercase tracking-wider block">
                Status
              </span>
              <div className="flex items-center gap-2">
                <Select
                  value={currentStatus}
                  onValueChange={(val) => handleStatusChange(val as QuoteStatus)}
                  disabled={isUpdating || ['draft', 'completed', 'expired', 'rejected', 'cancelled'].includes(currentStatus)}
                >
                  <SubscriptionGuard showVisualDisabled={false}>
                    <SelectTrigger
                      className={cn(
                        "h-10 w-full rounded-sm px-3 border shadow-none focus:ring-0 transition-all font-semibold justify-between",
                        STATUS_MAP[currentStatus]?.color
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isUpdating ? (
                          <Spinner className="h-4.5 w-4.5" />
                        ) : (
                          <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", STATUS_MAP[currentStatus]?.dot)} />
                        )}
                        <SelectValue>{STATUS_MAP[currentStatus]?.label}</SelectValue>
                      </div>
                    </SelectTrigger>
                  </SubscriptionGuard>
                  <SelectContent className="rounded-sm border-border bg-card">
                    {Object.entries(STATUS_MAP)
                      .filter(([value]) => {
                        if (currentStatus === 'draft') {
                          return ['draft'].includes(value)
                        }
                        if (currentStatus === 'pending') {
                          return ['pending', 'approved', 'rejected', 'cancelled'].includes(value)
                        }
                        if (currentStatus === 'approved') {
                          return ['approved', 'completed', 'cancelled'].includes(value)
                        }
                        return value === currentStatus
                      })
                      .map(([value, info]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="py-2 focus:bg-muted cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", info.dot)} />
                            <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">
                              {info.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Motivo do Cancelamento */}
                {currentStatus === 'cancelled' && currentCancellationReason && (
                  <Popover>
                    <PopoverTrigger
                      className="h-10 w-10 border border-border bg-muted hover:bg-muted/80 text-foreground rounded-sm shrink-0 cursor-pointer flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Ver motivo do cancelamento"
                    >
                      <Info className="h-5 w-5" />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-card border-border rounded-md shadow-md p-4">
                      <PopoverHeader className="mb-2">
                        <PopoverTitle className="text-ds-body-sm font-bold text-destructive flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Motivo do Cancelamento
                        </PopoverTitle>
                      </PopoverHeader>
                      <PopoverDescription className="text-ds-body-sm text-foreground italic">
                        &quot;{currentCancellationReason}&quot;
                      </PopoverDescription>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col gap-2.5">
              {/* Botão Reabrir Orçamento */}
              {['expired', 'rejected', 'cancelled'].includes(currentStatus) && (
                <SubscriptionGuard>
                  <Button
                    onClick={() => setIsReopenOpen(true)}
                    className="w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <RotateCcw className="h-4.5 w-4.5" />
                    Reabrir Orçamento
                  </Button>
                </SubscriptionGuard>
              )}

              {/* Botão Ver / Gerar Recibo */}
              {currentStatus === 'completed' && (
                receiptId ? (
                  <Link
                    href={`/app/quotes/${quote.id}/receipt`}
                    className={cn(
                      buttonVariants({ variant: 'default' }),
                      "w-full bg-status-completed hover:bg-status-completed/90 text-white dark:bg-status-completed dark:hover:bg-status-completed/90 dark:text-neutral-950 transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                    )}
                  >
                    <FileText className="h-4.5 w-4.5" />
                    Ver Recibo
                  </Link>
                ) : (
                  <SubscriptionGuard>
                    <Link
                      href={`/app/quotes/${quote.id}/receipt/edit`}
                      className={cn(
                        buttonVariants({ variant: 'default' }),
                        "w-full bg-status-completed hover:bg-status-completed/90 text-white dark:bg-status-completed dark:hover:bg-status-completed/90 dark:text-neutral-950 transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                      )}
                    >
                      <Receipt className="h-4.5 w-4.5" />
                      Gerar Recibo
                    </Link>
                  </SubscriptionGuard>
                )
              )}

              {/* Ações de Rascunho */}
              {currentStatus === 'draft' && (
                <>
                  <SubscriptionGuard>
                    <Button
                      onClick={() => handleStatusChange('pending')}
                      disabled={isUpdating}
                      className="w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isUpdating ? (
                        <Spinner className="h-4.5 w-4.5" />
                      ) : (
                        <CheckCircle className="h-4.5 w-4.5" />
                      )}
                      Gerar Orçamento
                    </Button>
                  </SubscriptionGuard>
                  <SubscriptionGuard>
                    <Link
                      href={`/app/quotes/${quote.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        "w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                      )}
                    >
                      <Pencil className="h-4.5 w-4.5" />
                      Editar Rascunho
                    </Link>
                  </SubscriptionGuard>
                  <SubscriptionGuard>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isUpdating}
                      className="w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isUpdating ? (
                        <Spinner className="h-4.5 w-4.5" />
                      ) : (
                        <Trash2 className="h-4.5 w-4.5" />
                      )}
                      Excluir Rascunho
                    </Button>
                  </SubscriptionGuard>
                </>
              )}

              {/* Botão Imprimir */}
              {currentStatus !== 'draft' && (
                <a
                  href={`/api/quotes/${quote.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    "w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  <Printer className="h-4.5 w-4.5" />
                  Imprimir
                </a>
              )}

              {/* Botão Baixar PDF */}
              {currentStatus !== 'draft' && (
                <a
                  href={`/api/quotes/${quote.id}/pdf?download=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    "w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  <CloudDownload className="h-4.5 w-4.5" />
                  Baixar PDF
                </a>
              )}

              {/* Botão Clonar Orçamento */}
              {currentStatus !== 'draft' && (
                <SubscriptionGuard>
                  <Link
                    href={`/app/quotes/new?clone=${quote.id}`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      "w-full transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
                    )}
                  >
                    <Copy className="h-4.5 w-4.5 text-primary" />
                    Clonar Orçamento
                  </Link>
                </SubscriptionGuard>
              )}
            </div>
          </div>
        </div>

      </div>

      <ReopenQuoteDialog
        quoteId={quote.id}
        open={isReopenOpen}
        onOpenChange={setIsReopenOpen}
        onSuccess={() => {
          setCurrentStatus('pending')
          setCurrentCancellationReason(null)
        }}
      />

      {/* Dialog de Motivo de Cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-ds-heading-sm font-bold text-foreground">Cancelar Orçamento</DialogTitle>
            <DialogDescription className="text-ds-body-sm text-muted-foreground">
              Por favor, informe o motivo do cancelamento deste orçamento. Esta justificativa ficará registrada no documento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-ds-body-sm font-semibold text-foreground">
                Motivo do Cancelamento <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="reason"
                placeholder="Ex: Cliente fechou com outro concorrente / Orçamento fora do limite planejado"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-25 resize-none"
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
                setCancelDialogOpen(false)
                setCancellationReason('')
              }}
              className="transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancellationReason.trim().length < 5}
              onClick={handleConfirmCancel}
              className="transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-ds-heading-sm font-bold text-foreground">
              Excluir Rascunho
            </DialogTitle>
            <DialogDescription className="text-ds-body-sm text-muted-foreground">
              Deseja realmente excluir este rascunho? Esta ação é permanente e não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="transition-transform duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
            >
              Excluir Rascunho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
