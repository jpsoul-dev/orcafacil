'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm, useFieldArray, useWatch, Controller, type Resolver, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/components/subscription-provider'
import { ArrowLeft, Save, Plus, Trash2, Package, Search } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FormError } from '@/components/ui/form-error'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/use-debounce'
import { maskCurrency } from '@/lib/masks'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/services/customer-service'
import { CatalogItem } from '../../catalog/catalog-form'
import { CustomerSelector } from '../../quotes/components/customer-selector'
import { standaloneReceiptSchema, type StandaloneReceiptInput } from '../../quotes/schemas'
import { saveStandaloneReceiptAction } from '../../quotes/receipt-actions'

interface StandaloneReceiptFormProps {
  customers: Customer[]
  catalogItems: CatalogItem[]
  initialData?: {
    id: string
    customer_id: string
    title: string
    amount: number
    payment_method: string
    services_description: string
    issued_at: string
    items: Array<{
      id?: string
      item_name: string
      quantity: number
      unit_price: number
      subtotal: number
    }>
  } | null
}

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    val,
  )

export function StandaloneReceiptForm({ customers, catalogItems, initialData }: StandaloneReceiptFormProps) {
  const router = useRouter()
  const { isExpired, openUpgradeModal } = useSubscription()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isExpired) {
      openUpgradeModal()
      router.push('/app/receipts')
    }
  }, [isExpired, openUpgradeModal, router])
  const [openCatalogModal, setOpenCatalogModal] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  const debouncedCatalogSearch = useDebounce(catalogSearch, 300)

  const defaultItems = initialData?.items?.length
    ? initialData.items.map((i) => ({
      item_name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
    }))
    : []

  const defaultValues: StandaloneReceiptInput = {
    id: initialData?.id,
    customerId: initialData?.customer_id || '',
    title: initialData?.title || '',
    amount: initialData?.amount ?? 0,
    paymentMethod: initialData?.payment_method ?? 'Pix',
    servicesDescription: initialData?.services_description ?? 'Confirmamos o recebimento dos valores descritos referente aos serviços/produtos prestados.',
    issuedAt: initialData?.issued_at ?? (() => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })(),
    items: defaultItems,
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<StandaloneReceiptInput>({
    resolver: zodResolver(standaloneReceiptSchema) as unknown as Resolver<StandaloneReceiptInput>,
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = useWatch({ control, name: 'items' })
  const watchItems = useMemo(() => watchedItems || [], [watchedItems])

  const totalAmount = useMemo(() => {
    return watchItems.reduce((acc, item) => {
      return acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
    }, 0)
  }, [watchItems])

  // Sincroniza o total geral com o campo hidden amount do formulário
  useMemo(() => {
    setValue('amount', totalAmount)
  }, [totalAmount, setValue])

  const handleAddCatalogItem = (item: CatalogItem) => {
    if (!item) return
    append({
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
      item_name: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
    })
  }

  const onSubmit = async (data: StandaloneReceiptInput) => {
    setLoading(true)
    try {
      const result = await saveStandaloneReceiptAction(data)
      if (result.success) {
        toast.success(initialData ? 'Recibo atualizado com sucesso!' : 'Recibo emitido com sucesso!')
        router.push(`/app/receipts/${result.id}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Ocorreu um erro ao salvar o recibo.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro de conexão ao tentar salvar o recibo.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCatalog = useMemo(() => {
    const term = debouncedCatalogSearch.trim().toLowerCase()
    if (!term) return catalogItems
    if (term.length < 2) return catalogItems
    return catalogItems.filter((i) => i.name?.toLowerCase().includes(term))
  }, [catalogItems, debouncedCatalogSearch])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/app/receipts">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {initialData ? 'Editar Recibo Avulso' : 'Emitir Novo Recibo Avulso'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Preencha os dados do cliente e a listagem de itens do recibo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bloco 1: Informações Gerais */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Informações de Cabeçalho</CardTitle>
            <CardDescription className="text-xs">
              Defina o cliente, título e forma de pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Título do Recibo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  aria-invalid={!!errors.title}
                />
                <FormError message={errors.title?.message} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cliente <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="customerId"
                  render={({ field }) => (
                    <CustomerSelector
                      customers={customers}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.customerId?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Forma de Pagamento <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={cn("h-10 border-input rounded-sm bg-card transition-[border-color,box-shadow] duration-ds-fast focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none", errors.paymentMethod ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : "")}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm border-input bg-card">
                        {[
                          'Pix',
                          'Dinheiro',
                          'Cartão de Crédito',
                          'Cartão de Débito',
                          'Boleto Bancário',
                          'Cheque',
                        ].map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={errors.paymentMethod?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuedAt" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Data do Recibo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="issuedAt"
                  type="date"
                  {...register('issuedAt')}
                  aria-invalid={!!errors.issuedAt}
                />
                <FormError message={errors.issuedAt?.message} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 2: Itens do Recibo */}
        <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-800">
              Itens do Recibo
            </CardTitle>
            <CardDescription className="text-xs">
              Adicione produtos ou serviços prestados ao recibo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <Package className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhum item adicionado</p>
                <p className="text-xs mt-1">
                  Use <span className="font-semibold text-blue-600">Catálogo</span> para buscar um produto ou <span className="font-semibold text-slate-700">Novo item</span> para incluir manualmente.
                </p>
              </div>
            ) : (
              <div className="pb-4 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-150">
                  <thead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="pr-2 pb-3 text-center w-[6%]">Nº</th>
                      <th className="pr-2 pb-3 w-[50%]">Item / Serviço</th>
                      <th className="px-2 pb-3 text-center w-[15%]">Qtd</th>
                      <th className="px-2 pb-3 text-center w-[20%]">Preço Unitário (R$)</th>
                      <th className="px-2 pb-3 text-right w-[18%]">Total</th>
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
                              {...register(`items.${index}.item_name` as const)}
                              placeholder="Ex: Pintura da parede da sala"
                              aria-invalid={!!errors.items?.[index]?.item_name}
                            />
                            <FormError message={errors.items?.[index]?.item_name?.message} />
                          </div>
                        </td>
                        <td className="px-2 py-4 align-top">
                          <div className="flex h-10 border border-input rounded-sm overflow-hidden bg-card transition-[border-color,box-shadow] duration-ds-fast focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 outline-none">
                            <Input
                              type="number"
                              min="0.01"
                              step="any"
                              {...register(`items.${index}.quantity` as const, {
                                onChange: () => {
                                  const qty = Number(getValues(`items.${index}.quantity`)) || 0
                                  const price = Number(getValues(`items.${index}.unit_price`)) || 0
                                  setValue(`items.${index}.subtotal`, qty * price)
                                },
                              })}
                              className="h-full border-0 rounded-none focus-visible:ring-0 text-center tabular-nums w-full px-1"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-4 align-top">
                          <div className="flex h-10 border border-input rounded-sm overflow-hidden bg-card transition-[border-color,box-shadow] duration-ds-fast focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 outline-none">
                            <Controller
                              name={`items.${index}.unit_price` as const}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="text"
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

                                    const qty = Number(getValues(`items.${index}.quantity`)) || 0
                                    setValue(`items.${index}.subtotal`, qty * raw)
                                  }}
                                  className="h-full border-0 rounded-none focus-visible:ring-0 text-right tabular-nums w-full px-1"
                                />
                              )}
                            />
                            <div className="h-full px-2.5 bg-slate-50 dark:bg-neutral-800/40 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold border-l border-input shrink-0 font-sans select-none">
                              R$
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 align-top text-right">
                          <div className="h-10 flex items-center justify-end text-[14px] text-slate-800 font-bold tabular-nums">
                            {brl(
                              (Number(watchItems[index]?.quantity) || 0) *
                              (Number(watchItems[index]?.unit_price) || 0)
                            )}
                          </div>
                        </td>
                        <td className="pl-2 py-4 align-top text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-input rounded-sm transition-colors duration-ds-fast cursor-pointer flex items-center justify-center"
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

            {/* Ações de Itens */}
            <div className="mt-4 flex items-center justify-end gap-1.5">
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
                      className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      Catálogo
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl shadow-2xl border-slate-200 bg-white">
                  <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
                    <DialogTitle className="text-base font-bold text-slate-800">
                      Adicionar do Catálogo
                    </DialogTitle>
                  </DialogHeader>

                  <Command shouldFilter={false} className="rounded-none bg-white">
                    <CommandInput
                      placeholder="Buscar produto ou serviço..."
                      value={catalogSearch}
                      onValueChange={setCatalogSearch}
                      className="h-12 border-none focus:ring-0"
                    />
                    <CommandList className="max-h-87.5 p-2 no-scrollbar">
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
                            className="flex items-center justify-between p-3 cursor-pointer rounded-md data-[selected=true]:bg-slate-50 transition-all border border-transparent data-[selected=true]:border-slate-100"
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
                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center transition-all">
                              <Plus className="h-4 w-4 text-slate-400 hover:text-blue-600" />
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
                className="h-9 px-4 border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 gap-2 text-[13px] font-bold"
              >
                <Plus className="h-4 w-4" /> Novo item
              </Button>
            </div>

            {errors.items?.root && (
              <div className="pt-4 text-sm text-red-500 font-semibold">
                {errors.items.root.message}
              </div>
            )}
            {errors.items && !Array.isArray(errors.items) && (errors.items as FieldError).message && (
              <div className="pt-4 text-sm text-red-500 font-semibold">
                {(errors.items as FieldError).message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloco 3: Resumo e Descrição de Serviço */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Resumo e Descrição</CardTitle>
            <CardDescription className="text-xs">
              Escreva os detalhes dos serviços e revise os valores consolidados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="servicesDescription" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Descrição no Corpo do Recibo <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="servicesDescription"
                placeholder="Confirmamos o recebimento dos valores descritos referente aos serviços/produtos..."
                {...register('servicesDescription')}
                className="min-h-30 resize-none"
                aria-invalid={!!errors.servicesDescription}
              />
              <p className="text-xs text-slate-400 font-medium">
                Esta mensagem sairá impressa no corpo do recibo, detalhando o que está sendo quitado.
              </p>
              <FormError message={errors.servicesDescription?.message} />
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col items-end">
              <div className="w-full max-w-[320px] space-y-2.5">
                <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium pb-2 border-b border-slate-50">
                  <span>Itens adicionados</span>
                  <span className="font-bold text-slate-800">{fields.length}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] text-slate-950 font-bold">
                  <span>Total do Recibo</span>
                  <span className="text-lg text-slate-900 font-extrabold tabular-nums">
                    {brl(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Envio */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/app/receipts">
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              className="h-11 px-6 rounded-lg font-bold text-slate-500"
            >
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-8 rounded-lg font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-md gap-2"
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Recibo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
