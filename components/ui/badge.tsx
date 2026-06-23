import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Badge — OrçaFácil Design System
 *
 * Variantes de status usam tokens DS expostos via @theme inline:
 *   bg-status-pending-bg  → var(--ds-color-status-pending-bg)
 *   text-status-pending-fg → var(--ds-color-status-pending-fg)
 *   (adaptam automaticamente para modo escuro via .dark {} no globals.css)
 *
 * Regra: badge de status SEMPRE tem label de texto visível.
 * Nunca exibir só a cor ou só o dot sem o texto.
 */
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        /* Badge genérico — fundo primário sólido */
        default:
          "rounded-full bg-primary text-primary-foreground",
        /* Badge neutro — categorias, labels genéricos */
        secondary:
          "rounded-full bg-secondary text-secondary-foreground",
        /* Badge de ação destrutiva */
        destructive:
          "rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20",
        /* Badge com borda, sem preenchimento */
        outline:
          "rounded-sm border-border text-foreground",
        /* Badge fantasma */
        ghost:
          "rounded-full hover:bg-muted text-muted-foreground",
        /* Link inline */
        link: "text-primary underline-offset-4 hover:underline",

        /* ────────────────────────────────────────────────────────
           Variantes de Status de Orçamento/Recibo — DS §2 e §9
           Paleta:
             pending   → âmbar    (atenção, aguardando)
             approved  → verde    (positivo — exclusivo para este estado)
             rejected  → vermelho (negativo, inequívoco)
             cancelled → cinza    (inativo, fora do fluxo)
             completed → teal     (distinto do verde e do azul primário)
           ──────────────────────────────────────────────────────── */
        "status-pending":
          "rounded-full bg-status-pending-bg text-status-pending-fg",
        "status-approved":
          "rounded-full bg-status-approved-bg text-status-approved-fg",
        "status-rejected":
          "rounded-full bg-status-rejected-bg text-status-rejected-fg",
        "status-cancelled":
          "rounded-full bg-status-cancelled-bg text-status-cancelled-fg",
        "status-completed":
          "rounded-full bg-status-completed-bg text-status-completed-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
