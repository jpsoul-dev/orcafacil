'use client'

import { SubscriptionGuard } from '@/components/subscription-guard'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { ListContainer } from '@/components/ui/list-container'
import { MobileActionBar } from '@/components/ui/mobile-action-bar'
import { SearchInput } from '@/components/ui/search-input'
import type { Quote } from '@/types'
import { format, parseISO } from 'date-fns'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { ResponsivePagination } from '@/components/responsive-pagination'
import { FilterPanel } from './components/filter-panel'
import { QuoteItem } from './components/quote-item'

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
  completed: 'Finalizado',
  expired: 'Vencido',
}

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

const subscribeOnline = (callback: () => void) => {
  if (typeof window === 'undefined') return () => { }
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

const getOnlineSnapshot = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

const getOnlineServerSnapshot = () => true

export function QuotesList({
  initialQuotes,
  totalItems,
  allStatuses,
  filters,
}: QuotesListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Controle de abertura do painel de filtros
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Controle de conectividade para PWA
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  )



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

  // Limpar todos os filtros ativos
  const handleClearFilters = () => {
    updateFilters({
      search: '',
      status: 'all',
      from: '',
      to: '',
      page: 0,
      limit: 10,
      sort: 'newest',
      size: 10,
    })
  }

  // Remoção individual de status ativo nos chips
  const handleRemoveStatusChip = (statusToRemove: string) => {
    const activeStatuses = filters.status.split(',').map((s) => s.trim()).filter(Boolean)
    const updated = activeStatuses.filter((s) => s !== statusToRemove)
    const newStatusStr = updated.length > 0 ? updated.join(',') : 'all'
    updateFilters({ status: newStatusStr })
  }

  // Cálculo de chips de filtros ativos
  const activeStatuses = filters.status && filters.status !== 'all'
    ? filters.status.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const hasSearchFilter = !!filters.search
  const hasStatusFilter = activeStatuses.length > 0
  const hasDateFilter = !!filters.from || !!filters.to
  const hasSortFilter = filters.sort && filters.sort !== 'newest'

  const hasActiveFilters = hasSearchFilter || hasStatusFilter || hasDateFilter || hasSortFilter

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-card py-20 text-center shadow-xs select-none">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-50 mb-4 animate-pulse">
          <SlidersHorizontal className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-lg text-slate-800 font-display">
          Sem conexão com a internet
        </h3>
        <p className="text-slate-500 text-ds-body-sm mt-2 max-w-xs font-medium px-4">
          A listagem de orçamentos exige uma conexão ativa com a rede. Verifique seu sinal e tente novamente.
        </p>
        <Button
          variant="outline"
          className="mt-4 font-semibold rounded-md border-slate-200 cursor-pointer"
          onClick={() => {
            if (typeof window !== 'undefined' && navigator.onLine) {
              router.refresh()
            }
          }}
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Desktop (Ocultado no mobile) */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-background/95 backdrop-blur-xs py-4 border-b border-border/50 items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground font-display">
            Meus orçamentos
          </h2>
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

      {/* ── MOBILE ACTION: Anchored Button replacing TabBar ───────────────── */}
      <MobileActionBar>
        <SubscriptionGuard className="block w-full">
          <Link href="/app/quotes/new" className="block w-full">
            <Button
              variant="default"
              className="w-full gap-2 rounded-md font-semibold h-11 transition-all duration-ds-fast cursor-pointer"
            >
              <Plus className="h-5 w-5" /> Criar Orçamento
            </Button>
          </Link>
        </SubscriptionGuard>
      </MobileActionBar>

      {/* 3. Search Bar e Botão Filtros (Unified Row, Card Container Removed) */}
      <div className="flex items-center gap-3 w-full select-none">
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilters({ search: value })}
          placeholder="Buscar por cliente, título ou código..."
        />
        <Button
          variant="outline"
          className="h-10 w-10 sm:w-auto sm:px-4 rounded-md font-semibold shrink-0 cursor-pointer flex items-center justify-center"
          onClick={() => setIsFilterOpen(true)}
          aria-label="Filtros"
        >
          <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Filtros</span>
        </Button>
      </div>

      {/* 4. Chips de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-ds-body-sm select-none">
          {/* Chip de Busca */}
          {hasSearchFilter && (
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-semibold">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Busca:</span>
              <span className="truncate max-w-[150px]">{filters.search}</span>
              <button
                onClick={() => {
                  updateFilters({ search: '' })
                }}
                className="hover:text-destructive cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Chips de Status (Múltiplos) */}
          {activeStatuses.map((status) => (
            <div
              key={status}
              className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-semibold"
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Status:</span>
              <span>{statusLabels[status] || status}</span>
              <button
                onClick={() => handleRemoveStatusChip(status)}
                className="hover:text-destructive cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={`Remover filtro de status ${status}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Chip de Data */}
          {hasDateFilter && (
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-semibold">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Período:</span>
              <span>
                {filters.from ? format(parseISO(filters.from), 'dd/MM/yy') : ''}
                {' - '}
                {filters.to ? format(parseISO(filters.to), 'dd/MM/yy') : ''}
              </span>
              <button
                onClick={() => updateFilters({ from: '', to: '' })}
                className="hover:text-destructive cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Remover filtro de data"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Chip de Ordenação */}
          {hasSortFilter && (
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-semibold">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Ordem:</span>
              <span>{sortLabels[filters.sort] || filters.sort}</span>
              <button
                onClick={() => updateFilters({ sort: 'newest' })}
                className="hover:text-destructive cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Remover ordenação"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Botão Limpar Tudo */}
          <button
            onClick={handleClearFilters}
            className="text-primary hover:text-primary-hover font-semibold cursor-pointer px-2 py-1 text-xs transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* 5. Contador de Resultados */}
      {initialQuotes && initialQuotes.length > 0 && (
        <div className="py-1 px-1 select-none flex items-center justify-between">
          <span className="text-ds-body-sm text-slate-500 font-medium">
            Exibindo {initialQuotes.length} de {totalItems} {totalItems === 1 ? 'orçamento' : 'orçamentos'}
          </span>
        </div>
      )}

      {/* 6. Listagem de Orçamentos (Format Lista com Linhas Simples) */}
      {initialQuotes && initialQuotes.length > 0 ? (
        <div className="space-y-6">
          <ListContainer>
            {initialQuotes.map((quote) => (
              <QuoteItem key={quote.id} quote={quote} />
            ))}
          </ListContainer>

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
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-card py-20 text-center shadow-xs select-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-50 mb-4">
            <SlidersHorizontal className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-lg text-slate-800 font-display">
            Nenhum orçamento {hasActiveFilters ? 'encontrado' : 'cadastrado'}
          </h3>
          <p className="text-slate-500 text-ds-body-sm mt-2 max-w-xs font-medium px-4">
            {hasActiveFilters
              ? 'Tente alterar ou limpar seus termos de busca e filtros.'
              : 'Comece criando o seu primeiro orçamento comercial clicando no botão abaixo.'}
          </p>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              className="mt-4 font-semibold rounded-md border-slate-200 cursor-pointer"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          ) : (
            <SubscriptionGuard>
              <Link href="/app/quotes/new" className="mt-4">
                <Button className="font-semibold rounded-md cursor-pointer">
                  <Plus className="mr-1 h-4 w-4" /> Novo Orçamento
                </Button>
              </Link>
            </SubscriptionGuard>
          )}
        </div>
      )}

      {/* Painel de Filtros Unificado */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={{
          status: filters.status,
          from: filters.from,
          to: filters.to,
          sort: filters.sort,
        }}
        allStatuses={allStatuses}
        onApply={(newFilters) => updateFilters(newFilters)}
      />
    </div>
  )
}
