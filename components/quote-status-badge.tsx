import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const QUOTE_STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-slate-700 text-white hover:bg-slate-600',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-indigo-700 text-white hover:bg-indigo-600',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-emerald-700 text-white hover:bg-emerald-600',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'bg-amber-700 text-white hover:bg-amber-600',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-700 text-white hover:bg-red-600',
  },
  completed: {
    label: 'Finalizado',
    className: 'bg-sky-700 text-white hover:bg-sky-600',
  },
  expired: {
    label: 'Vencido',
    className: 'bg-slate-900 text-white hover:bg-slate-800',
  },
}

interface QuoteStatusBadgeProps {
  status: string
  className?: string
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  const config = QUOTE_STATUS_MAP[status] || {
    label: status,
    className: 'bg-slate-500 text-white hover:bg-slate-600',
  }

  return (
    <Badge
      className={cn(
        'rounded-md px-3 py-0.5 text-xs font-bold border-none shadow-sm',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
