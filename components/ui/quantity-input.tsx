import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface QuantityInputProps {
  id?: string
  value?: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling"
}

export const QuantityInput = React.forwardRef<HTMLInputElement, QuantityInputProps>(
  (
    {
      id,
      value = 1,
      onChange,
      min = 1,
      max = 999,
      disabled = false,
      className,
      "aria-invalid": ariaInvalid,
    },
    ref
  ) => {
    // Estado local para gerenciar o valor do input enquanto o usuário digita (permitindo campo vazio temporariamente)
    const [inputValue, setInputValue] = React.useState<string>(value.toString())

    React.useEffect(() => {
      setInputValue(value.toString())
    }, [value])

    const handleIncrement = () => {
      if (disabled) return
      const newValue = Math.min(max, value + 1)
      onChange(newValue)
    }

    const handleDecrement = () => {
      if (disabled) return
      const newValue = Math.max(min, value - 1)
      onChange(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setInputValue(rawValue)

      const numValue = parseInt(rawValue, 10)
      if (!isNaN(numValue)) {
        // Se ultrapassar o máximo, limita imediatamente
        if (numValue > max) {
          onChange(max)
        } else if (numValue >= min) {
          onChange(numValue)
        }
      }
    }

    const handleBlur = () => {
      const numValue = parseInt(inputValue, 10)
      if (isNaN(numValue) || numValue < min) {
        onChange(min)
        setInputValue(min.toString())
      } else if (numValue > max) {
        onChange(max)
        setInputValue(max.toString())
      } else {
        onChange(numValue)
        setInputValue(numValue.toString())
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        handleIncrement()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        handleDecrement()
      }
    }

    const isMinReached = value <= min
    const isMaxReached = value >= max

    return (
      <div className={cn("relative flex items-center w-full min-w-30", className)}>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || isMinReached}
          onClick={handleDecrement}
          className={cn(
            "absolute left-px top-px bottom-px h-auto w-10 rounded-none rounded-l-sm flex items-center justify-center border-r border-input bg-slate-50/50 dark:bg-neutral-800/20 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-ds-fast cursor-pointer shrink-0 z-10",
            "disabled:opacity-30 disabled:pointer-events-none"
          )}
          title="Diminuir quantidade"
        >
          <Minus className="h-3.5 w-3.5 stroke-[3px]" />
        </Button>

        <Input
          id={id}
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-invalid={ariaInvalid}
          className="px-12 text-center font-semibold text-foreground tabular-nums"
        />

        <Button
          type="button"
          variant="ghost"
          disabled={disabled || isMaxReached}
          onClick={handleIncrement}
          className={cn(
            "absolute right-px top-px bottom-px h-auto w-10 rounded-none rounded-r-sm flex items-center justify-center border-l border-input bg-slate-50/50 dark:bg-neutral-800/20 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-ds-fast cursor-pointer shrink-0 z-10",
            "disabled:opacity-30 disabled:pointer-events-none"
          )}
          title="Aumentar quantidade"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3px]" />
        </Button>
      </div>
    )
  }
)

QuantityInput.displayName = "QuantityInput"
