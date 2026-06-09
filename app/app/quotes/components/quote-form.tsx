'use client'

import { useState, useMemo } from 'react'
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { saveQuote } from '../actions'
import { useDebounce } from '@/hooks/use-debounce'
import { maskCurrency } from '@/lib/masks'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Trash2,
  Plus,
  Package,
  Calendar as CalendarIcon,
  Search,
  Edit2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Customer } from '../../customers/customer-form'
import { CatalogItem } from '../../catalog/columns'
import { CustomerSelector } from './customer-selector'

export interface QuoteWithItems {
  id: string
  title?: string | null
  customer_id: string
  valid_until?: string | null
  discount_type?: 'none' | 'percentage' | 'fixed'
  discount_value?: number
  payment_method?: string[] | null
  notes?: string | null
  show_quote_number?: boolean
  quote_items?: {
    catalog_item_id: string | null
    item_name: string
    quantity: number
    unit_price: number
    subtotal: number
    discount_type?: 'none' | 'percentage' | 'fixed' | null
    discount_value?: number | null
  }[]
}

const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.number(),
  discount_type: z.enum(['none', '%', 'R$']).optional().nullable().default('none'),
  discount_value: z.coerce.number().optional().nullable().default(0),
})

const quoteSchema = z.object({
  title: z.string().optional().nullable(),
  customer_id: z.string().min(1, 'Selecione um cliente'),
  valid_until: z
    .string()
    .refine(
      (val) => {
        if (!val) return true
        const date = new Date(val + 'T00:00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      },
      {
        message: 'A data de validade não pode ser anterior à data atual',
      },
    )
    .optional()
    .nullable(),
  discount_type: z.enum(['none', '%', 'R$']),
  discount_value: z.coerce.number().min(0),
  payment_method: z.array(z.string()).optional().nullable(),
  notes: z.string().optional().nullable(),
  show_quote_number: z.boolean().optional().default(true),
  items: z
    .array(quoteItemSchema)
    .min(1, 'Adicione pelo menos um item ao orçamento'),
})

type QuoteValues = z.infer<typeof quoteSchema>

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export function QuoteForm({
  customers,
  catalogItems,
  initialData,
  mode = 'new',
}: {
  customers: Customer[]
  catalogItems: CatalogItem[]
  initialData?: QuoteWithItems
  mode?: 'new' | 'edit' | 'clone'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Estados dos modais de busca
  const [openCatalogModal, setOpenCatalogModal] = useState(false)
  const [openDiscountModal, setOpenDiscountModal] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  const defaultValidDate = new Date()
  defaultValidDate.setDate(defaultValidDate.getDate() + 15)

  const defaultItems = initialData?.quote_items?.length
    ? initialData.quote_items.map((i) => ({
      catalog_item_id: i.catalog_item_id,
      item_name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
      discount_type: (i.discount_type === 'percentage' ? '%' : i.discount_type === 'fixed' ? 'R$' : 'none') as 'none' | '%' | 'R$',
      discount_value: i.discount_value || 0,
    }))
    : []

  const defaultPaymentMethods = (() => {
    if (!initialData?.payment_method) return ['Pix']
    if (Array.isArray(initialData.payment_method)) return initialData.payment_method
    if (typeof initialData.payment_method === 'string') {
      return (initialData.payment_method as string).split(',').map((m) => m.trim()).filter(Boolean)
    }
    return ['Pix']
  })()

  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema) as Resolver<QuoteValues>,
    defaultValues: {
      title: initialData?.title || '',
      customer_id: initialData?.customer_id || '',
      valid_until:
        initialData?.valid_until ||
        defaultValidDate.toISOString().split('T')[0],
      discount_type:
        initialData?.discount_type === 'percentage'
          ? '%'
          : initialData?.discount_type === 'fixed'
            ? 'R$'
            : 'R$',
      discount_value: initialData?.discount_value || 0,
      payment_method: defaultPaymentMethods,
      notes: initialData?.notes || '',
      show_quote_number: initialData?.show_quote_number ?? true,
      items: defaultItems,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })
  const watchedItems = useWatch({ control: form.control, name: 'items' })
  const watchItems = useMemo(() => watchedItems || [], [watchedItems])
  const watchDiscountType = useWatch({
    control: form.control,
    name: 'discount_type',
  })
  const watchDiscountValue = useWatch({
    control: form.control,
    name: 'discount_value',
  })
  const watchCustomerId = useWatch({
    control: form.control,
    name: 'customer_id',
  })
  const watchPaymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  const { subtotalFinal, totalFinal, totalItemsCount } = useMemo(() => {
    let itemsCount = 0
    const sub = (watchItems || []).reduce((acc, item) => {
      itemsCount += Number(item.quantity) || 0
      return acc + (Number(item.subtotal) || 0)
    }, 0)

    let tot = sub
    const dv = Number(watchDiscountValue) || 0
    if (watchDiscountType === '%') tot -= round2(tot * (dv / 100))
    else if (watchDiscountType === 'R$') tot -= dv

    return {
      subtotalFinal: sub,
      totalFinal: Math.max(0, round2(tot)),
      totalItemsCount: itemsCount,
    }
  }, [watchItems, watchDiscountType, watchDiscountValue])

  const debouncedCatalogSearch = useDebounce(catalogSearch, 300)

  const handleAddCatalogItem = (item: CatalogItem) => {
    if (!item) return
    append({
      catalog_item_id: item.id,
      item_name: item.name,
      quantity: 1,
      unit_price: item.unit_price,
      subtotal: item.unit_price,
      discount_type: 'none',
      discount_value: 0,
    })
    setOpenCatalogModal(false)
    setCatalogSearch('')
  }

  const handleAddManualItem = () => {
    append({
      catalog_item_id: null,
      item_name: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
      discount_type: 'none',
      discount_value: 0,
    })
  }

  async function handleSave(
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'expired',
  ) {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Preencha todos os campos obrigatórios corretamente.')
      return
    }

    const data = form.getValues()

    // Mapear valores da UI para o banco de dados
    const dbDiscountType =
      data.discount_type === '%'
        ? 'percentage'
        : data.discount_type === 'R$'
          ? 'fixed'
          : 'none'

    const dbItems = data.items.map((item) => ({
      ...item,
      discount_type: (item.discount_type === '%'
        ? 'percentage'
        : item.discount_type === 'R$'
          ? 'fixed'
          : 'none') as 'none' | 'percentage' | 'fixed',
      discount_value: Number(item.discount_value) || 0,
    }))

    setLoading(true)
    const result = await saveQuote({
      ...data,
      items: dbItems,
      discount_type: dbDiscountType,
      id: mode === 'edit' ? initialData?.id : undefined,
      status,
      subtotal: subtotalFinal,
      total: totalFinal,
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        status === 'draft'
          ? 'Rascunho salvo com sucesso!'
          : 'Orçamento concluído com sucesso!',
      )
      if (status === 'draft') {
        router.push('/app/quotes')
      } else {
        router.push(`/app/quotes/${result.id}`)
      }
    }
  }
  const filteredCatalog = useMemo(() => {
    const term = debouncedCatalogSearch.trim().toLowerCase()
    if (!term) return catalogItems
    if (term.length < 2) return catalogItems
    return catalogItems.filter((i) => i.name?.toLowerCase().includes(term))
  }, [catalogItems, debouncedCatalogSearch])

  return (
    <div className="space-y-6 w-full">
      <Card className="rounded-md border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-6 space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-slate-700"
              >
                Título do orçamento{' '}
                <span className="text-slate-400 text-xs">(opcional)</span>
              </Label>
              <Input
                id="title"
                {...form.register('title')}
                className="h-10 border-slate-200 rounded-md bg-white"
              />
              <div className="flex items-center gap-2 pt-1">
                <Controller
                  name="show_quote_number"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="show_quote_number"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 h-4 w-4 cursor-pointer accent-slate-900"
                    />
                  )}
                />
                <Label
                  htmlFor="show_quote_number"
                  className="text-xs font-medium text-slate-500 cursor-pointer select-none"
                >
                  Exibir número do orçamento
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="valid_until"
                className="text-sm font-semibold text-slate-700"
              >
                Validade
              </Label>
              <Controller
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <div>
                    <Popover>
                      <PopoverTrigger
                        id="valid_until"
                        nativeButton={true}
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full justify-between text-left font-normal h-10 border-slate-200 rounded-md bg-white',
                              !field.value && 'text-muted-foreground',
                              form.formState.errors.valid_until &&
                              'border-red-500 focus-visible:ring-red-500',
                            )}
                          />
                        }
                      >
                        {field.value ? (
                          format(
                            new Date(field.value + 'T00:00:00'),
                            'dd/MM/yyyy',
                            { locale: ptBR },
                          )
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? new Date(field.value + 'T00:00:00')
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear()
                              const month = String(
                                date.getMonth() + 1,
                              ).padStart(2, '0')
                              const day = String(date.getDate()).padStart(
                                2,
                                '0',
                              )
                              field.onChange(`${year}-${month}-${day}`)
                            } else {
                              field.onChange(null)
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />
              {form.formState.errors.valid_until && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.valid_until.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-full space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Cliente <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <CustomerSelector
                    customers={customers}
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.customer_id?.message}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens do Pedido */}
      <Card className="rounded-[12px] border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-[16px] font-bold text-slate-800">
            Itens do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {/* Empty state ou tabela de itens */}
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400">
              <Package className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">Nenhum item adicionado</p>
              <p className="text-xs mt-1">
                Use <span className="font-semibold">Catálogo</span> para buscar
                um produto ou <span className="font-semibold">Novo item</span>{' '}
                para incluir manualmente.
              </p>
            </div>
          ) : (
            <div className="pb-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pr-2 pb-3 text-center w-[5%]">Nº</th>
                    <th className="pr-2 pb-3 w-[30%]">Item</th>
                    <th className="px-2 pb-3 text-center w-[10%]">Qtd</th>
                    <th className="px-2 pb-3 text-center w-[18%]">
                      Preço (R$)
                    </th>
                    <th className="px-2 pb-3 text-center w-[18%]">
                      Desconto
                    </th>
                    <th className="px-2 pb-3 text-right w-[14%]">Total</th>
                    <th className="w-[5%] pb-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group">
                      <td className="pr-2 py-4 align-top text-center text-slate-500 font-medium text-sm">
                        <div className="h-10 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </td>
                      <td className="pr-2 py-4 align-top">
                        <div className="relative">
                          <Input
                            {...form.register(
                              `items.${index}.item_name` as const,
                            )}
                            placeholder="Descrição"
                            className={`h-10 text-sm border-slate-200 rounded-md ${form.formState.errors.items?.[index]?.item_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          {form.formState.errors.items?.[index]?.item_name && (
                            <p className="text-[10px] text-red-500 mt-1 font-medium ml-1">
                              {
                                form.formState.errors.items[index]?.item_name
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top">
                        <div className="flex h-10 border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            {...form.register(
                              `items.${index}.quantity` as const,
                              {
                                onChange: () => {
                                  const qty =
                                    Number(
                                      form.getValues(`items.${index}.quantity`),
                                    ) || 0
                                  const price =
                                    Number(
                                      form.getValues(
                                        `items.${index}.unit_price`,
                                      ),
                                    ) || 0
                                  const type =
                                    form.getValues(
                                      `items.${index}.discount_type`,
                                    ) || 'none'
                                  let discVal =
                                    Number(
                                      form.getValues(
                                        `items.${index}.discount_value`,
                                      ),
                                    ) || 0

                                  const gross = round2(qty * price)

                                  if (type === 'R$' && discVal > gross) {
                                    form.setValue(
                                      `items.${index}.discount_value`,
                                      gross,
                                    )
                                    discVal = gross
                                  }

                                  let discountMoney = 0
                                  if (type === '%') {
                                    discountMoney = round2(gross * (discVal / 100))
                                  } else if (type === 'R$') {
                                    discountMoney = round2(discVal)
                                  }

                                  form.setValue(
                                    `items.${index}.subtotal`,
                                    round2(gross - discountMoney),
                                  )
                                },
                              },
                            )}
                            className="h-full border-0 rounded-none focus-visible:ring-0 text-center tabular-nums w-full px-1"
                          />
                          <div className="h-full px-1.5 bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold border-l border-slate-200 shrink-0">
                            Un
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top">
                        <div className="flex h-10 border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
                          <Controller
                            name={`items.${index}.unit_price` as const}
                            control={form.control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                placeholder="0,00"
                                value={
                                  field.value
                                    ? maskCurrency(
                                      Math.round(
                                        field.value * 100,
                                      ).toString(),
                                    )
                                    : ''
                                }
                                onChange={(e) => {
                                  const masked = maskCurrency(e.target.value)
                                  const raw =
                                    parseFloat(
                                      masked
                                        .replace(/\./g, '')
                                        .replace(',', '.'),
                                    ) || 0
                                  field.onChange(raw)

                                  const qty =
                                    Number(
                                      form.getValues(`items.${index}.quantity`),
                                    ) || 0
                                  const type =
                                    form.getValues(
                                      `items.${index}.discount_type`,
                                    ) || 'none'
                                  let discVal =
                                    Number(
                                      form.getValues(
                                        `items.${index}.discount_value`,
                                      ),
                                    ) || 0

                                  const gross = round2(qty * raw)

                                  if (type === 'R$' && discVal > gross) {
                                    form.setValue(
                                      `items.${index}.discount_value`,
                                      gross,
                                    )
                                    discVal = gross
                                  }

                                  let discountMoney = 0
                                  if (type === '%') {
                                    discountMoney = round2(gross * (discVal / 100))
                                  } else if (type === 'R$') {
                                    discountMoney = round2(discVal)
                                  }

                                  form.setValue(
                                    `items.${index}.subtotal`,
                                    round2(gross - discountMoney),
                                  )
                                }}
                                className="h-full border-0 rounded-none focus-visible:ring-0 text-right tabular-nums w-full px-1"
                              />
                            )}
                          />
                          <div className="h-full px-1.5 bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold border-l border-slate-200 shrink-0">
                            R$
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top">
                        <div className="flex h-10 border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
                          <Controller
                            name={`items.${index}.discount_type` as const}
                            control={form.control}
                            render={({ field }) => (
                              <select
                                value={field.value || 'none'}
                                onChange={(e) => {
                                  const newType = e.target.value as 'none' | '%' | 'R$'
                                  field.onChange(newType)

                                  const qty = Number(form.getValues(`items.${index}.quantity`)) || 0
                                  const price = Number(form.getValues(`items.${index}.unit_price`)) || 0
                                  let discVal = Number(form.getValues(`items.${index}.discount_value`)) || 0

                                  if (newType === 'none') {
                                    form.setValue(`items.${index}.discount_value`, 0)
                                    discVal = 0
                                  }

                                  const gross = round2(qty * price)
                                  let discountMoney = 0
                                  if (newType === '%') {
                                    if (discVal > 100) {
                                      form.setValue(`items.${index}.discount_value`, 100)
                                      discVal = 100
                                    }
                                    discountMoney = round2(gross * (discVal / 100))
                                  } else if (newType === 'R$') {
                                    if (discVal > gross) {
                                      form.setValue(`items.${index}.discount_value`, gross)
                                      discVal = gross
                                    }
                                    discountMoney = round2(discVal)
                                  }

                                  form.setValue(
                                    `items.${index}.subtotal`,
                                    round2(gross - discountMoney),
                                  )
                                }}
                                className="h-full bg-slate-100 text-slate-700 text-xs px-2 border-r border-slate-200 outline-none shrink-0 font-medium cursor-pointer"
                              >
                                <option value="none">Sem desc.</option>
                                <option value="%">%</option>
                                <option value="R$">R$</option>
                              </select>
                            )}
                          />

                          <Controller
                            name={`items.${index}.discount_value` as const}
                            control={form.control}
                            render={({ field }) => {
                              const type = form.watch(`items.${index}.discount_type`) || 'none'
                              const isNone = type === 'none'

                              return (
                                <Input
                                  type={type === 'R$' ? 'text' : 'number'}
                                  disabled={isNone}
                                  placeholder={isNone ? '---' : type === 'R$' ? '0,00' : '0'}
                                  min="0"
                                  max={type === '%' ? '100' : undefined}
                                  step={type === '%' ? '1' : '0.01'}
                                  value={
                                    isNone
                                      ? ''
                                      : type === 'R$'
                                        ? field.value
                                          ? maskCurrency(Math.round(field.value * 100).toString())
                                          : ''
                                        : field.value || ''
                                  }
                                  onChange={(e) => {
                                    let raw = 0
                                    if (type === 'R$') {
                                      const masked = maskCurrency(e.target.value)
                                      raw = parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
                                    } else {
                                      raw = parseFloat(e.target.value) || 0
                                    }

                                    raw = Math.max(0, raw)

                                    const qty = Number(form.getValues(`items.${index}.quantity`)) || 0
                                    const price = Number(form.getValues(`items.${index}.unit_price`)) || 0
                                    const gross = round2(qty * price)

                                    if (type === '%') {
                                      if (raw > 100) raw = 100
                                    } else if (type === 'R$') {
                                      if (raw > gross) raw = gross
                                    }

                                    field.onChange(raw)

                                    let discountMoney = 0
                                    if (type === '%') {
                                      discountMoney = round2(gross * (raw / 100))
                                    } else if (type === 'R$') {
                                      discountMoney = round2(raw)
                                    }

                                    form.setValue(
                                      `items.${index}.subtotal`,
                                      round2(gross - discountMoney),
                                    )
                                  }}
                                  className="h-full border-0 rounded-none focus-visible:ring-0 text-right tabular-nums w-full px-2 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                              )
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top text-right">
                        <div className="h-10 flex flex-col items-end justify-center">
                          <span className="text-[14px] text-slate-800 font-bold tabular-nums">
                            {brl(watchItems[index]?.subtotal || 0)}
                          </span>
                          {Number(watchItems[index]?.discount_value) > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium tabular-nums mt-0.5">
                              {(() => {
                                const qty = Number(watchItems[index]?.quantity) || 0
                                const price = Number(watchItems[index]?.unit_price) || 0
                                const gross = round2(qty * price)
                                const discVal = Number(watchItems[index]?.discount_value) || 0
                                const type = watchItems[index]?.discount_type || 'none'

                                const discountMoney = type === '%'
                                  ? round2(gross * (discVal / 100))
                                  : round2(discVal)

                                return `(- ${brl(discountMoney)})`
                              })()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="pl-2 py-4 align-top text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Botões de ação dos itens — abaixo da lista, à direita */}
          <div className="mt-4 flex items-center justify-end gap-1">
            {/* Botão Catálogo — discreto, sem borda */}
            <Dialog
              open={openCatalogModal}
              onOpenChange={(open) => {
                setOpenCatalogModal(open)
                if (!open) {
                  setCatalogSearch('')
                }
              }}
            >
              <DialogTrigger
                nativeButton={true}
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-md transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    Catálogo
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl shadow-2xl border-slate-200">
                <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-50">
                  <DialogTitle className="text-base font-bold text-slate-800">
                    Adicionar do Catálogo
                  </DialogTitle>
                </DialogHeader>

                <Command shouldFilter={false} className="rounded-none">
                  <CommandInput
                    placeholder="Buscar produto ou serviço..."
                    value={catalogSearch}
                    onValueChange={setCatalogSearch}
                    className="h-12"
                  />
                  <CommandList className="max-h-[400px] p-2 no-scrollbar">
                    <CommandEmpty className="py-12 flex flex-col items-center justify-center text-center px-4">
                      <div className="bg-slate-50 p-3 rounded-full mb-3">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Nenhum item encontrado
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tente buscar por um termo diferente
                      </p>
                    </CommandEmpty>

                    <div className="space-y-1">
                      {filteredCatalog.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => handleAddCatalogItem(item)}
                          className="flex items-center justify-between p-3 cursor-pointer rounded-md data-[selected=true]:bg-slate-100 transition-all border border-transparent data-[selected=true]:border-slate-200"
                        >
                          <div className="flex flex-col min-w-0 flex-1 mr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-900 truncate">
                                {item.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider',
                                  item.type === 'product'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                )}
                              >
                                {item.type === 'product' ? 'PROD' : 'SERV'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-slate-700">
                                {brl(item.unit_price)}
                              </span>
                              {item.unit_measure && (
                                <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                  {item.unit_measure}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-data-[selected=true]:bg-white group-data-[selected=true]:shadow-sm transition-all">
                            <Plus className="h-4 w-4 text-slate-400 group-data-[selected=true]:text-blue-600" />
                          </div>
                        </CommandItem>
                      ))}
                    </div>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddManualItem}
              className="h-9 px-4 border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 gap-2 text-[13px] font-medium"
            >
              <Plus className="h-4 w-4" /> Novo item
            </Button>
          </div>

          {form.formState.errors.items?.root && (
            <div className="pt-4 text-sm text-red-500">
              {form.formState.errors.items.root.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo e Pagamento */}
      <Card className="rounded-[12px] border-slate-200 shadow-sm overflow-hidden bg-white relative">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-[16px] font-bold text-slate-800">
            Resumo e Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6 pt-2">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2 col-span-full">
              <Label className="text-[13px] font-semibold text-slate-700">
                Formas de pagamento disponibilizadas para o cliente
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  'Pix',
                  'Dinheiro',
                  'Cartão de Crédito',
                  'Cartão de Débito',
                  'Boleto Bancário',
                  'Cheque',
                ].map((method) => {
                  const currentMethods = Array.isArray(watchPaymentMethod) ? watchPaymentMethod : []
                  const isSelected = currentMethods.includes(method)
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        let newMethods: string[]
                        if (isSelected) {
                          newMethods = currentMethods.filter((m) => m !== method)
                        } else {
                          newMethods = [...currentMethods, method]
                        }
                        form.setValue('payment_method', newMethods)
                      }}
                      className={cn(
                        "flex items-center justify-center text-center px-3 h-10 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      {method}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end">
            <div className="w-full max-w-[320px] space-y-3">
              <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium border-b border-slate-100/50 pb-2">
                <span>Total de itens</span>
                <span className="tabular-nums text-slate-700">
                  {totalItemsCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums text-slate-700">
                  {brl(subtotalFinal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span>
                    Desconto{' '}
                    {watchDiscountType === '%' && watchDiscountValue > 0
                      ? `(${watchDiscountValue}%)`
                      : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={openDiscountModal}
                    onOpenChange={setOpenDiscountModal}
                  >
                    <DialogTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        />
                      }
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Editar desconto</span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                          Aplicar Desconto
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Tipo</Label>
                          <Select
                            onValueChange={(val) =>
                              form.setValue(
                                'discount_type',
                                val as 'none' | '%' | 'R$',
                              )
                            }
                            value={watchDiscountType}
                          >
                            <SelectTrigger className="w-full border-slate-200 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                              <SelectItem value="%">Porcentagem (%)</SelectItem>
                              <SelectItem value="R$">
                                Valor Fixo (R$)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Valor</Label>
                          <Controller
                            name="discount_value"
                            control={form.control}
                            render={({ field }) => (
                              <Input
                                type={
                                  watchDiscountType === 'R$' ? 'text' : 'number'
                                }
                                step="0.01"
                                placeholder={
                                  watchDiscountType === 'R$' ? '0,00' : '0'
                                }
                                value={
                                  watchDiscountType === 'R$'
                                    ? field.value
                                      ? maskCurrency(
                                        Math.round(
                                          field.value * 100,
                                        ).toString(),
                                      )
                                      : ''
                                    : field.value || ''
                                }
                                onChange={(e) => {
                                  if (watchDiscountType === 'R$') {
                                    const masked = maskCurrency(e.target.value)
                                    field.onChange(
                                      parseFloat(
                                        masked
                                          .replace(/\./g, '')
                                          .replace(',', '.'),
                                      ) || 0,
                                    )
                                  } else {
                                    field.onChange(e.target.value)
                                  }
                                }}
                                className="w-full border-slate-200 rounded-lg"
                                autoFocus={true}
                              />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          className="w-full bg-slate-900 text-white font-bold h-11 rounded-lg mt-2"
                          onClick={() => setOpenDiscountModal(false)}
                        >
                          Confirmar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <span className="tabular-nums text-green-600 text-sm">
                    {watchDiscountValue > 0 ? '-' : ''}
                    {brl(
                      watchDiscountType === 'none'
                        ? 0
                        : watchDiscountType === 'R$'
                          ? Number(watchDiscountValue)
                          : subtotalFinal * (Number(watchDiscountValue) / 100),
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">
                  Total
                </span>
                <span className="text-lg font-black text-blue-900 tabular-nums tracking-tighter">
                  {brl(totalFinal)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="rounded-[12px] border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-[16px] font-bold text-slate-800">
            Termos e condições
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <Textarea
            id="notes"
            {...form.register('notes')}
            className="resize-none text-sm p-4 border-slate-200 rounded-md bg-white min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <Button
          type="button"
          disabled={loading}
          variant="ghost"
          onClick={() => router.back()}
          className="h-11 px-8 rounded-xl font-bold text-slate-500"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={loading || fields.length === 0}
          variant="outline"
          onClick={() => handleSave('draft')}
          className="h-11 px-8 rounded-xl font-bold border-slate-200"
        >
          Salvar Rascunho
        </Button>
        <Button
          type="button"
          disabled={loading || fields.length === 0}
          onClick={() => handleSave('pending')}
          className="h-11 px-8 rounded-xl font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
        >
          {loading
            ? 'Processando...'
            : mode === 'edit'
              ? 'Salvar Alterações'
              : 'Gerar Orçamento'}
        </Button>
      </div>
    </div>
  )
}
