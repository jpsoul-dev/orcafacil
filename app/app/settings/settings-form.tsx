'use client'

import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCompanySettings } from './actions'
import { maskCEP, maskCNPJ, maskCPF, maskPhone } from '@/lib/masks'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { ImageIcon, Building2, MapPin, Loader2, Upload, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const settingsSchema = z.object({
  name: z.string().min(1, 'Nome do negócio é obrigatório'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cnpj: z.string().optional(),
  address_zip: z.string().optional(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
})

type SettingsValues = z.infer<typeof settingsSchema>

export interface Company {
  id: string
  user_id: string
  name: string
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  logo_url?: string | null
  cnpj?: string | null
  address_zip?: string | null
  address_street?: string | null
  address_number?: string | null
  address_complement?: string | null
  address_neighborhood?: string | null
  address_city?: string | null
  address_state?: string | null
  created_at: string
}

export function SettingsForm({ initialData }: { initialData: Company | null }) {
  const [loading, setLoading] = useState(false)
  const [searchingCEP, setSearchingCEP] = useState(false)
  const lastSearchedCep = useRef<string>('')

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      whatsapp: initialData?.whatsapp || '',
      email: initialData?.email || '',
      cnpj: initialData?.cnpj || '',
      address_zip: initialData?.address_zip || '',
      address_street: initialData?.address_street || '',
      address_number: initialData?.address_number || '',
      address_complement: initialData?.address_complement || '',
      address_neighborhood: initialData?.address_neighborhood || '',
      address_city: initialData?.address_city || '',
      address_state: initialData?.address_state || '',
    },
  })

  async function onSubmit(data: SettingsValues) {
    setLoading(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) =>
      formData.append(key, value || ''),
    )
    const result = await saveCompanySettings(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configurações salvas!')
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Card Dados da Empresa */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Informações do Negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="font-medium text-sm">
                Nome do negócio *
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ex: Minha Empresa"
                className="h-10"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-medium text-sm">
                Telefone
              </Label>
              <Controller
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    {...field}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="h-10"
                    maxLength={15}
                  />
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="font-medium text-sm">
                WhatsApp
              </Label>
              <Controller
                name="whatsapp"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="whatsapp"
                    {...field}
                    onChange={(e) => field.onChange(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="h-10"
                    maxLength={15}
                  />
                )}
              />
              {form.formState.errors.whatsapp && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.whatsapp.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cnpj" className="font-medium text-sm">
                CPF/CNPJ
              </Label>
              <Controller
                name="cnpj"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="cnpj"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      let masked = e.target.value
                      if (val.length <= 11)
                        masked = maskCPF(e.target.value)
                      else masked = maskCNPJ(e.target.value)
                      field.onChange(masked)
                    }}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className="h-10"
                    maxLength={18}
                  />
                )}
              />
              {form.formState.errors.cnpj && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-medium text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="exemplo@dominio.com"
                className="h-10"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Endereço */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_zip" className="font-bold text-sm text-slate-800">
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
                      onChange={(e) =>
                        field.onChange(maskCEP(e.target.value))
                      }
                      onBlur={handleSearchCEP}
                      placeholder="00000-000"
                      className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950 tabular-nums pr-8"
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
              <Label htmlFor="address_street" className="font-bold text-sm text-slate-800">
                Logradouro
              </Label>
              <Input
                id="address_street"
                {...form.register('address_street')}
                className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
                placeholder="Rua, Av., etc."
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_number" className="font-bold text-sm text-slate-800">
                Número
              </Label>
              <Input
                id="address_number"
                {...form.register('address_number')}
                placeholder="123"
                className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label
                htmlFor="address_complement"
                className="font-bold text-sm text-slate-800"
              >
                Complemento
              </Label>
              <Input
                id="address_complement"
                {...form.register('address_complement')}
                placeholder="Apto, sala, etc."
                className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label
                htmlFor="address_neighborhood"
                className="font-bold text-sm text-slate-800"
              >
                Bairro
              </Label>
              <Input
                id="address_neighborhood"
                {...form.register('address_neighborhood')}
                placeholder="Bairro"
                className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
              />
            </div>

            <div className="col-span-12 sm:col-span-8 space-y-1.5">
              <Label htmlFor="address_city" className="font-bold text-sm text-slate-800">
                Cidade
              </Label>
              <Input
                id="address_city"
                {...form.register('address_city')}
                placeholder="Cidade"
                className="h-10 rounded-lg bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-950"
              />
            </div>

            <div className="col-span-12 sm:col-span-4 space-y-1.5">
              <Label htmlFor="address_state" className="font-bold text-sm text-slate-800">
                Estado
              </Label>
              <Select
                onValueChange={(val) =>
                  form.setValue('address_state', val || undefined)
                }
                value={form.watch('address_state') ?? undefined}
              >
                <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 focus:ring-1 focus:ring-slate-950 text-slate-700">
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-8 font-semibold gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </div>
    </form>
  )
}
