'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer, Send, Pencil, ChevronLeft, Copy, Calendar, Building2, User2, Wallet, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateQuoteStatus } from '@/app/app/quotes/[id]/status-actions'
import { useState, useEffect } from 'react'

interface QuoteViewerProps {
  quote: any
  isAdmin?: boolean
}

export function QuoteViewer({ quote, isAdmin = false }: QuoteViewerProps) {
  const [currentStatus, setCurrentStatus] = useState(quote.status)
  const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

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
  }, [quote.hash_id])

  const statusMap: Record<string, { label: string, color: string }> = {
    draft: { label: 'RASCUNHO', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    open: { label: 'EM ABERTO', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    accepted: { label: 'ACEITO', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'REJEITADO', color: 'bg-red-100 text-red-700 border-red-200' },
    expired: { label: 'EXPIRADO', color: 'bg-slate-100 text-slate-700 border-slate-200' },
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

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/quote/${quote.public_uuid}`
    navigator.clipboard.writeText(url)
    toast.success('Link do orçamento copiado! Envie para o seu cliente.')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <style jsx global>{`
        @page {
          size: auto;
          margin: 0mm;
        }
        @media print {
          body {
            margin: 1.5cm;
            background-color: white !important;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 print:max-w-none print:px-0 print:space-y-4">

        {/* Navigation & Header Actions - ESCONDIDO NA IMPRESSÃO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 print:hidden">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/app/quotes">
                <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 text-slate-600 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="font-semibold">Voltar</span>
                </Button>
              </Link>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Orçamento: #{quote.hash_id}</h1>
                {!isAdmin ? (
                  <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black border tracking-wider ${statusMap[currentStatus]?.color || ''}`}>
                    {statusMap[currentStatus]?.label || currentStatus}
                  </Badge>
                ) : (
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className={`h-7 w-auto min-w-[110px] rounded-full px-3 text-[10px] font-black border tracking-wider shadow-none focus:ring-0 ${statusMap[currentStatus]?.color || ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([value, info]) => (
                        <SelectItem key={value} value={value} className="text-[10px] font-bold text-slate-700">
                          {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">{quote.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-2 p-1 bg-slate-200/50 rounded-lg">
                <Link href={`/app/quotes/${quote.id}/edit`}>
                  <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-slate-600 font-semibold hover:bg-white hover:shadow-xs">
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                </Link>
                <Link href={`/app/quotes/new?clone=${quote.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 px-3 gap-2 text-slate-600 font-semibold hover:bg-white hover:shadow-xs">
                    <Copy className="h-3.5 w-3.5" /> Clonar
                  </Button>
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button onClick={handleCopyLink} variant="outline" size="sm" className="h-9 px-4 gap-2 border-slate-200 bg-white text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-200 transition-all">
                  <Send className="h-4 w-4" /> Enviar
                </Button>
              )}
              <Button onClick={handlePrint} variant="default" size="sm" className="h-9 px-4 gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-md shadow-slate-200 transition-all">
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            </div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">

          {/* Main Info Card */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl print:shadow-none print:border-slate-100 print:rounded-none">
            <CardHeader className="p-0 border-b border-slate-100 bg-slate-50/50 print:bg-white">
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6 print:p-4">
                <div className="flex items-center gap-5">
                  {quote.company?.logo_url ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm p-2 flex items-center justify-center print:border-none print:shadow-none print:w-20 print:h-20">
                      <Image src={quote.company.logo_url} alt="Logo" fill className="object-contain p-2" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-400 rounded-xl border border-slate-200 border-dashed print:hidden">
                      <Building2 className="h-6 w-6 opacity-40" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 print:text-xl">{quote.company?.name || 'Empresa'}</h2>
                    <p className="text-sm text-slate-500 font-medium">{quote.company?.phone}</p>
                    {quote.company?.address_city && (
                      <p className="text-xs text-slate-400 print:text-slate-600">
                        {quote.company.address_city} - {quote.company.address_state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-2 print:text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-xs print:border-none print:shadow-none print:px-0">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 print:hidden" />
                    <span className="text-xs font-bold text-slate-600">Data do orçamento: {format(new Date(quote.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  {quote.valid_until && (
                    <div className="block sm:block">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg print:bg-white print:border-none print:px-0">
                        <Calendar className="h-3.5 w-3.5 text-blue-400 print:hidden" />
                        <span className="text-xs font-bold text-blue-700 print:text-slate-600">Válido até: {format(new Date(quote.valid_until), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-6 print:p-4">
                <div className="flex items-center gap-2 mb-4 print:mb-2">
                  <Package className="h-4 w-4 text-slate-400 print:hidden" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Itens do Orçamento</h3>
                </div>

                <div className="rounded-lg border border-slate-100 overflow-hidden print:border-none">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 border-none hover:bg-slate-50/80 print:bg-slate-50 print:border-b print:border-slate-100">
                        <TableHead className="py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Descrição</TableHead>
                        <TableHead className="py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider w-20">Qtd</TableHead>
                        <TableHead className="py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Unitário</TableHead>
                        <TableHead className="py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quote.items?.map((item: any, i: number) => (
                        <TableRow key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors print:border-slate-100 print:break-inside-avoid">
                          <TableCell className="py-4 text-sm font-semibold text-slate-700 print:py-3">{item.item_name}</TableCell>
                          <TableCell className="py-4 text-right text-sm text-slate-600 tabular-nums print:py-3">{item.quantity}</TableCell>
                          <TableCell className="py-4 text-right text-sm text-slate-600 tabular-nums print:py-3">{brl(item.unit_price)}</TableCell>
                          <TableCell className="py-4 text-right text-sm font-bold text-slate-800 tabular-nums print:py-3">{brl(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex justify-between items-center px-2 print:hidden">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Total de Itens: {quote.items?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Area: Customer & Financial */}
          <div className="space-y-6 print:space-y-4">
            {/* Customer Card */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden print:shadow-none print:border-slate-100 print:rounded-none">
              <CardHeader className="p-5 pb-2 border-b border-slate-50 flex flex-row items-center gap-3 print:p-4 print:pb-0 print:border-none">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center print:hidden">
                  <User2 className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 print:p-4 print:pt-1">
                {quote.customer ? (
                  <div className="space-y-3 print:space-y-1">
                    <div>
                      <p className="font-bold text-slate-800 text-base leading-tight print:text-lg">{quote.customer.name}</p>
                      {quote.customer.document && (
                        <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter print:text-xs print:text-slate-600">Doc: {quote.customer.document}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-50 space-y-2 print:pt-1 print:border-none print:space-y-0.5">
                      {(quote.customer.whatsapp || quote.customer.phone) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 print:text-xs">
                          <span className="font-medium text-slate-400 text-xs uppercase w-10 print:text-slate-500">Tel:</span>
                          <span className="font-semibold">{quote.customer.whatsapp || quote.customer.phone}</span>
                        </div>
                      )}
                      {quote.customer.address_city && (
                        <div className="flex items-start gap-2 text-sm text-slate-600 print:text-xs">
                          <span className="font-medium text-slate-400 text-xs uppercase w-10 mt-1 print:text-slate-500">End:</span>
                          <span className="flex-1 leading-snug">{quote.customer.address_street}, {quote.customer.address_number} - {quote.customer.address_city}/{quote.customer.address_state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Cliente não identificado</p>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary Card */}
            <Card className="border-slate-200 shadow-md bg-white rounded-xl overflow-hidden ring-1 ring-slate-100 print:shadow-none print:border-slate-100 print:rounded-none print:ring-0 print:break-inside-avoid">
              <CardHeader className="p-5 pb-2 border-b border-slate-50 flex flex-row items-center gap-3 print:p-4 print:pb-1 print:border-none">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center print:hidden">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 print:p-4 print:pt-0">
                <div className="space-y-3 print:space-y-1.5">
                  <div className="flex justify-between text-sm print:text-xs">
                    <span className="text-slate-400 font-medium print:text-slate-500">Subtotal</span>
                    <span className="text-slate-600 font-bold tabular-nums">{brl(quote.subtotal)}</span>
                  </div>
                  {quote.discount_value > 0 && (
                    <div className="flex justify-between text-sm print:text-xs">
                      <span className="text-slate-400 font-medium print:text-slate-500">Desconto ({quote.discount_value}%)</span>
                      <span className="text-slate-600 font-bold tabular-nums">
                        - {quote.discount_type === 'percentage'
                          ? `${brl(quote.subtotal * (quote.discount_value / 100))}`
                          : brl(quote.discount_value)}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 mt-2 print:pt-2 print:mt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] print:text-slate-500">Total do Orçamento</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter print:text-2xl">
                          {brl(quote.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {quote.payment_method && (
                  <div className="pt-4 border-t border-slate-200 print:pt-2 print:border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 print:text-slate-500">Forma de Pagamento</p>
                    <p className="text-sm text-slate-700 font-bold print:text-xs">{quote.payment_method}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Observations Card */}
        {quote.notes && (
          <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden print:shadow-none print:border-slate-100 print:rounded-none print:break-inside-avoid">
            <CardHeader className="p-5 pb-2 border-b border-slate-50 print:p-4 print:pb-1 print:border-none">
              <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Observações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="p-5 print:p-4 print:pt-0">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic print:text-xs">
                "{quote.notes}"
              </p>
            </CardContent>
          </Card>
        )}

        <div className="py-12 text-center border-t border-slate-200 mt-8 print:py-6 print:mt-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] print:text-slate-400">Obrigado pela preferência!</p>
          <p className="hidden print:block text-[8px] text-slate-400 mt-2 font-medium">Orçamento emitido por Orça Fácil</p>
        </div>
      </div>
    </div>
  )
}
