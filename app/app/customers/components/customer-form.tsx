'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { saveCustomer } from '../actions'
import { triggerHaptic } from '@/lib/haptic'
import { maskCPFCNPJ, maskPhone, maskCEP } from '@/lib/masks'
import { customerSchema, CustomerInput } from '@/lib/validations/customer-schema'
import type { Customer } from '@/lib/services/customer-service'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubscription } from '@/components/subscription-provider'
import { BackButton } from '@/components/ui/back-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Check, ChevronLeft } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function CustomerForm({
  initialData,
  mode = 'new',
}: {
  initialData?: Customer
  mode?: 'new' | 'edit'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [successStatus, setSuccessStatus] = useState<boolean>(false)
  const [searchingCEP, setSearchingCEP] = useState(false)
  const lastSearchedCep = useRef<string>('')

  const { isExpired, openUpgradeModal } = useSubscription()

  // Redireciona caso assinatura esteja expirada
  useEffect(() => {
    if (isExpired) {
      openUpgradeModal()
      router.back()
    }
  }, [isExpired, openUpgradeModal, router])

  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || '',
      document_type: initialData?.document_type ?? 'cpf',
      document: initialData?.document || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      whatsapp: initialData?.whatsapp || '',
      address_zip: initialData?.address_zip || '',
      address_street: initialData?.address_street || '',
      address_number: initialData?.address_number || '',
      address_complement: initialData?.address_complement || '',
      address_neighborhood: initialData?.address_neighborhood || '',
      address_city: initialData?.address_city || '',
      address_state: initialData?.address_state || '',
    },
  })

  async function onSubmit(data: CustomerInput) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      triggerHaptic('error')
      toast.error('Sem conexão com a internet. Não é possível salvar os dados do cliente agora.')
      return
    }

    setLoading(true)
    try {
      const result = await saveCustomer(data, initialData?.id)
      setLoading(false)
      if (result.error) {
        triggerHaptic('error')
        toast.error(result.error)
      } else {
        triggerHaptic('success')
        setSuccessStatus(true)

        setTimeout(() => {
          const targetId = initialData?.id || result.data?.id
          if (targetId) {
            router.push(`/app/customers/${targetId}`)
          } else {
            router.push('/app/customers')
          }
        }, 600)
      }
    } catch (err) {
      setLoading(false)
      console.error('Erro ao salvar cliente:', err)
      triggerHaptic('error')
      toast.error('Erro de conexão. Verifique sua rede e tente novamente.')
    }
  }

  const handleSearchCEP = async () => {
    const currentCep = form.getValues('address_zip') || ''
    const cep = currentCep.replace(/\D/g, '')

    if (cep.length !== 8) {
      if (cep.length > 0) toast.error('Digite um CEP válido')
      return
    }

    if (searchingCEP || cep === lastSearchedCep.current) return

    setSearchingCEP(true)
    lastSearchedCep.current = cep

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()

      if (!data.erro) {
        form.setValue('address_street', data.logradouro)
        form.setValue('address_neighborhood', data.bairro)
        form.setValue('address_city', data.localidade)
        form.setValue('address_state', data.uf)
      } else {
        toast.error('CEP não encontrado')
      }
    } catch (_err) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setSearchingCEP(false)
    }
  }

  const pageTitle = mode === 'edit' ? 'Editar cliente' : 'Novo cliente'

  return (
    <form
      id="customer-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-ds-normal hide-global-header-mobile"
    >
      {/* Header Mobile Nativo (AppBar) */}
      <div className="sm:hidden flex items-center justify-between h-14 bg-card border-b border-border sticky top-0 z-40 px-4 -mx-4 -mt-4 mb-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light')
            router.back()
          }}
          className="flex items-center justify-center h-11 w-11 -ml-2 text-foreground active:opacity-60 cursor-pointer rounded-full"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-ds-body-md font-bold text-foreground font-display">
          {pageTitle}
        </h1>
        <button
          type="submit"
          disabled={loading || successStatus}
          className={cn("text-ds-body-sm font-bold active:opacity-60 cursor-pointer disabled:opacity-40 transition-colors duration-ds-fast flex items-center justify-center",
            successStatus ? "text-success" : "text-primary"
          )}
        >
          {loading ? '...' : successStatus ? <Check className="h-5 w-5" /> : 'Salvar'}
        </button>
      </div>

      {/* Header Desktop */}
      <div className="hidden sm:flex items-center justify-between sticky top-16 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 py-4 -mt-4 mb-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            {pageTitle}
          </h1>
        </div>
        <Button
          type="submit"
          disabled={loading || successStatus}
          className={cn("gap-2 px-6 font-semibold cursor-pointer transition-all",
            successStatus ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""
          )}
        >
          {loading ? <Spinner className="h-4 w-4" /> : successStatus ? <Check className="h-4 w-4" /> : null}
          {successStatus ? 'Salvo' : 'Salvar'}
        </Button>
      </div>

      {/* Dados gerais */}
      <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4 pt-4 sm:pt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-start">
              <span className="bg-card pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                Dados gerais
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="name" className="text-sm font-bold text-foreground font-display">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Nome completo ou Razão Social"
                className="h-11 sm:h-10 font-medium"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-bold text-foreground font-display">
                Telefone
              </Label>
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    className="h-11 sm:h-10 font-medium tabular-nums"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                )}
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="document" className="text-sm font-bold text-foreground font-display">
                CPF/CNPJ
              </Label>
              <Controller
                name="document"
                control={form.control}
                render={({ field }) => {
                  return (
                    <Input
                      id="document"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(maskCPFCNPJ(e.target.value))}
                      placeholder="000.000.000-00"
                      className="h-11 sm:h-10 font-medium tabular-nums"
                      maxLength={18}
                    />
                  )
                }}
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold text-foreground font-display">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="email@cliente.com"
                className="h-11 sm:h-10 font-medium"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="whatsapp" className="text-sm font-bold text-foreground font-display">
                WhatsApp
              </Label>
              <Controller
                name="whatsapp"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="whatsapp"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    className="h-11 sm:h-10 font-medium tabular-nums"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados de endereço */}
      <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4 pt-4 sm:pt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-start">
              <span className="bg-card pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                Dados de endereço
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_zip" className="text-sm font-bold text-foreground font-display">
                CEP
              </Label>
              <div className="relative">
                <Controller
                  name="address_zip"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="address_zip"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(maskCEP(e.target.value))}
                      onBlur={handleSearchCEP}
                      placeholder="00000-000"
                      className="h-11 sm:h-10 font-medium tabular-nums pr-10"
                      maxLength={9}
                    />
                  )}
                />
                {searchingCEP ? (
                  <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                ) : (
                  <Search
                    onClick={handleSearchCEP}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground"
                  />
                )}
              </div>
            </div>

            <div className="col-span-12 sm:col-span-8 space-y-1.5">
              <Label htmlFor="address_street" className="text-sm font-bold text-foreground font-display">
                Logradouro
              </Label>
              <Input
                id="address_street"
                {...form.register('address_street')}
                className="h-11 sm:h-10 font-medium"
                placeholder="Rua, Av., etc."
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_number" className="text-sm font-bold text-foreground font-display">
                Número
              </Label>
              <Input
                id="address_number"
                {...form.register('address_number')}
                placeholder="123"
                className="h-11 sm:h-10 font-medium"
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_complement" className="text-sm font-bold text-foreground font-display">
                Complemento
              </Label>
              <Input
                id="address_complement"
                {...form.register('address_complement')}
                placeholder="Apto, sala, etc."
                className="h-11 sm:h-10 font-medium"
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_neighborhood" className="text-sm font-bold text-foreground font-display">
                Bairro
              </Label>
              <Input
                id="address_neighborhood"
                {...form.register('address_neighborhood')}
                placeholder="Bairro"
                className="h-11 sm:h-10 font-medium"
              />
            </div>

            <div className="col-span-12 sm:col-span-8 space-y-1.5">
              <Label htmlFor="address_city" className="text-sm font-bold text-foreground font-display">
                Cidade
              </Label>
              <Input
                id="address_city"
                {...form.register('address_city')}
                placeholder="Cidade"
                className="h-11 sm:h-10 font-medium"
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_state" className="text-sm font-bold text-foreground font-display">
                Estado
              </Label>
              <Controller
                control={form.control}
                name="address_state"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger className="h-11 sm:h-10 font-medium text-foreground">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
                      ].map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacer para garantir scroll total no mobile antes da barra de sistema */}
      <div className="h-10 sm:hidden"></div>
    </form>
  )
}
