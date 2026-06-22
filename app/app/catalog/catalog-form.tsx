'use client'

import { useState, useEffect } from 'react'
import { useForm, Resolver, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCatalogItem } from './actions'
import { maskCurrency } from '@/lib/masks'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubscription } from '@/components/subscription-provider'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Pencil,
  Loader2,
  Package,
  Box,
  Wrench,
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
})

type CatalogValues = z.infer<typeof catalogSchema>

export interface CatalogItem {
  id: string
  type: 'product' | 'service'
  name: string
  unit_price: number
  unit_measure?: string | null
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
      })
    }
  }, [open, initialData, form])

  const watchType = form.watch('type')

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
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
            <Button className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer">
              <PackagePlus className="h-4 w-4" /> Novo item
            </Button>
          )
        }
      />

      <DialogContent className="p-0 flex flex-col sm:max-w-md max-h-[90vh] overflow-hidden gap-0 rounded-2xl border border-border bg-card text-foreground shadow-2xl">
        {/* Header no estilo inspirado na imagem */}
        <DialogHeader className="px-6 py-5 border-b border-border shrink-0 bg-card z-10 relative">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-xl font-bold text-foreground">
                {initialData ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium">
                {initialData
                  ? 'Atualize as informações do item'
                  : 'Adicione um produto ou serviço ao catálogo'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto bg-background">
          <form
            id="catalog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
            {/* Seletor de tipo com cards */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo do Item
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: 'product',
                    label: 'Produto',
                    icon: Box,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-950/40',
                  },
                  {
                    value: 'service',
                    label: 'Serviço',
                    icon: Wrench,
                    color: 'text-orange-600 dark:text-orange-400',
                    bg: 'bg-orange-50 dark:bg-orange-950/40',
                  },
                ].map((opt) => {
                  const isSelected = watchType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        form.setValue(
                          'type',
                          opt.value as 'product' | 'service',
                        )
                      }
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-foreground bg-card shadow-sm text-foreground'
                          : 'border-border bg-card hover:border-border/80 text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSelected ? opt.bg : 'bg-muted'} ${isSelected ? opt.color : 'text-muted-foreground'}`}
                      >
                        <opt.icon className="h-5 w-5 shrink-0" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold leading-none ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}
                        >
                          {opt.label}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Nome do Item <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  className="h-11 rounded-xl bg-background border-input focus-visible:ring-1 focus-visible:ring-ring"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="unit_price"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Valor Unitário (R$) <span className="text-red-500">*</span>
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
                        className="h-11 rounded-xl bg-background border-input focus-visible:ring-1 focus-visible:ring-ring tabular-nums"
                      />
                    )}
                  />
                  {form.formState.errors.unit_price && (
                    <p className="text-xs text-red-500 font-medium">
                      {form.formState.errors.unit_price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="unit_measure"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Unidade de Medida
                  </Label>
                  <Input
                    id="unit_measure"
                    placeholder="Ex: un, m², h"
                    {...form.register('unit_measure')}
                    className="h-11 rounded-xl bg-background border-input focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {form.formState.errors.unit_measure && (
                    <p className="text-xs text-red-500 font-medium">
                      {form.formState.errors.unit_measure.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fixo */}
        <div className="shrink-0 border-t border-border bg-card p-6 rounded-b-2xl">
          <Button
            form="catalog-form"
            type="submit"
            disabled={loading}
            className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 gap-2 cursor-pointer"
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
      </DialogContent>
    </Dialog>
  )
}
