'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCatalogItem } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader, DialogDescription } from '@/components/ui/dialog'
import { Plus, Pencil, Loader2, Package, Box, Wrench } from 'lucide-react'

const catalogSchema = z.object({
  type: z.enum(['product', 'service']),
  name: z.string().min(1, 'Nome é obrigatório'),
  unit_price: z.coerce.number().min(0),
})

type CatalogValues = z.infer<typeof catalogSchema>

export function CatalogForm({ initialData, asMenuItem }: { initialData?: any, asMenuItem?: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<CatalogValues>({
    resolver: zodResolver(catalogSchema) as any,
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
    const result = await saveCatalogItem({ ...data, unit_measure: 'Un' }, initialData?.id)
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
      <DialogTrigger render={asMenuItem ? (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      ) : (
        <Button className="gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Novo Item
        </Button>
      )} />

      <DialogContent className="p-0 flex flex-col sm:max-w-md max-h-[90vh] overflow-hidden gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left space-y-0.5">
              <DialogTitle className="text-base font-semibold">
                {initialData ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {initialData ? 'Atualize as informações do item' : 'Adicione um produto ou serviço ao catálogo'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          <form id="catalog-form" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-5">
              {/* Seletor de tipo com cards */}
              <div className="space-y-2">
                <Label className="font-medium text-sm">Tipo do Item</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'product', label: 'Produto', icon: Box },
                    { value: 'service', label: 'Serviço', icon: Wrench },
                  ].map((opt) => {
                    const isSelected = watchType === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setValue('type', opt.value as any)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                          }`}
                      >
                        <opt.icon className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold leading-none">{opt.label}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-medium text-sm">Nome do Item *</Label>
                <Input id="name" {...form.register('name')} className="h-10" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit_price" className="font-medium text-sm">Valor Unitário (R$)</Label>
                <Input id="unit_price" type="number" step="0.01" min="0.01" {...form.register('unit_price')} className="h-10" />
              </div>
            </div>

            {/* Espaço para o footer */}
            <div className="h-20" />
          </form>
        </div>

        {/* Footer fixo */}
        <div className="shrink-0 border-t bg-background px-6 py-4">
          <Button form="catalog-form" type="submit" disabled={loading} className="w-full h-10 font-semibold gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              initialData ? 'Salvar Alterações' : 'Adicionar ao Catálogo'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
