'use client'

import { useState, useEffect, ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { checkCustomerRelations, deleteCustomer } from '../actions'
import { AlertTriangle, Trash } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { showPillToast } from './pill-toast'

interface DeleteCustomerDialogProps {
  id: string
  name: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  trigger?: ReactNode
  asDropdownItem?: boolean
}

/**
 * Dialog for deleting a customer.
 * Supports standalone trigger usage, dropdown trigger, and controlled state usage from view sheets.
 * Runs checkCustomerRelations on mount/open to verify block constraints (quotes/receipts).
 */
export function DeleteCustomerDialog({
  id,
  name,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  trigger,
  asDropdownItem,
}: DeleteCustomerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hasRelations, setHasRelations] = useState<boolean | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? controlledOnOpenChange : setInternalOpen

  useEffect(() => {
    if (isOpen) {
      const verifyRelations = async () => {
        setChecking(true)
        const result = await checkCustomerRelations(id)
        setChecking(false)

        if (result.success) {
          setHasRelations(!!result.data)
        } else {
          showPillToast(result.error || 'Não foi possível verificar vínculos do cliente.', 'error')
          setHasRelations(false) // Assume false to let DB RLS/constraints block if checking fails
        }
      }
      verifyRelations()
    } else {
      // Use microtask or timeout to prevent synchronous state change during render
      setTimeout(() => {
        setHasRelations(null)
      }, 0)
    }
  }, [isOpen, id])

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevents closing dialog on error
    setDeleting(true)
    const result = await deleteCustomer(id)
    setDeleting(false)

    if (result.success) {
      showPillToast('Cliente excluído com sucesso!', 'success')
      setIsOpen(false)
      if (onSuccess) onSuccess()
    } else {
      showPillToast(result.error || 'Erro ao excluir o cliente.', 'error')
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && !isControlled && (
        <div onClick={() => setIsOpen(true)} style={{ display: 'contents' }}>
          {trigger}
        </div>
      )}
      {!trigger && asDropdownItem && !isControlled && (
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setIsOpen(true)
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 font-medium cursor-pointer"
        >
          <Trash className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      )}
      {!trigger && !asDropdownItem && !isControlled && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer shrink-0"
        >
          <span className="sr-only">Excluir</span>
        </Button>
      )}

      <AlertDialogContent className="rounded-xl border border-border bg-card text-foreground shadow-lg max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ds-heading-sm font-bold text-foreground flex items-center gap-2">
            {hasRelations ? (
              <span className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Exclusão Bloqueada
              </span>
            ) : (
              'Confirmar Exclusão'
            )}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground text-ds-body-sm font-medium leading-relaxed mt-2" render={<div />}>
            {checking && (
              <span className="flex items-center gap-2 py-3 justify-center text-ds-body-sm font-medium text-slate-400">
                <Spinner className="h-4 w-4 text-primary" />
                Verificando vínculos do cliente...
              </span>
            )}

            {!checking && hasRelations === true && (
              <span className="block mt-2 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-xs">
                O cliente <strong>{name}</strong> possui orçamentos ou recibos associados ativos no sistema.
                <br /><br />
                Para garantir a integridade dos dados e o histórico financeiro, a exclusão deste cliente <strong>não é permitida</strong>.
                Cancele ou remova os documentos vinculados primeiro.
              </span>
            )}

            {!checking && hasRelations === false && (
              <span className="block mt-2">
                Tem certeza de que deseja excluir permanentemente o cliente <strong>{name}</strong>?
                Esta ação não pode ser desfeita e removerá todos os dados cadastrais associados.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 gap-2">
          {hasRelations === true ? (
            <AlertDialogCancel className="font-semibold border-border bg-card rounded-md px-6 cursor-pointer hover:bg-muted/40 transition-colors h-10 w-full sm:w-auto">
              Entendido
            </AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel className="font-semibold border-border bg-card rounded-md px-6 cursor-pointer hover:bg-muted/40 transition-colors h-10">
                Cancelar
              </AlertDialogCancel>
              <Button
                disabled={checking || deleting}
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold rounded-md h-10 px-6 cursor-pointer transition-colors shadow-sm"
              >
                {deleting ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Excluindo...
                  </>
                ) : (
                  'Confirmar Exclusão'
                )}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
