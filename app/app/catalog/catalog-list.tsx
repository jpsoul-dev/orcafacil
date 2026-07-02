'use client'

import { ResponsivePagination } from '@/components/responsive-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatBRL } from '@/lib/utils'
import { ChevronRight, Package, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import type { CatalogItem } from './catalog-form'
import { CatalogForm } from './catalog-form'
import { CatalogFilterSheet } from './components/catalog-filter-sheet'
import { CatalogViewSheet } from './components/catalog-view-sheet'
import { DeleteItemDialog } from './delete-item-dialog'

const sortLabels: Record<string, string> = {
  az: 'A–Z',
  za: 'Z–A',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  newest: 'Mais recentes',
  oldest: 'Mais antigos',
}

interface CatalogListProps {
  initialItems: (CatalogItem & { created_at: string; unit_measure: string | null })[]
  totalItems: number
  filters: {
    page: number
    size: number
    limit: number
    search: string
    sort: string
    type: string
  }
}

/**
 * List manager for Catalog items (User Story 1, 2, 3, 5).
 * Coordinates search, sorting, filtering, details sheet, edit form, and delete triggers.
 */
export function CatalogList({
  initialItems,
  totalItems,
  filters,
}: CatalogListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  // Centralized Sheets and Dialogs States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeViewItem, setActiveViewItem] = useState<CatalogItem | null>(null)
  const [activeEditItem, setActiveEditItem] = useState<CatalogItem | null>(null)
  const [activeDeleteItem, setActiveDeleteItem] = useState<CatalogItem | null>(null)

  // Estados locais para feedback de UI imediato
  const [localType, setLocalType] = useState(filters.type)
  const [localSort, setLocalSort] = useState(filters.sort)
  const [searchValue, setSearchValue] = useState(filters.search)

  const [prevType, setPrevType] = useState(filters.type)
  const [prevSort, setPrevSort] = useState(filters.sort)
  const [prevSearch, setPrevSearch] = useState(filters.search)
  const [lastSentSearch, setLastSentSearch] = useState(filters.search)

  // Sincronização direta de Props (State from Props, Regra 8.5)
  if (filters.type !== prevType) {
    setPrevType(filters.type)
    setLocalType(filters.type)
  }
  if (filters.sort !== prevSort) {
    setPrevSort(filters.sort)
    setLocalSort(filters.sort)
  }
  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search)
    if (filters.search !== lastSentSearch) {
      setSearchValue(filters.search)
      setLastSentSearch(filters.search)
    }
  }

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    // 1. Atualizar estados locais imediatamente para UI reativa
    if ('type' in newFilters) {
      setLocalType(newFilters.type ?? 'all')
    }
    if ('sort' in newFilters) {
      setLocalSort(newFilters.sort ?? 'az')
    }
    if ('search' in newFilters) {
      const newSearchValue = newFilters.search ?? ''
      setSearchValue(newSearchValue)
      setLastSentSearch(newSearchValue)
    }

    // 2. Disparar transição da rota em segundo plano
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      const merged = {
        page: filters.page,
        size: filters.size,
        limit: filters.limit,
        search: filters.search,
        sort: filters.sort,
        type: filters.type,
        ...newFilters,
      }

      if (merged.search) params.set('search', merged.search); else params.delete('search')
      if (merged.sort && merged.sort !== 'az') params.set('sort', merged.sort); else params.delete('sort')
      if (merged.type && merged.type !== 'all') params.set('type', merged.type); else params.delete('type')

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
    })
  }, [searchParams, filters, pathname, router])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== filters.search) {
        updateFilters({ search: searchValue })
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [searchValue, filters.search, updateFilters])

  const handleClearFilters = () => {
    setSearchValue('')
    setLocalType('all')
    setLocalSort('az')
    updateFilters({
      search: '',
      sort: 'az',
      type: 'all',
      page: 0,
      limit: 0,
    })
  }

  // Active chips display calculation baseados nos estados locais reativos
  const hasTypeFilter = localType !== 'all'
  const hasSortFilter = localSort !== 'az'
  const hasActiveFilters = hasTypeFilter || hasSortFilter || !!searchValue

  return (
    <div className="space-y-6">
      {/* 1. Search Bar & Filter Button (Same Row, Card Container Removed) */}
      <div className="flex items-center gap-3 w-full select-none">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do item..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-md font-semibold shrink-0 cursor-pointer"
          onClick={() => setIsFilterOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* 2. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-ds-body-sm select-none">
          {/* Type Chip */}
          {hasTypeFilter && (
            <div className="inline-flex items-center gap-1 bg-card border border-border px-3 py-1 rounded-full text-foreground font-semibold">
              <span>
                {localType === 'product' && 'Produto'}
                {localType === 'service' && 'Serviço'}
                {localType === 'none' && 'nenhum'}
              </span>
              <button
                onClick={() => updateFilters({ type: 'all' })}
                className="hover:text-destructive cursor-pointer"
                aria-label="Remover filtro de tipo"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Sort Chip */}
          {hasSortFilter && (
            <div className="inline-flex items-center gap-1 bg-card border border-border px-3 py-1 rounded-full text-foreground font-semibold">
              <span>{sortLabels[localSort] || localSort}</span>
              <button
                onClick={() => updateFilters({ sort: 'az' })}
                className="hover:text-destructive cursor-pointer"
                aria-label="Remover ordenação"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Clear All Filters Button */}
          <button
            onClick={handleClearFilters}
            className="text-primary hover:text-primary/80 font-semibold cursor-pointer px-2 py-1 text-xs"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Results counter (compact info) com indicador de carregamento pendente */}
      {initialItems && initialItems.length > 0 && (
        <div className="py-1 px-1 select-none flex items-center justify-between">
          <span className="text-ds-body-sm text-muted-foreground font-medium">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </span>
          {isPending && (
            <span className="text-xs text-muted-foreground animate-pulse font-medium">
              Atualizando...
            </span>
          )}
        </div>
      )}

      {/* 3. Simple Row List & Empty State */}
      {initialItems && initialItems.length > 0 ? (
        <div className="space-y-6">
          <div className={cn(
            "border border-border rounded-md bg-card divide-y divide-border overflow-hidden select-none transition-opacity duration-200",
            isPending && "opacity-60 pointer-events-none"
          )}>
            {initialItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveViewItem(item)}
                className="flex items-center justify-between p-4 hover:bg-muted/40 cursor-pointer transition-colors duration-ds-fast group"
              >
                <div className="space-y-1.5 min-w-0 pr-4">
                  <h4 className="text-ds-body-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                    {item.name}
                  </h4>
                  <span className="inline-flex items-center rounded-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                    {item.type === 'product' ? 'Produto' : 'Serviço'}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  <span className="text-ds-body-sm font-bold text-foreground tabular-nums text-right">
                    {formatBRL(item.unit_price)}
                    {item.unit_measure ? `/${item.unit_measure}` : ''}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>

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
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm select-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg font-display text-foreground">
            Nenhum item {hasActiveFilters ? 'encontrado' : 'cadastrado'}
          </h3>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
            {hasActiveFilters
              ? 'Tente mudar os termos da busca.'
              : 'Adicione itens ao seu catálogo para usá-los nos orçamentos.'}
          </p>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              className="mt-4 font-semibold rounded-md cursor-pointer"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          ) : (
            <div className="mt-5 hidden sm:block">
              <CatalogForm />
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE ACTION: Anchored Button replacing TabBar ───────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-4 flex items-center justify-center pb-[calc(1rem+env(safe-area-inset-bottom,0))]">
        <CatalogForm
          trigger={
            <Button
              variant="default"
              className="w-full gap-2 rounded-md font-semibold h-11 transition-all duration-ds-fast cursor-pointer"
            >
              <Plus className="h-5 w-5" /> Novo item
            </Button>
          }
        />
      </div>

      {/* ── SHEET: Detail View ────────────────────────────────────────────── */}
      <CatalogViewSheet
        item={activeViewItem}
        open={!!activeViewItem}
        onOpenChange={(open) => {
          if (!open) setActiveViewItem(null)
        }}
        onEdit={(item) => {
          setActiveViewItem(null) // Prevent sheet stacking
          setTimeout(() => {
            setActiveEditItem(item)
          }, 150)
        }}
        onDeleteClick={(item) => {
          setActiveDeleteItem(item)
        }}
      />

      {/* ── SHEET: Edit Form ──────────────────────────────────────────────── */}
      <CatalogForm
        initialData={activeEditItem || undefined}
        open={!!activeEditItem}
        onOpenChange={(open) => {
          if (!open) setActiveEditItem(null)
        }}
      />

      {/* ── DIALOG: Delete Confirmation ────────────────────────────────────── */}
      {activeDeleteItem && (
        <DeleteItemDialog
          id={activeDeleteItem.id}
          name={activeDeleteItem.name}
          open={!!activeDeleteItem}
          onOpenChange={(open) => {
            if (!open) setActiveDeleteItem(null)
          }}
          onSuccess={() => {
            setActiveDeleteItem(null)
            setActiveViewItem(null)
          }}
        />
      )}

      {/* ── SHEET: Advanced Filters ────────────────────────────────────────── */}
      <CatalogFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentType={localType}
        currentSort={localSort}
        onApply={(newFilters) => {
          updateFilters({
            type: newFilters.type,
            sort: newFilters.sort,
            page: 0, // Reset to first page
          })
        }}
      />
    </div>
  )
}
