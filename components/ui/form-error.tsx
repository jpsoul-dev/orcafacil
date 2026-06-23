import * as React from "react"
import { cn } from "@/lib/utils"

interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string
}

export const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, message, children, ...props }, ref) => {
    const content = message || children

    if (!content) return null

    return (
      <p
        ref={ref}
        role="alert"
        className={cn(
          "text-xs font-medium text-destructive mt-1 ml-1",
          "animate-in fade-in slide-in-from-top-0.5 duration-200",
          className
        )}
        {...props}
      >
        {content}
      </p>
    )
  }
)

FormError.displayName = "FormError"
