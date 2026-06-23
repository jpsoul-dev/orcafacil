'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Zap,
  ArrowRight,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { passwordSchema } from '@/lib/validations/auth'

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: ResetPasswordSchema) {
    try {
      const result = await updatePassword(data.password)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Senha redefinida com sucesso!')
        router.push('/app')
      }
    } catch {
      toast.error('Ocorreu um erro ao atualizar a senha.')
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
            Segurança em primeiro lugar.
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
            Redefina sua senha de forma simples e rápida para continuar emitindo
            seus orçamentos com total tranquilidade.
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
              Redefinir Senha
            </h2>
            <p className="text-muted-foreground text-ds-body-sm font-medium">
              Escolha uma nova senha segura para sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Nova Senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 rounded-sm bg-card border-border focus-visible:ring-ring transition-all duration-ds-fast text-ds-body-md placeholder:text-muted-foreground/50"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60 hover:text-foreground transition-all duration-ds-fast"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs font-semibold text-destructive px-1">
                  {errors.password.message}
                </p>
              ) : (
                <div className="flex items-start gap-1.5 text-ds-body-sm text-muted-foreground bg-muted/30 p-2.5 rounded-md border border-border/50">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Mínimo 6 caracteres, com letra maiúscula, minúscula e número.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 rounded-sm bg-card border-border focus-visible:ring-ring transition-all duration-ds-fast text-ds-body-md placeholder:text-muted-foreground/50"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60 hover:text-foreground transition-all duration-ds-fast"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-destructive px-1">
                  {errors.confirmPassword.message}
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  Redefinir Senha
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-ds-body-sm text-muted-foreground font-medium pt-2">
            Lembrou sua senha?{' '}
            <Link
              href="/login"
              className="font-bold text-primary hover:text-primary-hover transition-colors hover:underline underline-offset-4"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
