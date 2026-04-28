'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCompanySettings } from './actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

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

export function SettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || null)
  
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
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || '')
    })

    // Add logo if selected
    const fileInput = document.getElementById('logo') as HTMLInputElement
    if (fileInput?.files?.[0]) {
      formData.append('logo', fileInput.files[0])
    }
    
    if (initialData?.logo_url) {
      formData.append('existing_logo_url', initialData.logo_url)
    }

    const result = await saveCompanySettings(formData)
    
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configurações salvas com sucesso!')
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB")
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const checkCEP = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          form.setValue('address_street', data.logradouro)
          form.setValue('address_neighborhood', data.bairro)
          form.setValue('address_city', data.localidade)
          form.setValue('address_state', data.uf)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Logotipo</h3>
            <div className="flex items-center gap-6">
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                  <Image src={logoPreview} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center text-muted-foreground text-sm">
                  Sem logo
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="logo">Alterar Logotipo</Label>
                <Input id="logo" type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                <p className="text-xs text-muted-foreground">Recomendado: 500x500px, JPG ou PNG de até 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input id="name" {...form.register('name')} placeholder="Sua Empresa LTDA" />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp *</Label>
              <Input id="phone" {...form.register('phone')} placeholder="(00) 00000-0000" />
              {form.formState.errors.phone && <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg border-t pt-4">Endereço</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address_zip">CEP</Label>
                <Input id="address_zip" {...form.register('address_zip')} placeholder="00000-000" onBlur={checkCEP} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address_street">Rua / Logradouro</Label>
                <Input id="address_street" {...form.register('address_street')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_number">Número</Label>
                <Input id="address_number" {...form.register('address_number')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input id="address_complement" {...form.register('address_complement')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input id="address_neighborhood" {...form.register('address_neighborhood')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Cidade</Label>
                <Input id="address_city" {...form.register('address_city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_state">Estado (UF)</Label>
                <Input id="address_state" {...form.register('address_state')} maxLength={2} />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
