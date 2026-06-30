'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, Pencil, Trash2, Loader2, CloudDownload } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { deleteReceiptAction, deleteStandaloneReceiptAction } from '../receipt-actions'
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

import {
  type Receipt,
  type ReceiptQuote as Quote,
} from '@/types/receipt'

interface ReceiptViewerProps {
  receipt: Receipt
  quote: Quote
  isStandalone?: boolean
}

export function ReceiptViewer({ receipt, quote, isStandalone = false }: ReceiptViewerProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)


  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = isStandalone
        ? await deleteStandaloneReceiptAction(receipt.id)
        : await deleteReceiptAction(receipt.id, quote.id)
      if (result.success) {
        toast.success('Recibo excluído com sucesso!')
        router.push(isStandalone ? '/app/receipts' : `/app/quotes/${quote.id}`)
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

  // Formatação de data sem problemas de fuso horário (GMT)
  const formattedIssuedDate = (() => {
    if (!receipt.issued_at) return ''
    const [year, month, day] = receipt.issued_at.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    return format(localDate, "d 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    })
  })()

  // Endereço do cliente formatado
  const customerAddress = [
    quote.customer?.address_street &&
    `${quote.customer.address_street}${quote.customer.address_number ? `, ${quote.customer.address_number}` : ''}`,
    quote.customer?.address_neighborhood,
    quote.customer?.address_city &&
    `${quote.customer.address_city}${quote.customer.address_state ? `, ${quote.customer.address_state}` : ''}`,
    quote.customer?.address_zip,
  ]
    .filter(Boolean)
    .join(', ')

  const customerDocumentLabel = quote.customer?.document?.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF'

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-0 sm:px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start justify-center print:block print:max-w-none">

        {/* CONTAINER DO RECIBO FÍSICO (ESQUERDA) */}
        <div className="w-full lg:max-w-[21cm] shrink-0 print:w-full print:max-w-none order-2 lg:order-none">
          {/* CONTAINER DO RECIBO FÍSICO (A4 OTIMIZADO) */}
          <div className="max-w-[21cm] mx-auto bg-white shadow-xl rounded-none sm:rounded-md min-h-0 sm:min-h-[29.7cm] p-4 sm:p-12 md:p-16 print:shadow-none print:max-w-none print:p-0 print:m-0 relative overflow-hidden flex flex-col justify-between print:min-h-0 print:h-full">
            <div>
              {/* TOPO: CABEÇALHO DO RECIBO */}
              <div className="flex justify-between items-start mb-10 pb-6 border-b border-neutral-100">
                <div>
                  <h1 className="text-4xl font-extrabold text-neutral-800 tracking-tight">
                    Recibo
                  </h1>
                  {quote.title && (
                    <p className="text-sm font-medium text-neutral-600 mt-1">
                      {quote.title}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-medium text-neutral-500">
                    {formattedIssuedDate}
                  </span>
                </div>
              </div>

              {/* DADOS DO CLIENTE */}
              <div className="space-y-2 text-sm text-neutral-700 mb-8">
                <div>
                  <span className="font-extrabold text-neutral-800">Recebido de: </span>
                  {quote.customer?.name}
                </div>
                {quote.customer?.document && (
                  <div>
                    <span className="font-extrabold text-neutral-800">{customerDocumentLabel}: </span>
                    {quote.customer.document}
                  </div>
                )}
                {customerAddress && (
                  <div>
                    <span className="font-extrabold text-neutral-800">Endereço: </span>
                    {customerAddress}
                  </div>
                )}
              </div>

              {/* TABELA DE ITENS */}
              {quote.items && quote.items.length > 0 && (
                <div className="border border-neutral-300 rounded-none w-full overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px] sm:min-w-0">
                    <thead>
                      <tr className="bg-neutral-700 text-white font-bold uppercase tracking-wider text-[11px] border-b border-neutral-300">
                        <th className="p-3 text-left w-[45%] border-r border-neutral-300 bg-neutral-700 print:bg-neutral-700 text-white">Descrição</th>
                        <th className="p-3 text-center w-[20%] border-r border-neutral-300 bg-neutral-700 print:bg-neutral-700 text-white">Valor</th>
                        <th className="p-3 text-center w-[15%] border-r border-neutral-300 bg-neutral-700 print:bg-neutral-700 text-white">Qtd.</th>
                        <th className="p-3 text-center w-[20%] bg-neutral-700 print:bg-neutral-700 text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-300 text-neutral-700 font-medium">
                      {quote.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-neutral-300">
                          <td className="p-3 text-left font-normal border-r border-neutral-300">{item.item_name}</td>
                          <td className="p-3 text-center tabular-nums border-r border-neutral-300">{formatBRL(item.unit_price)}</td>
                          <td className="p-3 text-center tabular-nums border-r border-neutral-300">{item.quantity}</td>
                          <td className="p-3 text-center tabular-nums font-normal">{formatBRL(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* RODAPÉ DA TABELA E VALORES */}
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs font-bold text-neutral-800 tracking-wide uppercase">
                  <span className="font-extrabold">Forma de Pagamento: </span>
                  <span className="font-normal">{receipt.payment_method}</span>
                </div>
                <div className="bg-neutral-700 print:bg-neutral-700 text-white font-bold px-6 py-2 rounded-none text-sm tracking-wide">
                  Total: {formatBRL(receipt.amount)}
                </div>
              </div>

              {/* MENSAGEM DE CONFIRMAÇÃO */}
              {receipt.services_description && (
                <div className="mt-12 text-sm text-neutral-500 font-normal leading-relaxed text-left">
                  {receipt.services_description}
                </div>
              )}
            </div>

            {/* IDENTIFICAÇÃO DO EMITENTE NO RODAPÉ */}
            <div className="text-center mt-auto pt-16 mb-4">
              {quote.company?.name && (
                <p className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
                  {quote.company.name}
                </p>
              )}
              {quote.company?.cnpj && (
                <p className="text-xs text-neutral-500 mt-1">
                  CNPJ: {quote.company.cnpj}
                </p>
              )}
            </div>

            {/* DETALHE PEQUENO DO SISTEMA NO RODAPÉ */}
            <div className="absolute bottom-4 left-0 right-0 px-12 flex justify-between items-center text-[9px] text-slate-400 font-bold tracking-wider opacity-40 print:hidden">
              <span>Orca Fácil — Recibos de Quitação</span>
              <span>{isStandalone ? 'Recibo Avulso' : `Orçamento Ref: #${quote.quote_number}`}</span>
            </div>
          </div>
        </div>

        {/* SIDEBAR DE AÇÕES (DIREITA) */}
        <div className="w-full lg:w-[280px] shrink-0 sticky lg:top-8 print:hidden px-4 sm:px-0 order-1 lg:order-none">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-md flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ações
            </span>

            <Separator className="bg-slate-100" />

            <div className="flex flex-col gap-2.5">
              {/* Botão Imprimir Recibo */}
              <a
                href={`/api/receipts/${receipt.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  "w-full h-10 gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer flex items-center justify-center"
                )}
              >
                <Printer className="h-4.5 w-4.5" />
                Imprimir Recibo
              </a>

              {/* Botão Editar Recibo */}
              <SubscriptionGuard>
                <Link
                  href={isStandalone ? `/app/receipts/${receipt.id}/edit` : `/app/quotes/${quote.id}/receipt/edit`}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    "w-full h-10 gap-2 border-slate-200 font-bold rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 flex items-center justify-center"
                  )}
                >
                  <Pencil className="h-4.5 w-4.5" />
                  Editar Recibo
                </Link>
              </SubscriptionGuard>

              {/* Botão Baixar PDF */}
              <a
                href={`/api/receipts/${receipt.id}/pdf?download=true`}
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

              {/* Separador antes do excluir */}
              <Separator className="bg-slate-100 my-1" />

              {/* AlertDialog de Exclusão */}
              <AlertDialog>
                <SubscriptionGuard>
                  <AlertDialogTrigger
                    render={
                      <button
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "w-full h-10 gap-2 border-red-200 hover:bg-red-50 text-red-600 font-bold hover:text-red-700 rounded-lg cursor-pointer flex items-center justify-center"
                        )}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                        Excluir Recibo
                      </button>
                    }
                  />
                </SubscriptionGuard>
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
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
