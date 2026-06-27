'use client'

import { Receipt, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type ReceiptData = {
  id: string
  receipt_number: string
  title: string | null
  amount: number | string
  payment_method: string | null
  issued_at: string
  quote_id: string | null
}

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

export function CustomerReceiptsClient({ receipts }: { receipts: ReceiptData[] }) {
  if (!receipts || receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed rounded-xl border-border m-4">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-semibold text-foreground font-display">
          Nenhum recibo encontrado
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          Este cliente ainda não possui recibos emitidos.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card">
      <ul className="divide-y divide-border">
        {receipts.map((receipt) => {
          const price = parseFloat(receipt.amount as string)
          const title = receipt.title || `Recibo #${receipt.receipt_number}`

          return (
            <li key={receipt.id}>
              <Link
                href={`/app/receipts/${receipt.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground text-sm font-display">
                    {title}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {receipt.issued_at 
                      ? format(new Date(receipt.issued_at + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                      : '—'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-foreground text-sm tabular-nums">
                      {brl(isNaN(price) ? 0 : price)}
                    </span>
                    {receipt.quote_id ? (
                      <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-none font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                        Vinculado
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-500/10 text-slate-500 border border-slate-500/20 shadow-none font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                        Avulso
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
