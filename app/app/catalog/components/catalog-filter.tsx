'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Box, Wrench, LayoutGrid } from 'lucide-react'

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

  return (
    <div className="flex items-center justify-between gap-4 mb-2">
      <Tabs value={currentType} onValueChange={handleFilter} className="w-fit">
        <TabsList className="bg-muted/50 border border-border p-1 h-11">
          <TabsTrigger value="all" className="px-4 py-2 gap-2 h-9 data-active:bg-white data-active:shadow-sm">
            <LayoutGrid className="h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="product" className="px-4 py-2 gap-2 h-9 data-active:bg-white data-active:shadow-sm">
            <Box className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="service" className="px-4 py-2 gap-2 h-9 data-active:bg-white data-active:shadow-sm">
            <Wrench className="h-4 w-4" />
            Serviços
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
