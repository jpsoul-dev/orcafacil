'use client'

import { useState, useEffect } from 'react'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCatalogItem } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  type: z.enum(['product', 'service']),
  name: z.string().min(1, 'Nome é obrigatório'),
  unit_price: z.coerce.number().min(0),
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

  const form = useForm<CatalogValues>({
    resolver: zodResolver(catalogSchema) as Resolver<CatalogValues>,
    defaultValues: {
      type: initialData?.type || 'product',
      name: initialData?.name || '',
      unit_price: initialData?.unit_price || 0,
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
        type: initialData?.type || 'product',
        name: initialData?.name || '',
        unit_price: initialData?.unit_price || 0,
      })
    }
  }, [open, initialData, form])

  const watchType = form.watch('type')

  async function onSubmit(data: CatalogValues) {
    setLoading(true)
    const result = await saveCatalogItem(
      data,
      initialData?.id,
    )
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
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
            <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg">
              <PackagePlus className="h-4 w-4" /> Novo item
            </Button>
          )
        }
      />

      <DialogContent className="p-0 flex flex-col sm:max-w-md max-h-[90vh] overflow-hidden gap-0 rounded-2xl border-none shadow-2xl">
        {/* Header no estilo inspirado na imagem */}
        <DialogHeader className="px-6 py-5 border-b shrink-0 bg-white z-10 relative">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 shadow-md shadow-slate-950/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-xl font-bold text-slate-800">
                {initialData ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 font-medium">
                {initialData
                  ? 'Atualize as informações do item'
                  : 'Adicione um produto ou serviço ao catálogo'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <form
            id="catalog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
            {/* Seletor de tipo com cards */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tipo do Item
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: 'product',
                    label: 'Produto',
                    icon: Box,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                  {
                    value: 'service',
                    label: 'Serviço',
                    icon: Wrench,
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
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
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-slate-950 bg-white shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-400'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${isSelected ? opt.bg : 'bg-slate-50'} ${isSelected ? opt.color : 'text-slate-400'}`}
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
                  className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Nome do Item <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Ex: Produto X ou Serviço Y"
                  className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="unit_price"
                  className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Valor Unitário (R$)
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...form.register('unit_price')}
                  className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 tabular-nums"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer fixo */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-6 rounded-b-2xl">
          <Button
            form="catalog-form"
            type="submit"
            disabled={loading}
            className="w-full h-12 font-bold text-base bg-slate-950 hover:bg-slate-800 text-white rounded-xl shadow-md shadow-slate-950/20 gap-2"
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
