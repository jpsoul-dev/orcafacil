'use client'

import { formatBRL } from '@/lib/utils'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { triggerHaptic } from '@/lib/haptic'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { CatalogItem } from '../catalog-form'

interface CatalogViewSheetProps {
  item: CatalogItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (item: CatalogItem) => void
  onDeleteClick: (item: CatalogItem) => void
}

/**
 * Read-Only Sheet to display item details (User Story 1 / FR-001).
 * Supports actions for desktop (buttons) and mobile (dropdown menu).
 */
export function CatalogViewSheet({
  item,
  open,
  onOpenChange,
  onEdit,
  onDeleteClick,
}: CatalogViewSheetProps) {
  if (!item) return null

  const isProduct = item.type === 'product'

  const handleClose = () => {
    triggerHaptic('light')
    onOpenChange(false)
  }

  const handleEditClick = () => {
    triggerHaptic('light')
    onEdit(item)
  }

  const handleDeleteClickLocal = () => {
    triggerHaptic('light')
    onDeleteClick(item)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md h-full duration-ds-fast"
      >
        {/* Header com o botão voltar à esquerda, título e ações à direita */}
        <SheetHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/60 min-h-14">
          <div className="flex items-center gap-2">
            {/* Botão Voltar (fecha o sheet com feedback tátil) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-muted-foreground hover:text-foreground cursor-pointer rounded-md -ml-3.5 flex items-center justify-center"
              onClick={handleClose}
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <SheetTitle className="text-base font-bold">Visualizar Item</SheetTitle>
          </div>
          
          <div className="flex items-center gap-1.5 select-none">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <SubscriptionGuard>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md font-semibold cursor-pointer"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
              </SubscriptionGuard>
              <SubscriptionGuard>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md font-semibold text-destructive hover:text-destructive-foreground hover:bg-destructive cursor-pointer"
                  onClick={handleDeleteClickLocal}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Deletar
                </Button>
              </SubscriptionGuard>
            </div>

            {/* Mobile Actions Dropdown (no Header) */}
            <div className="flex sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger
                  nativeButton={true}
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-foreground cursor-pointer rounded-md flex items-center justify-center"
                      onClick={() => triggerHaptic('light')}
                    >
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Ações</span>
                    </Button>
                  }
                />
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 p-1.5 rounded-sm border border-border/60 bg-popover text-popover-foreground shadow-md"
                >
                  <SubscriptionGuard>
                    <DropdownMenuItem
                      onClick={handleEditClick}
                      className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold rounded-xs py-3 px-4 focus:bg-accent focus:text-accent-foreground"
                      render={<div />}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar item
                    </DropdownMenuItem>
                  </SubscriptionGuard>
                  <SubscriptionGuard>
                    <DropdownMenuItem
                      onClick={handleDeleteClickLocal}
                      className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold rounded-xs py-3 px-4 text-destructive focus:text-destructive focus:bg-destructive/10"
                      render={<div />}
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar item
                    </DropdownMenuItem>
                  </SubscriptionGuard>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        {/* Detalhes do item em modo leitura */}
        <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
          {/* Top Section: Name/Badge */}
          <div className="flex flex-col gap-2">
            {/* Nome e Badge de Tipo */}
            <div className="space-y-2.5">
              <h3 className="text-xl font-bold font-display text-foreground leading-tight break-words">
                {item.name}
              </h3>
              <span
                className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold select-none ${
                  isProduct
                    ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                {isProduct ? 'Produto' : 'Serviço'}
              </span>
            </div>
          </div>

          <div className="border-t border-border/60" />

          {/* Valor Unitário */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Valor Unitário
            </span>
            <div className="text-lg font-bold text-foreground tabular-nums">
              {formatBRL(item.unit_price)}
              {item.unit_measure ? (
                <span className="text-sm text-muted-foreground font-semibold">
                  {' '}/{' '}{item.unit_measure}
                </span>
              ) : null}
            </div>
          </div>

          {/* Descrição */}
          {item.description ? (
            <>
              <div className="border-t border-border/60" />
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                  Descrição
                </span>
                <p className="text-ds-body-sm text-foreground leading-relaxed break-words whitespace-pre-wrap font-medium">
                  {item.description}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
