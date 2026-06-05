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
    draft: 'bg-slate-400',
    pending: 'bg-indigo-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-rose-500',
    cancelled: 'bg-red-600',
    completed: 'bg-teal-500',
    expired: 'bg-slate-900',
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
    <div className="space-y-6 [&>*:first-child]:mb-12">
      {/*Header*/}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Meus orçamentos
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe seus orçamentos em andamento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SubscriptionGuard>
            <Link href="/app/quotes/new">
              <Button>
                <Plus /> Criar Orçamento
              </Button>
            </Link>
          </SubscriptionGuard>
        </div>
      </div>

      {/*Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente, título ou código..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto">
          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="h-10"
          />
          <Tabs
            value={statusTab}
            onValueChange={setStatusTab}
            className="w-full xl:w-auto animate-in fade-in duration-200"
          >
            <TabsList className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-auto bg-slate-100 p-1 rounded-lg gap-1 max-w-full justify-start">
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
                  className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-1.5 rounded-md transition-all shrink-0 flex items-center gap-1.5"
                >
                  {dotMap[tab.value] && (
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotMap[tab.value])} />
                  )}
                  <span>{tab.label}</span>
                  <span className="text-[10px] bg-slate-200/50 text-slate-500 data-[state=active]:bg-slate-100 rounded-full px-1.5 py-0.2 font-mono">
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
        <DataTable columns={columns} data={filteredQuotes} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
            <List className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {date?.from && date?.to
              ? 'Nenhum orçamento no período informado.'
              : 'Você ainda não possui orçamentos.'}
          </p>
        </div>
      )}
    </div>
  )
}
