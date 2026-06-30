'use client'

import { useState, useEffect } from 'react'
import { useForm, Resolver, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveCatalogItem } from './actions'
import { maskCurrency } from '@/lib/masks'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UnitMeasureSelector } from '@/components/ui/unit-measure-selector'
import { FormError } from '@/components/ui/form-error'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/components/subscription-provider'
import { showPillToast } from './components/pill-toast'
import { catalogItemSchema } from '@/lib/validations/catalog-schema'
import type { CatalogItemInput } from '@/lib/validations/catalog-schema'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetHeader,
  SheetCloseButton,
} from '@/components/ui/sheet'
import {
  Pencil,
  PackagePlus,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export interface CatalogItem {
  id: string
  type: 'product' | 'service'
  name: string
  unit_price: number
  unit_measure?: string | null
  description?: string | null
}

interface CatalogFormProps {
  initialData?: CatalogItem
  asMenuItem?: boolean
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Form component to create or edit a Catalog Item (User Story 4 / FR-007, FR-008, FR-009).
 * Supports controlled and uncontrolled states for sheet coordination.
 */
export function CatalogForm({
  initialData,
  asMenuItem,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CatalogFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { isExpired, openUpgradeModal } = useSubscription()

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && isExpired) {
      openUpgradeModal()
      return
    }
    setOpen(newOpen)
  }

  const form = useForm<CatalogItemInput>({
    resolver: zodResolver(catalogItemSchema) as Resolver<CatalogItemInput>,
    defaultValues: {
      type: initialData?.type || 'product',
      name: initialData?.name || '',
      unit_price: initialData?.unit_price || 0,
      unit_measure: initialData?.unit_measure || '',
      description: initialData?.description || '',
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        type: initialData?.type || 'product',
        name: initialData?.name || '',
        unit_price: initialData?.unit_price || 0,
        unit_measure: initialData?.unit_measure || '',
        description: initialData?.description || '',
      })
    }
  }, [open, initialData, form])

  const watchType = useWatch({
    control: form.control,
    name: 'type',
  })

  async function onSubmit(data: CatalogItemInput) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showPillToast('Sem conexão com a internet. Não é possível salvar o item agora.', 'error')
      return
    }

    setLoading(true)
    try {
      const result = await saveCatalogItem(data, initialData?.id)
      setLoading(false)
      if (result.error) {
        showPillToast(result.error, 'error')
      } else {
        showPillToast(initialData ? 'Item atualizado com sucesso!' : 'Item cadastrado com sucesso!', 'success')
        setOpen(false)
        if (!initialData) form.reset()
      }
    } catch (err) {
      setLoading(false)
      console.error('Erro ao salvar item do catálogo:', err)
      showPillToast('Erro de conexão. Verifique sua rede e tente novamente.', 'error')
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Trigger button (only if not controlled by parent) */}
      {!isControlled && (
        <SheetTrigger
          nativeButton={true}
          render={
            trigger ? (
              trigger
            ) : asMenuItem ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            ) : (
              <Button
                variant="default"
                className="gap-2 rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <PackagePlus className="h-4 w-4" /> Novo item
              </Button>
            )
          }
        />
      )}

      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md h-full duration-ds-fast"
      >
        <SheetHeader>
          <SheetTitle>{initialData ? 'Editar Item' : 'Novo Item'}</SheetTitle>
          <SheetCloseButton />
        </SheetHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-background">
          <form
            id="catalog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6 select-none"
          >
            {/* Nome do Item */}
            <div className="space-y-2">
              <Label htmlFor="name" error={!!form.formState.errors.name}>
                Nome do Item
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                aria-invalid={!!form.formState.errors.name}
              />
              <FormError message={form.formState.errors.name?.message} />
            </div>

            {/* Descrição do Item */}
            <div className="space-y-2">
              <Label htmlFor="description" optional error={!!form.formState.errors.description}>
                Descrição do Item
              </Label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    maxLength={300}
                    showCounter
                    value={field.value || ""}
                    onChange={field.onChange}
                    aria-invalid={!!form.formState.errors.description}
                  />
                )}
              />
              <FormError message={form.formState.errors.description?.message} />
            </div>

            {/* Valor Unitário */}
            <div className="space-y-2">
              <Label htmlFor="unit_price" error={!!form.formState.errors.unit_price}>
                Valor Unitário
              </Label>
              <Controller
                name="unit_price"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="unit_price"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={
                      field.value
                        ? maskCurrency(
                          Math.round(field.value * 100).toString(),
                        )
                        : ''
                    }
                    onChange={(e) => {
                      const masked = maskCurrency(e.target.value)
                      const raw =
                        parseFloat(
                          masked.replace(/\./g, '').replace(',', '.'),
                        ) || 0
                      field.onChange(raw)
                    }}
                    aria-invalid={!!form.formState.errors.unit_price}
                    className="tabular-nums"
                  />
                )}
              />
              <FormError message={form.formState.errors.unit_price?.message} />
            </div>

            {/* Unidade de Medida */}
            <div className="space-y-2">
              <Label htmlFor="unit_measure" error={!!form.formState.errors.unit_measure}>
                Unidade de Medida
              </Label>
              <Controller
                name="unit_measure"
                control={form.control}
                render={({ field }) => (
                  <UnitMeasureSelector
                    id="unit_measure"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={!!form.formState.errors.unit_measure}
                  />
                )}
              />
              <FormError message={form.formState.errors.unit_measure?.message} />
            </div>

            {/* Seletor de tipo segmentado */}
            <div className="space-y-2">
              <Label htmlFor="type" error={!!form.formState.errors.type}>
                Tipo
              </Label>
              <div className="flex h-11 w-full rounded-sm border border-input bg-card p-1">
                <button
                  type="button"
                  onClick={() => form.setValue('type', 'product')}
                  className={cn(
                    "flex-1 flex items-center justify-center text-sm font-semibold rounded-xs transition-all cursor-pointer select-none",
                    watchType === 'product'
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Produto
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue('type', 'service')}
                  className={cn(
                    "flex-1 flex items-center justify-center text-sm font-semibold rounded-xs transition-all cursor-pointer select-none",
                    watchType === 'service'
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Serviço
                </button>
              </div>
              <FormError message={form.formState.errors.type?.message} />
            </div>
          </form>
        </div>

        {/* Footer fixo */}
        <div className="shrink-0 border-t border-border bg-card p-6">
          <Button
            form="catalog-form"
            type="submit"
            disabled={loading}
            className="w-full rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <Spinner className="h-5 w-5 mr-2" />
                Salvando...
              </>
            ) : initialData ? (
              'Salvar Alterações'
            ) : (
              'Adicionar ao Catálogo'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
