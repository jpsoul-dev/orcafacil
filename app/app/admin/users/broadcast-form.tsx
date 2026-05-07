'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { broadcastNotificationAction } from '../actions'
import { toast } from 'sonner'
import { Megaphone } from 'lucide-react'

export function BroadcastForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    setIsLoading(true)
    try {
      const res = await broadcastNotificationAction(content, title)
      if (res.success) {
        toast.success('Comunicado enviado com sucesso para todos os usuários!')
        setTitle('')
        setContent('')
      } else {
        toast.error(res.error || 'Falha ao enviar comunicado')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar comunicado'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <CardTitle>Enviar Comunicado Global</CardTitle>
        </div>
        <CardDescription>
          Esta mensagem aparecerá instantaneamente para todos os usuários do sistema no ícone de notificação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título (Opcional)</label>
            <Input 
              placeholder="Ex: Manutenção Programada" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem</label>
            <Textarea 
              placeholder="Digite o comunicado aqui..." 
              className="min-h-[100px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Disparar para todos os usuários'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
