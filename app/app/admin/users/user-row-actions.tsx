'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncUserSubscriptionAction } from '../actions'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface UserRowActionsProps {
  userId: string
  stripeCustomerId: string | null
}

export function UserRowActions({ userId, stripeCustomerId }: UserRowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const result = await syncUserSubscriptionAction(userId, stripeCustomerId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Sincronizado com sucesso! Status atual: ${result?.status}`)
      }
    } catch {
      toast.error('Ocorreu um erro ao tentar sincronizar.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSync} 
      disabled={isLoading || !stripeCustomerId}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      Sincronizar Pagamento
    </Button>
  )
}
