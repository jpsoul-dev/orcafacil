'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { deleteCatalogItem } from './actions'
import { Button } from '@/components/ui/button'
import { showPillToast } from './components/pill-toast'
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

interface DeleteItemDialogProps {
  id: string
  name: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactElement
}

/**
 * Dialog for deleting a catalog item.
 * Supports both standalone usage via trigger and controlled state usage from view sheets.
 */
export function DeleteItemDialog({
  id,
  name,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: DeleteItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  async function onDelete() {
    setLoading(true)
    const result = await deleteCatalogItem(id)
    setLoading(false)
    if (result.error) {
      showPillToast(result.error, 'error')
    } else {
      showPillToast('Item excluído com sucesso!', 'success')
      setIsOpen(false)
      if (onSuccess) onSuccess()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && !isControlled && (
        <AlertDialogTrigger nativeButton={true} render={trigger} />
      )}
      {!trigger && !isControlled && (
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
      )}
      <AlertDialogContent className="rounded-xl border border-border bg-card text-foreground shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ds-heading-sm font-bold text-foreground">
            Excluir item do catálogo?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ds-body-sm text-muted-foreground font-medium">
            Você está prestes a excluir <strong>{name}</strong>. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? <Spinner className="h-4 w-4" /> : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
