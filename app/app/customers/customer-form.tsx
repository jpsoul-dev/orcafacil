'use client'

import { useState, useEffect, ReactElement, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { saveCustomer } from './actions'
import { maskCPFCNPJ, maskPhone, maskCEP } from '@/lib/masks'
import { customerSchema, CustomerInput } from '@/lib/validations/customer-schema'
import type { Customer } from '@/lib/services/customer-service'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubscription } from '@/components/subscription-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Loader2, Search, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogClose,
} from '@/components/ui/dialog'

export function CustomerForm({
  initialData,
  asMenuItem,
  trigger,
}: {
  initialData?: Customer
  asMenuItem?: boolean
  trigger?: ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchingCEP, setSearchingCEP] = useState(false)
  const lastSearchedCep = useRef<string>('')

  const { isExpired, openUpgradeModal } = useSubscription()

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && isExpired) {
      openUpgradeModal()
      return
    }
    setOpen(newOpen)
  }

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

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      form.reset({
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
      })
    }
  }, [open, initialData, form])

  async function onSubmit(data: CustomerInput) {
    setLoading(true)
    const result = await saveCustomer(data, initialData?.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(initialData ? 'Cliente atualizado!' : 'Cliente cadastrado!')
      setOpen(false)
      if (!initialData) form.reset()
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        nativeButton={true}
        render={
          trigger ? (
            trigger
          ) : asMenuItem ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-full shrink-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
          ) : (
            <Button variant="default" className="gap-2">
              <UserPlus className="h-4 w-4" /> Novo cliente
            </Button>
          )
        }
      />

      <DialogContent className="p-0 flex flex-col sm:max-w-3xl max-h-[95vh] overflow-hidden gap-0 rounded-2xl border-none shadow-2xl bg-white">
        <DialogHeader className="px-6 py-6 border-none shrink-0 bg-white z-10 relative">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground font-display">
              {initialData ? 'Editar cliente' : 'Novo cliente'}
            </DialogTitle>
            <DialogClose
              render={
                <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  <Plus className="h-6 w-6 rotate-45" />
                  <span className="sr-only">Fechar</span>
                </button>
              }
            />
          </div>
        </DialogHeader>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          <form
            id="customer-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-6"
          >
            {/* Dados gerais */}
            <div className="space-y-4">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="bg-white pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                    Dados gerais
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Nome completo ou Razão Social"
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-bold text-foreground font-display"
                  >
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
                        onChange={(e) =>
                          field.onChange(maskPhone(e.target.value))
                        }
                        className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium tabular-nums"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    )}
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="document"
                    className="text-sm font-bold text-foreground font-display"
                  >
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
                          onChange={(e) => {
                            field.onChange(maskCPFCNPJ(e.target.value))
                          }}
                          placeholder="000.000.000-00"
                          className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium tabular-nums"
                          maxLength={18}
                        />
                      )
                    }}
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="email@cliente.com"
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="whatsapp"
                    className="text-sm font-bold text-foreground font-display"
                  >
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
                        onChange={(e) =>
                          field.onChange(maskPhone(e.target.value))
                        }
                        className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium tabular-nums"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Dados de endereço */}
            <div className="space-y-4">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-start">
                  <span className="bg-white pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                    Dados de endereço
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="address_zip"
                    className="text-sm font-bold text-foreground font-display"
                  >
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
                          onChange={(e) =>
                            field.onChange(maskCEP(e.target.value))
                          }
                          onBlur={handleSearchCEP}
                          placeholder="00000-000"
                          className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium tabular-nums pr-8"
                          maxLength={9}
                        />
                      )}
                    />
                    {searchingCEP ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                      <Search
                        onClick={handleSearchCEP}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600"
                      />
                    )}
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-8 space-y-1.5">
                  <Label
                    htmlFor="address_street"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Logradouro
                  </Label>
                  <Input
                    id="address_street"
                    {...form.register('address_street')}
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                    placeholder="Rua, Av., etc."
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="address_number"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Número
                  </Label>
                  <Input
                    id="address_number"
                    {...form.register('address_number')}
                    placeholder="123"
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="address_complement"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Complemento
                  </Label>
                  <Input
                    id="address_complement"
                    {...form.register('address_complement')}
                    placeholder="Apto, sala, etc."
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="address_neighborhood"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Bairro
                  </Label>
                  <Input
                    id="address_neighborhood"
                    {...form.register('address_neighborhood')}
                    placeholder="Bairro"
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                  />
                </div>

                <div className="col-span-12 sm:col-span-8 space-y-1.5">
                  <Label
                    htmlFor="address_city"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Cidade
                  </Label>
                  <Input
                    id="address_city"
                    {...form.register('address_city')}
                    placeholder="Cidade"
                    className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-foreground font-medium"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1.5">
                  <Label
                    htmlFor="address_state"
                    className="text-sm font-bold text-foreground font-display"
                  >
                    Estado
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      form.setValue('address_state', val || undefined)
                    }
                    value={form.watch('address_state') ?? undefined}
                  >
                    <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'AC',
                        'AL',
                        'AP',
                        'AM',
                        'BA',
                        'CE',
                        'DF',
                        'ES',
                        'GO',
                        'MA',
                        'MT',
                        'MS',
                        'MG',
                        'PA',
                        'PB',
                        'PR',
                        'PE',
                        'PI',
                        'RJ',
                        'RN',
                        'RS',
                        'RO',
                        'RR',
                        'SC',
                        'SP',
                        'SE',
                        'TO',
                      ].map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer com botões lado a lado */}
        <div className="shrink-0 border-none bg-white p-6 pt-0">
          <div className="flex items-center justify-end">
            <Button
              form="customer-form"
              type="submit"
              disabled={loading}
              className="px-10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
