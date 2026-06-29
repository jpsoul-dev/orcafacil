'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { SubscriptionGuard } from '@/components/subscription-guard'
import type { Quote } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ResponsivePagination } from '@/components/responsive-pagination'
import { DatePickerWithRange } from './components/date-range-picker'
import { DateRange } from 'react-day-picker'
import { parseISO, format } from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { QuoteCard } from './components/quote-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

const sortLabels: Record<string, string> = {
  newest: 'Mais recentes',
  oldest: 'Mais antigos',
  highest_value: 'Maior valor',
  lowest_value: 'Menor valor',
}

interface QuotesListProps {
  initialQuotes: Quote[]
  totalItems: number
  allStatuses: string[]
  filters: {
    page: number
    size: number
    limit: number
    search: string
    status: string
    from: string
    to: string
    sort: string
  }
}

export function QuotesList({
  initialQuotes,
  totalItems,
  allStatuses,
  filters,
}: QuotesListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Estado local para a busca de texto rápida (evita lag ao digitar)
  const [searchValue, setSearchValue] = useState(filters.search)
  const [prevSearch, setPrevSearch] = useState(filters.search)

  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search)
    setSearchValue(filters.search)
  }

  // Estado local para o Date Picker
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const fromDate = filters.from ? parseISO(filters.from) : undefined
    const toDate = filters.to ? parseISO(filters.to) : undefined
    return { from: fromDate, to: toDate }
  })
  const [prevFrom, setPrevFrom] = useState(filters.from)
  const [prevTo, setPrevTo] = useState(filters.to)

  if (filters.from !== prevFrom || filters.to !== prevTo) {
    setPrevFrom(filters.from)
    setPrevTo(filters.to)
    if (!filters.from && !filters.to) {
      setDate(undefined)
    } else {
      const fromDate = filters.from ? parseISO(filters.from) : undefined
      const toDate = filters.to ? parseISO(filters.to) : undefined
      setDate({ from: fromDate, to: toDate })
    }
  }

  // Centralizador de atualização de parâmetros na URL
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    const merged = {
      page: filters.page,
      size: filters.size,
      limit: filters.limit,
      search: filters.search,
      status: filters.status,
      from: filters.from,
      to: filters.to,
      sort: filters.sort,
      ...newFilters,
    }

    if (merged.search) params.set('search', merged.search); else params.delete('search')
    if (merged.status && merged.status !== 'all') params.set('status', merged.status); else params.delete('status')
    if (merged.from) params.set('from', merged.from); else params.delete('from')
    if (merged.to) params.set('to', merged.to); else params.delete('to')
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort); else params.delete('sort')

    // Se a alteração não for de paginação direta, reseta a paginação para evitar ficar em página vazia
    const isPaginationChange = 'page' in newFilters || 'size' in newFilters || 'limit' in newFilters
    if (!isPaginationChange) {
      params.delete('page')
      params.delete('limit')
    } else {
      if (merged.page > 0) params.set('page', String(merged.page)); else params.delete('page')
      if (merged.size !== 10) params.set('size', String(merged.size)); else params.delete('size')
      if (merged.limit) params.set('limit', String(merged.limit)); else params.delete('limit')
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [filters, searchParams, router, pathname])

  // Debouncing para a busca de texto (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== filters.search) {
        updateFilters({ search: searchValue })
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [searchValue, filters.search, updateFilters])

  // Monitorar alterações no Date Picker e atualizar URL
  useEffect(() => {
    const fromStr = date?.from ? format(date.from, 'yyyy-MM-dd') : ''
    const toStr = date?.to ? format(date.to, 'yyyy-MM-dd') : ''
    if (fromStr !== filters.from || toStr !== filters.to) {
      updateFilters({ from: fromStr, to: toStr })
    }
  }, [date, filters.from, filters.to, updateFilters])

  // Calcular contagens por status baseadas na prop allStatuses
  const counts = useMemo(() => {
    const defaultCounts = {
      all: allStatuses.length,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
      expired: 0,
    }
    allStatuses.forEach((status) => {
      if (status in defaultCounts) {
        defaultCounts[status as keyof typeof defaultCounts]++
      }
    })
    return defaultCounts
  }, [allStatuses])

  const dotMap: Record<string, string> = {
    draft: 'var(--ds-color-text-disabled)',
    pending: 'var(--ds-color-status-pending)',
    approved: 'var(--ds-color-status-approved)',
    rejected: 'var(--ds-color-status-rejected)',
    cancelled: 'var(--ds-color-status-cancelled)',
    completed: 'var(--ds-color-status-completed)',
    expired: 'var(--ds-color-text-secondary)',
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setDate(undefined)
    updateFilters({
      search: '',
      status: 'all',
      from: '',
      to: '',
      page: 0,
      limit: 0,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.from ||
    filters.to

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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="w-full md:w-auto"
          />
        </div>

        <Tabs
          value={filters.status}
          onValueChange={(val) => updateFilters({ status: val })}
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
              const isActive = filters.status === tab.value
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
                    {counts[tab.value as keyof typeof counts] || 0}
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
          {totalItems} {totalItems === 1 ? 'orçamento' : 'orçamentos'}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={filters.sort}
            onValueChange={(val) => updateFilters({ sort: val || 'newest' })}
          >
            <SelectTrigger className="h-9 w-40 text-ds-body-sm bg-card font-medium rounded-sm border-border cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <span>{sortLabels[filters.sort] || 'Ordenar por'}</span>
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
      {initialQuotes && initialQuotes.length > 0 ? (
        <div className="space-y-6">
          {/* Grid Desktop */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>

          {/* Grid Mobile */}
          <div className="grid sm:hidden grid-cols-1 gap-6">
            {initialQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>

          {/* Pagination */}
          <ResponsivePagination
            pageIndex={filters.page}
            pageSize={filters.size}
            totalItems={totalItems}
            onPageIndexChange={(page) => updateFilters({ page })}
            onPageSizeChange={(size) => updateFilters({ size })}
            mobileLimit={filters.limit || 10}
            onMobileLimitChange={(limit) => updateFilters({ limit })}
          />
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
