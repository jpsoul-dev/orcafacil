'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { formatBRL } from '@/lib/utils'

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
  const [loading, setLoading] = useState(false)

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
      ? `Recibo de Quitação - ${quote.title}`
      : `Recibo de Quitação - Orçamento #${quote.quote_number}`)

  const defaultValues: ReceiptInput = {
    id: initialData?.id,
    quoteId: quote.id,
    title: defaultTitle,
    amount: initialData?.amount ?? quote.total,
    paymentMethod: defaultPaymentMethod,
    servicesDescription: initialData?.services_description ?? '',
    issuedAt: initialData?.issued_at ?? new Date().toISOString().split('T')[0],
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
          <p className="text-xs text-slate-500 font-medium">
            Orçamento #{quote.quote_number} — Cliente: {quote.customer.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-800">Dados do Recibo</CardTitle>
            <CardDescription className="text-xs">
              Preencha as informações para a impressão do documento de quitação física.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Título do Recibo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Ex: Recibo de Quitação - Serviços de Pintura"
                  className={`h-10 border-slate-200 rounded-lg bg-white ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 font-semibold">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Valor Recebido (R$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  className={`h-10 border-slate-200 rounded-lg bg-white ${errors.amount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Valor de referência do orçamento: <span className="font-bold">{formatBRL(quote.total)}</span>
                </p>
                {errors.amount && (
                  <p className="text-xs text-red-500 font-semibold">{errors.amount.message}</p>
                )}
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
                      <SelectTrigger className={`h-10 border-slate-200 rounded-lg bg-white ${errors.paymentMethod ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
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
                {errors.paymentMethod && (
                  <p className="text-xs text-red-500 font-semibold">{errors.paymentMethod.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuedAt" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Data do Recibo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="issuedAt"
                  type="date"
                  {...register('issuedAt')}
                  className={`h-10 border-slate-200 rounded-lg bg-white ${errors.issuedAt ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.issuedAt && (
                  <p className="text-xs text-red-500 font-semibold">{errors.issuedAt.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicesDescription" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Descrição dos Serviços Prestados <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="servicesDescription"
                placeholder="Descreva detalhadamente os serviços prestados que estão sendo quitados por este recibo..."
                {...register('servicesDescription')}
                className={`min-h-[140px] resize-none border-slate-200 rounded-lg bg-white ${errors.servicesDescription ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Esta descrição sairá impressa no corpo do recibo físico.
              </p>
              {errors.servicesDescription && (
                <p className="text-xs text-red-500 font-semibold">{errors.servicesDescription.message}</p>
              )}
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
