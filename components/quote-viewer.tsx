'use client'

import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { maskPhone } from '@/lib/masks'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Printer,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  RotateCcw,
  FileText,
  Receipt,
  Info,
  CloudDownload,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  updateQuoteStatus,
} from '@/app/app/quotes/actions'

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
  type QuoteItem,
  type Customer,
  type Company,
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
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  pending: {
    label: 'Pendente',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  approved: {
    label: 'Aprovado',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    dot: 'bg-rose-600',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-600',
  },
  completed: {
    label: 'Finalizado',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    dot: 'bg-teal-600',
  },
  expired: {
    label: 'Vencido',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-600',
  },
}


export function QuoteViewer({ quote, receiptId: initialReceiptId }: QuoteViewerProps) {
  const [currentStatus, setCurrentStatus] = useState<QuoteStatus>(quote.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isReopenOpen, setIsReopenOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [currentCancellationReason, setCurrentCancellationReason] = useState<string | null>(quote.cancellation_reason || null)
  const [receiptId, setReceiptId] = useState<string | null>(initialReceiptId || null)

  useEffect(() => {
    setCurrentStatus(quote.status)
    setCurrentCancellationReason(quote.cancellation_reason || null)
  }, [quote.status, quote.cancellation_reason])

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
        toast.error('Erro ao atualizar status: ' + result.error)
        setCurrentStatus(previousStatus)
      } else {
        toast.success(`Status alterado para ${STATUS_MAP[newStatus].label}`)
      }
    } catch (error) {
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
        toast.error('Erro ao cancelar orçamento: ' + result.error)
        setCurrentStatus(previousStatus)
      } else {
        toast.success('Orçamento cancelado com sucesso!')
        setCurrentCancellationReason(cancellationReason)
      }
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao tentar cancelar o orçamento.')
      setCurrentStatus(previousStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-0 sm:px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start justify-center print:block print:max-w-none">
        
        {/* DOCUMENT CONTAINER (ESQUERDA) */}
        <div className="w-full lg:max-w-[21cm] shrink-0 print:w-full print:max-w-none">
          {/* DOCUMENT CONTAINER */}
          <div className="max-w-[21cm] mx-auto bg-white shadow-xl rounded-none sm:rounded-sm min-h-[29.7cm] p-12 sm:p-16 print:shadow-none print:max-w-none print:p-0 print:m-0 relative print:overflow-visible overflow-hidden flex flex-col justify-between print:block print:min-h-0 print:h-auto print:flex-none">
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
          {/* COMPANY HEADER */}
          <div className="space-y-1 mb-6 text-left">
            <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">
              {quote.company?.name || 'Sua Empresa'}
            </h2>
            {(() => {
              const companyContacts = [
                quote.company?.phone && `Tel: ${maskPhone(quote.company.phone)}`,
                quote.company?.whatsapp && `Whats: ${maskPhone(quote.company.whatsapp)}`,
                quote.company?.email && `Email: ${quote.company.email}`,
              ].filter(Boolean).join(' | ')

              if (!companyContacts) return null
              return <p className="text-xs text-neutral-600 font-medium">{companyContacts}</p>
            })()}
            {(() => {
              const addressParts = [
                quote.company?.address_street && `${quote.company.address_street}${quote.company.address_number ? `, N. ${quote.company.address_number}` : ''}${quote.company.address_complement ? ` - ${quote.company.address_complement}` : ''}`,
                quote.company?.address_neighborhood,
                quote.company?.address_city && `${quote.company.address_city}${quote.company.address_state ? `/${quote.company.address_state}` : ''}`,
                quote.company?.address_zip && `CEP: ${quote.company.address_zip}`,
              ].filter(Boolean).join(', ')

              if (!addressParts) return null
              return (
                <p className="text-xs text-neutral-600 font-medium">
                  Endereço: {addressParts}
                </p>
              )
            })()}
          </div>

          <div className="border-t border-neutral-300 my-4" />

          {/* QUOTE IDENTIFICATION */}
          <div className="flex justify-between items-start my-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">Orçamento</h1>
              {quote.title && (
                <p className="text-sm font-medium text-neutral-600 mt-1 italic">{quote.title}</p>
              )}
            </div>
            <div className="text-right flex flex-col justify-between items-end min-h-[50px]">
              {quote.show_quote_number && (
                <span className="text-lg font-bold text-neutral-800">N° {quote.quote_number}</span>
              )}
              <div className={cn("text-xs font-semibold text-neutral-500 mt-auto")}>
                <span className="font-medium">Válido até: </span>
                <span className="text-neutral-800 font-bold">
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

          <div className="border-t border-neutral-300 my-4" />

          {/* CUSTOMER INFO */}
          <div className="text-xs text-neutral-700 space-y-1 my-6 leading-relaxed">
            <div>
              <span className="font-bold text-neutral-800">Orçamento para:</span>{' '}
              <span>{quote.customer?.name || '---'}</span>
            </div>
            <div>
              <span className="font-bold text-neutral-800">CPF/CNPJ:</span>{' '}
              <span>{quote.customer?.document || '---'}</span>
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
                  <span className="font-bold text-neutral-800">Contatos:</span>{' '}
                  <span>{customerContacts}</span>
                </div>
              )
            })()}
          </div>

          {/* ITEMS TABLE */}
          <div className="border border-neutral-800 rounded-none overflow-hidden my-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-800 text-white font-bold uppercase tracking-wider text-[11px] border-b border-neutral-800">
                  <th className="py-2 px-3 text-left w-[50%] border-r border-neutral-800 bg-neutral-800 text-white">DESCRIÇÃO</th>
                  <th className="py-2 px-3 text-left w-[20%] border-r border-neutral-800 bg-neutral-800 text-white">VALOR</th>
                  <th className="py-2 px-3 text-center w-[10%] border-r border-neutral-800 bg-neutral-800 text-white">QTD.</th>
                  <th className="py-2 px-3 text-left w-[20%] bg-neutral-800 text-white">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-800 font-medium">
                {quote.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-transparent">
                    <td className="py-1.5 px-3 text-left border-r border-neutral-800 font-normal">
                      {item.item_name}
                    </td>
                    <td className="py-1.5 px-3 text-left border-r border-neutral-800 tabular-nums">
                      {brl(item.unit_price)}
                    </td>
                    <td className="py-1.5 px-3 text-center border-r border-neutral-800 tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 px-3 text-left tabular-nums font-bold">
                      <div className="flex flex-col">
                        <span>{brl(item.subtotal)}</span>
                        {Number(item.discount_value) > 0 && (
                          <span className="text-[10px] font-normal text-neutral-500 mt-0.5">
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

          <div className="text-right text-[11px] font-semibold text-neutral-500 mt-1 mb-8">
            Total de itens:{' '}
            <span className="text-neutral-800 font-bold">
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
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      FORMAS DE PAGAMENTO
                    </h4>
                    <p className="text-xs text-neutral-700 font-medium">
                      {paymentMethodsString}
                    </p>
                  </div>
                )
              })()}
              {quote.notes && (
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    TERMOS E CONDIÇÕES
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {quote.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-neutral-800 p-4 space-y-2 max-w-[280px] ml-auto w-full print-no-break">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-medium">Valor itens</span>
                <span className="font-bold text-neutral-800 tabular-nums">{brl(quote.subtotal)}</span>
              </div>
              {quote.discount_value > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-600 font-bold">Desconto</span>
                  <span className="font-bold text-emerald-600 tabular-nums">
                    - {brl(
                      quote.discount_type === 'percentage'
                        ? quote.subtotal * (quote.discount_value / 100)
                        : quote.discount_value
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-2 flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-800 text-sm">Valor final</span>
                <span className="font-extrabold text-neutral-800 text-base tabular-nums">{brl(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INSTITUTIONAL FOOTER */}
        <div className="text-center mt-auto pt-16 print-no-break print-footer">
          <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            {quote.company?.name || 'Sua Empresa'}
          </p>
          {quote.company?.cnpj && (
            <p className="text-sm text-neutral-500 mt-1">
              CNPJ/CPF: {quote.company.cnpj}
            </p>
          )}
        </div>

        {/* DETALHE PEQUENO DO SISTEMA NO RODAPÉ */}
        <div className="absolute bottom-4 left-0 right-0 px-12 flex justify-between items-center text-xs text-slate-500 tracking-wider opacity-80 print-system-footer">
          <span>Criado por Orca Fácil</span>
          <span>Emitido em {format(parseISO(quote.created_at), 'dd/MM/yyyy')}</span>
        </div>
      </div>
    </div>

    {/* SIDEBAR DE STATUS E AÇÕES (DIREITA) */}
    <div className="w-full lg:w-[280px] shrink-0 sticky lg:top-8 print:hidden px-4 sm:px-0">
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-md flex flex-col gap-4">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={currentStatus}
              onValueChange={(val) => handleStatusChange(val as QuoteStatus)}
              disabled={isUpdating || ['completed', 'expired', 'rejected', 'cancelled'].includes(currentStatus)}
            >
              <SelectTrigger
                className={cn(
                  "h-10 w-full rounded-lg px-3 border shadow-none focus:ring-0 transition-all font-semibold justify-between",
                  STATUS_MAP[currentStatus]?.color
                )}
              >
                <div className="flex items-center gap-2">
                  {isUpdating ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", STATUS_MAP[currentStatus]?.dot)} />
                  )}
                  <SelectValue>{STATUS_MAP[currentStatus]?.label}</SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                {Object.entries(STATUS_MAP)
                  .filter(([value]) => {
                    if (currentStatus === 'draft') {
                      return ['draft', 'pending'].includes(value)
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
                      className="py-2 focus:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", info.dot)} />
                        <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
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
                  className="h-10 w-10 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg shrink-0 cursor-pointer flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  title="Ver motivo do cancelamento"
                >
                  <Info className="h-5 w-5" />
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white border-slate-200 rounded-xl shadow-md p-4">
                  <PopoverHeader className="mb-2">
                    <PopoverTitle className="text-sm font-bold text-red-600 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Motivo do Cancelamento
                    </PopoverTitle>
                  </PopoverHeader>
                  <PopoverDescription className="text-sm text-slate-700 italic">
                    "{currentCancellationReason}"
                  </PopoverDescription>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div className="flex flex-col gap-2.5">
          {/* Botão Reabrir Orçamento */}
          {['expired', 'rejected', 'cancelled'].includes(currentStatus) && (
            <Button
              onClick={() => setIsReopenOpen(true)}
              className="w-full h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              Reabrir Orçamento
            </Button>
          )}

          {/* Botão Imprimir */}
          <a
            href={`/api/quotes/${quote.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              "w-full h-10 gap-2 border-slate-200 font-bold rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 flex items-center justify-center"
            )}
          >
            <Printer className="h-4.5 w-4.5" />
            Imprimir
          </a>

          {/* Botão Ver / Gerar Recibo */}
          {currentStatus === 'completed' && (
            receiptId ? (
              <Link
                href={`/app/quotes/${quote.id}/receipt`}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  "w-full h-10 gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center justify-center cursor-pointer"
                )}
              >
                <FileText className="h-4.5 w-4.5" />
                Ver Recibo
              </Link>
            ) : (
              <Link
                href={`/app/quotes/${quote.id}/receipt/edit`}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  "w-full h-10 gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center justify-center cursor-pointer"
                )}
              >
                <Receipt className="h-4.5 w-4.5" />
                Gerar Recibo
              </Link>
            )
          )}

          {/* Botão Baixar PDF */}
          <a
            href={`/api/quotes/${quote.id}/pdf?download=true`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              "w-full h-10 gap-2 border-slate-200 font-bold rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 flex items-center justify-center"
            )}
          >
            <CloudDownload className="h-4.5 w-4.5" />
            Baixar PDF
          </a>
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
        <DialogContent className="sm:max-w-[425px] rounded-xl bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Cancelar Orçamento</DialogTitle>
            <DialogDescription className="text-slate-500">
              Por favor, informe o motivo do cancelamento deste orçamento. Esta justificativa ficará registrada no documento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-semibold text-slate-700">
                Motivo do Cancelamento <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="reason"
                placeholder="Ex: Cliente fechou com outro concorrente / Orçamento fora do limite planejado"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-[100px] resize-none border-slate-200 rounded-lg focus:ring-slate-500"
              />
              <p className="text-[11px] text-slate-400">
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
              className="rounded-lg"
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancellationReason.trim().length < 5}
              onClick={handleConfirmCancel}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
