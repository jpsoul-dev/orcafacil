'use client'

import { FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { CustomerQuote } from '@/lib/services/customer-service'

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

export function CustomerQuotesClient({ quotes }: { quotes: CustomerQuote[] }) {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed rounded-xl border-border m-4">
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-semibold text-foreground font-display">
          Nenhum orçamento encontrado
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-62.5">
          Este cliente ainda não possui orçamentos registrados.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card">
      <ul className="divide-y divide-border">
        {quotes.map((quote) => {
          let status = quote.status
          if (status === 'open') status = 'pending'
          else if (status === 'accepted') status = 'approved'
          else if (status === 'vencido') status = 'expired'
          if (status === 'pending' && quote.valid_until) {
            if (new Date() > new Date(quote.valid_until)) status = 'expired'
          }

          return (
            <li key={quote.id}>
              <Link
                href={`/app/quotes/${quote.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground text-sm font-display">
                    {quote.title ? quote.title : `#${String(quote.quote_number).padStart(6, '0')}`}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-foreground text-sm tabular-nums">
                      {brl(quote.total)}
                    </span>
                    <QuoteStatusBadge status={status} />
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
