'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    setIsMobile(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger
          id="date"
          nativeButton={true}
          render={
            <Button
              variant="outline"
              className={cn(
                'w-full sm:w-65 justify-start text-left font-normal h-10 px-3 py-2 text-sm transition-[border-color,box-shadow] cursor-pointer',
                'focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring focus-visible:ring-offset-0 focus-visible:outline-none',
                !date && 'text-muted-foreground',
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'dd LLL', { locale: ptBR })} -{' '}
                {format(date.to, 'dd LLL, y', { locale: ptBR })}
              </>
            ) : (
              format(date.from, 'dd LLL, y', { locale: ptBR })
            )
          ) : (
            <span>Selecione um período</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={isMobile ? 1 : 2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

