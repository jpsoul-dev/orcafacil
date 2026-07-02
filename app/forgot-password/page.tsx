'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendPasswordReset } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Zap,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: ForgotPasswordSchema) {
    try {
      const result = await sendPasswordReset(data.email)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Link de recuperação enviado!')
        setSuccess(true)
      }
    } catch {
      toast.error('Erro ao enviar e-mail de recuperação.')
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado esquerdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12 text-white">
        {/* Camada de Gradiente e Grid */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-950 via-slate-900 to-black z-0" />
        <div
          className="absolute inset-0 opacity-5 z-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Zap
                className="h-6 w-6 text-indigo-400"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">
              OrçaFácil
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Recupere seu acesso rápido.
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
            Não se preocupe! Insira seu e-mail de cadastro e enviaremos instruções
            para que você possa redefinir sua senha com segurança.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <p className="text-slate-500 text-sm font-medium">
            © 2025 OrçaFácil
          </p>
        </div>
      </div>

      {/* Lado direito — Formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 lg:hidden mb-4 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary shadow-sm shadow-primary/10">
              <Zap
                className="h-6 w-6 text-white"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            <span className="font-bold text-xl tracking-tighter text-foreground">
              OrçaFácil
            </span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground">
              Recuperar Senha
            </h2>
            <p className="text-muted-foreground text-ds-body-sm font-medium">
              Insira seu e-mail para receber o link de redefinição.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-6 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-ds-heading-xs font-bold text-foreground">E-mail enviado!</h3>
                <p className="text-ds-body-sm text-muted-foreground leading-relaxed">
                  Enviamos as instruções de recuperação. Por favor, verifique sua caixa de entrada e spam.
                </p>
              </div>
              <Link href="/login" className="inline-block w-full">
                <Button className="w-full h-11 rounded-md font-semibold bg-primary hover:bg-primary-hover text-primary-foreground gap-2 transition-all duration-ds-fast shadow-sm hover:scale-[1.01] active:scale-[0.99]">
                  <ArrowLeft className="h-4 w-4" /> Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  E-mail
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-11 h-11 rounded-sm bg-card border-border focus-visible:ring-ring transition-all duration-ds-fast text-ds-body-md placeholder:text-muted-foreground/50"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive px-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full h-11 rounded-md font-semibold gap-2 bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-ds-fast shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar link de recuperação
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-ds-body-sm font-bold text-primary hover:text-primary-hover transition-colors hover:underline underline-offset-4"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
