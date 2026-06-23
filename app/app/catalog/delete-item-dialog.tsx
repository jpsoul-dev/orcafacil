'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCatalogItem } from './actions'
import { Button } from '@/components/ui/button'
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

export function DeleteItemDialog({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function onDelete() {
    setLoading(true)
    const result = await deleteCatalogItem(id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Item excluído com sucesso!')
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        nativeButton={true}
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        }
      />
      <AlertDialogContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ds-heading-sm font-bold text-foreground">Excluir item do catálogo?</AlertDialogTitle>
          <AlertDialogDescription className="text-ds-body-sm text-muted-foreground font-medium">
            Você está prestes a excluir <strong>{name}</strong>. Esta ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
