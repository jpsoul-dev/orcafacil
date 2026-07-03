'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet'
import {
  SidebarSheet,
  SidebarSheetContent,
  SidebarSheetHeader,
  SidebarSheetBody,
  SidebarSheetFooter,
} from '@/components/ui/sidebar-sheet'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, SlidersHorizontal, Tag } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

interface CatalogFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentType: string
  currentSort: string
  onApply: (filters: { type: string; sort: string }) => void
}

const sortOptions = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'price_desc', label: 'Maior valor' },
  { value: 'price_asc', label: 'Menor valor' },
]

/**
 * Filter Sheet for catalog items.
 * Built with composition using SidebarSheet for consistency.
 */
export function CatalogFilterSheet({
  open,
  onOpenChange,
  currentType,
  currentSort,
  onApply,
}: CatalogFilterSheetProps) {
  const [prevOpen, setPrevOpen] = useState(open)
  const [productChecked, setProductChecked] = useState(currentType === 'all' || currentType === 'product')
  const [serviceChecked, setServiceChecked] = useState(currentType === 'all' || currentType === 'service')
  const [sortValue, setSortValue] = useState(currentSort && currentSort !== 'az' ? currentSort : 'newest')

  // Drawer de Tipo no Mobile
  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false)

  // Synchronize state when sheet transitions to open (state adjustment during render)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setProductChecked(currentType === 'all' || currentType === 'product')
      setServiceChecked(currentType === 'all' || currentType === 'service')
      setSortValue(currentSort && currentSort !== 'az' ? currentSort : 'newest')
    }
  }

  const handleApply = () => {
    let type = 'all'
    if (productChecked && !serviceChecked) {
      type = 'product'
    } else if (!productChecked && serviceChecked) {
      type = 'service'
    } else if (!productChecked && !serviceChecked) {
      type = 'none'
    }

    onApply({ type, sort: sortValue })
    onOpenChange(false)
  }

  const handleClear = () => {
    setProductChecked(true)
    setServiceChecked(true)
    setSortValue('newest')
  }

  return (
    <>
      <SidebarSheet open={open} onOpenChange={onOpenChange}>
        <SidebarSheetContent>
          <SidebarSheetHeader
            title="Filtros"
            icon={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
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
              <Select value={sortValue} onValueChange={(val) => setSortValue(val || 'newest')}>
                <SelectTrigger className="w-full cursor-pointer">
                  <span>{sortOptions.find(o => o.value === sortValue)?.label || 'Selecione'}</span>
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Filtro de Tipo */}
            <div className="space-y-3">
              <Label className="text-ds-caption font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Tipo de Item
              </Label>

              {/* Modo Desktop: Checkboxes Inline */}
              <div className="hidden sm:flex flex-col gap-2.5 bg-muted/30 p-4 rounded-md border border-border/50">
                <label className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-0.5 select-none">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={productChecked}
                      onChange={(e) => setProductChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span>Produto</span>
                  </div>
                </label>
                <label className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-0.5 select-none">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={serviceChecked}
                      onChange={(e) => setServiceChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span>Serviço</span>
                  </div>
                </label>
              </div>

              {/* Modo Mobile: Botão Selector que abre o Drawer inferior */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  className="w-full justify-between font-semibold cursor-pointer"
                  onClick={() => setIsTypeDrawerOpen(true)}
                >
                  <span>
                    {productChecked && serviceChecked
                      ? 'Todos os tipos'
                      : productChecked
                        ? 'Apenas Produtos'
                        : serviceChecked
                          ? 'Apenas Serviços'
                          : 'Nenhum tipo selecionado'}
                  </span>
                  <Tag className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </SidebarSheetBody>

          {/* Footer do Painel */}
          <SidebarSheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1 font-semibold cursor-pointer"
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="flex-1 font-semibold cursor-pointer"
            >
              Aplicar Filtros
            </Button>
          </SidebarSheetFooter>
        </SidebarSheetContent>
      </SidebarSheet>

      {/* Drawer inferior de tipo para Mobile */}
      <Sheet open={isTypeDrawerOpen} onOpenChange={setIsTypeDrawerOpen}>
        <SheetContent side="bottom" className="w-full h-auto max-h-[85vh] bg-card rounded-t-xl border-t border-border flex flex-col p-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <SheetTitle>Selecionar Tipo</SheetTitle>
            </div>
            <SheetCloseButton onClick={() => setIsTypeDrawerOpen(false)} />
          </SheetHeader>

          {/* Conteúdo do Drawer */}
          <div className="overflow-y-auto px-6 py-4 space-y-4 max-h-[50vh] select-none">
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-2 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={productChecked}
                    onChange={(e) => setProductChecked(e.target.checked)}
                    className="h-5 w-5 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span>Produto</span>
                </div>
              </label>
              <label className="flex items-center justify-between text-ds-body-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={serviceChecked}
                    onChange={(e) => setServiceChecked(e.target.checked)}
                    className="h-5 w-5 rounded border-border bg-card text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <span>Serviço</span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer do Drawer */}
          <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
            <Button
              className="w-full font-semibold cursor-pointer"
              onClick={() => setIsTypeDrawerOpen(false)}
            >
              Confirmar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
