'use client'

import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { maskPhone } from '@/lib/masks'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer, CopyIcon, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect, useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { updateQuoteStatus, updatePublicQuoteStatus } from '@/app/app/quotes/[id]/status-actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export type QuoteStatus = 'draft' | 'open' | 'accepted' | 'rejected' | 'expired' | 'vencido'

export interface QuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
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
}

export interface Company {
  name: string
  logo_url?: string
  phone: string
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
}

const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

interface QuoteViewerProps {
  quote: Quote
  isAdmin?: boolean
}

const STATUS_MAP: Record<QuoteStatus, { label: string, color: string, dot: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  open: { label: 'Pendente', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600' },
  accepted: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-600' },
  expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-600' },
  vencido: { label: 'Vencido', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
}

export interface QuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string
}

export function QuoteViewer({ quote, isAdmin = false }: QuoteViewerProps) {
  const [currentStatus, setCurrentStatus] = useState<QuoteStatus>(quote.status)
  const [isUpdating, setIsUpdating] = useState(false)

  // Sincronizar estado local se a prop mudar (ex: re-render do pai)
  useEffect(() => {
    setCurrentStatus(quote.status)
  }, [quote.status])

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

  const handleStatusChange = async (newStatus: QuoteStatus | null) => {
    if (!newStatus || isUpdating) return
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
      toast.error('Ocorreu um erro ao atualizar o status.')
      setCurrentStatus(previousStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePublicStatusChange = async (newStatus: QuoteStatus | null) => {
    if (!newStatus || isUpdating) return
    const previousStatus = currentStatus
    setIsUpdating(true)
    setCurrentStatus(newStatus)
    try {
      const result = await updatePublicQuoteStatus(quote.public_uuid, newStatus)
      if (result.error) {
        toast.error('Erro ao atualizar orçamento: ' + result.error)
        setCurrentStatus(previousStatus)
      } else {
        toast.success(newStatus === 'accepted' ? 'Orçamento aprovado' : 'Orçamento rejeitado')
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao processar sua solicitação.')
      setCurrentStatus(previousStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/quote/${quote.public_uuid}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link do orçamento copiado! Envie para o seu cliente.')
    } catch (err) {
      toast.error('Não foi possível copiar o link automaticamente. Copie manualmente: ' + url)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-0 sm:py-8 print:bg-white print:py-0">
      {/* ACTION BAR - NO PRINT */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden mb-8">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger className={`h-9 w-40 rounded-lg px-3 border shadow-none focus:ring-0 transition-all ${STATUS_MAP[currentStatus]?.color}`}>
                    <div className="flex items-center gap-2">
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <div className={`h-2 w-2 rounded-full ${STATUS_MAP[currentStatus]?.dot}`} />
                      )}
                      <SelectValue>
                        {STATUS_MAP[currentStatus]?.label}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {Object.entries(STATUS_MAP)
                      .filter(([value]) => (value !== 'expired' && value !== 'draft') || value === currentStatus)
                      .map(([value, info]) => (
                        <SelectItem key={value} value={value} className="py-2 focus:bg-slate-50">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${info.dot}`} />
                            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">{info.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" className="h-6" />
              </div>
            )}
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              #{quote.hash_id}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin && currentStatus === 'open' && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger render={
                    <Button variant="outline" size="sm" className="h-9 gap-2 border-red-200 text-red-600 hover:bg-red-50 font-bold">
                      <XCircle className="h-4 w-4" /> Rejeitar
                    </Button>
                  } />
                  <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Rejeitar Orçamento?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-500 font-medium">
                        Tem certeza que deseja rejeitar este orçamento? Esta ação sinalizará à empresa que você não concorda com os termos propostos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl font-bold">Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isUpdating}
                        onClick={() => handlePublicStatusChange('rejected')}
                        className="rounded-xl bg-red-600 hover:bg-red-700 font-bold"
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirmar Rejeição
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger render={
                    <Button
                      disabled={isUpdating}
                      size="sm"
                      className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Aprovar
                    </Button>
                  } />
                  <AlertDialogContent className="rounded-2xl border-slate-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Aprovar Orçamento?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-500 font-medium">
                        Ao aprovar, você confirma que está de acordo com os itens, valores e condições descritos neste orçamento.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl font-bold">Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isUpdating}
                        onClick={() => handlePublicStatusChange('accepted')}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white"
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirmar Aprovação
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Separator orientation="vertical" className="h-6 mx-2" />
              </>
            )}

            <Button onClick={handlePrint} size="sm" className="h-9 gap-2 border-slate-200 font-bold">
              <Printer className="h-4 w-4" />Imprimir
            </Button>
            {isAdmin && (
              <Button onClick={handleCopyLink} variant="secondary" size="sm" className="h-9 gap-2 border-slate-200 font-bold hover:bg-blue-50">
                <CopyIcon className="h-4 w-4" /> Link
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-none sm:rounded-sm min-h-[29.7cm] p-8 sm:p-16 print:shadow-none print:max-w-none print:p-0 print:m-0 relative overflow-hidden">

        {/* COMPANY HEADER */}
        <div className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4">
            {quote.company?.logo_url ? (
              <img
                src={quote.company.logo_url}
                alt={quote.company.name}
                className="h-16 w-16 object-contain rounded-xl bg-slate-50 p-2"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl">
                {quote.company?.name?.charAt(0) || 'O'}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{quote.company?.name || 'Sua Empresa'}</h2>
              <p className="text-sm text-slate-500 font-medium">{maskPhone(quote.company?.phone)}</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-900 tracking-widest uppercase mb-1">Orçamento</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-6">Nº {quote.hash_id}</p>

            <div className="flex items-center justify-end gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Válido até:</span>
              <span className="text-[13px] font-black text-slate-900">
                {quote.valid_until
                  ? format(parseISO(quote.valid_until), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : 'A combinar'}
              </span>
            </div>
          </div>
        </div>

        <Separator className="mb-12 bg-slate-100" />

        {/* CUSTOMER HEADER */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Orçamento para</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{quote.customer?.name}</h1>
            <p className="text-sm text-slate-500 font-medium">CPF: {quote.customer?.document || '---'}</p>
            <p className="text-sm text-slate-500 font-medium">{maskPhone(quote.customer?.phone)}</p>
          </div>

          <div className="text-right border-r-4 border-emerald-500 pr-6 py-1">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-2">Endereço</h4>
            <div className="text-[13px] text-slate-500 font-medium leading-relaxed">
              <p>{quote.customer?.address_street}{quote.customer?.address_number ? `, ${quote.customer.address_number}` : ''}</p>
              <p>{quote.customer?.address_neighborhood} — {quote.customer?.address_city}, {quote.customer?.address_state}</p>
              <p>CEP: {quote.customer?.address_zip || '---'}</p>
            </div>
          </div>
        </div>
        {/* ITEMS TABLE */}
        <div className="mb-12">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-slate-100 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-10 px-0">Descrição</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-10 text-center">Unid.</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-10 text-center">Qtd</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-10 text-right">Preço Unit.</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-10 text-right pr-0">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items?.map((item, i) => (
                <TableRow key={i} className="border-b border-slate-50 hover:bg-transparent group">
                  <TableCell className="py-5 px-0">
                    <span className="text-sm font-black text-slate-800">{item.item_name}</span>
                  </TableCell>
                  <TableCell className="py-5 text-center text-[13px] text-slate-500 font-medium">{item.unit_measure || 'un'}</TableCell>
                  <TableCell className="py-5 text-center text-[13px] text-slate-500 font-medium tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="py-5 text-right text-[13px] text-slate-500 font-medium tabular-nums">{brl(item.unit_price)}</TableCell>
                  <TableCell className="py-5 text-right pr-0 font-black text-slate-900 tabular-nums">{brl(item.subtotal)}</TableCell>
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
              <span className="font-bold text-slate-900 tabular-nums">{brl(quote.subtotal)}</span>
            </div>

            {quote.discount_value > 0 && (
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">
                  Desconto {quote.discount_type === 'percentage' ? `(${quote.discount_value}%)` : ''}
                </span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  - {brl(quote.discount_value)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">Valor final</span>
              <span className="text-2xl font-black text-emerald-600 tabular-nums tracking-tight">
                {brl(quote.total)}
              </span>
            </div>
          </div>
        </div>

        {/* NOTES SECTION */}
        {quote.notes && (
          <div className="mb-24 pt-8 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observações Adicionais</h4>
            <p className="text-sm text-slate-500 leading-relaxed italic">"{quote.notes}"</p>
            {quote.payment_method && (
              <p className="text-sm text-slate-900 font-bold mt-4">Forma de Pagamento: <span className="uppercase">{quote.payment_method}</span></p>
            )}
          </div>
        )}

        {/* SIGNATURES */}
        <div className="mt-auto pt-16">
          <div className="grid grid-cols-2 gap-20">
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 w-full" />
              <p className="text-sm font-bold text-slate-900">{quote.company?.name || 'Empresa'}</p>
            </div>
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 w-full" />
              <p className="text-sm font-bold text-slate-900">{quote.customer?.name}</p>
              <p className="text-[11px] text-slate-400 font-medium">CPF: {quote.customer?.document || '---'}</p>
            </div>
          </div>
        </div>

        {/* COMPANY DETAILS - BOTTOM SMALL */}
        <div className="absolute bottom-8 left-0 right-0 px-16 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-50 print:hidden">
          <span>{quote.company?.name}</span>
          <span>Emitido em {format(parseISO(quote.created_at), 'dd/MM/yyyy')}</span>
        </div>

      </div>
    </div>
  )
}
