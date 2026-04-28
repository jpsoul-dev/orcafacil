'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCatalogItem } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Plus, Pencil } from 'lucide-react'

const catalogSchema = z.object({
  type: z.enum(['product', 'service']),
  name: z.string().min(1, 'Nome é obrigatório'),
  unit_price: z.coerce.number().min(0),
  unit_measure: z.string().optional(),
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
      unit_measure: initialData?.unit_measure || 'Un',
    },
  })

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={asMenuItem ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        )} />
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>{initialData ? 'Editar Item' : 'Novo Item'}</SheetTitle>
          <SheetDescription>
            Adicione um produto ou serviço ao seu catálogo.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo do Item</Label>
              <Select onValueChange={(val) => form.setValue('type', val as any)} defaultValue={form.getValues('type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produto Físico</SelectItem>
                  <SelectItem value="service">Serviço / Mão de Obra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit_price">Valor Base (R$)</Label>
                <Input id="unit_price" type="number" step="0.01" {...form.register('unit_price')} />
                {form.formState.errors.unit_price && <p className="text-sm text-red-500">{form.formState.errors.unit_price.message}</p>}
              </div>

              {watchType === 'product' && (
                <div className="space-y-2">
                  <Label htmlFor="unit_measure">Unidade de Medida</Label>
                  <Select onValueChange={(val) => form.setValue('unit_measure', val as any)} defaultValue={form.getValues('unit_measure')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ex: Un, Kg" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Un">Un (Unidade)</SelectItem>
                      <SelectItem value="Kg">Kg (Quilograma)</SelectItem>
                      <SelectItem value="L">L (Litro)</SelectItem>
                      <SelectItem value="M">M (Metro)</SelectItem>
                      <SelectItem value="Cx">Cx (Caixa)</SelectItem>
                      <SelectItem value="Hr">Hr (Hora)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Item'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
