import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  maxLength?: number
  showCounter?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, showCounter, value, onChange, defaultValue, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState<string>((value || defaultValue || "") as string)

    React.useEffect(() => {
      if (value !== undefined) {
        setLocalValue((value || "") as string)
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(e.target.value)
      if (onChange) {
        onChange(e)
      }
    }

    const charCount = localValue.length

    return (
      <div className="w-full flex flex-col gap-1.5">
        <textarea
          ref={ref}
          data-slot="textarea"
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            "flex min-h-16 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground",
            "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
            "dark:bg-input/30 dark:aria-invalid:border-destructive/50",
            className
          )}
          {...props}
        />
        {showCounter && maxLength !== undefined && (
          <span className="text-xs text-muted-foreground self-end font-medium select-none tabular-nums">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
