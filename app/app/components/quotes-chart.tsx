'use client'

import * as React from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  format,
  parseISO,
  eachDayOfInterval,
  eachMonthOfInterval,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

const chartConfig = {
  quotes: {
    label: 'Orçamentos',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface QuotesChartProps {
  quotes: { created_at: string }[]
}

export function QuotesChart({ quotes }: QuotesChartProps) {
  const [view, setView] = React.useState<'day' | 'month'>('month')

  const chartData = React.useMemo(() => {
    if (view === 'day') {
      // Last 30 days
      const end = new Date()
      const start = subMonths(end, 1)
      const days = eachDayOfInterval({ start, end })

      const counts = quotes.reduce((acc: Record<string, number>, quote) => {
        const date = format(parseISO(quote.created_at), 'yyyy-MM-dd')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      return days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        return {
          label: format(day, 'dd/MM'),
          fullDate: format(day, "dd 'de' MMMM", { locale: ptBR }),
          quotes: counts[dateKey] || 0,
        }
      })
    } else {
      // Last 12 months
      const end = new Date()
      const start = subMonths(end, 11)
      const months = eachMonthOfInterval({ start, end })

      const counts = quotes.reduce((acc: Record<string, number>, quote) => {
        const date = format(parseISO(quote.created_at), 'yyyy-MM')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      return months.map((month) => {
        const dateKey = format(month, 'yyyy-MM')
        return {
          label: format(month, 'MMM', { locale: ptBR }),
          fullDate: format(month, "MMMM 'de' yyyy", { locale: ptBR }),
          quotes: counts[dateKey] || 0,
        }
      })
    }
  }, [quotes, view])

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-lg font-bold tracking-tight">
            Histórico de Orçamentos
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            Acompanhe o volume de orçamentos criados
          </CardDescription>
        </div>
        <div className="flex items-center px-6 py-4 sm:py-0">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as 'day' | 'month')}
          >
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger
                value="day"
                className="text-xs font-semibold px-4 h-7"
              >
                Dia
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="text-xs font-semibold px-4 h-7"
              >
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted/30"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-[10px] font-medium text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[10px] font-medium text-muted-foreground"
              allowDecimals={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="quotes"
                  labelFormatter={(value, payload) => {
                    return payload[0]?.payload?.fullDate
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="quotes"
              stroke="var(--color-quotes)"
              strokeWidth={2.5}
              dot={{
                fill: 'var(--color-quotes)',
                strokeWidth: 2,
                r: 4,
                stroke: '#fff',
              }}
              activeDot={{
                r: 6,
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
