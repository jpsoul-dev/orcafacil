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
import { toast } from 'sonner'
import { Loader2, AlertTriangle, Trash } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface DeleteCustomerDialogProps {
  id: string
  name: string
  trigger?: ReactNode
  asDropdownItem?: boolean
}

export function DeleteCustomerDialog({ id, name, trigger, asDropdownItem }: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hasRelations, setHasRelations] = useState<boolean | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      const verifyRelations = async () => {
        setChecking(true)
        const result = await checkCustomerRelations(id)
        setChecking(false)

        if (result.success) {
          setHasRelations(!!result.data)
        } else {
          toast.error(result.error || 'Não foi possível verificar vínculos do cliente.')
          setHasRelations(false) // Assume falso para permitir tentar a deleção se a RLS permitir
        }
      }
      verifyRelations()
    } else {
      setHasRelations(null)
    }
  }, [open, id])

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Evita fechar automaticamente se houver erro
    setDeleting(true)
    const result = await deleteCustomer(id)
    setDeleting(false)

    if (result.success) {
      toast.success('Cliente excluído com sucesso!')
      setOpen(false)
    } else {
      toast.error(result.error || 'Erro ao excluir o cliente.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} style={{ display: 'contents' }}>
        {trigger ? trigger : asDropdownItem ? (
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 font-medium cursor-pointer"
          >
            <Trash className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer shrink-0"
          >
            <span className="sr-only">Excluir</span>
          </Button>
        )}
      </div>

      <AlertDialogContent className="rounded-2xl border-none p-6 shadow-2xl bg-white max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground font-display flex items-center gap-2">
            {hasRelations ? (
              <span className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" /> Exclusão Bloqueada
              </span>
            ) : (
              'Confirmar Exclusão'
            )}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed mt-2">
            {checking && (
              <span className="flex items-center gap-2 py-3 justify-center text-sm font-medium text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Verificando vínculos do cliente...
              </span>
            )}

            {!checking && hasRelations === true && (
              <span className="block mt-2 bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-xs">
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
            <AlertDialogCancel className="font-bold border-slate-200 rounded-xl px-6 cursor-pointer hover:bg-slate-50 transition-colors h-10 w-full sm:w-auto">
              Entendido
            </AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel className="font-bold border-slate-200 rounded-xl px-6 cursor-pointer hover:bg-slate-50 transition-colors h-10">
                Cancelar
              </AlertDialogCancel>
              <Button
                disabled={checking || deleting}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-10 px-6 cursor-pointer transition-colors shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
