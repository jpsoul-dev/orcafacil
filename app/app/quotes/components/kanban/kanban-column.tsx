'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'
import { FileText } from 'lucide-react'

interface ColumnProps {
  id: string
  title: string
  quotes: any[]
  color: string
}

export function KanbanColumn({ id, title, quotes, color }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col h-full w-full min-w-[300px] bg-slate-50/50 rounded-2xl border border-slate-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${color}`} />
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <span className="text-xs text-slate-400 font-medium">{quotes.length}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <FileText className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[500px]"
      >
        <SortableContext items={quotes.map(q => q.id)} strategy={verticalListSortingStrategy}>
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <KanbanCard key={quote.id} quote={quote} />
            ))
          ) : (
            <div className="h-32 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4">
              <FileText className="h-6 w-6 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">Sem orçamentos nesta categoria</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
