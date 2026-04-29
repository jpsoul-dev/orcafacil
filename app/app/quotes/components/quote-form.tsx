'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { saveQuote } from '../actions'

import { Button as BaseButton } from '@base-ui/react/button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Search, Check, ChevronDown, Package } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CustomerForm } from '../../customers/customer-form'

const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.number()
})

const quoteSchema = z.object({
  title: z.string().min(1, 'Título do orçamento obrigatório'),
  customer_id: z.string().min(1, 'Selecione um cliente'),
  valid_until: z.string().optional().nullable(),
  discount_type: z.enum(['none', '%', 'R$']),
  discount_value: z.coerce.number().min(0),
  payment_method: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(quoteItemSchema).min(1, 'Adicione pelo menos um item ao orçamento')
})

type QuoteValues = z.infer<typeof quoteSchema>

const brl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export function QuoteForm({ customers, catalogItems, initialData }: { customers: any[], catalogItems: any[], initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subtotalFinal, setSubtotalFinal] = useState(0)
  const [totalFinal, setTotalFinal] = useState(0)

  // Estados dos modais de busca
  const [openCustomerModal, setOpenCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('')

  const [openCatalogModal, setOpenCatalogModal] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [debouncedCatalogSearch, setDebouncedCatalogSearch] = useState('')

  const defaultValidDate = new Date()
  defaultValidDate.setDate(defaultValidDate.getDate() + 15)

  const defaultItems = initialData?.quote_items?.length
    ? initialData.quote_items.map((i: any) => ({
      catalog_item_id: i.catalog_item_id,
      item_name: i.item_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.subtotal
    }))
    : []

  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      customer_id: initialData?.customer_id || '',
      valid_until: initialData?.valid_until || defaultValidDate.toISOString().split('T')[0],
      discount_type: initialData?.discount_type === 'percentage' ? '%' : (initialData?.discount_type === 'fixed' ? 'R$' : 'R$'),
      discount_value: initialData?.discount_value || 0,
      payment_method: initialData?.payment_method || 'Pix',
      notes: initialData?.notes || '',
      items: defaultItems
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const watchItems = form.watch('items')
  const watchDiscountType = form.watch('discount_type')
  const watchDiscountValue = form.watch('discount_value')
  const watchCustomerId = form.watch('customer_id')
  const watchPaymentMethod = form.watch('payment_method')

  useEffect(() => {
    let currentSubtotal = 0
    watchItems.forEach((item, index) => {
      const lineSubtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
      currentSubtotal += lineSubtotal
      if (item.subtotal !== lineSubtotal) form.setValue(`items.${index}.subtotal`, lineSubtotal)
    })
    setSubtotalFinal(currentSubtotal)
    let currentTotal = currentSubtotal
    const dv = Number(watchDiscountValue) || 0
    if (watchDiscountType === '%') currentTotal -= currentTotal * (dv / 100)
    else if (watchDiscountType === 'R$') currentTotal -= dv
    setTotalFinal(currentTotal > 0 ? currentTotal : 0)
  }, [watchItems, watchDiscountType, watchDiscountValue, form])

  // Debounce da busca de clientes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [customerSearch])

  // Debounce da busca do catálogo (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCatalogSearch(catalogSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [catalogSearch])

  const handleAddCatalogItem = (item: any) => {
    if (!item) return
    append({ catalog_item_id: item.id, item_name: item.name, quantity: 1, unit_price: item.unit_price, subtotal: item.unit_price })
    setOpenCatalogModal(false)
    setCatalogSearch('')
    setDebouncedCatalogSearch('')
  }

  const handleAddManualItem = () => {
    append({ catalog_item_id: null, item_name: '', quantity: 1, unit_price: 0, subtotal: 0 })
  }

  async function handleSave(status: 'draft' | 'completed') {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Por favor, selecione um cliente e adicione itens ao orçamento.')
      return
    }

    const data = form.getValues()

    // Mapear valores da UI para o banco de dados
    const dbDiscountType = data.discount_type === '%' ? 'percentage' : (data.discount_type === 'R$' ? 'fixed' : 'none')

    setLoading(true)
    const result = await saveQuote({
      ...data,
      discount_type: dbDiscountType,
      id: initialData?.id,
      status,
      subtotal: subtotalFinal,
      total: totalFinal
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(status === 'draft' ? 'Rascunho salvo com sucesso!' : 'Orçamento concluído com sucesso!')
      if (status === 'draft') {
        router.push('/app/quotes')
      } else {
        router.push(`/quote/${result.public_uuid}`)
      }
    }
  }

  // Filtra clientes pelo nome usando o valor com debounce
  const filteredCustomers = useMemo(() => {
    const term = debouncedCustomerSearch.trim().toLowerCase()
    if (!term) return []
    return customers.filter(c => c.name?.toLowerCase().includes(term))
  }, [customers, debouncedCustomerSearch])

  // Filtra catálogo pelo nome usando o valor com debounce
  const filteredCatalog = useMemo(() => {
    const term = debouncedCatalogSearch.trim().toLowerCase()
    if (!term) return []
    return catalogItems.filter(c => c.name?.toLowerCase().includes(term))
  }, [catalogItems, debouncedCatalogSearch])

  const selectedCustomerName = useMemo(() => {
    if (!watchCustomerId) return null
    return customers.find(c => c.id === watchCustomerId)?.name
  }, [watchCustomerId, customers])

  return (
    <div className="space-y-6 w-full">
      {/* Dados do Cliente e Validade */}
      <Card className="rounded-[12px] border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-[16px] font-bold text-slate-800">
            Dados do Cliente e Validade
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title" className="text-[13px] font-semibold text-slate-700">
                Título do orçamento <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title" 
                {...form.register('title')} 
                placeholder="Ex: Orçamento de Pintura Residencial" 
                className={`h-10 border-slate-200 rounded-lg bg-white ${form.formState.errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_until" className="text-[13px] font-semibold text-slate-700">Validade</Label>
              <Input id="valid_until" type="date" {...form.register('valid_until')} className="h-10 border-slate-200 rounded-lg bg-white w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-slate-700">
              Cliente <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Dialog open={openCustomerModal} onOpenChange={(open) => {
                setOpenCustomerModal(open)
                if (!open) {
                  setCustomerSearch('')
                  setDebouncedCustomerSearch('')
                }
              }}>
                <DialogTrigger render={
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={`flex-1 justify-between h-10 px-4 border-slate-200 rounded-lg bg-white hover:bg-slate-50 font-normal ${!selectedCustomerName ? 'text-slate-500' : 'text-slate-900 font-medium'} ${form.formState.errors.customer_id ? 'border-red-500' : ''}`}
                  >
                    <span className="truncate">{selectedCustomerName || 'Selecionar cliente'}</span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Search className="h-4 w-4" />
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </Button>
                } />
                {form.formState.errors.customer_id && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.customer_id.message}</p>
                )}
                <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-xl shadow-xl">
                  <DialogHeader className="px-5 pt-5 pb-0">
                    <DialogTitle className="text-base font-semibold text-slate-900">Selecionar cliente</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        autoFocus
                        placeholder="Buscar por nome, CPF ou WhatsApp..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto border-t border-slate-100">
                    {customerSearch.trim() === '' ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Search className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">Digite para buscar clientes</p>
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <p className="text-sm">Nenhum cliente encontrado.</p>
                        <p className="text-xs mt-1">Tente buscar por outro nome, CPF ou WhatsApp.</p>
                      </div>
                    ) : (
                      <div>
                        {filteredCustomers.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              form.setValue('customer_id', c.id)
                              setOpenCustomerModal(false)
                              setCustomerSearch('')
                            }}
                            className={`flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors text-left border-b border-slate-50 last:border-0 ${watchCustomerId === c.id
                              ? 'bg-blue-50'
                              : 'hover:bg-slate-50'
                              }`}
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                {c.document && (
                                  <span className="text-xs text-slate-500">{c.document}</span>
                                )}
                                {c.whatsapp && (
                                  <span className="text-xs text-slate-500">{c.whatsapp}</span>
                                )}
                              </div>
                            </div>
                            {watchCustomerId === c.id && (
                              <Check className="h-4 w-4 shrink-0 text-blue-600 ml-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {watchCustomerId && (
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => {
                          form.setValue('customer_id', '')
                          setOpenCustomerModal(false)
                        }}
                        className="w-full text-sm text-slate-500 hover:text-red-500 transition-colors py-1"
                      >
                        Remover seleção
                      </button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <CustomerForm trigger={
                <Button type="button" variant="outline" className="h-10 px-4 border-slate-200 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 gap-2 shrink-0">
                  <Plus className="h-4 w-4" /> Novo
                </Button>
              } />
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-slate-800">Itens</h3>
          </div>

          {/* Empty state ou tabela de itens */}
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400">
              <Package className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">Nenhum item adicionado</p>
              <p className="text-xs mt-1">Use <span className="font-semibold">Catálogo</span> para buscar um produto ou <span className="font-semibold">Novo item</span> para incluir manualmente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-sm text-left table-fixed border-collapse">
                <thead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pr-2 pb-3 w-auto">Item</th>
                    <th className="px-2 pb-3 text-center w-[16%]">Qtd</th>
                    <th className="px-2 pb-3 text-center w-[20%]">Preço (R$)</th>
                    <th className="px-2 pb-3 text-right w-[15%]">Total</th>
                    <th className="w-[40px] pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group">
                      <td className="pr-2 py-4 align-top">
                        <div className="relative">
                          <Input
                            {...form.register(`items.${index}.item_name` as const)}
                            placeholder="Descrição"
                            className="h-10 text-sm border-slate-200 rounded-lg pr-9"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top">
                        <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.quantity` as const)}
                            className="h-full border-0 rounded-none focus-visible:ring-0 text-center tabular-nums w-full"
                          />
                          <div className="h-full px-3 bg-slate-100 text-slate-500 flex items-center justify-center text-xs border-l border-slate-200">
                            un
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top">
                        <div className="flex h-10 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.unit_price` as const)}
                            className="h-full border-0 rounded-none focus-visible:ring-0 text-right tabular-nums w-full"
                          />
                          <div className="h-full px-3 bg-slate-100 text-slate-500 flex items-center justify-center text-xs border-l border-slate-200">
                            R$
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 align-top text-right">
                        <div className="h-10 flex items-center justify-end text-[15px] text-slate-800 font-bold tabular-nums">
                          {brl(watchItems[index]?.subtotal || 0)}
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
            <Dialog open={openCatalogModal} onOpenChange={(open) => {
              setOpenCatalogModal(open)
              if (!open) {
                setCatalogSearch('')
                setDebouncedCatalogSearch('')
              }
            }}>
              <DialogTrigger render={
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Catálogo
                </button>
              } />
              <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl shadow-xl">
                <DialogHeader className="px-5 pt-5 pb-0">
                  <DialogTitle className="text-base font-semibold text-slate-900">Adicionar do Catálogo</DialogTitle>
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
                  {catalogSearch.trim() === '' ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Search className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-sm">Digite para buscar no catálogo</p>
                    </div>
                  ) : filteredCatalog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <p className="text-sm">Nenhum item encontrado.</p>
                      <p className="text-xs mt-1">Tente buscar por outro nome.</p>
                    </div>
                  ) : (
                    <div>
                      {filteredCatalog.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddCatalogItem(item)}
                          className="flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors text-left border-b border-slate-50 last:border-0 hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-slate-500">{item.type === 'product' ? 'Produto' : 'Serviço'}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">Valor base: <strong className="text-slate-700">{brl(item.unit_price)}</strong></span>
                              {item.unit_measure && (
                                <span className="text-xs text-slate-500">• {item.unit_measure}</span>
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

            <Button type="button" variant="outline" onClick={handleAddManualItem} className="h-9 px-4 border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 gap-2 text-[13px] font-medium">
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
            {/* Esquerda */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-slate-700">Desc. geral</Label>
                <div className="flex items-center gap-3">
                  <Select onValueChange={(val) => form.setValue('discount_type', val as any)} value={watchDiscountType}>
                    <SelectTrigger className="h-10 w-[120px] border-slate-200 rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="R$">R$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register('discount_value')}
                    disabled={watchDiscountType === 'none'}
                    className="h-10 border-slate-200 rounded-lg bg-white flex-1 text-slate-700 disabled:opacity-50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-slate-700">Forma de pagamento</Label>
                <Select onValueChange={(val) => form.setValue('payment_method', val as string)} value={watchPaymentMethod}>
                  <SelectTrigger className="h-10 border-slate-200 rounded-lg bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto Bancário', 'Cheque'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex w-full items-center justify-between text-[13px] text-slate-500 font-medium">
                  <span>Subtotal:</span>
                  <span className="tabular-nums font-bold text-slate-800">{brl(subtotalFinal)}</span>
                </div>
                <div className="flex w-full items-center justify-between text-[13px] text-slate-500 font-medium">
                  <span>Descontos:</span>
                  <span className="tabular-nums font-bold text-slate-800">
                    {brl(watchDiscountType === 'none' ? 0 : (watchDiscountType === 'R$' ? Number(watchDiscountValue) : subtotalFinal * (Number(watchDiscountValue) / 100)))}
                  </span>
                </div>
              </div>

            </div>

            {/* Direita */}
            <div className="space-y-2 flex flex-col h-full">
              <Label htmlFor="notes" className="text-[13px] font-semibold text-slate-700">Observações</Label>
              <Textarea
                id="notes"
                {...form.register('notes')}
                placeholder="Prazo de entrega, condições..."
                className="resize-none text-sm p-4 border-slate-200 rounded-lg bg-white flex-1 min-h-[140px]"
              />
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between border-t border-slate-100 pt-6">
            <span className="text-xl font-bold text-slate-900">Total:</span>
            <div className="text-right">
              <span className="text-[12px] font-semibold text-slate-500 block mb-1">Total do Pedido</span>
              <span className="text-3xl font-black text-[#004B71] tabular-nums tracking-tight">{brl(totalFinal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões Finais com Base UI */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <BaseButton
          type="button"
          disabled={loading}
          onClick={() => router.back()}
          className="h-10 px-6 rounded-lg text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="button"
          disabled={loading || fields.length === 0}
          onClick={() => handleSave('draft')}
          className="h-10 px-6 rounded-lg text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-200 font-semibold disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Salvar como Rascunho
        </BaseButton>
        <BaseButton
          type="button"
          disabled={loading || fields.length === 0}
          onClick={() => handleSave('completed')}
          className="h-10 px-6 rounded-lg bg-[#2E6898] hover:bg-[#255680] text-white font-semibold disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6898] focus-visible:ring-offset-2"
        >
          {loading ? 'Salvando...' : (initialData ? 'Concluir Orçamento' : 'Emitir Orçamento')}
        </BaseButton>
      </div>
    </div>
  )
}

