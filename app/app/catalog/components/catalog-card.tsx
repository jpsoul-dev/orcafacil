'use client'

import { Box, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CatalogForm } from '../catalog-form'
import { DeleteItemDialog } from '../delete-item-dialog'
import type { CatalogItem } from '../catalog-form'

interface CatalogCardProps {
  item: CatalogItem & { created_at?: string; unit_measure?: string | null }
}

export function CatalogCard({ item }: CatalogCardProps) {
  const brl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      val,
    )

  return (
    <div className="bg-card border border-border p-5 rounded-xl flex items-start gap-4 shadow-sm hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-md transition-all cursor-pointer font-display animate-fade-in w-full relative group">
      {/* Icon Area */}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
        item.type === 'product'
          ? 'bg-blue-500/10 text-blue-500'
          : 'bg-orange-500/10 text-orange-500'
      }`}>
        {item.type === 'product' ? (
          <Box className="h-5 w-5" />
        ) : (
          <Wrench className="h-5 w-5" />
        )}
      </div>

      {/* Content Area */}
      <div className="min-w-0 flex-1 pr-6">
        <div className="flex items-center gap-2 flex-wrap">
          <CatalogForm
            initialData={item}
            trigger={
              <button className="font-bold text-foreground text-sm sm:text-base text-left hover:text-primary transition-colors cursor-pointer line-clamp-1">
                {item.name}
              </button>
            }
          />
          <Badge
            className={`font-semibold text-[10px] px-2 py-0.5 rounded-md uppercase border shadow-none ${
              item.type === 'product'
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            }`}
          >
            {item.type === 'product' ? 'Produto' : 'Serviço'}
          </Badge>
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-base sm:text-lg font-bold text-foreground">
            {brl(item.unit_price)}
          </span>
          {item.unit_measure && (
            <span className="text-xs text-muted-foreground font-medium">
              / {item.unit_measure}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-3 top-3 flex items-center gap-1 shrink-0">
        <CatalogForm initialData={item} asMenuItem={true} />
        <DeleteItemDialog id={item.id} name={item.name} />
      </div>
    </div>
  )
}
