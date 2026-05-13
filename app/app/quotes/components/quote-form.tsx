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
  Search,
  Package,
  Calendar as CalendarIcon,
} from 'lucide-react'
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
  payment_method?: string
  notes?: string | null
  quote_items?: {
    catalog_item_id: string | null
    item_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }[]
}

const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.number(),
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
  payment_method: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z
    .array(quoteItemSchema)
    .min(1, 'Adicione pelo menos um item ao orçamento'),
})

type QuoteValues = z.infer<typeof quoteSchema>

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

export function QuoteForm({
  customers,
  catalogItems,
  initialData,
}: {
  customers: Customer[]
  catalogItems: CatalogItem[]
  initialData?: QuoteWithItems
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Estados dos modais de busca
  const [openCatalogModal, setOpenCatalogModal] = useState(false)
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
      }))
    : []

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
      payment_method: initialData?.payment_method || 'Pix',
      notes: initialData?.notes || '',
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

  const { subtotalFinal, totalFinal } = useMemo(() => {
    const sub = (watchItems || []).reduce((acc, item) => {
      return acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
    }, 0)

    let tot = sub
    const dv = Number(watchDiscountValue) || 0
    if (watchDiscountType === '%') tot -= tot * (dv / 100)
    else if (watchDiscountType === 'R$') tot -= dv

    return {
      subtotalFinal: sub,
      totalFinal: Math.max(0, tot),
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
    })
  }

  async function handleSave(
    status: 'draft' | 'open' | 'accepted' | 'rejected' | 'expired',
  ) {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error(
        'Por favor, preencha todos os campos obrigatórios corretamente.',
      )
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

    setLoading(true)
    const result = await saveQuote({
      ...data,
      discount_type: dbDiscountType,
      id: initialData?.id,
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
            <div className="md:col-span-1 space-y-2">
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
                    <th className="pr-2 pb-3 w-[45%]">Item</th>
                    <th className="px-2 pb-3 text-center w-[12%]">Qtd</th>
                    <th className="px-2 pb-3 text-center w-[20%]">
                      Preço (R$)
                    </th>
                    <th className="px-2 pb-3 text-right w-[18%]">Total</th>
                    <th className="w-[5%] pb-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group">
                      <td className="pr-2 py-4 align-top">
                        <div className="relative">
                          <Input
                            {...form.register(
                              `items.${index}.item_name` as const,
                            )}
                            placeholder="Descrição"
                            className={`h-10 text-sm border-slate-200 rounded-lg ${form.formState.errors.items?.[index]?.item_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                        <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
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
                                  form.setValue(
                                    `items.${index}.subtotal`,
                                    qty * price,
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
                        <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
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
                                  form.setValue(
                                    `items.${index}.subtotal`,
                                    qty * raw,
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
                      <td className="px-2 py-4 align-top text-right">
                        <div className="h-10 flex items-center justify-end text-[14px] text-slate-800 font-bold tabular-nums">
                          {brl(
                            (Number(watchItems[index]?.quantity) || 0) *
                              (Number(watchItems[index]?.unit_price) || 0),
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
                  <button
                    type="button"
                    className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-indigo-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    Catálogo
                  </button>
                }
              />
              <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl shadow-xl">
                <DialogHeader className="px-5 pt-5 pb-0">
                  <DialogTitle className="text-base font-semibold text-slate-900">
                    Adicionar do Catálogo
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      autoFocus
                      placeholder="Buscar produto ou serviço..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="max-h-[380px] overflow-y-auto border-t border-slate-100">
                  {filteredCatalog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <p className="text-sm">Nenhum item encontrado.</p>
                      <p className="text-xs mt-1">
                        Tente buscar por outro nome.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredCatalog.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddCatalogItem(item)}
                          className="flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors text-left border-b border-slate-50 last:border-0 hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-slate-500">
                                {item.type === 'product'
                                  ? 'Produto'
                                  : 'Serviço'}
                              </span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">
                                Valor base:{' '}
                                <strong className="text-slate-700">
                                  {brl(item.unit_price)}
                                </strong>
                              </span>
                              {item.unit_measure && (
                                <span className="text-xs text-slate-500">
                                  • {item.unit_measure}
                                </span>
                              )}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 shrink-0 text-slate-400 ml-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddManualItem}
              className="h-9 px-4 border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 gap-2 text-[13px] font-medium"
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
            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-slate-700">
                Desc. geral
              </Label>
              <div className="flex items-center gap-3">
                <Select
                  onValueChange={(val) =>
                    form.setValue('discount_type', val as 'none' | '%' | 'R$')
                  }
                  value={watchDiscountType}
                >
                  <SelectTrigger className="h-10 w-[120px] border-slate-200 rounded-lg bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    side="bottom"
                    sideOffset={4}
                    className="rounded-xl border-slate-200"
                  >
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="R$">R$</SelectItem>
                  </SelectContent>
                </Select>
                <Controller
                  name="discount_value"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      type={watchDiscountType === 'R$' ? 'text' : 'number'}
                      step="0.01"
                      placeholder={watchDiscountType === 'R$' ? '0,00' : '0'}
                      value={
                        watchDiscountType === 'R$'
                          ? field.value
                            ? maskCurrency(
                                Math.round(field.value * 100).toString(),
                              )
                            : ''
                          : field.value || ''
                      }
                      onChange={(e) => {
                        if (watchDiscountType === 'R$') {
                          const masked = maskCurrency(e.target.value)
                          field.onChange(
                            parseFloat(
                              masked.replace(/\./g, '').replace(',', '.'),
                            ) || 0,
                          )
                        } else {
                          field.onChange(e.target.value)
                        }
                      }}
                      disabled={watchDiscountType === 'none'}
                      className="h-10 border-slate-200 rounded-lg bg-white flex-1 text-slate-700 disabled:opacity-50"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-semibold text-slate-700">
                Forma de pagamento
              </Label>
              <Select
                onValueChange={(val) =>
                  form.setValue('payment_method', val as string)
                }
                value={watchPaymentMethod}
              >
                <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent
                  alignItemWithTrigger={false}
                  side="bottom"
                  sideOffset={4}
                  className="rounded-xl border-slate-200"
                >
                  {[
                    'Pix',
                    'Dinheiro',
                    'Cartão de Crédito',
                    'Cartão de Débito',
                    'Boleto Bancário',
                    'Cheque',
                  ].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end">
            <div className="w-full max-w-[320px] space-y-3">
              <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums text-slate-700">
                  {brl(subtotalFinal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                <span>
                  Desconto{' '}
                  {watchDiscountType === '%' && watchDiscountValue > 0
                    ? `(${watchDiscountValue}%)`
                    : ''}
                </span>
                <span className="tabular-nums text-green-600">
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
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <Textarea
            id="notes"
            {...form.register('notes')}
            className="resize-none text-sm p-4 border-slate-200 rounded-lg bg-white min-h-[100px]"
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
          onClick={() => handleSave('open')}
          className="h-11 px-8 rounded-xl font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
        >
          {loading ? 'Gerando...' : 'Gerar Orçamento'}
        </Button>
      </div>
    </div>
  )
}
