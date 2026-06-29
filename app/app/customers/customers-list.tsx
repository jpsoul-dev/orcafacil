'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { Customer } from '@/lib/services/customer-service'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CustomerCard } from './components/customer-card'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ResponsivePagination } from '@/components/responsive-pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

const sortLabels: Record<string, string> = {
  az: 'Nome (A-Z)',
  za: 'Nome (Z-A)',
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

export function CustomersList({
  initialCustomers,
  totalItems,
  filters,
}: CustomersListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Estado local para a busca de texto rápida (evita lags ao digitar)
  const [prevSearch, setPrevSearch] = useState(filters.search)
  const [searchValue, setSearchValue] = useState(filters.search)

  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search)
    setSearchValue(filters.search)
  }

  // Centralizador de atualização de parâmetros na URL
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
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
  }, [searchParams, filters, pathname, router])

  // Debouncing para a busca de texto (400ms)
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
    updateFilters({
      search: '',
      sort: 'az',
      page: 0,
      limit: 0,
    })
  }

  const hasActiveFilters = !!filters.search

  return (
    <div className="space-y-6">
      {/*Header*/}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground font-display">
            Gerenciar Clientes
          </h2>
          <p className="text-muted-foreground text-ds-body-sm mt-1">
            Cadastre e consulte os dados dos seus clientes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/customers/new">
            <Button variant="default" className="gap-2 font-semibold cursor-pointer">
              <Users className="h-4 w-4" /> Novo cliente
            </Button>
          </Link>
        </div>
      </div>

      {/*Action Bar */}
      <div className="flex flex-col gap-4 bg-card border border-border p-4 rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail, documento ou telefone..."
              className="pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Info & Sort Bar */}
      <div className="flex items-center justify-between py-1 px-1">
        <span className="text-ds-body-sm text-muted-foreground font-medium">
          {totalItems} {totalItems === 1 ? 'cliente' : 'clientes'}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={filters.sort}
            onValueChange={(val) => updateFilters({ sort: val || 'az' })}
          >
            <SelectTrigger className="h-9 w-40 text-ds-body-sm bg-card font-medium rounded-sm border-border cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <span>{sortLabels[filters.sort] || 'Ordenar por'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">Nome (A-Z)</SelectItem>
              <SelectItem value="za">Nome (Z-A)</SelectItem>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/*Cards Grid & Empty State*/}
      {initialCustomers && initialCustomers.length > 0 ? (
        <div className="space-y-6">
          {/* Grid Desktop */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>

          {/* Grid Mobile */}
          <div className="grid sm:hidden grid-cols-1 gap-6">
            {initialCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
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
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg font-display text-foreground">
            Nenhum cliente {hasActiveFilters ? 'encontrado' : 'cadastrado'}
          </h3>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
            {hasActiveFilters
              ? 'Tente mudar os termos da busca.'
              : 'Adicione seu primeiro cliente para vinculá-lo aos orçamentos.'}
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
            <div className="mt-5">
              <Link href="/app/customers/new">
                <Button variant="default" className="gap-2 font-semibold cursor-pointer">
                  <Users className="h-4 w-4" /> Novo cliente
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
