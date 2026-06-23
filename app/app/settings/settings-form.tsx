'use client'

import { useState, useRef } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
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
import { ImageIcon, Building2, MapPin, Loader2, Upload, Search, FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

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
  show_quote_number: z.boolean().optional().default(true),
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
  show_quote_number?: boolean | null
}

export function SettingsForm({ initialData }: { initialData: Company | null }) {
  const [loading, setLoading] = useState(false)
  const [searchingCEP, setSearchingCEP] = useState(false)
  const lastSearchedCep = useRef<string>('')

  const [logoPreview, setLogoPreview] = useState<string>(initialData?.logo_url || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const processFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de imagem inválido. Use PNG, JPG, WEBP ou SVG.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O tamanho da imagem não deve exceder 2MB.')
      return
    }

    setLogoFile(file)
    setRemoveLogo(false)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview('')
    setLogoFile(null)
    setRemoveLogo(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsValues>,
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
      show_quote_number: initialData?.show_quote_number ?? true,
    },
  })

  async function onSubmit(data: SettingsValues) {
    setLoading(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false')
      } else {
        formData.append(key, value || '')
      }
    })
    
    if (logoFile) {
      formData.append('logo', logoFile)
    }
    if (removeLogo) {
      formData.append('remove_logo', 'true')
    }

    const result = await saveCompanySettings(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configurações salvas!')
      setLogoFile(null)
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
    <div className="max-w-[720px] mx-auto w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Card Logotipo */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-ds-body-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <ImageIcon className="h-4 w-4" />
              Logotipo da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5 flex flex-col md:flex-row items-center gap-6">
            {/* Visualizador da Logo */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-md border border-border bg-muted overflow-hidden shadow-sm">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo do Negócio"
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <Building2 className="h-8 w-8 text-muted-foreground/60 mb-1" />
                  <span className="text-[10px] text-muted-foreground font-medium">Sem Logo</span>
                </div>
              )}
            </div>

            {/* Zona de Drop/Click para Upload */}
            <div className="flex-1 w-full">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={cn(
                  "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-ds-fast",
                  isDragOver
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 bg-card hover:bg-muted/30"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                />
                <Upload className={cn("h-6 w-6 mb-2 text-muted-foreground transition-transform duration-ds-fast", isDragOver && "scale-110 text-primary")} />
                <p className="text-ds-body-sm font-bold text-foreground">
                  Arraste seu logotipo aqui ou clique para selecionar
                </p>
                <p className="text-ds-caption text-muted-foreground mt-1 font-medium">
                  PNG, JPG, WEBP ou SVG (Máx. 2MB)
                </p>
              </div>
              
              {logoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold rounded-sm h-8"
                >
                  Remover logotipo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card Dados da Empresa */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-ds-body-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              Informações do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nome do negócio *
                </Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
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
                <Label htmlFor="whatsapp" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
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
                <Label htmlFor="cnpj" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
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
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
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
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-ds-body-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <MapPin className="h-4 w-4" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label htmlFor="address_zip" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast pr-8"
                        maxLength={9}
                      />
                    )}
                  />
                  {searchingCEP ? (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search
                      onClick={handleSearchCEP}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    />
                  )}
                </div>
              </div>

              <div className="col-span-12 sm:col-span-8 space-y-1.5">
                <Label htmlFor="address_street" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Logradouro
                </Label>
                <Input
                  id="address_street"
                  {...form.register('address_street')}
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
                  placeholder="Rua, Av., etc."
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label htmlFor="address_number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Número
                </Label>
                <Input
                  id="address_number"
                  {...form.register('address_number')}
                  placeholder="123"
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label
                  htmlFor="address_complement"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Complemento
                </Label>
                <Input
                  id="address_complement"
                  {...form.register('address_complement')}
                  placeholder="Apto, sala, etc."
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label
                  htmlFor="address_neighborhood"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Bairro
                </Label>
                <Input
                  id="address_neighborhood"
                  {...form.register('address_neighborhood')}
                  placeholder="Bairro"
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
                />
              </div>

              <div className="col-span-12 sm:col-span-8 space-y-1.5">
                <Label htmlFor="address_city" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cidade
                </Label>
                <Input
                  id="address_city"
                  {...form.register('address_city')}
                  placeholder="Cidade"
                  className="h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-1.5">
                <Label htmlFor="address_state" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Estado
                </Label>
                <Select
                  onValueChange={(val) =>
                    form.setValue('address_state', val || undefined)
                  }
                  value={form.watch('address_state') ?? undefined}
                >
                  <SelectTrigger className="h-10 rounded-sm border-border bg-card text-ds-body-md focus:ring-ring text-foreground transition-all duration-ds-fast">
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

        {/* Card Preferências do Orçamento */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-ds-body-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              Preferências dos Orçamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Controller
                  name="show_quote_number"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="show_quote_number"
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="rounded-sm border-border text-primary focus:ring-ring h-4 w-4 mt-0.5 cursor-pointer accent-primary"
                    />
                  )}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="show_quote_number"
                    className="font-bold text-ds-body-sm text-foreground cursor-pointer select-none"
                  >
                    Exibir número do orçamento nos documentos
                  </Label>
                  <p className="text-ds-caption text-muted-foreground font-medium">
                    Quando ativado, os orçamentos gerados e visualizados exibirão o número de controle sequencial (ex: N° 1024).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] px-8 h-10 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Salvando...
              </>
            ) : (
              'Salvar Configurações'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
