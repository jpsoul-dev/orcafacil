import * as React from "react"
import { cn } from "@/lib/utils"
import { maskCurrency } from "@/lib/masks"

export interface DiscountInputProps {
  type: "none" | "%" | "R$"
  value: number
  onChange: (type: "none" | "%" | "R$", value: number) => void
  disabled?: boolean
  className?: string
}

export function DiscountInput({
  type,
  value,
  onChange,
  disabled = false,
  className,
}: DiscountInputProps) {
  // Tipo visual ativo nos botões. Se for 'none', mantemos '%' como padrão visual
  const [activeType, setActiveType] = React.useState<"%" | "R$">(type === "R$" ? "R$" : "%")

  // Estado local do valor digitado
  const [inputValue, setInputValue] = React.useState<string>(() => {
    if (type === "none" || value === 0) return ""
    if (type === "R$") return maskCurrency(Math.round(value * 100).toString())
    return value.toString()
  })

  // Sincroniza estado se o valor mudar externamente
  React.useEffect(() => {
    if (type === "none" || value === 0) {
      setInputValue("")
    } else if (type === "R$") {
      setInputValue(maskCurrency(Math.round(value * 100).toString()))
      setActiveType("R$")
    } else {
      setInputValue(value.toString())
      setActiveType("%")
    }
  }, [value, type])

  const handleTypeChange = (newType: "%" | "R$") => {
    if (disabled) return
    setActiveType(newType)

    // Se já houver um valor numérico válido digitado, converte o tipo e emite o onChange imediatamente
    if (value > 0) {
      onChange(newType, value)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value

    let parsedVal = 0
    if (activeType === "R$") {
      const masked = maskCurrency(rawVal)
      setInputValue(masked) // Formata em tempo de digitação
      parsedVal = parseFloat(masked.replace(/\./g, "").replace(",", ".")) || 0
    } else {
      setInputValue(rawVal)
      parsedVal = parseFloat(rawVal) || 0
    }

    parsedVal = Math.max(0, parsedVal)
    if (activeType === "%") {
      parsedVal = Math.min(100, parsedVal)
    }

    if (parsedVal > 0) {
      onChange(activeType, parsedVal)
    } else {
      onChange("none", 0)
    }
  }

  const handleBlur = () => {
    let parsedVal = 0
    if (activeType === "R$") {
      const masked = maskCurrency(inputValue)
      parsedVal = parseFloat(masked.replace(/\./g, "").replace(",", ".")) || 0
      setInputValue(parsedVal > 0 ? masked : "")
    } else {
      parsedVal = parseFloat(inputValue) || 0
      parsedVal = Math.min(100, parsedVal)
      setInputValue(parsedVal > 0 ? parsedVal.toString() : "")
    }

    parsedVal = Math.max(0, parsedVal)
    if (parsedVal > 0) {
      onChange(activeType, parsedVal)
    } else {
      onChange("none", 0)
    }
  }

  return (
    <div
      className={cn(
        "flex h-10 w-full min-w-[160px] items-center border border-input rounded-sm bg-card overflow-hidden transition-[border-color,box-shadow] duration-ds-fast",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 outline-none",
        disabled && "opacity-50 pointer-events-none bg-muted/20",
        className
      )}
    >
      {/* Toggle de Tipo de Desconto (Segmented Control) */}
      <div className="flex h-full items-center p-1 bg-slate-50/50 dark:bg-neutral-800/10 border-r border-input shrink-0 gap-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTypeChange("%")}
          className={cn(
            "h-7 px-2.5 text-xs font-bold rounded-xs flex items-center justify-center transition-all cursor-pointer select-none",
            activeType === "%"
              ? "bg-white dark:bg-neutral-800 text-primary shadow-xs border border-border/50"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          %
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTypeChange("R$")}
          className={cn(
            "h-7 px-2.5 text-xs font-bold rounded-xs flex items-center justify-center transition-all cursor-pointer select-none",
            activeType === "R$"
              ? "bg-white dark:bg-neutral-800 text-primary shadow-xs border border-border/50"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          R$
        </button>
      </div>

      {/* Input de Valor */}
      <input
        type="text"
        inputMode={activeType === "R$" ? "text" : "numeric"}
        disabled={disabled}
        placeholder={activeType === "R$" ? "0,00" : "0"}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="h-full w-full min-w-0 border-0 rounded-none bg-transparent px-3 text-right text-sm text-foreground tabular-nums outline-none focus:ring-0 focus:outline-none"
      />
    </div>
  )
}
