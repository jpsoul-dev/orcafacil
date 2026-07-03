'use client'

import { ResponsivePagination } from '@/components/responsive-pagination'
import { Button } from '@/components/ui/button'
import { ListContainer } from '@/components/ui/list-container'
import { MobileActionBar } from '@/components/ui/mobile-action-bar'
import { SearchInput } from '@/components/ui/search-input'
import { ChevronRight, Users, Plus, SlidersHorizontal, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import type { Customer } from '@/lib/services/customer-service'
import { CustomerForm } from './components/customer-form'
import { CustomerFilterSheet } from './components/customer-filter-sheet'
import { CustomerViewSheet } from './components/customer-view-sheet'
import { DeleteCustomerDialog } from './components/delete-customer-dialog'

const sortLabels: Record<string, string> = {
  az: 'Nome (A–Z)',
  za: 'Nome (Z–A)',
  newest: 'Mais recentes',
  oldest: 'Mais antigos',
}

interface CustomersListProps {
  initialCustomers: Customer[]
  totalItems: number
  filters: {
    page: number
    size: number
    limit: number
    search: string
    sort: string
  }
}

/**
 * List manager for Customers (User Story 1, 2, 3, 5).
 * Coordinates search, sorting, details sheet, edit form, and delete triggers.
 * Highly aligned with CatalogList visual and architecture patterns.
 */
export function CustomersList({
  initialCustomers,
  totalItems,
  filters,
}: CustomersListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  // Centralized Sheets and Dialogs States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeViewCustomer, setActiveViewCustomer] = useState<Customer | null>(null)
  const [activeEditCustomer, setActiveEditCustomer] = useState<Customer | null>(null)
  const [activeDeleteCustomer, setActiveDeleteCustomer] = useState<Customer | null>(null)

  // Local state for instant UI reactive feedback
  const [localSort, setLocalSort] = useState(filters.sort)

  const [prevSort, setPrevSort] = useState(filters.sort)
  const [prevSearch, setPrevSearch] = useState(filters.search)

  // Direct synchronization of Props (State from Props, Rule 8.5)
  if (filters.sort !== prevSort) {
    setPrevSort(filters.sort)
    setLocalSort(filters.sort)
  }
  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search)
  }

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    // 1. Update local states immediately for reactive feel
    if ('sort' in newFilters) {
      setLocalSort(newFilters.sort ?? 'az')
    }

    // 2. Fire route transition in background
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      const merged = {
        page: filters.page,
        size: filters.size,
        limit: filters.limit,
        search: filters.search,
        sort: filters.sort,
        ...newFilters,
      }

      if (merged.search) params.set('search', merged.search); else params.delete('search')
      if (merged.sort && merged.sort !== 'az') params.set('sort', merged.sort); else params.delete('sort')

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

  const handleClearFilters = () => {
    setLocalSort('az')
    updateFilters({
      search: '',
      sort: 'az',
      page: 0,
      limit: 0,
    })
  }

  // Active chips display calculations based on reactive state
  const hasSortFilter = localSort !== 'az'
  const hasActiveFilters = hasSortFilter || !!filters.search

  return (
    <div className="space-y-6">
      {/* 1. Search Bar & Filter Button (Same Row, Card Container Removed) */}
      <div className="flex items-center gap-3 w-full select-none">
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilters({ search: value })}
          placeholder="Buscar por nome, e-mail, documento ou telefone..."
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

      {/* 2. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-ds-body-sm select-none">
          {/* Sort Chip */}
          {hasSortFilter && (
            <div className="inline-flex items-center gap-1 bg-card border border-border px-3 py-1 rounded-full text-foreground font-semibold">
              <span>{sortLabels[localSort] || localSort}</span>
              <button
                onClick={() => updateFilters({ sort: 'az' })}
                className="hover:text-destructive cursor-pointer animate-in fade-in"
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

      {/* Results counter (compact info) with pending loading indicator */}
      {initialCustomers && initialCustomers.length > 0 && (
        <div className="py-1 px-1 select-none flex items-center justify-between">
          <span className="text-ds-body-sm text-muted-foreground font-medium">
            {totalItems} {totalItems === 1 ? 'cliente' : 'clientes'}
          </span>
          {isPending && (
            <span className="text-xs text-muted-foreground animate-pulse font-medium">
              Atualizando...
            </span>
          )}
        </div>
      )}

      {/* 3. Simple Row List & Empty State */}
      {initialCustomers && initialCustomers.length > 0 ? (
        <div className="space-y-6">
          <ListContainer isPending={isPending}>
            {initialCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setActiveViewCustomer(customer)}
                className="flex items-center justify-between p-4 hover:bg-muted/40 cursor-pointer transition-colors duration-ds-fast group"
              >
                <div className="space-y-1.5 min-w-0 pr-4">
                  <h4 className="text-ds-body-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                    {customer.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className="inline-flex items-center rounded-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-neutral-800 dark:text-neutral-200">
                      {customer.document_type === 'cnpj' ? 'CNPJ' : 'CPF'}
                    </span>
                    {customer.document && (
                      <span className="tabular-nums font-medium tracking-normal text-muted-foreground ml-1 lowercase">
                        {customer.document}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-auto select-none">
                  {customer.phone && (
                    <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground tabular-nums">
                      {customer.phone}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
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
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm select-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg font-display text-foreground">
            Nenhum cliente {hasActiveFilters ? 'encontrado' : 'cadastrado'}
          </h3>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
            {hasActiveFilters
              ? 'Tente mudar os termos da busca.'
              : 'Cadastre seus clientes para vinculá-los aos orçamentos.'}
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
              <CustomerForm isSheet={true} />
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE ACTION: Anchored Button replacing TabBar ───────────────── */}
      <MobileActionBar>
        <CustomerForm
          isSheet={true}
          trigger={
            <Button
              variant="default"
              className="w-full gap-2 rounded-md font-semibold h-11 transition-all duration-ds-fast cursor-pointer"
            >
              <Plus className="h-5 w-5" /> Novo cliente
            </Button>
          }
        />
      </MobileActionBar>

      {/* ── SHEET: Detail View ────────────────────────────────────────────── */}
      <CustomerViewSheet
        customer={activeViewCustomer}
        open={!!activeViewCustomer}
        onOpenChange={(open) => {
          if (!open) setActiveViewCustomer(null)
        }}
        onEdit={(customer) => {
          setActiveViewCustomer(null) // Prevent sheet stacking
          setTimeout(() => {
            setActiveEditCustomer(customer)
          }, 150)
        }}
        onDeleteClick={(customer) => {
          setActiveDeleteCustomer(customer)
        }}
      />

      {/* ── SHEET: Edit Form ──────────────────────────────────────────────── */}
      <CustomerForm
        initialData={activeEditCustomer || undefined}
        mode="edit"
        isSheet={true}
        open={!!activeEditCustomer}
        onOpenChange={(open) => {
          if (!open) setActiveEditCustomer(null)
        }}
      />

      {/* ── DIALOG: Delete Confirmation ────────────────────────────────────── */}
      {activeDeleteCustomer && (
        <DeleteCustomerDialog
          id={activeDeleteCustomer.id}
          name={activeDeleteCustomer.name}
          open={!!activeDeleteCustomer}
          onOpenChange={(open) => {
            if (!open) setActiveDeleteCustomer(null)
          }}
          onSuccess={() => {
            setActiveDeleteCustomer(null)
            setActiveViewCustomer(null)
          }}
        />
      )}

      {/* ── SHEET: Advanced Filters ────────────────────────────────────────── */}
      <CustomerFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentSort={localSort}
        onApply={(newFilters) => {
          updateFilters({
            sort: newFilters.sort,
            page: 0, // Reset to first page
          })
        }}
      />
    </div>
  )
}
