'use client'

import React, { useState, useMemo } from 'react'
import { KanbanBoard } from './components/kanban/kanban-board'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, SlidersHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'
import { DatePickerWithRange } from './components/date-range-picker'
import { DateRange } from 'react-day-picker'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

interface QuotesClientProps {
  initialQuotes: any[]
}

export function QuotesClient({ initialQuotes }: QuotesClientProps) {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // Filtrar orçamentos pelo período selecionado
  const filteredQuotes = useMemo(() => {
    if (!date?.from || !date?.to) return initialQuotes

    return initialQuotes.filter((quote) => {
      const quoteDate = parseISO(quote.created_at)
      return isWithinInterval(quoteDate, {
        start: date.from!,
        end: date.to!,
      })
    })
  }, [initialQuotes, date])

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Todos os orçamentos em andamento</h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhe status, validade e valores dos orçamentos em execução.</p>
        </div>
        <div className="flex items-center gap-2">
           <Link href="/app/quotes/new">
            <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg shadow-sm">
              <Plus className="h-4 w-4" /> Novo Orçamento
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button variant="outline" size="sm" className="gap-2 text-slate-600 border-slate-200 h-9 rounded-lg">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 h-8 px-3 rounded-md transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-slate-900 hover:bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setView('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs font-semibold">Board</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 h-8 px-3 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-slate-900 hover:bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setView('table')}
          >
            <List className="h-4 w-4" />
            <span className="text-xs font-semibold">Tabela</span>
          </Button>
        </div>
      </div>

      {filteredQuotes && filteredQuotes.length > 0 ? (
        view === 'kanban' ? (
          <KanbanBoard initialQuotes={filteredQuotes} />
        ) : (
          <DataTable
            columns={columns}
            data={filteredQuotes}
            searchKey="title"
            searchPlaceholder="Buscar por título do orçamento..."
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
            <LayoutGrid className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="font-bold text-xl text-slate-900">Nenhum orçamento</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {date?.from && date?.to 
              ? "Não foram encontrados orçamentos no período selecionado."
              : "Você ainda não possui orçamentos registrados."}
          </p>
          <div className="mt-8">
            <Link href="/app/quotes/new">
              <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg px-6 py-5">
                <Plus className="h-5 w-5" /> Criar Primeiro Orçamento
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
