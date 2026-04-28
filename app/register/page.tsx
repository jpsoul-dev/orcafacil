'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup, signInWithGoogle } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(formData: FormData) {
    setLoading(true)
    const result = await signup(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Conta criada! Verifique seu e-mail para confirmar.')
      router.push('/login')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Crie sua conta no OrçaFácil para começar a emitir orçamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar conta'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                Ou continue com
              </span>
            </div>
          </div>

          <form action={signInWithGoogle}>
            <Button variant="outline" className="w-full" type="submit">
              Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-sm text-slate-500">
          <p>
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
