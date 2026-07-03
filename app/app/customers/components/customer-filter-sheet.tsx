'use client'

import React, { useState } from 'react'
import {
  SidebarSheet,
  SidebarSheetContent,
  SidebarSheetHeader,
  SidebarSheetBody,
  SidebarSheetFooter,
} from '@/components/ui/sidebar-sheet'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

interface CustomerFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSort: string
  onApply: (filters: { sort: string }) => void
}

const sortOptions = [
  { value: 'az', label: 'Nome (A-Z)' },
  { value: 'za', label: 'Nome (Z-A)' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
]

/**
 * Filter Sheet for customer items.
 * Built with composition using SidebarSheet for consistency with Catalog.
 */
export function CustomerFilterSheet({
  open,
  onOpenChange,
  currentSort,
  onApply,
}: CustomerFilterSheetProps) {
  const [prevOpen, setPrevOpen] = useState(open)
  const [sortValue, setSortValue] = useState(currentSort || 'az')

  // Synchronize state when sheet transitions to open
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSortValue(currentSort || 'az')
    }
  }

  const handleApply = () => {
    onApply({ sort: sortValue })
    onOpenChange(false)
  }

  const handleClear = () => {
    setSortValue('az')
  }

  return (
    <SidebarSheet open={open} onOpenChange={onOpenChange}>
      <SidebarSheetContent>
        <SidebarSheetHeader
          title="Filtros"
          icon={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
          showCloseButton={true}
        />

        {/* Scrollable area */}
        <SidebarSheetBody>
          {/* 1. Ordenação */}
          <div className="space-y-3">
            <Label className="text-ds-caption font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Ordenar por
            </Label>
            <Select value={sortValue} onValueChange={(val) => setSortValue(val || 'az')}>
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
        </SidebarSheetBody>

        {/* Footer */}
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
  )
}
