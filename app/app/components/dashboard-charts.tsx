'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const QuotesChart = dynamic(() => import('./quotes-chart').then(mod => mod.QuotesChart), {
  ssr: false,
  loading: () => <Skeleton className="h-75 w-full rounded-2xl border border-border/40 bg-card/50 shadow-sm" />
})

const StatusPieChart = dynamic(() => import('./status-pie-chart').then(mod => mod.StatusPieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-75 w-full rounded-2xl border border-border/40 bg-card/50 shadow-sm" />
})

const RevenueBarChart = dynamic(() => import('./revenue-bar-chart').then(mod => mod.RevenueBarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-75 w-full rounded-2xl border border-border/40 bg-card/50 shadow-sm" />
})

interface DashboardChartsProps {
  quotes: any[]
}

export function DashboardCharts({ quotes }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <QuotesChart quotes={quotes} />
      </div>
      <div className="lg:col-span-1">
        <StatusPieChart quotes={quotes} />
      </div>
      <div className="lg:col-span-3">
        <RevenueBarChart quotes={quotes} />
      </div>
    </div>
  )
}
