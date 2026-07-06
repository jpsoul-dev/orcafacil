'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  SidebarSheet,
  SidebarSheetContent,
  SidebarSheetHeader,
  SidebarSheetBody,
  SidebarSheetFooter,
} from '@/components/ui/sidebar-sheet'
import { format, parseISO } from 'date-fns'
import { ArrowUpDown, Calendar, SlidersHorizontal, Tag } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from '../../quotes/components/date-range-picker'

const typeLabels: Record<string, string> = {
  standalone: 'Avulso',
  quote: 'Vinculado a Orçamento',
}

const sortLabels: Record<string, string> = {
  newest: 'Mais recentes',
  oldest: 'Mais antigos',
  highest_value: 'Maior valor',
  lowest_value: 'Menor valor',
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    receiptType: string
    from: string
    to: string
    sort: string
  }
  counts: Record<string, number>
  onApply: (newFilters: { receiptType: string; from: string; to: string; sort: string }) => void
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  counts,
  onApply,
}: FilterPanelProps) {
  // Estado local para os filtros temporários
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    return filters.receiptType && filters.receiptType !== 'all'
      ? filters.receiptType.split(',').map((t) => t.trim()).filter(Boolean)
      : []
  })
  const [sortOption, setSortOption] = useState(filters.sort)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const fromDate = filters.from ? parseISO(filters.from) : undefined
    const toDate = filters.to ? parseISO(filters.to) : undefined
    return { from: fromDate, to: toDate }
  })

  // Estados para rastrear props anteriores e detectar mudanças na renderização (State from Props)
  const [prevFilters, setPrevFilters] = useState(filters)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  const filtersChanged =
    filters.receiptType !== prevFilters.receiptType ||
    filters.from !== prevFilters.from ||
    filters.to !== prevFilters.to ||
    filters.sort !== prevFilters.sort

  if (isOpen !== prevIsOpen || filtersChanged) {
    setPrevIsOpen(isOpen)
    setPrevFilters(filters)

    if (isOpen) {
      const activeTypes = filters.receiptType && filters.receiptType !== 'all'
        ? filters.receiptType.split(',').map((t) => t.trim()).filter(Boolean)
        : []
      setSelectedTypes(activeTypes)
      setSortOption(filters.sort)

      const fromDate = filters.from ? parseISO(filters.from) : undefined
      const toDate = filters.to ? parseISO(filters.to) : undefined
      setDateRange({ from: fromDate, to: toDate })
    }
  }

  // Alternar a seleção do tipo de recibo
  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  // Aplicar filtros locais
  const handleApply = () => {
    const fromStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''
    const toStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
    const typeStr = selectedTypes.length > 0 ? selectedTypes.join(',') : 'all'

    onApply({
      receiptType: typeStr,
      from: fromStr,
      to: toStr,
      sort: sortOption,
    })
    onClose()
  }

  // Limpar filtros locais
  const handleClearLocal = () => {
    setSelectedTypes([])
    setSortOption('newest')
    setDateRange(undefined)
  }

  return (
    <SidebarSheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SidebarSheetContent>
        <SidebarSheetHeader
          title="Filtros"
          icon={<SlidersHorizontal className="h-4 w-4 text-slate-500" />}
          showCloseButton={true}
        />

        {/* Área de rolagem de filtros */}
        <SidebarSheetBody>
          {/* 1. Ordenação */}
          <div className="space-y-3">
            <Label className="text-ds-caption font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Ordenar por
            </Label>
            <Select value={sortOption} onValueChange={(val) => setSortOption(val || 'newest')}>
              <SelectTrigger className="w-full cursor-pointer">
                <span>{sortLabels[sortOption] || 'Selecione'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
                <SelectItem value="highest_value">Maior valor</SelectItem>
                <SelectItem value="lowest_value">Menor valor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Filtro de Data */}
          <div className="space-y-3">
            <Label className="text-ds-caption font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Período de Emissão
            </Label>
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-full"
            />
          </div>

          {/* 3. Filtro de Tipo de Recibo */}
          <div className="space-y-3">
            <Label className="text-ds-caption font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              Tipo de Recibo
            </Label>

            {/* Checkboxes Inline para ambos Desktop e Mobile */}
            <div className="flex flex-col gap-2.5 bg-muted/30 p-4 rounded-md border border-border/50 select-none">
              {Object.keys(typeLabels).map((type) => {
                const isChecked = selectedTypes.includes(type)
                const count = counts[type] || 0
                return (
                  <label
                    key={type}
                    className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleType(type)}
                        className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span>{typeLabels[type]}</span>
                    </div>
                    <span className="text-ds-caption font-semibold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                      {count}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </SidebarSheetBody>

        {/* Footer do Painel */}
        <SidebarSheetFooter>
          <Button
            variant="outline"
            onClick={handleClearLocal}
            className="flex-1 font-semibold cursor-pointer"
          >
            Limpar
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 font-semibold cursor-pointer"
          >
            Aplicar Filtros
          </Button>
        </SidebarSheetFooter>
      </SidebarSheetContent>
    </SidebarSheet>
  )
}
