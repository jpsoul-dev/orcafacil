'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Box, Wrench, LayoutGrid } from 'lucide-react'

export function CatalogFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('type') || 'all'

  const handleFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    params.delete('page')
    params.delete('limit')
    router.push(`/app/catalog?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-border p-4 rounded-md shadow-sm">
      <Tabs value={currentType} onValueChange={handleFilter} className="w-full sm:w-auto">
        <TabsList className="flex flex-nowrap h-auto bg-muted/50 p-1 rounded-md gap-1 max-w-full justify-start border border-border/50">
          <TabsTrigger
            value="all"
            className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Todos</span>
          </TabsTrigger>
          <TabsTrigger
            value="product"
            className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Box className="h-4 w-4" />
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger
            value="service"
            className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="h-4 w-4" />
            <span>Serviços</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
