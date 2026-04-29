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

  return (
    <div className="flex items-center gap-2 mb-6">
      <BaseButton
        onClick={() => handleFilter('all')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${currentStatus === 'all'
          ? 'bg-slate-800 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
      >
        Todos
      </BaseButton>
      <BaseButton
        onClick={() => handleFilter('draft')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${currentStatus === 'draft'
          ? 'bg-slate-800 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
      >
        Rascunhos
      </BaseButton>
      <BaseButton
        onClick={() => handleFilter('completed')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${currentStatus === 'completed'
          ? 'bg-slate-800 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
      >
        Concluídos
      </BaseButton>
    </div>
  )
}
