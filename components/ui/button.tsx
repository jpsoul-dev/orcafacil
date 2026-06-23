import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Button — OrçaFácil Design System
 *
 * Os tokens shadcn apontam para os valores do DS (globals.css):
 *   --primary       = DS blue-500 (#1E5EFF)
 *   --primary-hover = DS blue-600 (#1648D6)
 *   --primary-active= DS blue-700 (#1136AD)
 *
 * Tamanhos (DS Seção 10):
 *   sm  → h-8  (32px)  px-3 (12px)
 *   md  → h-10 (40px)  px-4 (16px) — DEFAULT
 *   lg  → h-12 (48px)  px-6 (24px)
 *
 * Radius: rounded-md = 12px via --radius-md = var(--radius) = 0.75rem
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Ação principal — no máximo uma visível por contexto de tela */
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        /* Ação alternativa com borda, sem preenchimento sólido */
        outline:
          'border-border bg-background text-foreground shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        /* Ação de mesmo contexto, peso visual reduzido */
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary',
        /* Ação de baixa ênfase — toolbars e tabelas */
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:hover:bg-muted/50',
        /* Ações irreversíveis — cancelar, excluir */
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/50 dark:bg-destructive/20 dark:hover:bg-destructive/30',
        /* Ação inline em texto corrido */
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        /* sm — 32px — ações dentro de tabelas, toolbars compactas */
        sm: 'h-8 gap-1.5 px-3 text-xs',
        /* md — 40px — DEFAULT — uso geral */
        default: 'h-10 gap-1.5 px-4 text-sm',
        /* lg — 48px — CTAs de tela cheia no mobile */
        lg: 'h-12 gap-2 px-6 text-base',
        /* Ícone — quadrado (sempre com aria-label) */
        icon: 'size-10',
        'icon-sm': 'size-8 [&_svg:not([class*="size-"])]:size-3.5',
        'icon-lg': 'size-12',
        /* Legado xs — mantido para não quebrar uso existente */
        xs: 'h-6 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*="size-"])]:size-3',
        'icon-xs': 'size-6 rounded-sm [&_svg:not([class*="size-"])]:size-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
