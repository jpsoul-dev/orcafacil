'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { saveQuote } from '../actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'

const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.number()
})

const quoteSchema = z.object({
  customer_id: z.string().optional().nullable(),
  valid_until: z.string().optional(),
  discount_type: z.enum(['none', 'percentage', 'fixed']),
  discount_value: z.coerce.number().min(0),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, 'Adicione pelo menos um item ao orçamento')
})

type QuoteValues = z.infer<typeof quoteSchema>

export function QuoteForm({ customers, catalogItems }: { customers: any[], catalogItems: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subtotalFinal, setSubtotalFinal] = useState(0)
  const [totalFinal, setTotalFinal] = useState(0)

  // Default valid date (+15 days)
  const defaultValidDate = new Date()
  defaultValidDate.setDate(defaultValidDate.getDate() + 15)

  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: {
      customer_id: null,
      valid_until: defaultValidDate.toISOString().split('T')[0],
      discount_type: 'none',
      discount_value: 0,
      payment_method: '',
      notes: '',
      items: []
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  // Watch items and discounts to calculate totals
  const watchItems = form.watch('items')
  const watchDiscountType = form.watch('discount_type')
  const watchDiscountValue = form.watch('discount_value')

  useEffect(() => {
    let currentSubtotal = 0
    watchItems.forEach((item, index) => {
      const q = Number(item.quantity) || 0
      const p = Number(item.unit_price) || 0
      const lineSubtotal = q * p
      currentSubtotal += lineSubtotal
      
      // Update form value only if it changed to avoid infinite loops
      if (item.subtotal !== lineSubtotal) {
        form.setValue(`items.${index}.subtotal`, lineSubtotal)
      }
    })

    setSubtotalFinal(currentSubtotal)

    let currentTotal = currentSubtotal
    const dv = Number(watchDiscountValue) || 0

    if (watchDiscountType === 'percentage') {
      currentTotal -= currentTotal * (dv / 100)
    } else if (watchDiscountType === 'fixed') {
      currentTotal -= dv
    }

    setTotalFinal(currentTotal > 0 ? currentTotal : 0)
  }, [watchItems, watchDiscountType, watchDiscountValue, form])

  const handleAddCatalogItem = (catalogItemId: string) => {
    if (!catalogItemId) return
    const catalogItem = catalogItems.find(i => i.id === catalogItemId)
    if (catalogItem) {
      append({
        catalog_item_id: catalogItem.id,
        item_name: catalogItem.name,
        quantity: 1,
        unit_price: catalogItem.unit_price,
        subtotal: catalogItem.unit_price
      })
    }
  }

  const handleAddManualItem = () => {
    append({
      catalog_item_id: null,
      item_name: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0
    })
  }

  async function onSubmit(data: QuoteValues) {
    setLoading(true)
    const submitData = {
      ...data,
      subtotal: subtotalFinal,
      total: totalFinal
    }

    const result = await saveQuote(submitData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Orçamento gerado com sucesso!')
      router.push(`/quote/${result.public_uuid}`)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Header section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer_id">Cliente</Label>
          <Select onValueChange={(val) => form.setValue('customer_id', val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente (Opcional)" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valid_until">Validade do Orçamento</Label>
          <Input id="valid_until" type="date" {...form.register('valid_until')} />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-medium">Itens do Orçamento</h3>
          <div className="flex gap-2">
            <Select onValueChange={(val) => handleAddCatalogItem(val as string)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Buscar do catálogo..." />
              </SelectTrigger>
              <SelectContent>
                {catalogItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={handleAddManualItem}>
              <Plus className="mr-2 h-4 w-4" /> Item Avulso
            </Button>
          </div>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border rounded-md border-dashed">
            Nenhum item adicionado.
          </div>
        )}

        {form.formState.errors.items?.root && (
          <p className="text-sm text-red-500">{form.formState.errors.items.root.message}</p>
        )}

        {fields.length > 0 && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Descrição</TableHead>
                  <TableHead className="w-[20%]">Qtd</TableHead>
                  <TableHead className="w-[20%]">Vlr. Unit</TableHead>
                  <TableHead className="w-[15%]">Subtotal</TableHead>
                  <TableHead className="w-[5%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input {...form.register(`items.${index}.item_name` as const)} placeholder="Nome do item" />
                      {form.formState.errors.items?.[index]?.item_name && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.items[index].item_name.message}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" {...form.register(`items.${index}.quantity` as const)} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" {...form.register(`items.${index}.unit_price` as const)} />
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watchItems[index]?.subtotal || 0)}
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Footer / Summary */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select onValueChange={(val) => form.setValue('payment_method', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Ex: Pix, Cartão, Boleto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Débito">Cartão de Débito</SelectItem>
                <SelectItem value="Boleto">Boleto Bancário</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              {...form.register('notes')} 
              placeholder="Garantia, prazo de entrega, etc."
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalFinal)}
            </span>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="space-y-2 flex-1">
              <Label>Desconto</Label>
              <Select onValueChange={(val) => form.setValue('discount_type', val as any)} defaultValue={form.getValues('discount_type')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Desconto</SelectItem>
                  <SelectItem value="percentage">% Porcentagem</SelectItem>
                  <SelectItem value="fixed">R$ Valor Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {watchDiscountType !== 'none' && (
              <div className="w-[120px]">
                <Input 
                  type="number" 
                  step="0.01" 
                  {...form.register('discount_value')} 
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-4 flex justify-between items-center">
            <span className="text-lg font-bold">Total Geral</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinal)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button size="lg" type="submit" disabled={loading || fields.length === 0}>
          {loading ? 'Gerando...' : 'Gerar Orçamento'}
        </Button>
      </div>
    </form>
  )
}
