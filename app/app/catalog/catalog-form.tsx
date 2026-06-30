'use client'

import { useState, useEffect } from 'react'
import { useForm, Resolver, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
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
  Loader2,
  PackagePlus,
} from 'lucide-react'

const catalogSchema = z.object({
  type: z.enum(['product', 'service'], {
    message: 'O tipo do item é obrigatório.',
  }),
  name: z.string()
    .min(2, 'O nome deve conter pelo menos 2 caracteres.')
    .max(100, 'O nome deve conter no máximo 100 caracteres.'),
  unit_price: z.coerce.number()
    .min(0.01, 'O valor unitário deve ser estritamente maior que zero.'),
  unit_measure: z.string()
    .max(10, 'A unidade de medida deve conter no máximo 10 caracteres.')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z.string()
    .max(300, 'A descrição deve conter no máximo 300 caracteres.')
    .optional()
    .nullable()
    .or(z.literal('')),
})

type CatalogValues = z.infer<typeof catalogSchema>

export interface CatalogItem {
  id: string
  type: 'product' | 'service'
  name: string
  unit_price: number
  unit_measure?: string | null
  description?: string | null
}

export function CatalogForm({
  initialData,
  asMenuItem,
  trigger,
}: {
  initialData?: CatalogItem
  asMenuItem?: boolean
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { isExpired, openUpgradeModal } = useSubscription()

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && isExpired) {
      openUpgradeModal()
      return
    }
    setOpen(newOpen)
  }

  const form = useForm<CatalogValues>({
    resolver: zodResolver(catalogSchema) as Resolver<CatalogValues>,
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

  async function onSubmit(data: CatalogValues) {
    setLoading(true)
    const result = await saveCatalogItem(data, initialData?.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(initialData ? 'Item atualizado!' : 'Item cadastrado!')
      setOpen(false)
      if (!initialData) form.reset()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
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
            <Button variant="default" className="gap-2 rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]">
              <PackagePlus className="h-4 w-4" /> Novo item
            </Button>
          )
        }
      />

      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md h-full duration-ds-fast"
      >
        {/* Header no estilo inspirado na imagem */}
        <SheetHeader>
          <SheetTitle>{initialData ? 'Editar Item' : 'Novo Item'}</SheetTitle>
          <SheetCloseButton />
        </SheetHeader>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto bg-background">
          <form
            id="catalog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
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
              <Label htmlFor="unit_measure" optional error={!!form.formState.errors.unit_measure}>
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
            className="w-full rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
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
