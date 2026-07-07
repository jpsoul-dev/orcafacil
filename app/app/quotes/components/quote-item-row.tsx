'use client'

import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuantityInput } from '@/components/ui/quantity-input'
import { maskCurrency } from '@/lib/masks'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import type { QuoteValues } from './quote-form'

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

interface QuoteItemRowProps {
  index: number
  register: UseFormRegister<QuoteValues>
  control: Control<QuoteValues>
  remove: (index: number) => void
  errors: FieldErrors<QuoteValues>
  watchItem: {
    item_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }
  handleRecalculate: (index: number, qty?: number, price?: number) => void
  triggerVibration: (pattern: number | number[]) => void
}

export function QuoteItemRow({
  index,
  register,
  control,
  remove,
  errors,
  watchItem,
  handleRecalculate,
  triggerVibration,
}: QuoteItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    triggerVibration(10)
    setIsExpanded((prev) => !prev)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerVibration(15)
    remove(index)
  }

  const subtotal = watchItem?.subtotal || 0
  const qty = watchItem?.quantity || 0
  const unitPrice = watchItem?.unit_price || 0
  const name = watchItem?.item_name || `Item ${index + 1}`

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card transition-all duration-ds-fast overflow-hidden",
        isExpanded ? "shadow-sm border-primary/30" : "hover:border-primary/20"
      )}
    >
      {/* Cabeçalho do Item / Visualização Simplificada (Recolhido) */}
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between p-3 cursor-pointer select-none"
      >
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Número e Nome do Item */}
          <div className="md:col-span-5 flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {index + 1}
            </span>
            <span className="text-ds-body-sm font-semibold text-foreground truncate">
              {name || <span className="text-muted-foreground italic">Sem descrição</span>}
            </span>
          </div>

          {/* Valores Ocultos no Mobile quando Expandido para evitar poluição */}
          <div className="hidden md:contents">
            {/* Quantidade */}
            <div className="md:col-span-2 text-right text-ds-body-sm text-muted-foreground">
              {qty}
            </div>
            {/* Valor Unitário */}
            <div className="md:col-span-2 text-right text-ds-body-sm text-muted-foreground">
              {brl(unitPrice)}
            </div>
            {/* Total */}
            <div className="md:col-span-2 text-right text-ds-body-sm font-bold text-foreground">
              {brl(subtotal)}
            </div>
          </div>

          {/* Visualização de Resumo Rápida para Mobile */}
          <div className="md:hidden flex items-center gap-2 text-xs text-muted-foreground mt-1 pl-7">
            <span>{qty} un.</span>
            <span>•</span>
            <span>{brl(unitPrice)}</span>
            <span>•</span>
            <span className="font-bold text-foreground">{brl(subtotal)}</span>
          </div>
        </div>

        {/* Ações do cabeçalho */}
        <div className="flex items-center gap-1.5 ml-3" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={handleDelete}
            aria-label="Excluir item"
          >
            <Trash2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={toggleExpand}
            aria-label={isExpanded ? "Recolher item" : "Expandir item"}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </div>

      {/* Visualização de Edição (Expandido) */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-4 animate-in fade-in duration-ds-fast">
          {/* Desktop: Edição em Linha Única */}
          <div className="hidden md:grid grid-cols-12 gap-4 items-end">
            <div className="col-span-6 space-y-1.5">
              <Label htmlFor={`items.${index}.item_name`} className="text-xs">
                Descrição do Item
              </Label>
              <Input
                id={`items.${index}.item_name`}
                {...register(`items.${index}.item_name` as const)}
                placeholder="Ex: Instalação de ar condicionado"
                className="h-9 text-xs"
                aria-invalid={!!errors?.items?.[index]?.item_name}
              />
              {errors?.items?.[index]?.item_name && (
                <FormError message={errors.items[index].item_name.message} />
              )}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor={`items.${index}.quantity`} className="text-xs">
                Qtd.
              </Label>
              <Controller
                name={`items.${index}.quantity` as const}
                control={control}
                render={({ field }) => (
                  <QuantityInput
                    id={`items.${index}.quantity`}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      handleRecalculate(index, val)
                    }}
                    className="h-9"
                    min={0.01}
                    max={99999}
                  />
                )}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor={`items.${index}.unit_price`} className="text-xs">
                Valor Unitário
              </Label>
              <Controller
                name={`items.${index}.unit_price` as const}
                control={control}
                render={({ field }) => (
                  <Input
                    id={`items.${index}.unit_price`}
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={
                      field.value
                        ? maskCurrency(Math.round(field.value * 100).toString())
                        : ''
                    }
                    onChange={(e) => {
                      const masked = maskCurrency(e.target.value)
                      const raw = parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
                      field.onChange(raw)
                      handleRecalculate(index, undefined, raw)
                    }}
                    className="h-9 text-xs text-right"
                  />
                )}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor={`items.${index}.subtotal`} className="text-xs">
                Total
              </Label>
              <Input
                id={`items.${index}.subtotal`}
                type="text"
                disabled
                value={brl(subtotal)}
                className="h-9 text-xs bg-muted font-bold text-right"
              />
            </div>
          </div>

          {/* Mobile: Edição Empilhada (Vertical) */}
          <div className="md:hidden space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor={`items-mob.${index}.item_name`} className="text-xs">
                Descrição do Item
              </Label>
              <Input
                id={`items-mob.${index}.item_name`}
                {...register(`items.${index}.item_name` as const)}
                placeholder="Ex: Instalação de ar condicionado"
                className="h-10 text-sm"
                aria-invalid={!!errors?.items?.[index]?.item_name}
              />
              {errors?.items?.[index]?.item_name && (
                <FormError message={errors.items[index].item_name.message} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`items-mob.${index}.quantity`} className="text-xs">
                  Quantidade
                </Label>
                <Controller
                  name={`items.${index}.quantity` as const}
                  control={control}
                  render={({ field }) => (
                    <QuantityInput
                      id={`items-mob.${index}.quantity`}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val)
                        handleRecalculate(index, val)
                      }}
                      className="h-10"
                      min={0.01}
                      max={99999}
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`items-mob.${index}.unit_price`} className="text-xs">
                  Valor Unitário
                </Label>
                <Controller
                  name={`items.${index}.unit_price` as const}
                  control={control}
                  render={({ field }) => (
                    <Input
                      id={`items-mob.${index}.unit_price`}
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={
                        field.value
                          ? maskCurrency(Math.round(field.value * 100).toString())
                          : ''
                      }
                      onChange={(e) => {
                        const masked = maskCurrency(e.target.value)
                        const raw = parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
                        field.onChange(raw)
                        handleRecalculate(index, undefined, raw)
                      }}
                      className="h-10 text-sm text-right"
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground">Total Calculado</span>
              <span className="text-sm font-bold text-primary">{brl(subtotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
