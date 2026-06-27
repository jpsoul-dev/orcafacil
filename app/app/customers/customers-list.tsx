'use client'

import React, { useState, useMemo, useEffect } from 'react'
import type { Customer } from '@/lib/services/customer-service'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CustomerCard } from './components/customer-card'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const sortLabels: Record<string, string> = {
  az: 'Nome (A-Z)',
  za: 'Nome (Z-A)',
  newest: 'Mais recentes',
  oldest: 'Mais antigos',
}

interface CustomersListProps {
  initialCustomers: Customer[]
}

export function CustomersList({ initialCustomers }: CustomersListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('az')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPageIndex(0)
  }, [search])

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((customer) => {
      if (search) {
        const searchLower = search.toLowerCase()
        const name = customer.name?.toLowerCase() || ''
        const email = customer.email?.toLowerCase() || ''
        const phone = customer.phone?.toLowerCase() || ''
        const document = customer.document?.toLowerCase() || ''

        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower) ||
          document.includes(searchLower)
        )
      }
      return true
    })
  }, [initialCustomers, search])

  const sortedAndFilteredCustomers = useMemo(() => {
    let result = [...filteredCustomers]
    if (sortBy === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'za') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
    }
    return result
  }, [filteredCustomers, sortBy])

  const paginatedCustomers = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return sortedAndFilteredCustomers.slice(start, end)
  }, [sortedAndFilteredCustomers, pageIndex, pageSize])

  const totalPages = Math.ceil(sortedAndFilteredCustomers.length / pageSize)

  const handleClearFilters = () => {
    setSearch('')
  }

  const hasActiveFilters = search.length > 0

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Info & Sort Bar */}
      <div className="flex items-center justify-between py-1 px-1">
        <span className="text-ds-body-sm text-muted-foreground font-medium">
          {sortedAndFilteredCustomers.length} {sortedAndFilteredCustomers.length === 1 ? 'cliente' : 'clientes'}
        </span>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'az')}>
            <SelectTrigger className="h-9 w-40 text-ds-body-sm bg-card font-medium rounded-sm border-border cursor-pointer">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <span>{sortLabels[sortBy] || 'Ordenar por'}</span>
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
      {paginatedCustomers && paginatedCustomers.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
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
      
      {/* Pagination - Sempre visível conforme solicitado */}
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
            <SelectTrigger className="h-8 w-20 text-xs bg-card font-semibold rounded-sm border-border cursor-pointer">
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
  )
}
