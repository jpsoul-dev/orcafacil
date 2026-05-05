'use client'

import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer, Send, Pencil, Copy, Calendar, User2, Wallet, Package, FileText, CopyIcon, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ExternalLink, History, Info } from 'lucide-react'
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

interface QuoteViewerProps {
  quote: any
  isAdmin?: boolean
}

export function QuoteViewer({ quote, isAdmin = false }: QuoteViewerProps) {
  const [currentStatus, setCurrentStatus] = useState(quote.status)
  const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  }

  useEffect(() => {
    const originalTitle = document.title
    const handleBeforePrint = () => {
      const dateStr = format(new Date(quote.created_at), 'ddMMyyyy')
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
  }, [quote.hash_id, quote.title, quote.created_at])

  const statusMap: Record<string, { label: string, color: string, dot: string }> = {
    draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
    open: { label: 'Pendente', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600' },
    accepted: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' },
    rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-600' },
    expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-600' },
    vencido: { label: 'Vencido', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  }

  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = currentStatus
    setCurrentStatus(newStatus)
    const result = await updateQuoteStatus(quote.id, newStatus)
    if (result.error) {
      toast.error('Erro ao atualizar status: ' + result.error)
      setCurrentStatus(previousStatus)
    } else {
      toast.success(`Status alterado para ${statusMap[newStatus].label}`)
    }
  }

  const handlePublicStatusChange = async (newStatus: string) => {
    const previousStatus = currentStatus
    setCurrentStatus(newStatus)
    const result = await updatePublicQuoteStatus(quote.public_uuid, newStatus)
    if (result.error) {
      toast.error('Erro ao atualizar orçamento: ' + result.error)
      setCurrentStatus(previousStatus)
    } else {
      toast.success(newStatus === 'accepted' ? 'Orçamento aprovado com sucesso!' : 'Orçamento rejeitado.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/quote/${quote.public_uuid}`
    navigator.clipboard.writeText(url)
    toast.success('Link do orçamento copiado! Envie para o seu cliente.')
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 print:bg-white print:pb-0 print:min-h-0">
      <style jsx global>{`
        @page { size: auto; margin: 0; }
        @media print {
          body { margin: 0; background-color: white !important; }
          .no-print { 
            display: none !important; 
            height: 0 !important; 
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-only { display: block !important; }
          .print-container {
            padding: 1.5cm;
            padding-bottom: 2cm;
            width: 100%;
            position: relative;
          }
          tr {
            break-inside: avoid;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* HEADER SECTION - NO PRINT */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/app/quotes" className="font-medium">Orçamentos</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-slate-900">{quote.hash_id}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
            {!isAdmin && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-slate-950 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Orçamento</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Link Copy removed as redundant with Send button */}

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
                          onClick={() => handlePublicStatusChange('rejected')}
                          className="rounded-xl bg-red-600 hover:bg-red-700 font-bold"
                        >
                          Confirmar Rejeição
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    onClick={() => handlePublicStatusChange('accepted')}
                    size="sm"
                    className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprovar Orçamento
                  </Button>

                  <Separator orientation="vertical" className="h-6 mx-2" />
                </>
              )}

              <Button onClick={handlePrint} size="sm" className="h-9 gap-2 border-slate-200 font-bold">
                <Printer className="h-4 w-4" />Imprimir
              </Button>
              {isAdmin && (
                <Button onClick={handleCopyLink} variant="secondary" size="sm" className="h-9 gap-2 border-slate-200 font-bold  hover:bg-blue-50">
                  <CopyIcon className="h-4 w-4" /> Copiar link
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 no-print">
        {/* TOP TITLE CARD - NO PRINT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 no-print shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <FileText className="h-3 w-3" /> Orçamento
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{quote.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-slate-400" />
                  <Link
                    href={`/app/customers/${quote.customer_id}`}
                    className="text-slate-900 font-bold hover:text-blue-600 hover:underline transition-colors flex items-center gap-1"
                  >
                    {quote.customer?.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </Link>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Criado em {format(new Date(quote.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Total</p>
                <p className="text-3xl font-black text-slate-950 tabular-nums">{brl(quote.total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: MAIN CONTENT */}
          <div className="lg:col-span-9 space-y-8">

            {/* ITEMS CARD */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  Itens e Serviços
                </CardTitle>
                <Badge variant="outline" className="bg-white font-bold text-slate-500">
                  {quote.items?.length || 0} {quote.items?.length === 1 ? 'item' : 'itens'}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 border-none hover:bg-slate-50/30">
                      <TableHead className="py-4 pl-6 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Descrição</TableHead>
                      <TableHead className="py-4 text-center font-bold text-slate-500 text-[10px] uppercase tracking-widest w-24">Qtd</TableHead>
                      <TableHead className="py-4 text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest">Valor Unitário</TableHead>
                      <TableHead className="py-4 pr-6 text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.items?.map((item: any, i: number) => (
                      <TableRow key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors">
                        <TableCell className="py-5 pl-6 text-sm font-bold text-slate-800">{item.item_name}</TableCell>
                        <TableCell className="py-5 text-center text-sm font-semibold text-slate-600">{item.quantity}</TableCell>
                        <TableCell className="py-5 text-right text-sm font-semibold text-slate-600 tabular-nums">{brl(item.unit_price)}</TableCell>
                        <TableCell className="py-5 pr-6 text-right text-sm font-black text-slate-950 tabular-nums">{brl(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* TOTALS INSIDE ITEMS CARD */}
                <div className="border-t border-slate-100 bg-slate-50/30 p-6 space-y-3">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-8 text-sm">
                      <span className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Subtotal</span>
                      <span className="text-slate-900 font-bold tabular-nums w-24 text-right">{brl(quote.subtotal)}</span>
                    </div>

                    {quote.discount_value > 0 && (
                      <div className="flex items-center gap-8 text-sm text-emerald-600">
                        <span className="font-bold uppercase text-[10px] tracking-widest">
                          Desconto {quote.discount_type === 'percentage' ? `(${quote.discount_value}%)` : ''}
                        </span>
                        <span className="font-bold tabular-nums w-24 text-right">
                          - {brl(quote.discount_type === 'percentage'
                            ? (quote.subtotal * quote.discount_value / 100)
                            : quote.discount_value)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-8 mt-2">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Geral</span>
                      <span className="text-3xl font-black text-slate-950 tabular-nums tracking-tighter w-40 text-right">
                        {brl(quote.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PAYMENT & NOTES CARD - NOW SEPARATE BELOW ITEMS */}
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-slate-100 flex flex-row items-center gap-2 bg-slate-50/50">
                <Info className="h-4 w-4 text-slate-400" />
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">Informações Complementares</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forma de Pagamento</p>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Wallet className="h-4 w-4 text-slate-400" />
                      <p className="text-sm text-slate-900 font-black uppercase tracking-tight">
                        {quote.payment_method || 'A combinar'}
                      </p>
                    </div>
                  </div>

                  {quote.notes && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações</p>
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{quote.notes}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: PROPERTIES SIDEBAR */}
          <div className="lg:col-span-3 space-y-8">
            <Card className="border-slate-200 shadow-lg rounded-2xl bg-white sticky top-24">
              <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">Propriedades</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">

                {/* STATUS SELECTOR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <History className="h-3.5 w-3.5" /> Status Atual
                    </div>
                  </div>
                  {!isAdmin ? (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${statusMap[currentStatus]?.color}`}>
                      <div className={`h-2.5 w-2.5 rounded-full ${statusMap[currentStatus]?.dot}`} />
                      <span className="font-bold text-sm uppercase tracking-tight">{statusMap[currentStatus]?.label}</span>
                    </div>
                  ) : (
                    <Select value={currentStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className={`h-14 w-full rounded-xl px-4 border shadow-none focus:ring-0 transition-all ${statusMap[currentStatus]?.color}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full shadow-sm ${statusMap[currentStatus]?.dot}`} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        {Object.entries(statusMap)
                          .filter(([value]) => value !== 'expired' && value !== 'draft')
                          .map(([value, info]) => (
                            <SelectItem key={value} value={value} className="py-3 focus:bg-slate-50">
                              <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${info.dot}`} />
                                <span className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">{info.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Separator />

                {/* DUE DATE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5" /> Validade do Orçamento
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">
                      {quote.valid_until ? format(new Date(quote.valid_until), 'dd/MM/yyyy') : 'Sem validade'}
                    </span>
                    {quote.valid_until && new Date() > new Date(quote.valid_until) && (
                      <Badge variant="destructive" className="text-[10px] font-black uppercase">Expirado</Badge>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PRINT VIEW AREA - HIDDEN IN SCREEN, SHOWN IN PRINT */}
      <div className="hidden print:block print:relative">
        {/* Layout de impressão mantido separado para o cliente */}
        <div className="max-w-4xl mx-auto bg-white print-container">
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
            <div className="flex items-center gap-6">
              {quote.company?.logo_url && (
                <img
                  src={quote.company.logo_url}
                  alt={quote.company.name}
                  className="h-16 w-16 object-contain rounded-md border border-slate-100"
                />
              )}
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{quote.company?.name || 'Empresa'}</h2>
                <div className="text-[10px] text-slate-500 font-medium">
                  {[
                    quote.company?.address_street && `${quote.company.address_street}${quote.company.address_number ? `, ${quote.company.address_number}` : ''}`,
                    quote.company?.address_neighborhood,
                    (quote.company?.address_city || quote.company?.address_state) && `${quote.company.address_city}${quote.company.address_state ? `/${quote.company.address_state}` : ''}`
                  ].filter(Boolean).join(' • ')}
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Tel: {formatPhone(quote.company?.phone)}</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter mb-1">ORÇAMENTO</h1>
              <p className="text-md font-bold text-slate-900">#{quote.hash_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cliente</h4>
              <p className="font-bold text-slate-900 text-lg">{quote.customer?.name}</p>
              <p className="text-sm text-slate-500">{quote.customer?.document}</p>
            </div>
            <div className="text-right">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detalhes</h4>
              <p className="text-sm font-bold text-slate-900">Emissão: {format(new Date(quote.created_at), 'dd/MM/yyyy')}</p>
              {quote.valid_until && (
                <p className="text-sm font-bold text-slate-900">Válido até: {format(new Date(quote.valid_until), 'dd/MM/yyyy')}</p>
              )}
              {quote.payment_method && (
                <p className="text-sm font-bold text-slate-700 mt-1">Pagamento: {quote.payment_method}</p>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-slate-900 hover:bg-transparent">
                <TableHead className="text-slate-900 font-black uppercase text-xs">Descrição do Item</TableHead>
                <TableHead className="text-right text-slate-900 font-black uppercase text-xs">Qtd</TableHead>
                <TableHead className="text-right text-slate-900 font-black uppercase text-xs">Unitário</TableHead>
                <TableHead className="text-right text-slate-900 font-black uppercase text-xs">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items?.map((item: any, i: number) => (
                <TableRow key={i} className="border-b border-slate-100 hover:bg-transparent">
                  <TableCell className="py-4 font-bold text-slate-800">{item.item_name}</TableCell>
                  <TableCell className="py-4 text-right font-medium">{item.quantity}</TableCell>
                  <TableCell className="py-4 text-right font-medium">{brl(item.unit_price)}</TableCell>
                  <TableCell className="py-4 text-right font-black text-slate-900">{brl(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-12 flex justify-end avoid-break">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-bold text-slate-900">{brl(quote.subtotal)}</span>
              </div>
              {quote.discount_value > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                  <span>Desconto</span>
                  <span>-{brl(quote.discount_type === 'percentage' ? (quote.subtotal * quote.discount_value / 100) : quote.discount_value)}</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-end">
                <span className="text-xs font-black uppercase">Total Geral</span>
                <span className="text-2xl font-black text-slate-900 tabular-nums">{brl(quote.total)}</span>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-16 pt-8 border-t border-slate-100 avoid-break">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observações</h4>
              <p className="text-sm text-slate-600 leading-relaxed italic">"{quote.notes}"</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
