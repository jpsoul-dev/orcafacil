'use client'

import React, { useState, useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns, type ReceiptRow } from './columns'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { Button } from '@/components/ui/button'
import { Receipt, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { DatePickerWithRange } from '../quotes/components/date-range-picker'
import { DateRange } from 'react-day-picker'
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  endOfDay,
} from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ReceiptsListProps {
  initialReceipts: ReceiptRow[]
}

export function ReceiptsList({ initialReceipts }: ReceiptsListProps) {
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
    all: 'bg-slate-400',
    standalone: 'bg-indigo-500',
    quote: 'bg-emerald-500',
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
    <div className="space-y-6 [&>*:first-child]:mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Meus recibos
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie seus recibos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SubscriptionGuard>
            <Link href="/app/receipts/new">
              <Button className="h-10 font-bold bg-slate-950 hover:bg-slate-800 text-white gap-2 rounded-lg">
                <Plus className="h-4 w-4" /> Criar Recibo
              </Button>
            </Link>
          </SubscriptionGuard>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente, título ou código..."
            className="pl-9 h-10 border-slate-200 rounded-lg bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto">
          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="h-10"
          />
          <Tabs
            value={typeTab}
            onValueChange={setTypeTab}
            className="w-full xl:w-auto animate-in fade-in duration-200"
          >
            <TabsList className="flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-auto bg-slate-100 p-1 rounded-lg gap-1 max-w-full justify-start">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'standalone', label: 'Avulso' },
                { value: 'quote', label: 'Orçamento' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-1.5 rounded-md transition-all shrink-0 flex items-center gap-1.5"
                >
                  {dotMap[tab.value] && (
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotMap[tab.value])} />
                  )}
                  <span>{tab.label}</span>
                  <span className="text-[10px] bg-slate-200/50 text-slate-500 data-[state=active]:bg-slate-100 rounded-full px-1.5 py-0.2 font-mono">
                    {counts[tab.value as keyof typeof counts]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Receipts List Table */}
      {filteredReceipts && filteredReceipts.length > 0 ? (
        <DataTable columns={columns} data={filteredReceipts} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
            <Receipt className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm mt-2 max-w-xs font-medium">
            {date?.from && date?.to
              ? 'Nenhum recibo no período informado.'
              : 'Você ainda não possui recibos emitidos.'}
          </p>
        </div>
      )}
    </div>
  )
}
