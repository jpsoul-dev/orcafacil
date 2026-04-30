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
import { useState } from 'react'

interface QuoteViewerProps {
  quote: any
  isAdmin?: boolean
}

export function QuoteViewer({ quote, isAdmin = false }: QuoteViewerProps) {
  const [currentStatus, setCurrentStatus] = useState(quote.status)
  const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Header Actions */}
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
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Orçamento: ORC-{quote.quote_number?.toString().padStart(4, '0')}</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info Card */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
            <CardHeader className="p-0 border-b border-slate-100 bg-slate-50/50">
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="flex items-center gap-5">
                  {quote.company?.logo_url ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm p-2 flex items-center justify-center">
                      <Image src={quote.company.logo_url} alt="Logo" fill className="object-contain p-2" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white flex items-center justify-center text-slate-400 rounded-xl border border-slate-200 border-dashed">
                      <Building2 className="h-6 w-6 opacity-40" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{quote.company?.name || 'Empresa'}</h2>
                    <p className="text-sm text-slate-500 font-medium">{quote.company?.phone}</p>
                    {quote.company?.address_city && (
                      <p className="text-xs text-slate-400">
                        {quote.company.address_city} - {quote.company.address_state}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-left sm:text-right space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-xs">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Emissão: {format(new Date(quote.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  {quote.valid_until && (
                    <div className="block sm:block">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-blue-700">Validade: {format(new Date(quote.valid_until), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Itens do Orçamento</h3>
                </div>
                
                <div className="rounded-lg border border-slate-100 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 border-none hover:bg-slate-50/80">
                        <TableHead className="py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Descrição</TableHead>
                        <TableHead className="py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider w-20">Qtd</TableHead>
                        <TableHead className="py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Unitário</TableHead>
                        <TableHead className="py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quote.items?.map((item: any, i: number) => (
                        <TableRow key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors">
                          <TableCell className="py-4 text-sm font-semibold text-slate-700">{item.item_name}</TableCell>
                          <TableCell className="py-4 text-right text-sm text-slate-600 tabular-nums">{item.quantity}</TableCell>
                          <TableCell className="py-4 text-right text-sm text-slate-600 tabular-nums">{brl(item.unit_price)}</TableCell>
                          <TableCell className="py-4 text-right text-sm font-bold text-slate-800 tabular-nums">{brl(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Total de Itens: {quote.items?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Area: Customer & Financial */}
          <div className="space-y-6">
            {/* Customer Card */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardHeader className="p-5 pb-2 border-b border-slate-50 flex flex-row items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User2 className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {quote.customer ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-slate-800 text-base leading-tight">{quote.customer.name}</p>
                      {quote.customer.document && (
                        <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Doc: {quote.customer.document}</p>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-50 space-y-2">
                      {(quote.customer.whatsapp || quote.customer.phone) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-400 text-xs uppercase w-10">Tel:</span>
                          <span className="font-semibold">{quote.customer.whatsapp || quote.customer.phone}</span>
                        </div>
                      )}
                      {quote.customer.address_city && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="font-medium text-slate-400 text-xs uppercase w-10 mt-1">End:</span>
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
            <Card className="border-slate-200 shadow-md bg-white rounded-xl overflow-hidden ring-1 ring-slate-100">
              <CardHeader className="p-5 pb-2 border-b border-slate-50 flex flex-row items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Subtotal</span>
                    <span className="text-slate-600 font-bold tabular-nums">{brl(quote.subtotal)}</span>
                  </div>
                  {quote.discount_value > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Desconto</span>
                      <span className="text-red-500 font-bold tabular-nums">
                        - {quote.discount_type === 'percentage' 
                            ? `${quote.discount_value}%` 
                            : brl(quote.discount_value)}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total do Orçamento</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">
                          {brl(quote.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {quote.payment_method && (
                  <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Forma de Pagamento</p>
                    <p className="text-sm text-slate-700 font-bold">{quote.payment_method}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Observations Card */}
        {quote.notes && (
          <Card className="border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
            <CardHeader className="p-5 pb-2 border-b border-slate-50">
              <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-tight">Observações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                "{quote.notes}"
              </p>
            </CardContent>
          </Card>
        )}

        <div className="py-12 text-center border-t border-slate-200 mt-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Obrigado pela preferência!</p>
        </div>
      </div>
      
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          .max-w-5xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .shadow-sm, .shadow-md, .shadow-xl {
            box-shadow: none !important;
          }
          .border-slate-200 {
            border-color: #f1f5f9 !important;
          }
          .bg-slate-50, .bg-slate-50\/50, .bg-slate-50\/80 {
            background-color: #f8fafc !important;
          }
          .rounded-xl {
            border-radius: 4px !important;
          }
        }
      `}</style>
    </div>
  )
}
