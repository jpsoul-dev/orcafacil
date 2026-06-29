'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { User, ShieldCheck, CreditCard, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword } from '@/app/auth/actions'
import { passwordSchema } from '@/lib/validations/auth'
import Link from 'next/link'
import { createPortalAction, getActiveSubscriptionDetails } from '@/app/pricing/server-actions'


const managePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type PasswordForm = z.infer<typeof managePasswordSchema>

interface ManageAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { name: string; email: string; avatar?: string }
  hasPasswordInitial: boolean
  subscriptionStatus: string | null
  cancelAt: string | null
  trialEndsAt: string | null
}

export function ManageAccountModal({
  open,
  onOpenChange,
  user,
  hasPasswordInitial,
}: ManageAccountModalProps) {
  const [, setHasPassword] = useState(hasPasswordInitial)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoadingSub, setIsLoadingSub] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [subDetails, setSubDetails] = useState<{
    planName: string | null
    price: string | null
    status: string | null
    trialEndsAt: string | null
    cancelAt: string | null
    nextBillingDate: string | null
    error?: string
  } | null>(null)

  useEffect(() => {
    if (!open) return

    if (activeTab === 'subscription' && !subDetails && !isLoadingSub) {
      setTimeout(() => {
        setIsLoadingSub(true)
      }, 0)
      getActiveSubscriptionDetails()
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error || 'Ocorreu um erro ao carregar os dados da assinatura.')
            setSubDetails({
              planName: null,
              price: null,
              status: 'error',
              trialEndsAt: null,
              cancelAt: null,
              nextBillingDate: null,
              error: data.error || 'Erro ao carregar dados'
            })
          } else {
            setSubDetails(data)
          }
          setIsLoadingSub(false)
        })
        .catch(() => {
          toast.error('Erro de comunicação ao carregar a assinatura.')
          setSubDetails({
            planName: null,
            price: null,
            status: 'error',
            trialEndsAt: null,
            cancelAt: null,
            nextBillingDate: null,
            error: 'Erro de comunicação com o provedor de pagamentos'
          })
          setIsLoadingSub(false)
        })
    }
  }, [activeTab, subDetails, isLoadingSub, open])

  const handleManageSubscription = () => {
    startTransition(async () => {
      try {
        await createPortalAction()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage === 'NEXT_REDIRECT' || errorMessage.includes('NEXT_REDIRECT')) {
          return
        }
        toast.error(errorMessage || 'Erro ao redirecionar para o portal do cliente.')
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSubDetails(null)
      setActiveTab('profile')
    }
    onOpenChange(newOpen)
  }

  const form = useForm<PasswordForm>({
    resolver: zodResolver(managePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordForm) {
    setIsLoading(true)
    try {
      const result = await updatePassword(data.password)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Senha atualizada com sucesso!')
        setHasPassword(true)
        form.reset()
      }
    } catch {
      toast.error('Ocorreu um erro ao atualizar a senha.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full p-0 overflow-hidden gap-0">
        <DialogHeader className="p-8 border-b">
          <DialogTitle className="text-2xl font-bold">Conta</DialogTitle>
          <DialogDescription className="text-base">
            Gerencie seu perfil e segurança.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex w-full h-150"
        >
          <TabsList className="w-64 bg-muted/30 border-r rounded-none p-4 shrink-0 flex flex-col gap-2">
            <TabsTrigger
              value="profile"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium data-active:bg-background data-active:shadow-sm transition-all"
            >
              <User className="size-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium data-active:bg-background data-active:shadow-sm transition-all"
            >
              <ShieldCheck className="size-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium data-active:bg-background data-active:shadow-sm transition-all"
            >
              <CreditCard className="size-4" />
              Assinatura
            </TabsTrigger>
          </TabsList>


          <div className="flex-1 min-w-0 overflow-y-auto">
            <TabsContent
              value="profile"
              className="m-0 p-10 max-w-2xl space-y-8"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Seu Perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas da sua conta que são visíveis para você.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nome de perfil</Label>
                  <Input
                    value={user.name}
                    disabled
                    className="bg-muted/50 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Endereço de e-mail
                  </Label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-muted/50 h-11"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="security"
              className="m-0 p-10 max-w-2xl space-y-10"
            >
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">Senha</h3>
                  <p className="text-sm text-muted-foreground">
                    Use uma senha forte e única para garantir a segurança da sua
                    conta.
                  </p>
                </div>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nova senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="h-11"
                        {...form.register('password')}
                      />
                      {form.formState.errors.password ? (
                        <p className="text-xs text-destructive font-medium">
                          {form.formState.errors.password.message}
                        </p>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-muted-foreground/10">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary/70" />
                          <span>Mínimo 6 caracteres, letras (A-z) e números.</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="h-11"
                        {...form.register('confirmPassword')}
                      />
                      {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive font-medium">
                          {form.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 px-8"
                  >
                    {isLoading ? 'Salvando...' : 'Alterar senha'}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent
              value="subscription"
              className="m-0 p-10 max-w-2xl space-y-8"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Assinatura</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie sua assinatura do OrçaFácil e detalhes de faturamento.
                </p>
              </div>

              {isLoadingSub || !subDetails ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-11 w-44 bg-muted rounded animate-pulse pt-2" />
                </div>
              ) : subDetails.status === 'error' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center space-y-4">
                    <p className="text-sm font-medium text-destructive leading-relaxed">
                      {subDetails.error || 'Ocorreu um erro ao carregar os dados da assinatura.'}
                    </p>
                    <Button
                      onClick={() => setSubDetails(null)}
                      variant="outline"
                      className="h-10 px-5 font-bold cursor-pointer"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                </div>
              ) : !subDetails.planName && !['active', 'trialing', 'past_due', 'paused'].includes(subDetails.status || '') ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-muted/20 border border-muted/50 rounded-xl p-8 text-center space-y-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                      <Zap className="h-6 w-6 text-primary fill-primary/10" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h4 className="text-lg font-bold">Faça o upgrade para o Plano Pro</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Crie orçamentos ilimitados, monte um catálogo de produtos e serviços profissional e envie recibos automáticos para seus clientes.
                      </p>
                    </div>
                    <Link href="/pricing" className="inline-block">
                      <Button className="h-11 px-8 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                        Assinar Plano Pro
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1 text-left">
                    <span className="text-[11px] uppercase font-bold text-muted-foreground/50 tracking-wider">
                      Plano Atual
                    </span>
                    <h4 className="text-lg font-bold text-foreground">
                      {subDetails.planName || 'Avaliação Gratuita'}
                    </h4>
                    {subDetails.price && (
                      <p className="text-sm font-semibold text-muted-foreground/80">
                        {subDetails.price}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    {subDetails.status === 'trialing' ? (
                      <Link href="/pricing" className="inline-block">
                        <Button className="h-11 px-6 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                          Assinar Plano Pro
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={handleManageSubscription}
                        disabled={isPending}
                        className="h-11 px-6 font-bold cursor-pointer"
                      >
                        {isPending ? 'Redirecionando...' : 'Gerenciar Assinatura'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
