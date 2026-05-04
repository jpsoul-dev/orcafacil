'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, FileText, User } from 'lucide-react'
import Link from 'next/link'

interface Quote {
  id: string
  title: string
  hash_id: string
  total: number
  status: string
  created_at: string
  valid_until?: string | null
  customers?: { name: string } | null
}

export function KanbanCard({ quote }: { quote: Quote }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: quote.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/app/quotes/${quote.id}`}>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-slate-200">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">
                {quote.customers?.name || 'Cliente não informado'}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1">
                {quote.title}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex flex-col">
                <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-slate-100 text-slate-600 border-none">
                  OR {quote.hash_id}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Calendar className="h-4 w-4 text-slate-300" />
                Venc. {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') : '-'}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
