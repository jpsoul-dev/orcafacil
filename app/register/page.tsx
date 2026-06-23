'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup, signInWithGoogle } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authSchema, type AuthSchema } from '@/lib/validations/auth'

export default function RegisterPage() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: AuthSchema) {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)

    const result = await signup(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Conta criada! Verifique seu e-mail para confirmar.')
      router.push('/login')
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

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Cresça seu negócio com profissionalismo.
            </h1>
            <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
              Junte-se a milhares de empreendedores que já simplificaram suas
              vendas e aumentaram seus fechamentos com o OrçaFácil.
            </p>
          </div>

          <div className="grid gap-4 pt-2">
            {[
              'Orçamentos profissionais em segundos',
              'Catálogo inteligente de produtos',
              'Link de compartilhamento exclusivo',
              'Personalização total com sua logo',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 text-slate-300 group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-base font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <p className="text-slate-500 text-sm font-medium">
            © 2025 OrçaFácil
          </p>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            <div className="h-1.5 w-8 rounded-full bg-indigo-500" />
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>
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
              Criar sua conta
            </h2>
            <p className="text-muted-foreground text-ds-body-sm font-medium">
              Comece a criar orçamentos profissionais grátis.
            </p>
          </div>

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Senha
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
                Confirmar Senha
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
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-semibold tracking-wider">
                ou continue com
              </span>
            </div>
          </div>

          <form
            action={async () => {
              setGoogleLoading(true)
              try {
                const result = await signInWithGoogle(window.location.origin)
                if (result?.error) {
                  toast.error(result.error)
                }
              } finally {
                setGoogleLoading(false)
              }
            }}
          >
            <Button
              variant="outline"
              className="w-full h-11 rounded-md gap-2 font-semibold border-border bg-card hover:bg-muted/50 text-foreground transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              type="submit"
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Entrar com Google
            </Button>
          </form>

          <p className="text-center text-ds-body-sm text-muted-foreground font-medium pt-2">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-bold text-primary hover:text-primary-hover transition-colors hover:underline underline-offset-4"
            >
              Fazer login
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground/85 leading-relaxed">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link
              href="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
            >
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
