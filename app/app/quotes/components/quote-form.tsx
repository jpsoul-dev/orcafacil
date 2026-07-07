'use client'

import { useSubscription } from '@/components/subscription-provider'
import { maskCurrency } from '@/lib/masks'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Controller,
  Resolver,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { saveQuote } from '../actions'

import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { DiscountInput } from '@/components/ui/discount-input'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuantityInput } from '@/components/ui/quantity-input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  Sheet,
  SheetCloseButton,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Banknote,
  Barcode,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit2,
  FileSignature,
  Package,
  Plus,
  QrCode,
  Wallet,
} from 'lucide-react'

import type { Customer } from '@/lib/services/customer-service'
import type { CatalogItem } from '../../catalog/catalog-form'
import { CatalogForm } from '../../catalog/catalog-form'
import { CustomerSelector } from './customer-selector'
import { QuoteItemRow } from './quote-item-row'

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
  }[]
}

const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().trim().min(1, 'Descrição do item obrigatória').max(255, 'Descrição muito longa'),
  quantity: z.coerce.number().min(0.01, 'Quantidade mínima é 0.01').max(999999, 'Quantidade muito alta'),
  unit_price: z.coerce.number().min(0).max(99999999.99, 'Valor muito alto'),
  subtotal: z.number(),
})

const quoteSchema = z.object({
  title: z.string().trim().max(100, 'Título muito longo').optional().nullable(),
  customer_id: z.string().min(1, 'Selecione um cliente'),
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido')
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
  discount_value: z.coerce.number().min(0).max(99999999.99, 'Desconto muito alto'),
  payment_method: z.array(z.string()).optional().nullable(),
  notes: z.string().trim().max(5000, 'Anotação muito longa').optional().nullable(),
  show_quote_number: z.boolean().optional().default(true),
  items: z
    .array(quoteItemSchema)
    .min(1, 'Adicione pelo menos um item ao orçamento')
    .max(200, 'Limite de 200 itens por orçamento atingido'),
})

export type QuoteValues = z.infer<typeof quoteSchema>

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

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

