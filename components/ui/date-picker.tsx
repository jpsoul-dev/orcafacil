import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useIsMobile } from "@/hooks/use-mobile"

export interface DatePickerProps {
  id?: string
  value?: string | Date | null
  onChange: (value: string | null) => void // Sempre retorna YYYY-MM-DD para simplificar o backend
  placeholder?: string
  disabledDates?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  error?: boolean
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      id,
      value,
      onChange,
      placeholder = "Selecione uma data",
      disabledDates,
      minDate,
      maxDate,
      className,
      error = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const isMobile = useIsMobile()

    // 1. Parser seguro e resiliente de valor para objeto Date
    const selectedDate = React.useMemo(() => {
      if (!value) return undefined
      if (value instanceof Date) return value

      // Tratamento de string YYYY-MM-DD pura sem deslocamento de fuso horário
      const date = parseISO(value)
      return isValid(date) ? date : undefined
    }, [value])

    // 2. Junção de regras de desabilitação de datas
    const isDateDisabled = React.useCallback(
      (date: Date) => {
        if (disabledDates) return disabledDates(date)

        const normalizedDate = new Date(date)
        normalizedDate.setHours(0, 0, 0, 0)

        if (minDate) {
          const normalizedMin = new Date(minDate)
          normalizedMin.setHours(0, 0, 0, 0)
          if (normalizedDate < normalizedMin) return true
        }

        if (maxDate) {
          const normalizedMax = new Date(maxDate)
          normalizedMax.setHours(0, 0, 0, 0)
          if (normalizedDate > normalizedMax) return true
        }

        return false
      },
      [disabledDates, minDate, maxDate]
    )

    const handleSelect = (date: Date | undefined) => {
      if (date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        onChange(`${year}-${month}-${day}`)
      } else {
        onChange(null)
      }
      setOpen(false) // Auto-fechamento do Popover
    }

    const buttonTrigger = (
      <button
        ref={ref}
        type="button"
        className={cn(
          "h-11 w-full min-w-0 rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none flex items-center justify-between",
          "hover:bg-card hover:text-foreground cursor-pointer",
          "dark:bg-input/30",
          !selectedDate && "text-muted-foreground",
          error
            ? "border-destructive focus:ring-2 focus:ring-destructive/20 dark:border-destructive/50"
            : "focus:border-ring focus:ring-2 focus:ring-ring/20",
          className
        )}
      >
        {selectedDate ? (
          format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
        ) : (
          <span>{placeholder}</span>
        )}
        <CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </button>
    )

    const calendarComponent = (
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        disabled={isDateDisabled}
        initialFocus
        locale={ptBR}
      />
    )

    return (
      <div className="relative w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            id={id}
            nativeButton={true}
            render={buttonTrigger}
          />
          <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "start"}>
            {calendarComponent}
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"
