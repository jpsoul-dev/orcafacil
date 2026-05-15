'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { reopenQuote } from '@/app/app/quotes/actions'

interface ReopenQuoteDialogProps {
  quoteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReopenQuoteDialog({
  quoteId,
  open,
  onOpenChange,
  onSuccess,
}: ReopenQuoteDialogProps) {
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast.error('Informe a nova data de validade.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await reopenQuote(quoteId, date)
      if (result.success) {
        toast.success('Orçamento reaberto com sucesso!')
        onOpenChange(false)
        setDate('')
        onSuccess?.()
      } else {
        toast.error('Erro ao reabrir orçamento: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao tentar reabrir o orçamento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reabrir Orçamento</DialogTitle>
          <DialogDescription>
            Informe uma nova data de validade. O orçamento voltará para Em
            Aberto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="valid_until">Nova Data de Validade</Label>
            <Input
              id="valid_until"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !date}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reabrir Orçamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
