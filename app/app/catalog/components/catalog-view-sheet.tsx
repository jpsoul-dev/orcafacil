'use client'

import { formatBRL } from '@/lib/utils'
import { SubscriptionGuard } from '@/components/subscription-guard'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md h-full duration-ds-fast"
      >
        {/* Header com as ações e botão fechar */}
        <SheetHeader className="flex flex-row items-center justify-between pr-4">
          <SheetTitle>Visualizar Item</SheetTitle>
          
          <div className="flex items-center gap-1.5 ml-auto mr-1 select-none">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <SubscriptionGuard>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md font-semibold cursor-pointer"
                  onClick={() => onEdit(item)}
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
                  onClick={() => onDeleteClick(item)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Deletar
                </Button>
              </SubscriptionGuard>
            </div>

            {/* Botão padrão de fechar */}
            <SheetCloseButton />
          </div>
        </SheetHeader>

        {/* Detalhes do item em modo leitura */}
        <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
          {/* Top Section: Mobile Actions + Name/Badge */}
          <div className="flex flex-col gap-2">
            {/* Mobile Actions Dropdown */}
            <div className="flex sm:hidden justify-end -mr-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  nativeButton={true}
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Ações</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-32">
                  <SubscriptionGuard>
                    <DropdownMenuItem
                      onClick={() => onEdit(item)}
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                      render={<div />}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </SubscriptionGuard>
                  <SubscriptionGuard>
                    <DropdownMenuItem
                      onClick={() => onDeleteClick(item)}
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
                      render={<div />}
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  </SubscriptionGuard>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
