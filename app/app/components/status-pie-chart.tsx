'use client'

import * as React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
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

const STATUS_DETAILS = {
  draft: { label: 'Rascunho', color: 'var(--color-text-disabled)' },
  pending: { label: 'Pendente', color: 'var(--color-status-pending)' },
  approved: { label: 'Aprovado', color: 'var(--color-status-approved)' },
  rejected: { label: 'Rejeitado', color: 'var(--color-status-rejected)' },
  cancelled: { label: 'Cancelado', color: 'var(--color-status-cancelled)' },
  completed: { label: 'Finalizado', color: 'var(--color-status-completed)' },
  expired: { label: 'Vencido', color: 'var(--color-text-disabled)' },
}

const chartConfig = {
  count: {
    label: 'Quantidade',
  },
  draft: { label: 'Rascunho', color: 'var(--color-text-disabled)' },
  pending: { label: 'Pendente', color: 'var(--color-status-pending)' },
  approved: { label: 'Aprovado', color: 'var(--color-status-approved)' },
  rejected: { label: 'Rejeitado', color: 'var(--color-status-rejected)' },
  cancelled: { label: 'Cancelado', color: 'var(--color-status-cancelled)' },
  completed: { label: 'Finalizado', color: 'var(--color-status-completed)' },
  expired: { label: 'Vencido', color: 'var(--color-text-disabled)' },
} satisfies ChartConfig

interface StatusPieChartProps {
  quotes: { status: string }[]
}

export function StatusPieChart({ quotes }: StatusPieChartProps) {
  const chartData = React.useMemo(() => {
    const counts = quotes.reduce((acc: Record<string, number>, quote) => {
      const status = quote.status || 'draft'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(STATUS_DETAILS).map(([status, info]) => {
      const count = counts[status] || 0
      return {
        name: info.label,
        value: count,
        statusKey: status,
        fill: info.color,
      }
    }).filter(item => item.value > 0)
  }, [quotes])

  const totalQuotes = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  if (quotes.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm flex flex-col justify-center items-center p-8 h-[350px] rounded-lg">
        <p className="text-ds-body-sm font-semibold text-muted-foreground">Nenhum orçamento registrado para exibir</p>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden flex flex-col h-full rounded-lg">
      <CardHeader className="px-6 py-5 pb-2">
        <CardTitle className="text-ds-heading-xs font-bold tracking-tight text-foreground">Distribuição por Situação</CardTitle>
        <CardDescription className="text-ds-body-sm font-medium text-muted-foreground">
          Quantidade de orçamentos em cada status do ciclo de vida
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6 pt-0 flex flex-col justify-between">
        <div className="relative aspect-square max-h-[220px] w-full mx-auto my-4">
          <ChartContainer
             config={chartConfig}
            className="mx-auto aspect-square h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-ds-heading-lg font-bold text-foreground tracking-tighter">
              {totalQuotes}
            </span>
            <span className="text-ds-caption font-bold text-muted-foreground uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Legenda customizada premium */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-ds-body-sm font-semibold px-2">
          {chartData.map((item) => (
            <div key={item.statusKey} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-foreground/80 truncate font-medium">{item.name}</span>
              <span className="ml-auto text-muted-foreground/80 tabular-nums font-bold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
