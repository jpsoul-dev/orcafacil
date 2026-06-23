import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/*
 * QuoteStatusBadge — Componente específico do produto OrçaFácil
 *
 * Paleta definida na Seção 2 do Design System (tokens de status):
 *   pending   → âmbar (aguardando ação, atenção sem alarme)
 *   approved  → verde (positivo, reservado exclusivamente para este estado)
 *   rejected  → vermelho (negativo, inequívoco)
 *   cancelled → cinza-azulado neutro (estado inativo, fora do fluxo)
 *   completed → teal (distinto do verde e do azul primário)
 *   draft     → neutro (rascunho, sem fluxo definido)
 *   expired   → neutro escuro
 *
 * Anatomia: dot de 6px (cor base) + label em text-caption peso 600
 * Modo escuro: automático via tokens CSS redefinidos em .dark{}
 */

interface StatusConfig {
  label: string
  badgeVariant:
    | 'status-pending'
    | 'status-approved'
    | 'status-rejected'
    | 'status-cancelled'
    | 'status-completed'
    | 'secondary'
    | 'outline'
  dotColor: string
}

export const QUOTE_STATUS_MAP: Record<string, StatusConfig> = {
  draft: {
    label: 'Rascunho',
    badgeVariant: 'outline',
    dotColor: 'var(--ds-color-neutral-400)',
  },
  pending: {
    label: 'Pendente',
    badgeVariant: 'status-pending',
    dotColor: 'var(--ds-color-status-pending)',
  },
  approved: {
    label: 'Aprovado',
    badgeVariant: 'status-approved',
    dotColor: 'var(--ds-color-status-approved)',
  },
  rejected: {
    label: 'Rejeitado',
    badgeVariant: 'status-rejected',
    dotColor: 'var(--ds-color-status-rejected)',
  },
  cancelled: {
    label: 'Cancelado',
    badgeVariant: 'status-cancelled',
    dotColor: 'var(--ds-color-status-cancelled)',
  },
  completed: {
    label: 'Finalizado',
    badgeVariant: 'status-completed',
    dotColor: 'var(--ds-color-status-completed)',
  },
  expired: {
    label: 'Vencido',
    badgeVariant: 'secondary',
    dotColor: 'var(--ds-color-neutral-500)',
  },
}

interface QuoteStatusBadgeProps {
  status: string
  className?: string
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  const config = QUOTE_STATUS_MAP[status] ?? {
    label: status,
    badgeVariant: 'secondary' as const,
    dotColor: 'var(--ds-color-neutral-400)',
  }

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn('gap-1.5 px-2.5 py-0.5 text-xs font-semibold', className)}
    >
      {/* Dot de 6px — cor base do status. Não é o único indicador: o label sempre acompanha. */}
      <span
        className="inline-block size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  )
}
