'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
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
import { format, parseISO, eachMonthOfInterval, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatBRL } from '@/lib/utils'

const chartConfig = {
  revenue: {
    label: 'Faturamento Faturado',
    color: '#14b8a6', // Teal-500
  },
} satisfies ChartConfig

interface RevenueBarChartProps {
  quotes: { total: number; status: string; created_at: string }[]
}

export function RevenueBarChart({ quotes }: RevenueBarChartProps) {
  const chartData = React.useMemo(() => {
    // Last 12 months
    const end = new Date()
    const start = subMonths(end, 11)
    const months = eachMonthOfInterval({ start, end })

    // Agrupa o total faturado (somente status 'completed') por mês
    const monthlyRevenue = quotes.reduce((acc: Record<string, number>, quote) => {
      if (quote.status === 'completed') {
        const monthKey = format(parseISO(quote.created_at), 'yyyy-MM')
        acc[monthKey] = (acc[monthKey] || 0) + parseFloat(quote.total as any || 0)
      }
      return acc
    }, {})

    return months.map((month) => {
      const monthKey = format(month, 'yyyy-MM')
      return {
        label: format(month, 'MMM', { locale: ptBR }),
        fullDate: format(month, "MMMM 'de' yyyy", { locale: ptBR }),
        revenue: monthlyRevenue[monthKey] || 0,
      }
    })
  }, [quotes])

  const totalRevenue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0)
  }, [chartData])

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="px-6 py-5 pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Faturamento Faturado</CardTitle>
        <CardDescription className="text-xs font-medium text-muted-foreground">
          Soma do valor de orçamentos com status 'Finalizado'
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6 pt-4 sm:px-6 sm:pt-6 flex flex-col justify-between">
        <div className="mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acumulado (12M)</span>
          <span className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums">
            {formatBRL(totalRevenue)}
          </span>
        </div>
        
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
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
                className="text-[10px] font-medium text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[10px] font-medium text-muted-foreground"
                tickFormatter={(value) => {
                  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
                  return `R$ ${value}`
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    nameKey="revenue"
                    formatter={(value) => formatBRL(Number(value))}
                    labelFormatter={(value, payload) => {
                      return payload[0]?.payload?.fullDate
                    }}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
