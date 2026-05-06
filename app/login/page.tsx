'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login, signInWithGoogle } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { FileText, Zap, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(formData: FormData) {
    setLoading(true)
    const result = await login(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      router.push('/app')
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado esquerdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-700 flex-col justify-between p-12 text-white">
        {/* Camada de Gradiente e Grid */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-blue-800 to-blue-950 z-0" />
        <div
          className="absolute inset-0 opacity-10 z-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <Zap
                className="h-6 w-6 text-white"
                fill="white"
                strokeWidth={0}
              />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">
              OrçaFácil
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
              Bem-vindo de volta ao seu painel.
            </h1>
            <p className="text-blue-100 text-xl max-w-md font-medium leading-relaxed">
              Continue simplificando suas vendas e encantando seus clientes com
              orçamentos impecáveis.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: FileText, text: 'Gerencie seus orçamentos ativos' },
              { icon: Zap, text: 'Acesse seu catálogo atualizado' },
              { icon: ArrowRight, text: 'Acompanhe o status de fechamento' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 text-blue-50/90 group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/10 group-hover:bg-white/20 transition-all">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-base font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8">
          <p className="text-blue-200/50 text-sm font-medium">
            © 2025 OrçaFácil
          </p>
          <div className="flex gap-4">
            <div className="h-1.5 w-8 rounded-full bg-white/40" />
            <div className="h-1.5 w-4 rounded-full bg-white/10" />
            <div className="h-1.5 w-4 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Lado direito — Formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 lg:hidden mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Zap
                className="h-6 w-6 text-white"
                fill="white"
                strokeWidth={0}
              />
            </div>
            <span className="font-bold text-xl tracking-tighter">
              OrçaFácil
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight">
              Entrar na conta
            </h2>
            <p className="text-muted-foreground text-sm">
              Ainda não tem conta?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Criar grátis
              </Link>
            </p>
          </div>

          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>
            <Button
              className="w-full h-11 font-semibold gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                ou continue com
              </span>
            </div>
          </div>

          <form
            action={async () => {
              setGoogleLoading(true)
              await signInWithGoogle()
            }}
          >
            <Button
              variant="outline"
              className="w-full h-11 gap-2 font-medium"
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
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continuar com Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
