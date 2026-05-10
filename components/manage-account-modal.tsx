'use client'

import { useState } from 'react'
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
import { User, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword } from '@/app/auth/actions'
import { passwordSchema } from '@/lib/validations/auth'

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
}

export function ManageAccountModal({
  open,
  onOpenChange,
  user,
  hasPasswordInitial,
}: ManageAccountModalProps) {
  const [hasPassword, setHasPassword] = useState(hasPasswordInitial)
  const [isLoading, setIsLoading] = useState(false)

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full p-0 overflow-hidden gap-0">
        <DialogHeader className="p-8 border-b">
          <DialogTitle className="text-2xl font-bold">Conta</DialogTitle>
          <DialogDescription className="text-base">
            Gerencie seu perfil e segurança.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="security"
          orientation="vertical"
          className="flex w-full h-[600px]"
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
                  <Label className="text-sm font-semibold">Nome completo</Label>
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

              <div className="pt-6 border-t">
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-destructive">
                        Excluir conta
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Ao excluir sua conta, todos os seus dados serão
                        removidos permanentemente. Esta ação não pode ser
                        desfeita.
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" className="h-10">
                    Encerrar conta
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
