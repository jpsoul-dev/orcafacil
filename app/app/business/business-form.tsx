'use client'

import { saveCompanySettings } from '@/app/app/settings/actions'
import { maskCEP, maskCNPJ, maskCPF, maskPhone } from '@/lib/masks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { Controller, Resolver, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { Building2, Check, Search, Upload } from 'lucide-react'
import Image from 'next/image'

const businessSchema = z.object({
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

type BusinessValues = z.infer<typeof businessSchema>

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

const getCreationText = (createdAt?: string) => {
  if (!createdAt) return ''
  try {
    const date = new Date(createdAt)
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' })
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    const year = date.getFullYear()
    return `Desde ${capitalizedMonth} de ${year}`
  } catch (_err) {
    return ''
  }
}

export function BusinessForm({ initialData }: { initialData: Company | null }) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [searchingCEP, setSearchingCEP] = useState(false)
  const lastSearchedCep = useRef<string>('')

  const [logoPreview, setLogoPreview] = useState<string>(initialData?.logo_url || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de imagem inválido. Use PNG, JPG ou WEBP.')
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

  const form = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema) as Resolver<BusinessValues>,
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

  const watchName = useWatch({
    control: form.control,
    name: 'name',
  })

  const watchAddressState = useWatch({
    control: form.control,
    name: 'address_state',
  })

  async function onSubmit(data: BusinessValues) {
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
      setSaved(true)
      toast.success('Configurações salvas!')
      setLogoFile(null)
      // Reset dirty state dynamically after save
      form.reset(data)
      setTimeout(() => setSaved(false), 2000)
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

  const isFormDirty = form.formState.isDirty || logoFile !== null || removeLogo

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 pb-32">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* Cabeçalho de Perfil Humano */}
        <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-border">
          <div className="relative h-24 w-24 rounded-2xl border border-border bg-muted flex items-center justify-center overflow-hidden shadow-sm">
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

          <div className="mt-4 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {watchName || 'Seu Negócio'}
            </h1>
            {initialData?.created_at && (
              <p className="text-sm text-muted-foreground">
                {getCreationText(initialData.created_at)}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
                className="h-8 px-3 text-xs font-medium rounded-md gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Trocar imagem
              </Button>
              {logoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="h-8 px-3 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                >
                  Remover
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              PNG • JPG • WEBP (Máx. 2MB)
            </p>
          </div>
        </div>

        {/* Seção Informações do Negócio */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Informações do negócio
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                Nome do negócio *
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ex: Terra Norte Ferragista"
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
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
                    maxLength={15}
                    className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-xs font-medium text-muted-foreground">
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
                    maxLength={15}
                    className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                )}
              />
              {form.formState.errors.whatsapp && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.whatsapp.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnpj" className="text-xs font-medium text-muted-foreground">
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
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                    className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                )}
              />
              {form.formState.errors.cnpj && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="email@exemplo.com"
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Seção Endereço */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Endereço
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            <div className="col-span-12 md:col-span-4 space-y-1.5">
              <Label htmlFor="address_zip" className="text-xs font-medium text-muted-foreground">
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
                      className="h-10 pr-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                      maxLength={9}
                    />
                  )}
                />
                {searchingCEP ? (
                  <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Search
                    onClick={handleSearchCEP}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  />
                )}
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-1.5">
              <Label htmlFor="address_street" className="text-xs font-medium text-muted-foreground">
                Logradouro
              </Label>
              <Input
                id="address_street"
                {...form.register('address_street')}
                placeholder="Rua, Av., etc."
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            <div className="col-span-12 md:col-span-3 space-y-1.5">
              <Label htmlFor="address_number" className="text-xs font-medium text-muted-foreground">
                Número
              </Label>
              <Input
                id="address_number"
                {...form.register('address_number')}
                placeholder="123"
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-1.5">
              <Label htmlFor="address_complement" className="text-xs font-medium text-muted-foreground">
                Complemento
              </Label>
              <Input
                id="address_complement"
                {...form.register('address_complement')}
                placeholder="Apto, sala, etc."
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            <div className="col-span-12 md:col-span-5 space-y-1.5">
              <Label htmlFor="address_neighborhood" className="text-xs font-medium text-muted-foreground">
                Bairro
              </Label>
              <Input
                id="address_neighborhood"
                {...form.register('address_neighborhood')}
                placeholder="Bairro"
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            <div className="col-span-12 md:col-span-8 space-y-1.5">
              <Label htmlFor="address_city" className="text-xs font-medium text-muted-foreground">
                Cidade
              </Label>
              <Input
                id="address_city"
                {...form.register('address_city')}
                placeholder="Cidade"
                className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            <div className="col-span-12 md:col-span-4 space-y-1.5">
              <Label htmlFor="address_state" className="text-xs font-medium text-muted-foreground">
                Estado
              </Label>
              <Select
                onValueChange={(val) =>
                  form.setValue('address_state', val || undefined)
                }
                value={watchAddressState ?? undefined}
              >
                <SelectTrigger className="h-10 bg-transparent border-border hover:border-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
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

        {/* Barra Sticky no Rodapé */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border py-4">
          <div className="max-w-2xl mx-auto px-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset()
                setLogoPreview(initialData?.logo_url || '')
                setLogoFile(null)
                setRemoveLogo(false)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              disabled={loading || !isFormDirty}
              className="text-muted-foreground hover:text-foreground text-sm font-medium h-9 px-4 rounded-md"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || saved || !isFormDirty}
              className={cn(
                "px-6 h-9 transition-colors duration-ds-fast text-sm font-semibold rounded-md",
                saved ? "bg-success text-success-foreground hover:bg-success/90" : ""
              )}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Salvando...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvo
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
