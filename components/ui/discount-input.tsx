import * as React from "react"
import { cn } from "@/lib/utils"
import { maskCurrency } from "@/lib/masks"
import { Input } from "@/components/ui/input"

export interface DiscountInputProps {
  id?: string
  type: "none" | "%" | "R$"
  value: number
  onChange: (type: "none" | "%" | "R$", value: number) => void
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling"
}

export function DiscountInput({
  id,
  type,
  value,
  onChange,
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
}: DiscountInputProps) {
  // Tipo visual ativo nos botões. Se for 'none', mantemos '%' como padrão visual
  const [activeType, setActiveType] = React.useState<"%" | "R$">(type === "R$" ? "R$" : "%")

  // Estado local do valor digitado
  const [inputValue, setInputValue] = React.useState<string>(() => {
    if (type === "none" || value === 0) return ""
    if (type === "R$") return maskCurrency(Math.round(value * 100).toString())
    return value.toString()
  })

  // Sincroniza estado se o valor mudar externamente (padrão de render update sem useEffect para evitar loops no eslint)
  const [prevProps, setPrevProps] = React.useState({ value, type })
  if (value !== prevProps.value || type !== prevProps.type) {
    setPrevProps({ value, type })
    if (type === "none" || value === 0) {
      setInputValue("")
    } else if (type === "R$") {
      setInputValue(maskCurrency(Math.round(value * 100).toString()))
      setActiveType("R$")
    } else {
      setInputValue(value.toString())
      setActiveType("%")
    }
  }

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
    <div className={cn("relative flex items-center w-full", className)}>
      {/* Toggle de Tipo de Desconto (Segmented Control) */}
      <div className="absolute left-[1px] top-[1px] bottom-[1px] flex items-center p-1 bg-slate-50/50 dark:bg-neutral-800/10 border-r border-input shrink-0 gap-0.5 rounded-l-sm z-10">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTypeChange("%")}
          className={cn(
            "h-7 px-2.5 text-xs font-bold rounded-xs flex items-center justify-center transition-all cursor-pointer select-none border",
            activeType === "%"
              ? "bg-white dark:bg-neutral-800 text-primary shadow-xs border-border/50"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          %
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTypeChange("R$")}
          className={cn(
            "h-7 px-2.5 text-xs font-bold rounded-xs flex items-center justify-center transition-all cursor-pointer select-none border",
            activeType === "R$"
              ? "bg-white dark:bg-neutral-800 text-primary shadow-xs border-border/50"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          R$
        </button>
      </div>

      {/* Input de Valor */}
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        placeholder={activeType === "R$" ? "0,00" : "0"}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        aria-invalid={ariaInvalid}
        className="pl-[86px] text-right text-base sm:text-sm tabular-nums"
      />
    </div>
  )
}
