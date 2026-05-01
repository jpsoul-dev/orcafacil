'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Rocket, Store, MessageSquare, ArrowRight } from 'lucide-react'
import { maskPhone } from '@/lib/masks'
import { saveOnboarding } from './actions'

const onboardingSchema = z.object({
  name: z.string().min(3, 'O nome do negócio deve ter pelo menos 3 caracteres'),
  phone: z.string().min(14, 'Informe um WhatsApp válido'),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  })

  async function onSubmit(data: OnboardingValues) {
    setLoading(true)
    try {
      const result = await saveOnboarding(data)
      if (result.success) {
        toast.success('Perfil configurado com sucesso!')
        router.refresh()
        router.push('/app')
      } else {
        toast.error(result.error || 'Ocorreu um erro ao salvar')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20 mb-4">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bem-vindo ao OrçaFácil!</h1>
          <p className="text-slate-500 font-medium">Estamos quase prontos. Conte-nos um pouco sobre o seu negócio para começar.</p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Store className="h-3.5 w-3.5" /> Nome do seu Negócio
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: Pinturas Silva ou Tech Solutions"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-base"
                    disabled={loading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp de Contato
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    {...form.register('phone')}
                    onChange={(e) => form.setValue('phone', maskPhone(e.target.value))}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-base tabular-nums"
                    disabled={loading}
                    maxLength={15}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-xs font-bold text-red-500 animate-in slide-in-from-top-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 font-medium italic">
          Você poderá alterar essas informações e adicionar sua logo nas configurações mais tarde.
        </p>
      </div>
    </div>
  )
}
