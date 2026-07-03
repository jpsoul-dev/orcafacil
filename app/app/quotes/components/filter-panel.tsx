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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet'
import { format, parseISO } from 'date-fns'
import { ArrowUpDown, Calendar, SlidersHorizontal, Tag } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from './date-range-picker'

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

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    status: string // Separado por vírgulas
    from: string
    to: string
    sort: string
  }
  allStatuses: string[]
  onApply: (newFilters: { status: string; from: string; to: string; sort: string }) => void
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  allStatuses,
  onApply,
}: FilterPanelProps) {
  // Estado local para os filtros temporários, inicializados com as props correspondentes
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
    return filters.status && filters.status !== 'all'
      ? filters.status.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  })
  const [sortOption, setSortOption] = useState(filters.sort)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const fromDate = filters.from ? parseISO(filters.from) : undefined
    const toDate = filters.to ? parseISO(filters.to) : undefined
    return { from: fromDate, to: toDate }
  })

  // Drawer de status no Mobile
  const [isStatusDrawerOpen, setIsStatusDrawerOpen] = useState(false)

  // Estados para rastrear props anteriores e detectar mudanças na renderização (padrão State from Props)
  const [prevFilters, setPrevFilters] = useState(filters)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  // Sincroniza o estado local diretamente na renderização se o painel foi aberto ou as props mudaram
  const filtersChanged =
    filters.status !== prevFilters.status ||
    filters.from !== prevFilters.from ||
    filters.to !== prevFilters.to ||
    filters.sort !== prevFilters.sort

  if (isOpen !== prevIsOpen || filtersChanged) {
    setPrevIsOpen(isOpen)
    setPrevFilters(filters)

    // Apenas redefine o estado se o painel estiver aberto
    if (isOpen) {
      const activeStatuses = filters.status && filters.status !== 'all'
        ? filters.status.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      setSelectedStatuses(activeStatuses)
      setSortOption(filters.sort)

      const fromDate = filters.from ? parseISO(filters.from) : undefined
      const toDate = filters.to ? parseISO(filters.to) : undefined
      setDateRange({ from: fromDate, to: toDate })
    }
  }

  // Alternar seleção de status
  const handleToggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  // Contar quantos de cada status existem para exibir
  const getStatusCount = (status: string) => {
    return allStatuses.filter((s) => s === status).length
  }

  // Aplicar filtros
  const handleApply = () => {
    const fromStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''
    const toStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
    const statusStr = selectedStatuses.length > 0 ? selectedStatuses.join(',') : 'all'

    onApply({
      status: statusStr,
      from: fromStr,
      to: toStr,
      sort: sortOption,
    })
    onClose()
  }

  // Limpar filtros locais
  const handleClearLocal = () => {
    setSelectedStatuses([])
    setSortOption('newest')
    setDateRange(undefined)
  }

  return (
    <>
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
                Período de Criação
              </Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
                className="w-full"
              />
            </div>

            {/* 3. Filtro de Status */}
            <div className="space-y-3">
              <Label className="text-ds-caption font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Status do Orçamento
              </Label>

              {/* Modo Desktop: Checkboxes Inline */}
              <div className="hidden sm:flex flex-col gap-2.5 bg-muted/30 p-4 rounded-md border border-border/50">
                {Object.keys(statusLabels).map((status) => {
                  const isChecked = selectedStatuses.includes(status)
                  const count = getStatusCount(status)
                  return (
                    <label
                      key={status}
                      className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-0.5 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStatus(status)}
                          className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span>{statusLabels[status]}</span>
                      </div>
                      <span className="text-ds-caption font-semibold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                        {count}
                      </span>
                    </label>
                  )
                })}
              </div>

              {/* Modo Mobile: Botão Selector que abre o Drawer inferior */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  className="w-full justify-between font-semibold cursor-pointer"
                  onClick={() => setIsStatusDrawerOpen(true)}
                >
                  <span>
                    {selectedStatuses.length === 0
                      ? 'Todos os Statuses'
                      : `${selectedStatuses.length} status selecionado(s)`}
                  </span>
                  <Tag className="h-4 w-4 ml-2" />
                </Button>
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

      {/* Drawer inferior de status para Mobile */}
      <Sheet open={isStatusDrawerOpen} onOpenChange={setIsStatusDrawerOpen}>
        <SheetContent side="bottom" className="w-full h-auto max-h-[85vh] bg-card rounded-t-xl border-t border-border flex flex-col p-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <SheetTitle>Selecionar Status</SheetTitle>
            </div>
            <SheetCloseButton onClick={() => setIsStatusDrawerOpen(false)} />
          </SheetHeader>

          {/* Conteúdo do Drawer */}
          <div className="overflow-y-auto px-6 py-4 space-y-4 max-h-[50vh] select-none">
            <div className="flex flex-col gap-3">
              {Object.keys(statusLabels).map((status) => {
                const isChecked = selectedStatuses.includes(status)
                const count = getStatusCount(status)
                return (
                  <label
                    key={status}
                    className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-2 border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStatus(status)}
                        className="h-5 w-5 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span>{statusLabels[status]}</span>
                    </div>
                    <span className="text-ds-caption font-semibold bg-muted text-muted-foreground rounded-full px-2.5 py-0.5">
                      {count}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Footer do Drawer */}
          <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
            <Button
              className="w-full font-semibold cursor-pointer"
              onClick={() => setIsStatusDrawerOpen(false)}
            >
              Confirmar ({selectedStatuses.length})
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
