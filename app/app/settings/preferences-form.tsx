'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { saveCompanySettings } from './actions'

import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Palette, Sun, Moon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'

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

export function PreferencesForm({ initialData }: { initialData: Company | null }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false')
      } else {
        formData.append(key, value || '')
      }
    })

    const result = await saveCompanySettings(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Preferências salvas!')
    }
  }

  return (
    <div className="max-w-180 mx-auto w-full space-y-6">
      {/* Card Preferências do Orçamento */}
      <Card className="-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-x-0 sm:border-x shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-ds-body-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            Preferências dos Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
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
              <Controller
                name="show_quote_number"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    id="show_quote_number"
                    checked={field.value ?? true}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      const currentData = form.getValues()
                      currentData.show_quote_number = checked
                      onSubmit(currentData)
                    }}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border mt-4">
              <div className="space-y-1">
                <Label className="font-bold text-ds-body-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <Palette className="h-4 w-4" />
                  Tema do Sistema
                </Label>
                <p className="text-ds-caption text-muted-foreground font-medium">
                  Alternar entre tema Claro e Escuro.
                </p>
              </div>
              {mounted && (
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    aria-label="Alternar modo escuro"
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
