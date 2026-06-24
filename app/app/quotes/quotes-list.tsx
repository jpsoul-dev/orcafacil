'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { SubscriptionGuard } from '@/components/subscription-guard'
import type { Quote } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Filter, X } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { QuoteCard } from './components/quote-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const sortLabels: Record<string, string> = {
  newest: 'Mais recentes',
  oldest: 'Mais antigos',
  highest_value: 'Maior valor',
  lowest_value: 'Menor valor',
}

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
  const [sortBy, setSortBy] = useState<string>('newest')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPageIndex(0)
  }, [search, statusTab, date])

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
    draft: 'var(--ds-color-text-disabled)',
    pending: 'var(--ds-color-status-pending)',
    approved: 'var(--ds-color-status-approved)',
    rejected: 'var(--ds-color-status-rejected)',
    cancelled: 'var(--ds-color-status-cancelled)',
    completed: 'var(--ds-color-status-completed)',
    expired: 'var(--ds-color-text-secondary)',
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

  const sortedAndFilteredQuotes = useMemo(() => {
    let result = [...filteredQuotes]
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
    } else if (sortBy === 'highest_value') {
      result.sort((a, b) => {
        const aVal = typeof a.total === 'number' ? a.total : parseFloat(a.total as any) || 0
        const bVal = typeof b.total === 'number' ? b.total : parseFloat(b.total as any) || 0
        return bVal - aVal
      })
    } else if (sortBy === 'lowest_value') {
      result.sort((a, b) => {
        const aVal = typeof a.total === 'number' ? a.total : parseFloat(a.total as any) || 0
        const bVal = typeof b.total === 'number' ? b.total : parseFloat(b.total as any) || 0
        return aVal - bVal
      })
    }
    return result
  }, [filteredQuotes, sortBy])

  const paginatedQuotes = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return sortedAndFilteredQuotes.slice(start, end)
  }, [sortedAndFilteredQuotes, pageIndex, pageSize])

  const totalPages = Math.ceil(sortedAndFilteredQuotes.length / pageSize)

  const handleClearFilters = () => {
    setSearch('')
    setStatusTab('all')
    setDate({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    })
  }

  const hasActiveFilters = search || statusTab !== 'all' ||
    (date?.from && date?.to && (date.from.getTime() !== startOfMonth(new Date()).getTime() || date.to.getTime() !== endOfMonth(new Date()).getTime()))

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
              <Button className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                <Plus className="mr-1 h-4 w-4" /> Criar Orçamento
              </Button>
            </Link>
          </SubscriptionGuard>
        </div>
      </div>

      {/*Action Bar */}
      <div className="flex flex-col gap-4 bg-card border border-border p-4 rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, título ou código..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="w-full md:w-auto"
          />
        </div>

        <Tabs
          value={statusTab}
          onValueChange={setStatusTab}
          className="w-full"
        >
          <TabsList className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] group-data-horizontal/tabs:h-auto bg-transparent p-0 gap-2 max-w-full justify-start border-none sm:flex-wrap sm:overflow-x-visible">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'draft', label: 'Rascunho' },
              { value: 'pending', label: 'Pendente' },
              { value: 'approved', label: 'Aprovado' },
              { value: 'rejected', label: 'Rejeitado' },
              { value: 'cancelled', label: 'Cancelado' },
              { value: 'completed', label: 'Finalizado' },
              { value: 'expired', label: 'Vencido' },
            ].map((tab) => {
              const isActive = statusTab === tab.value
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "text-ds-body-sm font-semibold border rounded-full px-3 py-1.5 transition-all duration-ds-fast shrink-0 flex items-center gap-1.5 cursor-pointer",
                    isActive
                      ? "data-active:bg-primary/10 data-active:text-primary shadow-none"
                      : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/75"
                  )}
                >
                  {dotMap[tab.value] && (
                    <div
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: dotMap[tab.value] }}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "text-[10px] rounded-full px-1.5 py-0.2 font-sans transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary "
                        : "bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {counts[tab.value as keyof typeof counts]}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Info & Sort Bar */}
      <div className="flex items-center justify-between py-1 px-1">
        <span className="text-ds-body-sm text-muted-foreground font-medium">
          {sortedAndFilteredQuotes.length} {sortedAndFilteredQuotes.length === 1 ? 'orçamento' : 'orçamentos'}
        </span>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'newest')}>
            <SelectTrigger className="h-9 w-[160px] text-ds-body-sm bg-card font-medium rounded-sm border-border cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <span>{sortLabels[sortBy] || 'Ordenar por'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="highest_value">Maior valor</SelectItem>
              <SelectItem value="lowest_value">Menor valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/*Quotes Cards Grid*/}
      {paginatedQuotes && paginatedQuotes.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.max(totalPages, 1) }).map((_, idx) => (
                <Button
                  key={idx}
                  variant={pageIndex === idx ? "default" : "outline"}
                  className={cn(
                    "h-8 w-8 text-xs font-semibold cursor-pointer",
                    pageIndex === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setPageIndex(idx)}
                  disabled={totalPages <= 1}
                >
                  {idx + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={pageIndex === totalPages - 1 || totalPages <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Por página:
              </span>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  if (value) {
                    setPageSize(Number(value))
                    setPageIndex(0)
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs bg-card font-semibold rounded-sm border-border cursor-pointer">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`} className="text-xs">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
            {hasActiveFilters
              ? 'Nenhum orçamento encontrado para os filtros informados.'
              : 'Você ainda não possui orçamentos.'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4 font-semibold rounded-md cursor-pointer"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
