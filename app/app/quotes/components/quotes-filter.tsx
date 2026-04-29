'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button as BaseButton } from '@base-ui/react/button'

export function QuotesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') || 'all'

  const handleFilter = (status: string) => {
    if (status === 'all') {
      router.push('/app/quotes')
    } else {
      router.push(`/app/quotes?status=${status}`)
    }
  }

  const statuses = [
    { id: 'all', label: 'Todos' },
    { id: 'draft', label: 'Rascunhos' },
    { id: 'open', label: 'Em Aberto' },
    { id: 'accepted', label: 'Aceitos' },
    { id: 'rejected', label: 'Rejeitados' },
    { id: 'expired', label: 'Expirados' },
  ]

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
      {statuses.map((status) => (
        <BaseButton
          key={status.id}
          onClick={() => handleFilter(status.id)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${currentStatus === status.id
            ? 'bg-slate-800 text-white shadow-sm'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          {status.label}
        </BaseButton>
      ))}
    </div>
  )
}
