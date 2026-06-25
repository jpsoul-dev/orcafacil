"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface LabelProps extends React.ComponentProps<"label"> {
  error?: boolean;
  optional?: boolean;
}

function Label({ className, error, optional, children, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "text-foreground",
        !error && "peer-focus:text-primary [&:has(+_*:focus-within)]:text-primary",
        error && "text-destructive",
        className
      )}
      {...props}
    >
      {children}
      {optional && <span className="text-muted-foreground text-xs font-normal">(opcional)</span>}
    </label>
  )
}

export { Label }