const availablePaymentMethods = [
  'Pix',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto Bancário',
  'Cheque',
]

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
  const { isExpired, openUpgradeModal } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [successStatus, setSuccessStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'expired' | null>(null)

  // Estados de Seções Colapsáveis
  const [isDataExpanded, setIsDataExpanded] = useState(true)
  const [isItemsExpanded, setIsItemsExpanded] = useState(true)
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false)
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)

  // Estados dos Sheets Laterais
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isDiscountOpen, setIsDiscountOpen] = useState(false)

  // Estados locais para busca e seleção múltipla no catálogo de itens
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Estados locais para adição de item manual no Drawer
  const [manualName, setManualName] = useState('')
  const [manualQty, setManualQty] = useState(1)
  const [manualPrice, setManualPrice] = useState(0)

  useEffect(() => {
    if (isExpired) {
      openUpgradeModal()
      router.push('/app/quotes')
    }
  }, [isExpired, openUpgradeModal, router])

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

  const defaultPaymentMethods = (() => {
    if (!initialData?.payment_method) return []
    if (Array.isArray(initialData.payment_method)) return initialData.payment_method
    if (typeof initialData.payment_method === 'string') {
      return (initialData.payment_method as string).split(',').map((m) => m.trim()).filter(Boolean)
    }
    return []
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
  const watchDiscountType = useWatch({ control: form.control, name: 'discount_type' })
  const watchDiscountValue = useWatch({ control: form.control, name: 'discount_value' })
  const watchPaymentMethod = useWatch({ control: form.control, name: 'payment_method' })
  const watchNotes = useWatch({ control: form.control, name: 'notes' })

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

  // Limita o desconto global se o subtotal diminuir
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
    currentPrice?: number
  ) => {
    const qty = currentQty !== undefined ? currentQty : (Number(form.getValues(`items.${index}.quantity`)) || 0)
    const price = currentPrice !== undefined ? currentPrice : (Number(form.getValues(`items.${index}.unit_price`)) || 0)
    form.setValue(`items.${index}.subtotal`, round2(qty * price))
  }

  const triggerVibration = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch (e) {
        // Ignora silenciosamente
      }
    }
  }

  // Manipulação de adição de múltiplos itens do Catálogo
  const handleConfirmCatalogSelection = () => {
    triggerVibration(20)
    if (selectedCatalogIds.length === 0) {
      toast.error('Nenhum item selecionado do catálogo.')
      return
    }

    selectedCatalogIds.forEach((id) => {
      const item = catalogItems.find((i) => i.id === id)
      if (item) {
        append({
          catalog_item_id: item.id,
          item_name: item.name,
          quantity: 1,
          unit_price: item.unit_price,
          subtotal: item.unit_price,
        })
      }
    })

    toast.success(`${selectedCatalogIds.length} itens adicionados com sucesso!`)
    setSelectedCatalogIds([])
    setSearchTerm('')
    setIsAddItemOpen(false)
  }

  // Adição de Item Manual
  const handleAddManualItem = () => {
    triggerVibration(20)
    if (!manualName.trim()) {
      toast.error('Preencha a descrição do item manual')
      return
    }

    append({
      catalog_item_id: null,
      item_name: manualName.trim(),
      quantity: manualQty,
      unit_price: manualPrice,
      subtotal: round2(manualQty * manualPrice),
    })

    toast.success('Item manual adicionado!')
    setManualName('')
    setManualQty(1)
    setManualPrice(0)
    setIsAddItemOpen(false)
  }

  async function handleSave(
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'expired',
  ) {
    if (loading) return
    const isValid = await form.trigger()
    if (!isValid) {
      triggerVibration([30, 80, 30])
      toast.error('Por favor, corrija os erros de validação no formulário.')
      // Expande as seções com erro para guiar o usuário
      if (form.formState.errors.customer_id || form.formState.errors.valid_until || form.formState.errors.title) {
        setIsDataExpanded(true)
      }
      if (form.formState.errors.items) {
        setIsItemsExpanded(true)
      }
      return
    }

    triggerVibration(40)
    const data = form.getValues()

    const dbDiscountType =
      data.discount_type === '%'
        ? 'percentage'
        : data.discount_type === 'R$'
          ? 'fixed'
          : 'none'

    setLoading(true)
    const result = await saveQuote({
      ...data,
      items: data.items,
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
      setSuccessStatus(status)
      triggerVibration(50)
      setTimeout(() => {
        if (status === 'draft') {
          router.push('/app/quotes')
        } else {
          router.push(`/app/quotes/${result.id}`)
        }
      }, 600)
    }
  }

  // Métodos de catálogo filtrados
  const filteredCatalogItems = useMemo(() => {
    if (!searchTerm.trim()) return catalogItems
    return catalogItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, catalogItems])

  const toggleCatalogSelection = (id: string) => {
    setSelectedCatalogIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const pageTitle = mode === 'edit' ? 'Editar Orçamento' : mode === 'clone' ? 'Clonar Orçamento' : 'Novo Orçamento'

  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-ds-normal pb-44 md:pb-28 hide-global-header-mobile">
      {/* Header Mobile Nativo (AppBar) */}
      <div className="sm:hidden flex items-center justify-between h-14 bg-card border-b border-border sticky top-0 z-40 px-4 -mx-4 -mt-4 mb-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            triggerVibration(15)
            router.back()
          }}
          className="flex items-center justify-center h-11 w-11 -ml-2 text-foreground active:opacity-60 cursor-pointer rounded-full"
          aria-label="Voltar"
        >
          <ChevronDown className="h-6 w-6 rotate-90" />
        </button>
        <h1 className="text-ds-body-md font-bold text-foreground font-display">
          {pageTitle}
        </h1>
        <button
          type="button"
          disabled={loading || successStatus !== null}
          onClick={() => handleSave('pending')}
          className={cn("text-ds-body-sm font-bold active:opacity-60 cursor-pointer disabled:opacity-40 transition-colors duration-ds-fast flex items-center justify-center",
            successStatus === 'pending' ? "text-success" : "text-primary"
          )}
        >
          {loading ? '...' : successStatus === 'pending' ? <Check className="h-5 w-5" /> : mode === 'edit' ? 'Salvar' : 'Gerar'}
        </button>
      </div>

      {/* Header Desktop */}
      <div className="hidden sm:flex items-center gap-4 py-4 mb-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Layout de Duas Colunas (Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Coluna Esquerda: Formulário (2/3) */}
        <div className="md:col-span-2 space-y-4 md:space-y-5">
          {/* Seção 1: Dados do Orçamento */}
          <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-lg border-x-0 sm:border-x gap-4 py-0">
            <CardHeader
              className="flex flex-row items-center justify-between p-4 md:px-6 md:py-4 cursor-pointer select-none"
              onClick={() => {
                triggerVibration(10)
                setIsDataExpanded((prev) => !prev)
              }}
            >
              <CardTitle className="text-ds-heading-sm font-bold text-foreground">
                Dados do Orçamento
              </CardTitle>
              <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                {isDataExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CardHeader>
            {isDataExpanded && (
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4 animate-in fade-in duration-ds-fast">
                {/* 1. Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="customer_id" error={!!form.formState.errors.customer_id}>
                    Cliente
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 2. Validade */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="valid_until" className="h-5" error={!!form.formState.errors.valid_until}>
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

                  {/* 3. Título */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title" optional className="h-5" error={!!form.formState.errors.title}>
                      Título do Orçamento
                    </Label>
                    <Input id="title" {...form.register('title')} placeholder="Ex: Projeto Reforma de Banheiro" />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Seção 2: Itens do Orçamento */}
          <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-lg border-x-0 sm:border-x gap-4 py-0">
            <CardHeader
              className="flex flex-row items-center justify-between p-4 md:px-6 md:py-4 cursor-pointer select-none"
              onClick={() => {
                triggerVibration(10)
                setIsItemsExpanded((prev) => !prev)
              }}
            >
              <CardTitle className="text-ds-heading-sm font-bold text-foreground">
                Itens do Orçamento
              </CardTitle>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddItemOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus /> Adicionar Item
                </Button>
                <Button variant="ghost" size="icon-sm" className="cursor-pointer" onClick={() => setIsItemsExpanded((prev) => !prev)}>
                  {isItemsExpanded ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>
            </CardHeader>
            {isItemsExpanded && (
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4 animate-in fade-in duration-ds-fast">
                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-md text-muted-foreground bg-card/50">
                    <Package className="h-8 w-8 mb-2 opacity-40 text-muted-foreground" />
                    <p className="text-ds-body-sm font-semibold">Nenhum item adicionado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Cabeçalho Fixo da Lista em Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-1.5 text-xs font-bold text-muted-foreground border-b border-border">
                      <div className="col-span-5">Descrição do Item</div>
                      <div className="col-span-2 text-right">Qtd.</div>
                      <div className="col-span-2 text-right">Valor Unitário</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-2.5">
                      {fields.map((field, index) => (
                        <QuoteItemRow
                          key={field.id}
                          index={index}
                          register={form.register}
                          control={form.control}
                          remove={remove}
                          errors={form.formState.errors}
                          watchItem={watchItems[index]}
                          handleRecalculate={handleRecalculate}
                          triggerVibration={triggerVibration}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {form.formState.errors.items?.root && (
                  <div className="pt-2 text-ds-body-sm text-destructive font-medium">
                    {form.formState.errors.items.root.message}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Seção 3: Formas de Pagamento */}
          <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-lg border-x-0 sm:border-x gap-4 py-0">
            <CardHeader
              className="flex flex-row items-center justify-between p-4 md:px-6 md:py-4 cursor-pointer select-none"
              onClick={() => {
                triggerVibration(10)
                setIsPaymentExpanded((prev) => !prev)
              }}
            >
              <CardTitle className="text-ds-heading-sm font-bold text-foreground">
                Formas de Pagamento
              </CardTitle>
              <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                {isPaymentExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CardHeader>
            {isPaymentExpanded && (
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4 animate-in fade-in duration-ds-fast">
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaymentOpen(true)}
                    className="cursor-pointer"
                  >
                    <Edit2 /> Selecionar Formas
                  </Button>

                  {/* Chips das Formas de Pagamento Selecionadas */}
                  {(!watchPaymentMethod || watchPaymentMethod.length === 0) ? (
                    <span className="text-xs text-muted-foreground italic ml-2">Nenhuma forma selecionada</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 ml-2">
                      {watchPaymentMethod.map((method) => {
                        const Icon = paymentMethodIcons[method] || CreditCard
                        return (
                          <div
                            key={method}
                            className="flex items-center gap-1.5 bg-muted text-foreground border border-border rounded-full px-3 py-1 text-xs font-semibold"
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{method}</span>
                            <button
                              type="button"
                              onClick={() => {
                                triggerVibration(15)
                                form.setValue(
                                  'payment_method',
                                  watchPaymentMethod.filter((m) => m !== method)
                                )
                              }}
                              className="text-muted-foreground hover:text-destructive ml-1 cursor-pointer"
                              aria-label={`Remover ${method}`}
                            >
                              &times;
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Seção 4: Termos e Condições */}
          <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-lg border-x-0 sm:border-x gap-4 py-0">
            <CardHeader
              className="flex flex-row items-center justify-between p-4 md:px-6 md:py-4 cursor-pointer select-none"
              onClick={() => {
                triggerVibration(10)
                setIsNotesExpanded((prev) => !prev)
              }}
            >
              <CardTitle className="text-ds-heading-sm font-bold text-foreground">
                Termos e Condições
              </CardTitle>
              <Button variant="ghost" size="icon-sm" className="cursor-pointer">
                {isNotesExpanded ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CardHeader>
            {isNotesExpanded && (
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4 animate-in fade-in duration-ds-fast">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNotesOpen(true)}
                  className="cursor-pointer"
                >
                  <Edit2 /> Editar Termos e Condições
                </Button>

                {watchNotes ? (
                  <div
                    className="border border-border bg-muted/20 rounded-md p-4 max-h-48 overflow-y-auto text-xs text-muted-foreground prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: watchNotes }}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground italic">Nenhum termo ou condição inserido.</div>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Coluna Direita: Resumo Financeiro Fixo no Desktop (1/3) */}
        <div className="hidden md:block md:col-span-1 sticky top-24 self-start">
          <Card className="border border-border shadow-sm bg-card rounded-lg gap-4 py-0">
            <CardHeader className="p-4 md:px-6 md:py-4">
              <CardTitle className="text-ds-heading-sm font-bold text-foreground">
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
              {/* Total de itens */}
              <div className="flex justify-between items-center gap-4 text-ds-body-sm text-muted-foreground border-b border-border/50 pb-3">
                <span className="truncate">Total de itens</span>
                <span className="tabular-nums font-semibold text-foreground shrink-0">{totalItemsCount}</span>
              </div>

              {/* Subtotal e Desconto total */}
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4 text-ds-body-sm text-muted-foreground">
                  <span className="truncate">Subtotal</span>
                  <span className="tabular-nums font-semibold text-foreground shrink-0">{brl(subtotalFinal)}</span>
                </div>

                <div className="flex justify-between items-center gap-4 text-ds-body-sm text-muted-foreground border-b border-border/50 pb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate">Desconto total</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setIsDiscountOpen(true)}
                      className="text-muted-foreground hover:text-primary cursor-pointer"
                      aria-label="Configurar desconto geral"
                    >
                      <Edit2 />
                    </Button>
                    {watchDiscountValue > 0 && (
                      <span className="text-[9px] bg-green-500/10 text-green-600 px-1 py-0.2 font-bold rounded-sm uppercase shrink-0">
                        {watchDiscountType === '%' ? `${watchDiscountValue}%` : 'FIXO'}
                      </span>
                    )}
                  </div>
                  <span className="tabular-nums font-semibold text-green-600 shrink-0">
                    {watchDiscountValue > 0 ? '-' : ''}
                    {brl(
                      watchDiscountType === 'none'
                        ? 0
                        : watchDiscountType === 'R$'
                          ? Number(watchDiscountValue)
                          : subtotalFinal * (Number(watchDiscountValue) / 100)
                    )}
                  </span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between items-center pt-1 pb-2">
                <span className="text-ds-body-sm font-bold text-foreground uppercase tracking-tight">TOTAL</span>
                <span className="text-ds-heading-md font-bold text-primary tabular-nums tracking-tighter shrink-0">
                  {brl(totalFinal)}
                </span>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumo Fixo Inferior (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-md p-4 pb-safe space-y-3 animate-in slide-in-from-bottom duration-200">

        {/* Card de Valores (Subtotal, Desconto, TOTAL) */}
        <div className="grid grid-cols-3 gap-2 bg-muted/40 border border-border/80 rounded-xl p-3.5 items-center">
          {/* Subtotal */}
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Subtotal</span>
            <span className="text-xs font-semibold text-foreground tabular-nums truncate">
              {brl(subtotalFinal)}
            </span>
          </div>

          {/* Desconto */}
          <button
            type="button"
            onClick={() => {
              triggerVibration(10)
              setIsDiscountOpen(true)
            }}
            className="flex flex-col min-w-0 text-left cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Desconto</span>
              <Edit2 className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
            </div>
            <span className="text-xs font-semibold text-green-600 tabular-nums truncate">
              {watchDiscountValue > 0 ? '-' : ''}
              {brl(
                watchDiscountType === 'none'
                  ? 0
                  : watchDiscountType === 'R$'
                    ? Number(watchDiscountValue)
                    : subtotalFinal * (Number(watchDiscountValue) / 100)
              )}
            </span>
          </button>

          {/* TOTAL */}
          <div className="flex flex-col min-w-0 text-right">
            <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider mb-0.5">TOTAL</span>
            <span className="text-ds-body-md font-bold text-primary tabular-nums truncate">
              {brl(totalFinal)}
            </span>
          </div>
        </div>

        {/* Botões de Ação Lado a Lado */}
        <div className="flex gap-3">
          <Button
            type="button"
            disabled={loading || successStatus !== null}
            variant="outline"
            onClick={() => handleSave('draft')}
            className={cn(
              "flex-1 cursor-pointer bg-muted/20",
              successStatus === 'draft' && "bg-success/10 text-success border-success hover:bg-success/20 hover:text-success"
            )}
          >
            {successStatus === 'draft' ? 'Rascunho Salvo' : 'Salvar rascunho'}
          </Button>

          <Button
            type="button"
            disabled={loading || successStatus !== null}
            variant="default"
            onClick={() => handleSave('pending')}
            className={cn(
              "flex-[1.4] cursor-pointer",
              successStatus === 'pending' && "bg-success hover:bg-success"
            )}
          >
            {loading
              ? 'Processando...'
              : successStatus === 'pending'
                ? 'Concluído'
                : mode === 'edit'
                  ? 'Salvar orçamento'
                  : 'Gerar orçamento'}
          </Button>
        </div>
      </div>

      {/* Barra Fixa Inferior (Desktop Only) */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-md py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Esquerda: Cancelar */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              triggerVibration(15)
              router.back()
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer px-4"
          >
            Cancelar
          </Button>

          {/* Direita: Salvar rascunho e Gerar orçamento */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={loading || successStatus !== null}
              variant="outline"
              onClick={() => handleSave('draft')}
              className={cn(
                "px-6 cursor-pointer",
                successStatus === 'draft' && "bg-success/10 text-success border-success hover:bg-success/20 hover:text-success"
              )}
            >
              {successStatus === 'draft' ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Rascunho Salvo
                </>
              ) : (
                'Salvar rascunho'
              )}
            </Button>

            <Button
              type="button"
              disabled={loading || successStatus !== null}
              variant="default"
              onClick={() => handleSave('pending')}
              className={cn(
                "px-6 cursor-pointer",
                successStatus === 'pending' && "bg-success hover:bg-success"
              )}
            >
              {loading
                ? 'Processando...'
                : successStatus === 'pending'
                  ? 'Concluído'
                  : mode === 'edit'
                    ? 'Salvar alterações'
                    : 'Gerar orçamento'}
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* DRAWER / SHEET 1: ADICIONAR ITEM */}
      {/* ========================================== */}
      <Sheet open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-0">
          <SheetHeader className="border-b-0 pb-0">
            <SheetTitle>Adicionar Item</SheetTitle>
            <SheetCloseButton onClick={() => triggerVibration(10)} />
          </SheetHeader>

          <Tabs defaultValue="new-item" className="flex-1 flex flex-col min-h-0 bg-background">
            <TabsList variant="line" className="px-6 bg-card border-b border-border/60 justify-start w-full">
              <TabsTrigger value="catalog" className="flex-1 py-3 text-sm font-bold">Catálogo</TabsTrigger>
              <TabsTrigger value="new-item" className="flex-1 py-3 text-sm font-bold">Novo Item</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="flex-1 overflow-y-auto p-6 space-y-6 outline-none">
              {/* Opção A: Busca no Catálogo */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Buscar no Catálogo
                  </h3>
                  <CatalogForm
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-primary font-semibold cursor-pointer gap-1"
                      >
                        <Plus className="h-3 w-3" /> Novo no Catálogo
                      </Button>
                    }
                  />
                </div>

                <Input
                  type="search"
                  placeholder="Pesquisar produto ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 text-sm"
                />

                <div className="border border-border rounded-md divide-y divide-border max-h-72 overflow-y-auto">
                  {filteredCatalogItems.length === 0 ? (
                    <div className="p-4 text-xs text-center text-muted-foreground italic">
                      Nenhum item cadastrado no catálogo com este nome.
                    </div>
                  ) : (
                    filteredCatalogItems.map((item) => {
                      const isSelected = selectedCatalogIds.includes(item.id)
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCatalogSelection(item.id)}
                          className={cn(
                            "flex items-center justify-between p-3 cursor-pointer transition-colors text-left",
                            isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                          )}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-ds-body-sm font-semibold text-foreground truncate block">
                                {item.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[8px] px-1 py-0 h-3.5 font-bold uppercase tracking-wider rounded-sm shrink-0',
                                  item.type === 'product'
                                    ? 'bg-blue-50/10 text-blue-600 border-blue-200/50 dark:text-blue-400'
                                    : 'bg-muted text-muted-foreground border-border'
                                )}
                              >
                                {item.type === 'product' ? 'PROD' : 'SERV'}
                              </Badge>
                            </div>
                            <span className="text-xs font-bold text-foreground">{brl(item.unit_price)}</span>
                          </div>

                          {/* Checkbox Visual */}
                          <div
                            className={cn(
                              "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input bg-card"
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md cursor-pointer"
                  disabled={selectedCatalogIds.length === 0}
                  onClick={handleConfirmCatalogSelection}
                >
                  Adicionar Selecionados ({selectedCatalogIds.length})
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="new-item" className="flex-1 overflow-y-auto p-6 space-y-4 outline-none">
              {/* Opção B: Adição Manual de Item */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Adicionar Item Avulso
                </h3>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="manual_name" className="text-xs">Descrição</Label>
                    <Input
                      id="manual_name"
                      placeholder="Ex: Instalação e teste de fiação"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="manual_qty" className="text-xs">Quantidade</Label>
                      <QuantityInput
                        id="manual_qty"
                        value={manualQty}
                        onChange={(val) => setManualQty(val)}
                        className="h-10"
                        min={0.01}
                        max={99999}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="manual_price" className="text-xs">Valor Unitário</Label>
                      <Input
                        id="manual_price"
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={
                          manualPrice
                            ? maskCurrency(Math.round(manualPrice * 100).toString())
                            : ''
                        }
                        onChange={(e) => {
                          const masked = maskCurrency(e.target.value)
                          const raw = parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
                          setManualPrice(raw)
                        }}
                        className="h-10 text-sm text-right"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full font-semibold h-10 rounded-md cursor-pointer border-input hover:bg-muted"
                    onClick={handleAddManualItem}
                  >
                    Confirmar Item Avulso
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* ========================================== */}
      {/* DRAWER / SHEET 2: SELEÇÃO DE PAGAMENTO */}
      {/* ========================================== */}
      <Sheet open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Formas de Pagamento</SheetTitle>
            <SheetCloseButton onClick={() => triggerVibration(10)} />
          </SheetHeader>

          <div className="p-6 space-y-4">
            <div className="divide-y divide-border border border-border rounded-md">
              {availablePaymentMethods.map((method) => {
                const currentMethods = watchPaymentMethod || []
                const isSelected = currentMethods.includes(method)
                const Icon = paymentMethodIcons[method] || CreditCard

                return (
                  <div
                    key={method}
                    onClick={() => {
                      triggerVibration(15)
                      let newMethods: string[]
                      if (isSelected) {
                        newMethods = currentMethods.filter((m) => m !== method)
                      } else {
                        newMethods = [...currentMethods, method]
                      }
                      form.setValue('payment_method', newMethods)
                    }}
                    className={cn(
                      "flex items-center justify-between p-3.5 cursor-pointer transition-colors text-left",
                      isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="text-ds-body-sm font-semibold text-foreground">{method}</span>
                    </div>

                    <div
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input bg-card"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              type="button"
              className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md cursor-pointer mt-4"
              onClick={() => setIsPaymentOpen(false)}
            >
              Confirmar Formas
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ========================================== */}
      {/* DRAWER / SHEET 3: EDITAR TERMOS */}
      {/* ========================================== */}
      <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Termos e Condições</SheetTitle>
            <SheetCloseButton onClick={() => triggerVibration(10)} />
          </SheetHeader>

          <div className="p-6 space-y-4">
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />

            <Button
              type="button"
              className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md cursor-pointer mt-4"
              onClick={() => setIsNotesOpen(false)}
            >
              Confirmar Termos e Condições
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ========================================== */}
      {/* DRAWER / SHEET 4: APLICAR DESCONTO GERAL */}
      {/* ========================================== */}
      <Sheet open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Desconto Geral</SheetTitle>
            <SheetCloseButton onClick={() => triggerVibration(10)} />
          </SheetHeader>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-ds-body-sm font-semibold text-foreground">Desconto</Label>
              <Controller
                name="discount_type"
                control={form.control}
                render={({ field: typeField }) => {
                  const discountValue = watchDiscountValue || 0

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
              className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-md mt-2 cursor-pointer"
              onClick={() => {
                triggerVibration(15)
                setIsDiscountOpen(false)
              }}
            >
              Confirmar Desconto
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
