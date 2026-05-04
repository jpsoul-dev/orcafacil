'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { KanbanBoard } from './components/kanban/kanban-board'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, SlidersHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'
import { DatePickerWithRange } from './components/date-range-picker'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, endOfDay } from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
interface QuotesClientProps {
  initialQuotes: any[]
}

export function QuotesClient({ initialQuotes }: QuotesClientProps) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<'active' | 'draft'>('active')
  const [mounted, setMounted] = useState(false)
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Alternar automaticamente para tabela ao selecionar rascunhos
  useEffect(() => {
    if (statusTab === 'draft' && view === 'kanban') {
      setView('table')
    }
  }, [statusTab, view])

  // Filtrar orçamentos
  const filteredQuotes = useMemo(() => {
    return initialQuotes.filter((quote) => {
      // 1. Filtro por Status (Aba)
      const isDraft = quote.status === 'draft'
      if (statusTab === 'active' && isDraft) return false
      if (statusTab === 'draft' && !isDraft) return false

      // 2. Filtro por Data (apenas para Ativos, Rascunhos costumam ser atemporais ou recentes)
      if (statusTab === 'active' && date?.from && date?.to) {
        const quoteDate = parseISO(quote.created_at)
        if (!isWithinInterval(quoteDate, { start: date.from!, end: endOfDay(date.to!) })) return false
      }

      // 3. Filtro por Busca
      if (search) {
        const searchLower = search.toLowerCase()
        const customerName = quote.customers?.name?.toLowerCase() || ''
        const title = quote.title?.toLowerCase() || ''
        const hashId = quote.hash_id?.toLowerCase() || ''

        return (
          customerName.includes(searchLower) ||
          title.includes(searchLower) ||
          hashId.includes(searchLower)
        )
      }

      return true
    })
  }, [initialQuotes, date, search, statusTab])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Orçamentos em andamento</h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhe a situação de seus orçamentos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/quotes/new">
            <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg shadow-sm">
              <Plus className="h-4 w-4" /> Criar Orçamento
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente, título ou código..."
            className="pl-9 h-10 bg-white border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {statusTab === 'active' && <DatePickerWithRange date={date} setDate={setDate} />}
          <Tabs value={statusTab} onValueChange={(v: any) => setStatusTab(v)} className="bg-slate-100 p-1 rounded-lg">
            <TabsList className="bg-transparent border-none p-0 h-8">
              <TabsTrigger value="active" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                Ativos
              </TabsTrigger>
              <TabsTrigger value="draft" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                Rascunhos
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg ml-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 h-8 px-3 rounded-md transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-slate-900 hover:bg-white' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 h-8 px-3 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-slate-900 hover:bg-white' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredQuotes && filteredQuotes.length > 0 ? (
        view === 'kanban' ? (
          <KanbanBoard initialQuotes={filteredQuotes} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredQuotes}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
            <LayoutGrid className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {date?.from && date?.to
              ? "Não foram encontrados orçamentos no período selecionado."
              : "Você ainda não possui orçamentos registrados."}
          </p>
          <div className="mt-8">
            <Link href="/app/quotes/new">
              <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg px-6 py-5">
                <Plus className="h-5 w-5" /> Criar Orçamento
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
