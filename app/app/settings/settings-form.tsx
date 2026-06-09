'use client'

import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCompanySettings } from './actions'
import { maskCEP, maskCNPJ } from '@/lib/masks'

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
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
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
  phone: string
  logo_url: string | null
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
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logo_url || null,
  )
  const [searchingCEP, setSearchingCEP] = useState(false)
  const lastSearchedCep = useRef<string>('')

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
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
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput?.files?.[0]) formData.append('logo', fileInput.files[0])
    if (initialData?.logo_url)
      formData.append('existing_logo_url', initialData.logo_url)
    const result = await saveCompanySettings(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configurações salvas!')
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB')
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
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
      {/* Card Logotipo */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Logotipo
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              {logoPreview ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border shadow-sm">
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center text-muted-foreground">
                  <Building2 className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-medium">Sem logo</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="logo" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/60 hover:border-muted-foreground/40 transition-all">
                  <Upload className="h-4 w-4 shrink-0" />
                  <span>Clique para selecionar uma imagem</span>
                </div>
                <Input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                PNG ou JPG, recomendado 500×500px, máximo 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Dados da Empresa */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-medium text-sm">
                Nome da Empresa *
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Sua Empresa LTDA"
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
                Telefone / WhatsApp *
              </Label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="(00) 00000-0000"
                className="h-10"
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cnpj" className="font-medium text-sm">
                CNPJ
              </Label>
              <Controller
                name="cnpj"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="cnpj"
                    {...field}
                    onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
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
