'use client'

import React, { useState, useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { SubscriptionGuard } from '@/components/subscription-guard'
import type { Quote } from '@/types'
import { Button } from '@/components/ui/button'
import { List, Plus } from 'lucide-react'
import Link from 'next/link'
import { DatePickerWithRange } from './components/date-range-picker'
import { DateRange } from 'react-day-picker'
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  endOfDay,
} from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuoteStatusBadge } from '@/components/quote-status-badge'

interface QuotesListProps {
  initialQuotes: Quote[]
}

export function QuotesList({ initialQuotes }: QuotesListProps) {
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<string>('all')
  const [date, setDate] = useState<DateRange | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  }))

  const counts = useMemo(() => {
    const defaultCounts = {
      all: initialQuotes.length,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
      expired: 0,
    }
    initialQuotes.forEach((quote) => {
      const status = quote.status
      if (status in defaultCounts) {
        defaultCounts[status as keyof typeof defaultCounts]++
      }
    })
    return defaultCounts
  }, [initialQuotes])

  const dotMap: Record<string, string> = {
    draft: 'bg-neutral-400 dark:bg-neutral-600',
    pending: 'bg-status-pending',
    approved: 'bg-status-approved',
    rejected: 'bg-status-rejected',
    cancelled: 'bg-status-cancelled',
    completed: 'bg-status-completed',
    expired: 'bg-neutral-500',
  }

  const filteredQuotes = useMemo(() => {
    return initialQuotes.filter((quote) => {
      // Filtrar por aba de situação
      if (statusTab !== 'all' && quote.status !== statusTab) {
        return false
      }

      // Filtrar por intervalo de data
      if (date?.from && date?.to) {
        if (!quote.created_at) return false
        const quoteDate = parseISO(quote.created_at)
        if (
          !isWithinInterval(quoteDate, {
            start: date.from!,
            end: endOfDay(date.to!),
          })
        )
          return false
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const customerName = quote.customers?.name?.toLowerCase() || ''
        const title = quote.title?.toLowerCase() || ''
        const quoteNumber = quote.quote_number?.toString() || ''

        return (
          customerName.includes(searchLower) ||
          title.includes(searchLower) ||
          quoteNumber.includes(searchLower)
        )
      }

      return true
    })
  }, [initialQuotes, date, search, statusTab])

  return (
    <div className="space-y-6">
      {/*Header*/}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground">
            Meus orçamentos
          </h2>
          <p className="text-muted-foreground text-ds-body-sm font-medium mt-1">
            Acompanhe seus orçamentos em andamento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SubscriptionGuard>
            <Link href="/app/quotes/new">
              <Button className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]">
                <Plus className="mr-1 h-4 w-4" /> Criar Orçamento
              </Button>
            </Link>
          </SubscriptionGuard>
        </div>
      </div>

      {/*Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card border border-border p-4 rounded-md shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, título ou código..."
            className="pl-9 h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto">
          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="h-10 border-border bg-card text-ds-body-sm font-medium rounded-sm"
          />
          <Tabs
            value={statusTab}
            onValueChange={setStatusTab}
            className="w-full xl:w-auto"
          >
            <TabsList className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-auto bg-muted/50 p-1 rounded-md gap-1 max-w-full justify-start border border-border/50">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'draft', label: 'Rascunho' },
                { value: 'pending', label: 'Pendente' },
                { value: 'approved', label: 'Aprovado' },
                { value: 'rejected', label: 'Rejeitado' },
                { value: 'cancelled', label: 'Cancelado' },
                { value: 'completed', label: 'Finalizado' },
                { value: 'expired', label: 'Vencido' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {dotMap[tab.value] && (
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotMap[tab.value])} />
                  )}
                  <span>{tab.label}</span>
                  <span className="text-[10px] bg-muted/80 text-muted-foreground rounded-full px-1.5 py-0.2 font-sans">
                    {counts[tab.value as keyof typeof counts]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/*Quotes List*/}
      {filteredQuotes && filteredQuotes.length > 0 ? (
        <>
          {/* Tabela em telas médias/grandes */}
          <div className="hidden md:block">
            <DataTable columns={columns} data={filteredQuotes} />
          </div>

          {/* Cards táteis no Mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredQuotes.map((quote) => {
              const isDraft = quote.status === 'draft'
              const targetUrl = isDraft
                ? `/app/quotes/${quote.id}/edit`
                : `/app/quotes/${quote.id}`
              
              const quoteTotal = parseFloat(quote.total as any || 0)
              
              return (
                <Link key={quote.id} href={targetUrl} className="block">
                  <div className="flex flex-col p-4 rounded-md border border-border bg-card shadow-sm hover:shadow-md transition-all duration-ds-fast cursor-pointer">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-ds-caption font-bold text-muted-foreground uppercase">
                        #{quote.quote_number}
                      </span>
                      <QuoteStatusBadge status={quote.status} />
                    </div>
                    <h3 className="text-ds-body-md font-bold text-foreground truncate mb-1">
                      {quote.title || 'Sem título'}
                    </h3>
                    <p className="text-ds-body-sm text-muted-foreground truncate mb-3">
                      Cliente: <span className="text-foreground font-medium">{quote.customers?.name || 'Não informado'}</span>
                    </p>
                    <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                      <span className="text-ds-caption text-muted-foreground">
                        {quote.created_at ? new Date(quote.created_at).toLocaleDateString('pt-BR') : '—'}
                      </span>
                      <span className="text-ds-body-md font-semibold text-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quoteTotal)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <List className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
            {date?.from && date?.to
              ? 'Nenhum orçamento no período informado.'
              : 'Você ainda não possui orçamentos.'}
          </p>
        </div>
      )}
    </div>
  )
}
