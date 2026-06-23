import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Card — OrçaFácil Design System (DS §10)
 *
 *   rounded-lg  = 16px  (--radius-lg = calc(0.75rem * 1.333))
 *   bg-card     = #FFFFFF modo claro / #111827 modo escuro
 *   border-border = #E2E8F0 modo claro / #1E293B modo escuro
 *   shadow-sm   = 0 1px 2px rgba(17,24,39,0.06)
 *
 * Variantes:
 *   default     → fundo card + borda + shadow-sm
 *   flat        → sem sombra (dentro de outro container elevado)
 *   interactive → shadow-md no hover (card inteiro clicável)
 */

type CardVariant = "default" | "flat" | "interactive"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: CardVariant
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-6 overflow-hidden rounded-lg bg-card py-6 text-sm text-card-foreground",
        "border border-border shadow-sm",
        "has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        "data-[size=sm]:gap-4 data-[size=sm]:py-4",
        "data-[variant=flat]:shadow-none",
        "data-[variant=interactive]:cursor-pointer data-[variant=interactive]:transition-shadow data-[variant=interactive]:duration-200 data-[variant=interactive]:hover:shadow-md",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-6",
        "group-data-[size=sm]/card:px-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold text-base leading-normal text-card-foreground",
        "group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg px-6",
        "group-data-[size=sm]/card:px-4",
        "[.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
