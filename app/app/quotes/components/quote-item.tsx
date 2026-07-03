'use client'

import React from 'react'
import type { Quote } from '@/types'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { format, parseISO } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface QuoteItemProps {
  quote: Quote
}

export function QuoteItem({ quote }: QuoteItemProps) {
  // Formatando o número do orçamento como ORC-XXX
  const quoteCode = `ORC-${String(quote.quote_number).padStart(3, '0')}`

  // Formatando a data de criação
  const formattedDate = quote.created_at
    ? format(parseISO(quote.created_at), 'dd/MM/yyyy')
    : ''

  // Formatando o valor total
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(quote.total || 0)

  return (
    <Link
      href={`/app/quotes/${quote.id}`}
      className="group block transition-colors duration-ds-fast hover:bg-muted/40"
    >
      {/* Container Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        {/* Lado Esquerdo: Metadados do Orçamento (ID + Data) e Título */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 min-w-0">
          {/* ID e Data de Criação */}
          <div className="flex items-baseline sm:flex-col sm:justify-center shrink-0 min-w-[80px]">
            <span className="text-xs font-semibold text-foreground tracking-tight">
              {quoteCode}
            </span>
            <span className="text-[11px] text-muted-foreground ml-2 sm:ml-0 font-medium">
              {formattedDate}
            </span>
          </div>

          {/* Título / Descrição e Nome do Cliente */}
          <div className="min-w-0 flex-1">
            <h3 className="text-ds-body-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {quote.title || 'Sem título'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">
              {quote.customers?.name || 'Cliente não associado'}
            </p>
          </div>
        </div>

        {/* Lado Direito: Valor Total, Status Badge e Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mt-1 sm:mt-0">
          <span className="text-ds-body-sm font-bold text-foreground sm:text-right min-w-[90px] tabular-nums">
            {formattedTotal}
          </span>
          <div className="flex items-center justify-end min-w-[90px]">
            <QuoteStatusBadge status={quote.status} />
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </Link>
  )
}
