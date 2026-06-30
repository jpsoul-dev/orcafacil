'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/components/subscription-provider'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
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
import { receiptSchema, type ReceiptInput } from '../schemas'
import { saveReceiptAction } from '../receipt-actions'
import { cn } from '@/lib/utils'

interface ReceiptFormProps {
  quote: {
    id: string
    quote_number: number
    title?: string | null
    total: number
    payment_method?: string | string[] | null
    customer: {
      name: string
      document: string
    }
    items?: Array<{
      item_name: string
      quantity: number
      unit_price: number
      subtotal: number
      unit_measure?: string | null
    }>
  }
  initialData?: {
    id: string
    title: string
    amount: number
    payment_method: string
    services_description: string
    issued_at: string
  } | null
}

export function ReceiptForm({ quote, initialData }: ReceiptFormProps) {
  const router = useRouter()
  const { isExpired, openUpgradeModal } = useSubscription()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isExpired) {
      openUpgradeModal()
      router.push(`/app/quotes/${quote.id}`)
    }
  }, [isExpired, openUpgradeModal, router, quote.id])

  const availableMethods = useMemo(() => {
    if (!quote.payment_method) return []
    if (Array.isArray(quote.payment_method)) {
      return quote.payment_method.filter(Boolean)
    }
    if (typeof quote.payment_method === 'string') {
      return (quote.payment_method as string)
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    }
    return []
  }, [quote.payment_method])

  const defaultPaymentMethod = initialData?.payment_method ?? (availableMethods[0] || 'Pix')

  const defaultTitle = initialData?.title ||
    (quote.title
      ? `${quote.title}`
      : `Recibo de Quitação - Orçamento #${quote.quote_number}`)

  const defaultValues: ReceiptInput = {
    id: initialData?.id,
    quoteId: quote.id,
    title: defaultTitle,
    amount: initialData?.amount ?? quote.total,
    paymentMethod: defaultPaymentMethod,
    servicesDescription: initialData?.services_description ?? 'Confirmamos o recebimento dos produtos/serviços descritos.',
    issuedAt: initialData?.issued_at ?? (() => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })(),
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReceiptInput>({
    resolver: zodResolver(receiptSchema) as unknown as Resolver<ReceiptInput>,
    defaultValues,
  })

  const onSubmit = async (data: ReceiptInput) => {
    setLoading(true)
    try {
      const result = await saveReceiptAction(data)
      if (result.success) {
        toast.success(initialData ? 'Recibo atualizado com sucesso!' : 'Recibo emitido com sucesso!')
        router.push(`/app/quotes/${quote.id}/receipt`)
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/app/quotes/${quote.id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {initialData ? 'Editar Recibo' : 'Emitir Recibo de Quitação'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Orçamento #{quote.quote_number} — Cliente: {quote.customer.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-sm overflow-hidden bg-card rounded-md">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Dados do Recibo</CardTitle>
            <CardDescription className="text-xs">
              Confirme as informações para emissão do recibo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Título do Recibo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  aria-invalid={!!errors.title}
                />
                <FormError message={errors.title?.message} />
              </div>

              {/* Valor do Recibo registrado de forma oculta */}
              <input type="hidden" {...register('amount')} />

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Forma de Pagamento <span className="text-destructive">*</span>
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
                        {(availableMethods.length > 0
                          ? availableMethods
                          : [
                            'Pix',
                            'Dinheiro',
                            'Cartão de Crédito',
                            'Cartão de Débito',
                            'Boleto Bancário',
                            'Cheque',
                          ]
                        ).map((method) => (
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
                  Data do Recibo <span className="text-destructive">*</span>
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
            <div className="space-y-2">
              <Label htmlFor="servicesDescription" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="servicesDescription"
                placeholder="Confirmamos o recebimento dos produtos/serviços descritos."
                {...register('servicesDescription')}
                className="min-h-[140px] resize-none"
                aria-invalid={!!errors.servicesDescription}
              />
              <p className="text-xs text-slate-400 font-medium">
                Esta descrição sairá impressa no corpo do recibo.
              </p>
              <FormError message={errors.servicesDescription?.message} />
            </div>
          </CardContent>
        </Card>


        <div className="flex items-center justify-end gap-3">
          <Link href={`/app/quotes/${quote.id}`}>
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
            className="h-11 px-8 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Recibo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
