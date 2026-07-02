import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer } from "vaul"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface UnitOption {
  value: string
  label: string
}

export interface UnitCategory {
  category: string
  options: UnitOption[]
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    category: "UNIDADES",
    options: [
      { value: "un.", label: "unidades" },
      { value: "cx", label: "caixas" },
      { value: "pct", label: "pacotes" },
    ],
  },
  {
    category: "ÁREA",
    options: [
      { value: "m²", label: "metros quadrados" },
      { value: "km²", label: "quilômetros quadrados" },
    ],
  },
  {
    category: "DISTÂNCIA",
    options: [
      { value: "m", label: "metros" },
      { value: "mm", label: "milímetros" },
      { value: "cm", label: "centímetros" },
      { value: "km", label: "quilômetros" },
    ],
  },
  {
    category: "VOLUME",
    options: [
      { value: "ml", label: "mililitros" },
      { value: "L", label: "litros" },
      { value: "m³", label: "metros cúbicos" },
    ],
  },
  {
    category: "TEMPO",
    options: [
      { value: "h", label: "horas" },
      { value: "d", label: "dia" },
      { value: "meses", label: "meses" },
    ],
  },
  {
    category: "PESO",
    options: [
      { value: "g", label: "gramas" },
      { value: "kg", label: "quilogramas" },
      { value: "tn", label: "Tonelada" },
    ],
  },
]

export interface UnitMeasureSelectorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  error?: boolean
  className?: string
}

export function UnitMeasureSelector({
  id,
  value,
  onChange,
  error = false,
  className,
}: UnitMeasureSelectorProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => {
    for (const group of UNIT_CATEGORIES) {
      const found = group.options.find((opt) => opt.value === value)
      if (found) return found
    }
    return null
  }, [value])

  const triggerLabel = selectedOption
    ? `${selectedOption.value} (${selectedOption.label})`
    : "Selecione a unidade..."

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <button
            type="button"
            id={id}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-sm border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive/20",
              className
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs" />
          <Drawer.Content className="bg-background flex flex-col rounded-t-xl max-h-[85vh] fixed bottom-0 left-0 right-0 z-50 border-t border-border focus:outline-none">
            {/* Header consistente */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border select-none shrink-0">
              <Drawer.Title asChild>
                <span className="text-ds-body-md font-bold text-foreground font-display">
                  Unidade de Medida
                </span>
              </Drawer.Title>
              <Drawer.Close className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-input rounded-sm cursor-pointer">
                <X className="h-4 w-4" />
              </Drawer.Close>
            </div>
            <Drawer.Description className="sr-only">
              Selecione a unidade de medida para o item do catálogo.
            </Drawer.Description>

            {/* Lista de Opções */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {UNIT_CATEGORIES.map((group) => (
                <div key={group.category} className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                    {group.category}
                  </h3>
                  <div className="space-y-1">
                    {group.options.map((option) => {
                      const isSelected = value === option.value
                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => {
                            onChange(option.value)
                            setOpen(false)
                          }}
                          className={cn(
                            "flex items-center justify-between w-full py-2.5 px-4 rounded-md hover:bg-muted active:bg-muted/80 transition-colors cursor-pointer text-left",
                            isSelected ? "bg-accent/50 text-foreground" : "text-neutral-700 dark:text-neutral-300"
                          )}
                        >
                          <div className="flex flex-col min-w-0 pr-4">
                            <span className="text-ds-body-md font-bold text-foreground">
                              {option.value}
                            </span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {option.label}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Select value={value || ""} onValueChange={(val) => val !== null && onChange(val)}>
      <SelectTrigger
        id={id}
        className={cn(
          "w-full text-left justify-between h-10 px-3 bg-card border-input flex items-center",
          error && "border-destructive focus-visible:ring-destructive/20",
          className
        )}
      >
        <SelectValue placeholder="Selecione a unidade...">
          {selectedOption ? (
            <span className="text-sm font-semibold text-foreground">
              {selectedOption.value} <span className="text-muted-foreground font-normal text-xs">({selectedOption.label})</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Selecione a unidade...</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-(--anchor-width)">
        {UNIT_CATEGORIES.map((group, index) => (
          <React.Fragment key={group.category}>
            {index > 0 && <SelectSeparator />}
            <SelectGroup>
              <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                {group.category}
              </SelectLabel>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-2.5">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-foreground">
                      {option.value}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {option.label}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}
