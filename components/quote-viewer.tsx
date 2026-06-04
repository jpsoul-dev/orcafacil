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

export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'expired'

export interface QuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string
}

export interface Customer {
  name: string
  document: string
  phone: string
  address_street: string
  address_number?: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_zip: string
  address_complement?: string
  email?: string
  whatsapp?: string
}

export interface Company {
  name: string
  logo_url?: string
  phone: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_complement?: string
}

export interface Quote {
  id: string
  hash_id: string
  public_uuid: string
  status: QuoteStatus
  title: string
  created_at: string
  valid_until?: string | null
  subtotal: number
  discount_value: number
  discount_type: 'percentage' | 'fixed'
  total: number
  notes?: string
  payment_method?: string
  customer_id: string
  customer: Customer
  company: Company
  items: QuoteItem[]
  cancellation_reason?: string | null
}

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

  useEffect(() => {
    const originalTitle = document.title
    const handleBeforePrint = () => {
      const dateStr = format(parseISO(quote.created_at), 'ddMMyyyy')
      const titleStr = quote.title.replace(/\s+/g, '_')
      document.title = `${titleStr}_${dateStr}`
    }
    const handleAfterPrint = () => {
      document.title = originalTitle
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [quote.title, quote.created_at])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('print') === 'true') {
        const timer = setTimeout(() => {
          window.print()
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-50 py-0 print:bg-white print:py-0">
      {/* ACTION BAR - NO PRINT */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden mb-8">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Select
                value={currentStatus}
                onValueChange={(val) => handleStatusChange(val as QuoteStatus)}
                disabled={isUpdating || ['completed', 'expired', 'rejected', 'cancelled'].includes(currentStatus)}
              >
                <SelectTrigger
                  className={`h-9 w-40 rounded-lg px-3 border shadow-none focus:ring-0 transition-all ${STATUS_MAP[currentStatus]?.color}`}
                >
                  <div className="flex items-center gap-2">
                    {isUpdating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <div
                        className={`h-2 w-2 rounded-full ${STATUS_MAP[currentStatus]?.dot}`}
                      />
                    )}
                    <SelectValue>
                      {STATUS_MAP[currentStatus]?.label}
                    </SelectValue>
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
                        className="py-2 focus:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${info.dot}`}
                          />
                          <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                            {info.label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {['expired', 'rejected', 'cancelled'].includes(currentStatus) && (
                <Button
                  onClick={() => setIsReopenOpen(true)}
                  size="sm"
                  className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reabrir Orçamento
                </Button>
              )}
              {currentStatus === 'completed' && (
                receiptId ? (
                  <Link
                    href={`/app/quotes/${quote.id}/receipt`}
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'sm' }),
                      "h-9 gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Ver Recibo
                  </Link>
                ) : (
                  <Link
                    href={`/app/quotes/${quote.id}/receipt/edit`}
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'sm' }),
                      "h-9 gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold"
                    )}
                  >
                    <Receipt className="h-4 w-4" />
                    Gerar Recibo
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="h-9 gap-2 border-slate-200 font-bold"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-none sm:rounded-sm min-h-[29.7cm] p-8 sm:p-16 print:shadow-none print:max-w-none print:p-0 print:m-0 relative overflow-hidden">
        {/* COMPANY HEADER */}
        <div className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4">
            {quote.company?.logo_url && (
              <Image
                src={quote.company.logo_url}
                alt={quote.company.name}
                width={64}
                height={64}
                className="h-16 w-16 object-contain rounded-xl bg-slate-50 p-2"
              />
            )}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {quote.company?.name || 'Sua Empresa'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {maskPhone(quote.company?.phone)}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                {[
                  quote.company?.address_street &&
                    `${quote.company.address_street}${quote.company.address_number ? `, ${quote.company.address_number}` : ''}${quote.company.address_complement ? ` - ${quote.company.address_complement}` : ''}`,
                  quote.company?.address_neighborhood,
                  quote.company?.address_city &&
                    `${quote.company.address_city}${quote.company.address_state ? `/${quote.company.address_state}` : ''}`,
                ]
                  .filter(Boolean)
                  .join(' — ')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 tracking-widest uppercase mb-1">
              Orçamento
            </h1>
            <p className="text-slate-400 font-bold text-sm tracking-widest mb-6">
              # {quote.hash_id}
            </p>

            <div className="flex items-center justify-end gap-3">
              <span className="text-sm font-bold text-slate-400 tracking-widest">
                Válido até:
              </span>
              <span className="text-[13px] font-black text-slate-900">
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

        <Separator className="mb-12 bg-slate-200" />

        {/* CUSTOMER HEADER */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Orçamento para
            </p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {quote.customer?.name}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              CPF: {quote.customer?.document || '---'}
            </p>
          </div>

          <div className="text-right border-r-4 border-indigo-500 pr-6 py-1">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-2">
              Contato
            </h4>
            <div className="text-[13px] text-slate-500 font-medium leading-relaxed space-y-1">
              <div className="flex items-center justify-end gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{maskPhone(quote.customer?.phone) || '---'}</span>
              </div>
              {quote.customer?.whatsapp && (
                <div className="flex items-center justify-end gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
                  <span>{maskPhone(quote.customer.whatsapp)}</span>
                </div>
              )}
              {quote.customer?.email && (
                <div className="flex items-center justify-end gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{quote.customer.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentStatus === 'cancelled' && currentCancellationReason && (
          <div className="mb-12 p-5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex flex-col gap-1 shadow-sm">
            <span className="font-bold text-[11px] uppercase tracking-wider text-rose-600">Motivo do Cancelamento</span>
            <p className="font-medium text-slate-700 italic">"{currentCancellationReason}"</p>
          </div>
        )}

        {/* ITEMS TABLE */}
        <div className="mb-12">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-slate-100 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest h-10 px-0">
                  Descrição
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest h-10 text-center">
                  Unid.
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest h-10 text-center">
                  Qtd
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest h-10 text-right">
                  Preço Unit.
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-widest h-10 text-right pr-0">
                  Total item
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items?.map((item, i) => (
                <TableRow
                  key={i}
                  className="border-b border-slate-50 hover:bg-transparent group"
                >
                  <TableCell className="py-5 px-0">
                    <span className="text-sm font-black text-slate-800">
                      {item.item_name}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 text-center text-[13px] text-slate-500 font-medium">
                    {item.unit_measure || 'un'}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[13px] text-slate-500 font-medium tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="py-5 text-right text-[13px] text-slate-500 font-medium tabular-nums">
                    {brl(item.unit_price)}
                  </TableCell>
                  <TableCell className="py-5 text-right pr-0 font-black text-slate-900 tabular-nums">
                    {brl(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* TOTALS SECTION */}
        <div className="flex justify-end mb-24">
          <div className="w-full max-w-[320px] space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium">Valor total</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {brl(quote.subtotal)}
              </span>
            </div>

            {quote.discount_value > 0 && (
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">
                  Desconto{' '}
                  {quote.discount_type === 'percentage'
                    ? `(${quote.discount_value}%)`
                    : ''}
                </span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  - {brl(
                    quote.discount_type === 'percentage'
                      ? quote.subtotal * (quote.discount_value / 100)
                      : quote.discount_value
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Valor final
              </span>
              <span className="text-2xl font-black text-indigo-600 tabular-nums tracking-tight">
                {brl(quote.total)}
              </span>
            </div>
          </div>
        </div>

        {/* NOTES SECTION */}
        {quote.notes && (
          <div className="mb-24 pt-8 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Anotações
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              {`"${quote.notes}"`}
            </p>
            {quote.payment_method && (
              <p className="text-sm text-slate-900 font-bold mt-4">
                Forma de Pagamento:{' '}
                <span className="uppercase">{quote.payment_method}</span>
              </p>
            )}
          </div>
        )}

        {/* SIGNATURES */}
        <div className="mt-auto pt-16">
          <div className="grid grid-cols-2 gap-20">
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 w-full" />
              <p className="text-sm font-bold text-slate-900">
                {quote.company?.name || 'Empresa'}
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 w-full" />
              <p className="text-sm font-bold text-slate-900">
                {quote.customer?.name}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                CPF: {quote.customer?.document || '---'}
              </p>
            </div>
          </div>
        </div>

        {/* COMPANY DETAILS - BOTTOM SMALL */}
        <div className="absolute bottom-8 left-0 right-0 px-16 flex justify-end items-center text-xs text-slate-400 font-bold tracking-[0.2em] opacity-50 print:hidden">
          <span>
            Emitido em {format(parseISO(quote.created_at), 'dd/MM/yyyy')}
          </span>
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
