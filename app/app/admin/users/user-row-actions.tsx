'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncUserSubscriptionAction, deleteUserAction } from '../actions'
import { RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface UserRowActionsProps {
  userId: string
  stripeCustomerId: string | null
}

export function UserRowActions({ userId, stripeCustomerId }: UserRowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUserAction(userId, stripeCustomerId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuário excluído com sucesso!')
      }
    } catch {
      toast.error('Ocorreu um erro ao tentar excluir o usuário.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSync} 
        disabled={isLoading || isDeleting || !stripeCustomerId}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        Sincronizar
      </Button>

      <AlertDialog>
        <AlertDialogTrigger 
          render={
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-spin' : ''}`} />
              Excluir
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente a conta do usuário, 
              bem como todos os seus clientes, orçamentos, produtos e cancelará sua assinatura no Stripe (se houver).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Excluir Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
