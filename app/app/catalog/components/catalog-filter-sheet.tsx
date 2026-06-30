'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface CatalogFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentType: string
  currentSort: string
  onApply: (filters: { type: string; sort: string }) => void
}

const sortOptions = [
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'price_asc', label: 'Menor preço' },
]

/**
 * Filter Sheet for catalog items (User Story 3 / FR-012).
 * Responsive width: w-full on mobile, side-drawer on desktop.
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
  const [sortValue, setSortValue] = useState(currentSort || 'az')

  // Synchronize state when sheet transitions to open (state adjustment during render)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setProductChecked(currentType === 'all' || currentType === 'product')
      setServiceChecked(currentType === 'all' || currentType === 'service')
      setSortValue(currentSort || 'az')
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
    setSortValue('az')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md h-full duration-ds-fast"
      >
        <SheetHeader className="flex flex-row items-center justify-between pr-4 select-none">
          <SheetTitle>Filtros</SheetTitle>
          <SheetCloseButton />
        </SheetHeader>

        {/* Corpo dos filtros */}
        <div className="flex-1 overflow-y-auto bg-background p-6 space-y-8 select-none">
          {/* Seção Tipo */}
          <div className="space-y-4">
            <h4 className="text-ds-body-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Tipo
            </h4>
            <div className="space-y-3">
              {/* Checkbox Produto */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={productChecked}
                    onChange={(e) => setProductChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${productChecked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card group-hover:border-muted-foreground'
                    }`}>
                    {productChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-ds-body-sm font-semibold text-foreground">
                  Produto
                </span>
              </label>

              {/* Checkbox Serviço */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={serviceChecked}
                    onChange={(e) => setServiceChecked(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${serviceChecked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card group-hover:border-muted-foreground'
                    }`}>
                    {serviceChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-ds-body-sm font-semibold text-foreground">
                  Serviço
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-border/60" />

          {/* Seção Ordenação */}
          <div className="space-y-4">
            <h4 className="text-ds-body-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Ordenação
            </h4>
            <div className="space-y-3">
              {sortOptions.map((option) => {
                const isSelected = sortValue === option.value
                return (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="sort-order"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setSortValue(option.value)}
                        className="sr-only"
                      />
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                        ? 'border-primary bg-card text-primary'
                        : 'border-border bg-card group-hover:border-muted-foreground'
                        }`}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <span className="text-ds-body-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer com botões Limpar e Aplicar */}
        <div className="shrink-0 border-t border-border bg-card p-6 flex gap-4 select-none">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex-1 rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            Limpar
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
