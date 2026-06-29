'use client'

import React, { useState, useMemo } from 'react'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { Button } from '@/components/ui/button'
import { Receipt, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { DatePickerWithRange } from '../quotes/components/date-range-picker'
import { DateRange } from 'react-day-picker'
import { useRouter } from 'next/navigation'
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  endOfDay,
} from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ReceiptCard, type ReceiptRow } from './components/receipt-card'

interface ReceiptsListProps {
  initialReceipts: ReceiptRow[]
}

export function ReceiptsList({ initialReceipts }: ReceiptsListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeTab, setTypeTab] = useState<string>('all')
  const [date, setDate] = useState<DateRange | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  }))

  const counts = useMemo(() => {
    const defaultCounts = {
      all: initialReceipts.length,
      standalone: 0,
      quote: 0,
    }
    initialReceipts.forEach((receipt) => {
      const type = receipt.receipt_type
      if (type in defaultCounts) {
        defaultCounts[type as keyof typeof defaultCounts]++
      }
    })
    return defaultCounts
  }, [initialReceipts])

  const dotMap: Record<string, string> = {
    standalone: 'bg-primary',
    quote: 'bg-status-completed',
  }

  const filteredReceipts = useMemo(() => {
    return initialReceipts.filter((receipt) => {
      // Filtrar por aba de tipo
      if (typeTab !== 'all' && receipt.receipt_type !== typeTab) {
        return false
      }

      // Filtrar por intervalo de data (utiliza a data de emissão issued_at)
      if (date?.from && date?.to) {
        if (!receipt.issued_at) return false
        // Evita fuso horário convertendo de formato YYYY-MM-DD
        const [year, month, day] = receipt.issued_at.split('-').map(Number)
        const receiptDate = new Date(year, month - 1, day)
        if (
          !isWithinInterval(receiptDate, {
            start: date.from!,
            end: endOfDay(date.to!),
          })
        )
          return false
      }

      // Filtrar por busca textual
      if (search) {
        const searchLower = search.toLowerCase()
        const customerName = receipt.customer_name?.toLowerCase() || ''
        const title = receipt.title?.toLowerCase() || ''
        const receiptNumber = receipt.receipt_number?.toLowerCase() || ''

        return (
          customerName.includes(searchLower) ||
          title.includes(searchLower) ||
          receiptNumber.includes(searchLower)
        )
      }

      return true
    })
  }, [initialReceipts, date, search, typeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground font-display">
            Meus recibos
          </h2>
          <p className="text-muted-foreground text-ds-body-sm font-medium mt-1">
            Gerencie seus recibos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SubscriptionGuard>
            <Link href="/app/receipts/new">
              <Button className="rounded-md font-semibold transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                <Plus className="mr-1 h-4 w-4" /> Criar Recibo
              </Button>
            </Link>
          </SubscriptionGuard>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card border border-border p-4 rounded-md shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, título ou código..."
            className="pl-9 h-10 rounded-sm border-border bg-card text-ds-body-md focus-visible:ring-ring transition-all duration-ds-fast"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto">
          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="w-full md:w-auto"
          />
          <Tabs
            value={typeTab}
            onValueChange={setTypeTab}
            className="w-full xl:w-auto"
          >
            <TabsList className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-auto bg-muted/50 p-1 rounded-md gap-1 max-w-full justify-start border border-border/50">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'standalone', label: 'Avulso' },
                { value: 'quote', label: 'Orçamento' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {dotMap[tab.value] && (
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotMap[tab.value])} />
                  )}
                  <span>{tab.label}</span>
                  <span className="text-[10px] bg-muted/80 text-muted-foreground rounded-full px-1.5 py-0.2 font-sans">
                    {counts[tab.value as keyof typeof counts]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Receipts List */}
      {filteredReceipts && filteredReceipts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReceipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onDeleted={() => router.refresh()}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-ds-body-sm mt-2 max-w-xs font-medium">
            {date?.from && date?.to
              ? 'Nenhum recibo no período informado.'
              : 'Você ainda não possui recibos emitidos.'}
          </p>
        </div>
      )}
    </div>
  )
}
