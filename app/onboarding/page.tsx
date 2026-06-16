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

interface MarketSegmentCategory {
  category: string
  items: string[]
}

const MARKET_SEGMENTS: MarketSegmentCategory[] = [
  {
    category: 'CONSTRUÇÃO CIVIL E REFORMAS',
    items: [
      'Pedreiro / Construção',
      'Pintor',
      'Eletricista',
      'Encanador',
      'Gesseiro / Drywall',
      'Marcenaria',
      'Serralheria',
      'Vidraçaria',
      'Telhados e Impermeabilização',
      'Piscineiro',
      'Paisagismo e Jardinagem',
      'Arquitetura',
      'Engenharia Civil',
      'Demolição e Terraplanagem',
    ],
  },
  {
    category: 'AUTOMOTIVO',
    items: [
      'Oficina Mecânica',
      'Funilaria e Pintura Automotiva',
      'Auto Elétrica',
      'Borracharia',
      'Estética Automotiva (Lavagem e Polimento)',
      'Som e Acessórios Automotivos',
      'Guincho e Reboque',
      'Locação de Veículos',
    ],
  },
  {
    category: 'TECNOLOGIA',
    items: [
      'Desenvolvimento de Software',
      'Suporte e Manutenção de TI',
      'Web Design / Web Development',
      'Marketing Digital',
      'Agência de Marketing',
      'Design Gráfico',
      'Fotografia',
      'Filmagem e Produção de Vídeo',
      'Telecomunicações e Redes',
    ],
  },
  {
    category: 'SERVIÇOS PROFISSIONAIS E CONSULTORIA',
    items: [
      'Consultoria',
      'Contabilidade',
      'Advocacia',
      'Recursos Humanos',
      'Tradução e Idiomas',
      'Freelancer',
      'Prestação de Serviços (Geral)',
    ],
  },
  {
    category: 'SAÚDE E BEM-ESTAR',
    items: [
      'Clínica Médica',
      'Clínica Odontológica',
      'Fisioterapia',
      'Estética e Beleza',
      'Personal Trainer / Academia',
      'Nutrição',
      'Psicologia',
      'Veterinária',
    ],
  },
  {
    category: 'EVENTOS',
    items: [
      'Buffet e Catering',
      'Decoração de Eventos',
      'Cerimonial e Assessoria de Eventos',
      'DJ e Som para Eventos',
      'Locação de Equipamentos para Festas',
      'Confeitaria e Doces',
    ],
  },
  {
    category: 'MANUTENÇÃO E REPAROS RESIDENCIAIS',
    items: [
      'Manutenção Predial',
      'Chaveiro',
      'Climatização (Ar-condicionado e Refrigeração)',
      'Limpeza e Higienização',
      'Controle de Pragas (Dedetização)',
      'Instalação de Móveis',
      'Marido de Aluguel',
      'Jardinagem e Piscinas (Manutenção)',
    ],
  },
  {
    category: 'INDÚSTRIA E PRODUÇÃO',
    items: [
      'Indústria / Fábrica',
      'Metalurgia',
      'Gráfica e Impressão',
      'Confecção e Costura',
      'Marcenaria Industrial',
    ],
  },
  {
    category: 'AGRONEGÓCIO',
    items: [
      'Agricultura',
      'Pecuária',
      'Serviços Rurais e Maquinário Agrícola',
    ],
  },
  {
    category: 'TRANSPORTE E LOGÍSTICA',
    items: [
      'Transportadora',
      'Mudanças',
      'Frete e Entregas',
      'Logística',
    ],
  },
  {
    category: 'EDUCAÇÃO',
    items: [
      'Aulas Particulares',
      'Cursos e Treinamentos',
      'Coaching e Mentoria',
    ],
  },
  {
    category: 'OUTROS',
    items: [
      'Comércio / Varejo',
      'Imobiliário',
      'Segurança Patrimonial',
      'Outro',
    ],
  },
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs mb-2">
            <Rocket className="h-6 w-6 text-slate-800" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bem-vindo ao OrçaFácil
          </h1>
          <p className="text-slate-500 text-sm">
            Estamos quase prontos. Conte-nos um pouco sobre o seu negócio para
            começar.
          </p>
        </div>

        <Card className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                  >
                    <Store className="h-3.5 w-3.5 text-slate-400" /> Nome do seu Negócio
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Ex: Pinturas Silva ou Tech Solutions"
                    className="h-11 rounded-lg border-slate-200 bg-white focus-visible:border-slate-400 focus-visible:ring-0 text-slate-900 placeholder-slate-400 transition-all text-sm"
                    disabled={loading}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs font-medium text-red-600 animate-in slide-in-from-top-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="industry"
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Seguimento de mercado
                  </Label>
                  <div className="relative">
                    <select
                      id="industry"
                      {...form.register('industry')}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white focus:border-slate-400 focus:ring-0 text-slate-900 transition-all text-sm appearance-none cursor-pointer"
                      disabled={loading}
                      defaultValue=""
                    >
                      <option value="" disabled className="text-slate-400">
                        Selecione seu segmento...
                      </option>
                      {MARKET_SEGMENTS.map((group) => (
                        <optgroup key={group.category} label={group.category} className="bg-white text-slate-800 font-semibold text-xs">
                          {group.items.map((item) => (
                            <option key={item} value={item} className="text-slate-700 font-normal text-sm">
                              {item}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
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
                    <p className="text-xs font-medium text-red-600 animate-in slide-in-from-top-1">
                      {form.formState.errors.industry.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-all active:scale-95 group flex items-center justify-center gap-2 cursor-pointer"
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

        <p className="text-center text-xs text-slate-400 font-medium italic">
          Você poderá alterar essas informações mais tarde.
        </p>
      </div>
    </div>
  )
}
