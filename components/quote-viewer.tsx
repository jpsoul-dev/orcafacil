'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer, Send, Pencil, ChevronLeft, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
    draft: { label: 'Rascunho', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    open: { label: 'Em Aberto', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    accepted: { label: 'Aceito', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800 border-red-200' },
    expired: { label: 'Expirado', color: 'bg-slate-100 text-slate-800 border-slate-200' },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-sm sm:rounded-2xl overflow-hidden print:shadow-none print:dark:bg-white border border-slate-200 print:border-none">
        
        {/* Actions Bar - hidden on print */}
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-b print:hidden">
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/app/quotes">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
              </Link>
            )}
            {!isAdmin ? (
              <Badge className={`rounded-full px-3 py-1 font-bold ${statusMap[currentStatus]?.color || ''}`}>
                {statusMap[currentStatus]?.label || currentStatus}
              </Badge>
            ) : (
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className={`h-8 w-[140px] rounded-full px-3 font-bold border-none shadow-none focus:ring-0 ${statusMap[currentStatus]?.color || ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusMap).map(([value, info]) => (
                    <SelectItem key={value} value={value} className="font-medium text-slate-700">
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Link href={`/app/quotes/${quote.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 font-semibold">
                    <Pencil className="h-4 w-4" /> Editar
                  </Button>
                </Link>
                <Link href={`/app/quotes/new?clone=${quote.id}`}>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 font-semibold">
                    <Copy className="h-4 w-4" /> Clonar
                  </Button>
                </Link>
                <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-600 font-semibold hover:bg-blue-50">
                  <Send className="h-4 w-4" /> Enviar para Cliente
                </Button>
              </>
            )}
            <Button onClick={handlePrint} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>

        <div className="p-10 print:p-0 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-10">
            <div className="flex items-center gap-5">
              {quote.company?.logo_url ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                  <Image src={quote.company.logo_url} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-slate-400 rounded-xl border border-slate-200 border-dashed">
                  Sem logo
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{quote.company?.name || 'Empresa'}</h1>
                <p className="text-slate-500 font-medium print:text-slate-600">{quote.company?.phone}</p>
                {quote.company?.address_city && (
                  <p className="text-sm text-slate-400 print:text-slate-600">
                    {quote.company.address_city} - {quote.company.address_state}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right sm:max-w-[300px]">
              <h2 className="text-4xl font-black text-slate-200 leading-none mb-2">ORÇAMENTO</h2>
              <p className="text-xl font-bold text-[#2E6898] mt-1">ORC-{quote.quote_number?.toString().padStart(4, '0')}</p>
              <div className="mt-4 text-sm space-y-1">
                <p className="text-slate-500"><span className="font-bold text-slate-700">Data de emissão:</span> {format(new Date(quote.created_at), 'dd/MM/yyyy')}</p>
                {quote.valid_until && (
                  <p className="text-slate-500"><span className="font-bold text-slate-700">Válido até:</span> {format(new Date(quote.valid_until), 'dd/MM/yyyy')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Title and Customer */}
          <div className="py-10 grid sm:grid-cols-2 gap-10 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Título do Orçamento</h3>
              <p className="text-lg font-bold text-slate-800">{quote.title}</p>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cliente</h3>
              {quote.customer ? (
                <div className="text-sm space-y-1">
                  <p className="font-bold text-slate-900 text-base">{quote.customer.name}</p>
                  <div className="flex flex-col text-slate-500">
                    {quote.customer.document && <span>CPF/CNPJ: {quote.customer.document}</span>}
                    {(quote.customer.whatsapp || quote.customer.phone) && <span>Tel: {quote.customer.whatsapp || quote.customer.phone}</span>}
                    {quote.customer.address_city && (
                      <span>{quote.customer.address_street}, {quote.customer.address_number} - {quote.customer.address_city}/{quote.customer.address_state}</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Cliente não identificado</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-10">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-none print:bg-slate-100">
                  <TableHead className="w-[50%] font-bold text-slate-700 rounded-l-lg">Descrição do Item</TableHead>
                  <TableHead className="text-center font-bold text-slate-700">Qtd</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Preço Unit.</TableHead>
                  <TableHead className="text-right font-bold text-slate-700 rounded-r-lg">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items?.map((item: any, i: number) => (
                  <TableRow key={i} className="border-b border-slate-50 last:border-none">
                    <TableCell className="py-5 font-medium text-slate-800">{item.item_name}</TableCell>
                    <TableCell className="py-5 text-center text-slate-600 tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="py-5 text-right text-slate-600 tabular-nums">
                      {brl(item.unit_price)}
                    </TableCell>
                    <TableCell className="py-5 text-right font-bold text-slate-900 tabular-nums">
                      {brl(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Payment & Totals */}
          <div className="flex flex-col sm:flex-row justify-between gap-12 pt-10 mt-5 border-t border-slate-100">
            <div className="flex-1 space-y-8">
              {quote.payment_method && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Condições de Pagamento</h4>
                  <p className="text-slate-700 font-medium">{quote.payment_method}</p>
                </div>
              )}
              {quote.notes && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Observações Adicionais</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    "{quote.notes}"
                  </p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-80">
              <div className="space-y-3 p-6 rounded-2xl bg-slate-900 text-white shadow-xl">
                <div className="flex justify-between text-sm opacity-70">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">{brl(quote.subtotal)}</span>
                </div>
                {quote.discount_value > 0 && (
                  <div className="flex justify-between text-sm text-amber-400">
                    <span>Desconto aplicado:</span>
                    <span className="tabular-nums">
                      - {quote.discount_type === 'percentage' 
                          ? `${quote.discount_value}%` 
                          : brl(quote.discount_value)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold">Total Final:</span>
                  <span className="text-2xl font-black tabular-nums">{brl(quote.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Obrigado pela preferência!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
