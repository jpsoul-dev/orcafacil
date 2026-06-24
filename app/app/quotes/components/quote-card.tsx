'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { User, CalendarClock, CircleDollarSign } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import type { Quote } from '@/types'

interface QuoteCardProps {
  quote: Quote
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const router = useRouter()
  
  const targetUrl = `/app/quotes/${quote.id}`
  
  const rawTotal = quote.total
  const quoteTotal = typeof rawTotal === 'number'
    ? rawTotal
    : typeof rawTotal === 'string'
      ? parseFloat(rawTotal) || 0
      : 0

  const formatCurrencyBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar navegação se o usuário clicou no menu de ações (três pontinhos) ou em algum link interno
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('a') || target.closest('[role="button"]')) {
      return
    }
    router.push(targetUrl)
  }

  const formattedDate = React.useMemo(() => {
    if (!quote.created_at) return '—'
    try {
      const date = typeof quote.created_at === 'string' ? parseISO(quote.created_at) : new Date(quote.created_at)
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    } catch (err) {
      return '—'
    }
  }, [quote.created_at])

  const formattedValidUntil = React.useMemo(() => {
    if (!quote.valid_until) return null
    try {
      const date = new Date(quote.valid_until + 'T00:00:00')
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    } catch (err) {
      return null
    }
  }, [quote.valid_until])

  return (
    <Card 
      variant="interactive" 
      size="sm"
      className="flex flex-col h-full min-h-[190px] justify-between p-4"
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between w-full">
        <span className="text-ds-caption font-bold text-muted-foreground uppercase">
          ORC.{quote.quote_number} - {formattedDate}
        </span>
        <QuoteStatusBadge status={quote.status} />
      </CardHeader>
      
      <CardContent className="p-0 mt-3 flex-grow space-y-3">
        <CardTitle className="text-ds-body-md font-bold text-foreground line-clamp-2 leading-ds-normal">
          {quote.title || 'Sem título'}
        </CardTitle>
        
        <div className="space-y-2">
          {/* Cliente */}
          <div className="flex items-center gap-2 text-ds-body-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-foreground font-medium truncate">
              {quote.customers?.name || 'Não informado'}
            </span>
          </div>
          
          {/* Validade */}
          {formattedValidUntil && (
            <div className="flex items-center gap-2 text-ds-caption text-muted-foreground">
              <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>Válido até: {formattedValidUntil}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-0 pt-3 border-t border-border mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-ds-body-md font-semibold text-foreground">
          <CircleDollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{formatCurrencyBRL(quoteTotal)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
