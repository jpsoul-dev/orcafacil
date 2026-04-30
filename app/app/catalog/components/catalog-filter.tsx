'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button as BaseButton } from '@base-ui/react/button'

export function CatalogFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('type') || 'all'

  const handleFilter = (type: string) => {
    if (type === 'all') {
      router.push('/app/catalog')
    } else {
      router.push(`/app/catalog?type=${type}`)
    }
  }

  const types = [
    { id: 'all', label: 'Todos' },
    { id: 'product', label: 'Produtos' },
    { id: 'service', label: 'Serviços' },
  ]

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
      {types.map((type) => (
        <BaseButton
          key={type.id}
          onClick={() => handleFilter(type.id)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${currentType === type.id
            ? 'bg-slate-800 text-white shadow-sm'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          {type.label}
        </BaseButton>
      ))}
    </div>
  )
}
