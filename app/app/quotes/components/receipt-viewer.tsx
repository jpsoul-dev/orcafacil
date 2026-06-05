'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Printer, Pencil, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { deleteReceiptAction } from '../receipt-actions'
import { formatBRL } from '@/lib/utils'
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
} from '@/components/ui/alert-dialog'

interface Receipt {
  id: string
  receipt_number: string
  title: string
  amount: number
  payment_method: string
  services_description: string
  issued_at: string
}

interface Company {
  name: string
  phone: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  address_complement?: string
}

interface Customer {
  name: string
  document: string
  phone: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
}

interface Quote {
  id: string
  quote_number: number
  company: Company
  customer: Customer
}

interface ReceiptViewerProps {
  receipt: Receipt
  quote: Quote
}

export function ReceiptViewer({ receipt, quote }: ReceiptViewerProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handlePrint = () => {
    window.print()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteReceiptAction(receipt.id, quote.id)
      if (result.success) {
        toast.success('Recibo excluído com sucesso!')
        router.push(`/app/quotes/${quote.id}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao excluir o recibo.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro de conexão ao tentar excluir o recibo.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Formatação de data
  const formattedIssuedDate = format(parseISO(receipt.issued_at), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  // Endereço do Prestador formatado
  const companyAddress = [
    quote.company?.address_street &&
      `${quote.company.address_street}${quote.company.address_number ? `, ${quote.company.address_number}` : ''}${quote.company.address_complement ? ` - ${quote.company.address_complement}` : ''}`,
    quote.company?.address_neighborhood,
    quote.company?.address_city &&
      `${quote.company.address_city}${quote.company.address_state ? `/${quote.company.address_state}` : ''}`,
  ]
    .filter(Boolean)
    .join(' — ')

  return (
    <div className="min-h-screen bg-slate-50 py-0 print:bg-white print:py-0">
      {/* BARRA DE AÇÕES (OCULTADA NA IMPRESSÃO) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden mb-8">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/app/quotes/${quote.id}`}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                "h-9 gap-2 font-bold text-slate-600"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/app/quotes/${quote.id}/receipt/edit`}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                "h-9 gap-2 border-slate-200 font-bold text-slate-700"
              )}
            >
              <Pencil className="h-4 w-4" />
              Editar Recibo
            </Link>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      "h-9 gap-2 border-red-200 hover:bg-red-50 text-red-600 font-bold hover:text-red-700 cursor-pointer"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                }
              />
              <AlertDialogContent className="bg-white rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-bold text-slate-900">Excluir Recibo</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-500">
                    Tem certeza que deseja excluir este recibo? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Exclusão'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={handlePrint} size="sm" className="h-9 gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold">
              <Printer className="h-4 w-4" />
              Imprimir Recibo
            </Button>
          </div>
        </div>
      </div>

      {/* CONTAINER DO RECIBO FÍSICO (A4 OTIMIZADO) */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-none sm:rounded-md min-h-[29.7cm] p-8 sm:p-16 print:shadow-none print:max-w-none print:p-0 print:m-0 relative overflow-hidden flex flex-col justify-between">
        <div>
          {/* TOPO: NÚMERO DO RECIBO E VALOR EM DESTAQUE */}
          <div className="flex justify-between items-start mb-16 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                Recibo
              </h1>
              <p className="text-slate-400 font-black text-sm tracking-widest mt-1">
                Nº {receipt.receipt_number}
              </p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-right shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Valor Recebido
              </span>
              <span className="text-3xl font-black text-blue-900 tracking-tighter tabular-nums">
                {formatBRL(receipt.amount)}
              </span>
            </div>
          </div>

          {/* CABEÇALHO DO PRESTADOR */}
          <div className="mb-12">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Emitente
            </h4>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {quote.company?.name || 'Sua Empresa'}
              </h2>
              {companyAddress && (
                <p className="text-xs text-slate-500 font-medium">
                  {companyAddress}
                </p>
              )}
              <p className="text-xs text-slate-400 font-medium">
                Contato: {quote.company?.phone || '---'}
              </p>
            </div>
          </div>

          <Separator className="my-10 bg-slate-100" />

          {/* DECLARAÇÃO PRINCIPAL DO RECIBO */}
          <div className="space-y-8 my-12 text-slate-700 leading-relaxed text-base">
            <p className="text-justify font-normal">
              Recebemos de <strong className="font-extrabold text-slate-900">{quote.customer?.name}</strong>
              {quote.customer?.document ? (
                <>
                  , inscrito(a) no CPF/CNPJ sob o nº <strong className="font-bold text-slate-900">{quote.customer.document}</strong>,
                </>
              ) : (
                ','
              )}{' '}
              a importância de <strong className="font-extrabold text-slate-900">{formatBRL(receipt.amount)}</strong> ({receipt.title.toLowerCase()}), 
              paga por meio de <strong className="font-bold text-slate-900 uppercase">{receipt.payment_method}</strong>, 
              referente à prestação dos serviços detalhados abaixo:
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 italic text-slate-600 text-sm whitespace-pre-line leading-relaxed shadow-inner">
              {receipt.services_description}
            </div>

            <p className="text-right text-slate-500 font-medium pt-4">
              Para maior clareza, firmamos o presente recibo.
            </p>

            <p className="text-right font-black text-slate-900 text-sm tracking-wide">
              {quote.company?.address_city || 'Emitido'} em {formattedIssuedDate}.
            </p>
          </div>
        </div>

        {/* ASSINATURAS ESTÁTICAS PARA IMPRESSÃO */}
        <div className="pt-24 mt-auto">
          <div className="grid grid-cols-2 gap-20">
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 w-full" />
              <p className="text-sm font-bold text-slate-900">
                {quote.company?.name || 'Assinatura do Emitente'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Emitente / Prestador
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="border-t border-slate-300 w-full" />
              <p className="text-sm font-bold text-slate-900">
                {quote.customer?.name}
              </p>
              {quote.customer?.document && (
                <p className="text-[11px] text-slate-400 font-medium">
                  CPF/CNPJ: {quote.customer.document}
                </p>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Cliente / Pagador
              </p>
            </div>
          </div>
        </div>

        {/* DETALHE PEQUENO DO SISTEMA NO RODAPÉ */}
        <div className="absolute bottom-6 left-0 right-0 px-16 flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider opacity-40 print:hidden">
          <span>Orca Fácil — Recibos de Quitação</span>
          <span>Orçamento Ref: #{quote.quote_number}</span>
        </div>
      </div>
    </div>
  )
}
