'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { updateQuoteStatus } from '../../actions'
import { toast } from 'sonner'

const COLUMNS = [
  { id: 'draft', title: 'Rascunho', color: 'bg-slate-400' },
  { id: 'open', title: 'Pendente', color: 'bg-indigo-600' },
  { id: 'accepted', title: 'Aprovado', color: 'bg-emerald-600' },
  { id: 'rejected', title: 'Rejeitado', color: 'bg-red-600' },
]

export function KanbanBoard({ initialQuotes }: { initialQuotes: any[] }) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setQuotes(initialQuotes)
  }, [initialQuotes])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getQuotesByStatus = (status: string) => {
    return quotes.filter((q) => q.status === status)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeQuoteId = active.id as string
    const overId = over.id as string

    // Encontrar o status de destino
    let newStatus = overId
    if (!COLUMNS.find(c => c.id === overId)) {
      // Se dropou em cima de um card, pegar o status desse card
      const overQuote = quotes.find(q => q.id === overId)
      if (overQuote) newStatus = overQuote.status
    }

    const activeQuote = quotes.find(q => q.id === activeQuoteId)
    if (!activeQuote || activeQuote.status === newStatus) return

    // Otimista update local
    const oldQuotes = [...quotes]
    setQuotes(quotes.map(q => q.id === activeQuoteId ? { ...q, status: newStatus } : q))

    // Update no banco
    const result = await updateQuoteStatus(activeQuoteId, newStatus)
    if (result.error) {
      toast.error('Erro ao mover orçamento')
      setQuotes(oldQuotes)
    } else {
      toast.success(`Orçamento movido para ${COLUMNS.find(c => c.id === newStatus)?.title}`)
    }
  }

  const activeQuote = activeId ? quotes.find((q) => q.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            quotes={getQuotesByStatus(col.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeQuote ? <KanbanCard quote={activeQuote} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
