'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCompanySettings } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { ImageIcon, Building2, MapPin, Loader2, Upload } from 'lucide-react'

const settingsSchema = z.object({
  name: z.string().min(1, 'Nome da empresa é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
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

  const checkCEP = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')

    if (cep.length !== 8) return
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
      console.error(_err)
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address_zip" className="font-medium text-sm">
                CEP
              </Label>
              <div className="relative">
                <Input
                  id="address_zip"
                  {...form.register('address_zip')}
                  placeholder="00000-000"
                  onBlur={checkCEP}
                  className="h-10 pr-10"
                />
                {searchingCEP && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address_street" className="font-medium text-sm">
                Logradouro
              </Label>
              <Input
                id="address_street"
                {...form.register('address_street')}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address_number" className="font-medium text-sm">
                Número
              </Label>
              <Input
                id="address_number"
                {...form.register('address_number')}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="address_complement"
                className="font-medium text-sm"
              >
                Complemento
              </Label>
              <Input
                id="address_complement"
                {...form.register('address_complement')}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="address_neighborhood"
                className="font-medium text-sm"
              >
                Bairro
              </Label>
              <Input
                id="address_neighborhood"
                {...form.register('address_neighborhood')}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address_city" className="font-medium text-sm">
                Cidade
              </Label>
              <Input
                id="address_city"
                {...form.register('address_city')}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address_state" className="font-medium text-sm">
                Estado (UF)
              </Label>
              <Input
                id="address_state"
                {...form.register('address_state')}
                maxLength={2}
                className="h-10 uppercase"
              />
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
