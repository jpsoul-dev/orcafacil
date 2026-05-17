import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const QUOTE_STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-slate-900 text-white hover:bg-slate-500',
  },
  open: {
    label: 'Em aberto',
    className: 'bg-indigo-900 text-white hover:bg-indigo-500',
  },
  accepted: {
    label: 'Aprovado',
    className: 'bg-emerald-900 text-white hover:bg-emerald-500',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'bg-red-900 text-white hover:bg-red-500',
  },
  expired: {
    label: 'Expirado',
    className: 'bg-slate-950 text-white hover:bg-slate-500',
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
