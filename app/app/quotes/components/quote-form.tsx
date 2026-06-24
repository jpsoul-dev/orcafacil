'use client'

import { useState, useMemo, useEffect } from 'react'
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
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Drawer } from 'vaul'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/ui/form-error'
import { DatePicker } from '@/components/ui/date-picker'
import { QuantityInput } from '@/components/ui/quantity-input'
import { DiscountInput } from '@/components/ui/discount-input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Trash2,
  Plus,
  Package,
  Search,
  Edit2,
  HelpCircle,
  QrCode,
  Banknote,
  CreditCard,
  Wallet,
  Barcode,
  FileSignature,
  ChevronLeft,
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

import type { Customer } from '@/lib/services/customer-service'
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
  item_name: z.string().min(1, 'Descrição do item obrigatória'),
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

const paymentMethodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Pix': QrCode,
  'Dinheiro': Banknote,
  'Cartão de Crédito': CreditCard,
  'Cartão de Débito': Wallet,
  'Boleto Bancário': Barcode,
  'Cheque': FileSignature,
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
  const isMobile = useMediaQuery('(max-width: 640px)')
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

  // Limita o desconto global se o subtotal final diminuir para menos do que o desconto aplicado
  useEffect(() => {
    const discType = form.getValues('discount_type')
    const discVal = Number(form.getValues('discount_value')) || 0
    if (discType === 'R$' && discVal > subtotalFinal) {
      form.setValue('discount_value', subtotalFinal)
    } else if (discType === '%' && discVal > 100) {
      form.setValue('discount_value', 100)
    }
  }, [subtotalFinal, form])

  const handleRecalculate = (
    index: number,
    currentQty?: number,
    currentPrice?: number,
    currentDiscType?: 'none' | '%' | 'R$',
    currentDiscVal?: number
  ) => {
    const qty = currentQty !== undefined ? currentQty : (Number(form.getValues(`items.${index}.quantity`)) || 0)
    const price = currentPrice !== undefined ? currentPrice : (Number(form.getValues(`items.${index}.unit_price`)) || 0)
    const type = currentDiscType !== undefined ? currentDiscType : (form.getValues(`items.${index}.discount_type`) || 'none')
    let discVal = currentDiscVal !== undefined ? currentDiscVal : (Number(form.getValues(`items.${index}.discount_value`)) || 0)

    const gross = round2(qty * price)

    if (type === 'R$' && discVal > gross) {
      form.setValue(`items.${index}.discount_value`, gross)
      discVal = gross
    }

    let discountMoney = 0
    if (type === '%') {
      if (discVal > 100) {
        form.setValue(`items.${index}.discount_value`, 100)
        discVal = 100
      }
      discountMoney = round2(gross * (discVal / 100))
    } else if (type === 'R$') {
      discountMoney = round2(discVal)
    }

    form.setValue(`items.${index}.subtotal`, round2(gross - discountMoney))
  }

  // Função auxiliar para disparar vibrações com segurança (trata erros e navegadores sem suporte)
  const triggerVibration = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch (e) {
        // Ignora silenciosamente falhas de permissão ou suporte
      }
    }
  }

  const debouncedCatalogSearch = useDebounce(catalogSearch, 300)

  const handleAddCatalogItem = (item: CatalogItem) => {
    if (!item) return
    triggerVibration(15) // vibração leve ao adicionar do catálogo
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
    triggerVibration(15) // vibração leve ao adicionar manualmente
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
    if (loading) return
    const isValid = await form.trigger()
    if (!isValid) {
      triggerVibration([30, 80, 30]) // vibração dupla para erro de validação
      toast.error('Preencha todos os campos obrigatórios corretamente.')
      return
    }

    triggerVibration(40) // vibração curta de sucesso ao submeter
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

  const catalogContent = (
    <Command shouldFilter={false} className="rounded-none">
      <CommandInput
        placeholder="Buscar produto ou serviço..."
        value={catalogSearch}
        onValueChange={setCatalogSearch}
        className="h-12"
      />
      <CommandList className="max-h-[400px] p-2 no-scrollbar">
        <CommandEmpty className="py-12 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-muted p-3 rounded-full mb-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-ds-body-md font-semibold text-foreground">
            Nenhum item encontrado
          </p>
          <p className="text-ds-body-sm text-muted-foreground mt-1">
            Tente buscar por um termo diferente
          </p>
        </CommandEmpty>

        <div className="space-y-1">
          {filteredCatalog.map((item) => (
            <CommandItem
              key={item.id}
              value={item.id}
              onSelect={() => handleAddCatalogItem(item)}
              className="flex items-center justify-between p-3 cursor-pointer rounded-md data-[selected=true]:bg-muted transition-all duration-ds-fast border border-transparent data-[selected=true]:border-border"
            >
              <div className="flex flex-col min-w-0 flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-ds-body-md font-semibold text-foreground truncate">
                    {item.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider rounded-sm',
                      item.type === 'product'
                        ? 'bg-blue-50/10 text-blue-600 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50'
                        : 'bg-muted text-muted-foreground border-border',
                    )}
                  >
                    {item.type === 'product' ? 'PROD' : 'SERV'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ds-body-md font-bold text-foreground">
                    {brl(item.unit_price)}
                  </span>
                  {item.unit_measure && (
                    <span className="text-ds-caption text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-sm border border-border">
                      {item.unit_measure}
                    </span>
                  )}
                </div>
              </div>
            </CommandItem>
          ))}
        </div>
      </CommandList>
    </Command>
  )

  const catalogTrigger = (
    <Button
      type="button"
      variant="ghost"
      className="flex items-center gap-1.5 h-11 md:h-9 px-3 text-ds-body-sm font-semibold text-primary hover:text-primary-hover hover:bg-primary/5 dark:hover:bg-primary/10 rounded-sm transition-all duration-ds-fast cursor-pointer"
    >
      <Package className="h-4 w-4" />
      Catálogo
    </Button>
  )

  const catalogSelector = isMobile ? (
    <Drawer.Root
      open={openCatalogModal}
      onOpenChange={(open) => {
        setOpenCatalogModal(open)
        if (!open) setCatalogSearch('')
      }}
    >
      <Drawer.Trigger asChild>
        {catalogTrigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-card border-t border-border flex flex-col rounded-t-[10px] max-h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-3" />
          <div className="px-5 pb-3">
            <Drawer.Title className="text-ds-heading-xs font-bold text-foreground">
              Adicionar do Catálogo
            </Drawer.Title>
          </div>
          <div className="flex-1 overflow-y-auto pb-6">
            {catalogContent}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ) : (
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
        render={catalogTrigger}
      />
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-lg shadow-lg border-border bg-card">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <DialogTitle className="text-ds-heading-xs font-bold text-foreground">
            Adicionar do Catálogo
          </DialogTitle>
        </DialogHeader>
        {catalogContent}
      </DialogContent>
    </Dialog>
  )

  const pageTitle = mode === 'edit' ? 'Editar Orçamento' : mode === 'clone' ? 'Clonar Orçamento' : 'Novo Orçamento'

  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-ds-normal hide-global-header-mobile">
      {/* Header Mobile Nativo (AppBar) */}
      <div className="sm:hidden flex items-center justify-between h-14 bg-card border-b border-border sticky top-0 z-40 px-4 -mx-4 -mt-4 mb-4 backdrop-blur-md bg-card/90">
        <button
          type="button"
          onClick={() => {
            triggerVibration(15)
            router.back()
          }}
          className="flex items-center justify-center h-11 w-11 -ml-2 text-foreground active:opacity-60 cursor-pointer rounded-full"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-ds-body-md font-bold text-foreground">
          {pageTitle}
        </h1>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSave('pending')}
          className="text-ds-body-sm font-bold text-primary active:opacity-60 cursor-pointer disabled:opacity-40"
        >
          {loading ? '...' : mode === 'edit' ? 'Salvar' : 'Gerar'}
        </button>
      </div>

      <Card className="rounded-md border-border shadow-sm overflow-hidden bg-card">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 pt-4 md:pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label
                htmlFor="title"
                className="text-ds-body-sm font-semibold text-foreground"
              >
                Título do orçamento
                <span className="text-muted-foreground text-ds-caption ml-1">(opcional)</span>
              </Label>
              <Input
                id="title"
                {...form.register('title')}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="valid_until"
                className="text-ds-body-sm font-semibold text-foreground"
              >
                Validade
              </Label>
              <Controller
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <DatePicker
                    id="valid_until"
                    value={field.value}
                    onChange={field.onChange}
                    minDate={new Date()}
                    error={!!form.formState.errors.valid_until}
                  />
                )}
              />
              <FormError message={form.formState.errors.valid_until?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-full space-y-2">
              <Label className="text-ds-body-sm font-semibold text-foreground mb-2">
                Cliente <span className="text-muted-foreground text-ds-caption ml-0.5">(obrigatório)</span>
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
      <div className="rounded-md sm:border sm:border-border sm:shadow-sm overflow-hidden sm:bg-card">
        <div className="p-0 sm:p-6 sm:pb-2 max-sm:py-2">
          <h3 className="text-ds-body-sm font-bold text-foreground uppercase tracking-wider max-sm:text-muted-foreground/80 max-sm:text-[11px]">
            Itens do Pedido
          </h3>
        </div>
        <div className="p-0 sm:p-6 sm:pt-2">
          {/* Empty state ou tabela de itens */}
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-md text-muted-foreground bg-card">
              <Package className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-ds-body-sm font-medium">Nenhum item adicionado</p>
              <p className="text-xs mt-1">
                Use <span className="font-semibold">Catálogo</span> para buscar
                um produto ou <span className="font-semibold">Novo item</span>{' '}
                para incluir manualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="p-4 md:p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-neutral-900 shadow-sm relative space-y-4 md:space-y-6 max-sm:p-3 max-sm:space-y-3 animate-in fade-in duration-ds-fast"
                  >
                    {/* Cabeçalho do Card do Item */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold font-sans">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                          Item do Orçamento
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-input rounded-sm transition-colors duration-ds-fast cursor-pointer"
                        onClick={() => {
                          triggerVibration(15)
                          remove(index)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Corpo do Card com 2 linhas principais de campos */}
                    <div className="space-y-4">
                      {/* Linha 1: Descrição + Quantidade */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Descrição do Item */}
                        <div className="space-y-2 md:col-span-8 col-span-1">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                            Descrição <span className="ml-1 font-normal">{'(obrigatório)'}</span>
                          </Label>
                          <Input
                            {...form.register(`items.${index}.item_name` as const)}
                            aria-invalid={!!form.formState.errors.items?.[index]?.item_name}
                          />
                          <FormError message={form.formState.errors.items?.[index]?.item_name?.message} />
                        </div>

                        {/* Quantidade */}
                        <div className="space-y-2 md:col-span-4 col-span-1">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                            Quantidade
                          </Label>
                          <Controller
                            name={`items.${index}.quantity` as const}
                            control={form.control}
                            render={({ field }) => (
                              <QuantityInput
                                value={field.value}
                                onChange={(val) => {
                                  field.onChange(val)
                                  handleRecalculate(index, val)
                                }}
                                min={1}
                                max={999}
                              />
                            )}
                          />
                        </div>
                      </div>

                      {/* Linha 2: Preço Unitário + Desconto + Total */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Preço Unitário */}
                        <div className="space-y-2 md:col-span-5 col-span-1">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                            Preço Unitário <span className="ml-1 font-normal uppercase">{'(r$)'}</span>
                          </Label>
                          <div className="flex h-10 border border-input rounded-sm overflow-hidden bg-card transition-[border-color,box-shadow] duration-ds-fast focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 outline-none">
                            <Controller
                              name={`items.${index}.unit_price` as const}
                              control={form.control}
                              render={({ field }) => (
                                <Input
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
                                  className="h-full border-0 rounded-none focus-visible:ring-0 text-right bg-card text-base sm:text-ds-body-md tabular-nums w-full px-2"
                                />
                              )}
                            />
                          </div>
                        </div>

                        {/* Desconto */}
                        <div className="space-y-2 md:col-span-5 col-span-1">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                              Desconto
                            </Label>
                            <Popover>
                              <PopoverTrigger
                                render={
                                  <button
                                    type="button"
                                    className="text-slate-500 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 cursor-pointer rounded-full outline-none focus:ring-1 focus:ring-ring shrink-0 flex items-center justify-center p-2"
                                  />
                                }
                              >
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Ajuda desconto</span>
                              </PopoverTrigger>
                              <PopoverContent className="w-60 p-3 bg-card border-border rounded-md shadow-md text-xs text-muted-foreground">
                                Você pode aplicar um desconto percentual (%) ou valor fixo em reais (R$) para cada item individualmente.
                              </PopoverContent>
                            </Popover>
                          </div>

                          <Controller
                            name={`items.${index}.discount_type` as const}
                            control={form.control}
                            render={({ field: typeField }) => {
                              const discountValue = form.watch(`items.${index}.discount_value`) || 0

                              return (
                                <DiscountInput
                                  type={typeField.value || 'none'}
                                  value={discountValue}
                                  onChange={(newType, newVal) => {
                                    typeField.onChange(newType)
                                    form.setValue(`items.${index}.discount_value`, newVal)
                                    handleRecalculate(index, undefined, undefined, newType, newVal)
                                  }}
                                />
                              )
                            }}
                          />
                        </div>

                        {/* Total (R$) */}
                        <div className="space-y-2 md:col-span-2 col-span-1">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
                            Total <span className="ml-1 font-normal uppercase">(r$)</span>
                          </Label>
                          <Input
                            type="text"
                            disabled
                            value={brl(watchItems[index]?.subtotal || 0)}
                            className="h-10 text-right bg-muted/40 font-semibold text-foreground dark:text-foreground tabular-nums border-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Botões de ação dos itens — abaixo da lista, à direita */}
          <div className="mt-4 flex items-center justify-end gap-1">
            {/* Botão Catálogo — discreto, sem borda */}
            {catalogSelector}
 
            <Button
              type="button"
              variant="outline"
              onClick={handleAddManualItem}
              className="h-11 md:h-9 px-4 border-border rounded-md text-foreground hover:bg-muted gap-2 text-ds-body-sm font-semibold transition-all duration-ds-fast cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Novo item
            </Button>
          </div>

          {form.formState.errors.items?.root && (
            <div className="pt-4 text-ds-body-sm text-destructive">
              {form.formState.errors.items.root.message}
            </div>
          )}
        </div>
      </div>

      {/* Resumo e Pagamento */}
      <div className="rounded-md sm:border sm:border-border sm:shadow-sm overflow-hidden sm:bg-card relative">
        <div className="p-0 sm:p-6 sm:pb-2 max-sm:py-2">
          <h3 className="text-ds-body-sm font-bold text-foreground uppercase tracking-wider max-sm:text-muted-foreground/80 max-sm:text-[11px]">
            Resumo e Pagamento
          </h3>
        </div>
        <div className="p-0 sm:p-6 sm:pt-2">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2 col-span-full">
              <Label className="text-ds-body-sm font-semibold text-foreground">
                Formas de pagamento disponibilizadas
              </Label>
              <div className="flex flex-wrap gap-2.5">
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
                  const Icon = paymentMethodIcons[method] || CreditCard

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
                        "flex items-center gap-2 px-4 h-10 text-ds-body-sm font-semibold rounded-sm border transition-all cursor-pointer select-none",
                        isSelected
                          ? "bg-primary/10 border-primary text-primary shadow-xs"
                          : "bg-card border-border text-muted-foreground hover:bg-muted/50 hover:border-border/80"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{method}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col items-end">
            <div className="w-full max-w-[320px] space-y-3">
              <div className="flex justify-between items-center text-ds-body-sm text-muted-foreground font-medium border-b border-border/50 pb-2">
                <span>Total de itens</span>
                <span className="tabular-nums text-foreground">
                  {totalItemsCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-ds-body-sm text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums text-foreground">
                  {brl(subtotalFinal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-ds-body-sm text-muted-foreground font-medium">
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
                          className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-all duration-ds-fast cursor-pointer"
                        />
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Editar desconto</span>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] rounded-lg bg-card border-border shadow-lg p-6">
                      <DialogHeader>
                        <DialogTitle className="text-ds-heading-sm font-bold text-foreground">
                          Aplicar Desconto
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-ds-body-sm font-semibold text-foreground">Desconto</Label>
                          <Controller
                            name="discount_type"
                            control={form.control}
                            render={({ field: typeField }) => {
                              const discountValue = form.watch("discount_value") || 0

                              return (
                                <DiscountInput
                                  type={typeField.value || 'none'}
                                  value={discountValue}
                                  onChange={(newType, newVal) => {
                                    let adjustedVal = newVal
                                    if (newType === '%') {
                                      adjustedVal = Math.min(100, newVal)
                                    } else if (newType === 'R$') {
                                      adjustedVal = Math.min(subtotalFinal, newVal)
                                    }
                                    typeField.onChange(newType)
                                    form.setValue("discount_value", adjustedVal)
                                  }}
                                />
                              )
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-sm mt-2 transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
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
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-ds-body-sm font-bold text-foreground uppercase tracking-tight">
                  Total
                </span>
                <span className="text-ds-heading-md font-bold text-primary tabular-nums tracking-tighter">
                  {brl(totalFinal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      <Card className="rounded-md border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-ds-heading-xs font-bold text-foreground">
            Termos e condições
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2">
          <Textarea
            id="notes"
            {...form.register('notes')}
            className="resize-none min-h-25"
          />
        </CardContent>
      </Card>

      <div className="flex flex-row items-center justify-end gap-3 pt-6 border-t border-border w-full max-sm:py-4">
        <Button
          type="button"
          disabled={loading}
          variant="ghost"
          onClick={() => router.back()}
          className="h-10 px-6 w-full sm:w-auto font-semibold text-muted-foreground transition-all duration-ds-fast cursor-pointer max-sm:hidden"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={loading}
          variant="outline"
          onClick={() => handleSave('draft')}
          className="h-10 px-6 w-full sm:w-auto font-semibold transition-all duration-ds-fast cursor-pointer"
        >
          Salvar Rascunho
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={() => handleSave('pending')}
          className="h-10 px-6 w-full sm:w-auto font-semibold bg-primary text-primary-foreground transition-all duration-ds-fast cursor-pointer shadow-sm max-sm:hidden"
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
