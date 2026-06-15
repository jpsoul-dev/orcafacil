'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Rocket, Store, Briefcase, ArrowRight } from 'lucide-react'
import { saveOnboarding } from './actions'
import { onboardingSchema, type OnboardingValues } from './schemas'

const INDUSTRIES = [
  'Prestação de Serviços',
  'Freelancer',
  'Marcenaria',
  'Agência de Marketing',
  'Consultoria',
  'Outro'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      industry: '',
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
      toast.error(`Erro de conexão: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl mb-2">
            <Rocket className="h-6 w-6 text-zinc-100" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Bem-vindo ao OrçaFácil
          </h1>
          <p className="text-zinc-400 text-sm">
            Estamos quase prontos. Conte-nos um pouco sobre o seu negócio para
            começar.
          </p>
        </div>

        <Card className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-[#101112]/90 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"
                  >
                    <Store className="h-3.5 w-3.5" /> Nome do seu Negócio
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: Pinturas Silva ou Tech Solutions"
                    className="h-11 rounded-lg border-zinc-800 bg-[#161718] focus:border-zinc-700 focus:bg-[#1c1d1e] focus:ring-0 text-white placeholder-zinc-600 transition-all text-sm"
                    disabled={loading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs font-medium text-red-400 animate-in slide-in-from-top-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="industry"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2"
                  >
                    <Briefcase className="h-3.5 w-3.5" /> Ramo de Atuação
                  </Label>
                  <div className="relative">
                    <select
                      id="industry"
                      {...form.register('industry')}
                      className="w-full h-11 px-3 rounded-lg border border-zinc-800 bg-[#161718] focus:border-zinc-700 focus:bg-[#1c1d1e] focus:ring-0 text-white placeholder-zinc-600 transition-all text-sm appearance-none cursor-pointer"
                      disabled={loading}
                      defaultValue=""
                    >
                      <option value="" disabled className="text-zinc-600">
                        Selecione seu ramo...
                      </option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-[#101112]">
                          {ind}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {form.formState.errors.industry && (
                    <p className="text-xs font-medium text-red-400 animate-in slide-in-from-top-1">
                      {form.formState.errors.industry.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm rounded-lg transition-all active:scale-95 group flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Configurar conta
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-zinc-500 font-medium italic">
          Você poderá alterar essas informações mais tarde.
        </p>
      </div>
    </div>
  )
}
