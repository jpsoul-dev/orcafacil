'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { cn } from '@/lib/utils'

interface ResponsivePaginationProps {
  pageIndex: number
  pageSize: number
  totalItems: number
  onPageIndexChange: (index: number) => void
  onPageSizeChange: (size: number) => void
  mobileLimit: number
  onMobileLimitChange: (limit: number) => void
  itemsPerPageOptions?: number[]
}

export function ResponsivePagination({
  pageIndex,
  pageSize,
  totalItems,
  onPageIndexChange,
  onPageSizeChange,
  mobileLimit,
  onMobileLimitChange,
  itemsPerPageOptions = [10, 25, 50, 100],
}: ResponsivePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)

  const handleNextPage = () => {
    onPageIndexChange(Math.min(pageIndex + 1, totalPages - 1))
  }

  const handlePrevPage = () => {
    onPageIndexChange(Math.max(pageIndex - 1, 0))
  }

  const handlePageClick = (idx: number) => {
    onPageIndexChange(idx)
  }

  const handleLoadMore = () => {
    onMobileLimitChange(Math.min(mobileLimit + 10, totalItems))
  }

  return (
    <>
      {/* Pagination Desktop */}
      <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60 w-full">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.max(totalPages, 1) }).map((_, idx) => (
            <Button
              key={idx}
              variant={pageIndex === idx ? 'default' : 'outline'}
              className={cn(
                'h-8 w-8 text-xs font-semibold cursor-pointer',
                pageIndex === idx
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              onClick={() => handlePageClick(idx)}
              disabled={totalPages <= 1}
            >
              {idx + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={handleNextPage}
            disabled={pageIndex === totalPages - 1 || totalPages <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
            Por página:
          </span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (value) {
                onPageSizeChange(Number(value))
                onPageIndexChange(0)
              }
            }}
          >
            <SelectTrigger className="h-8 w-20 text-xs bg-card font-semibold rounded-sm border-border cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {itemsPerPageOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Mobile (Carregar Mais) */}
      <div className="flex sm:hidden flex-col items-center pt-4 border-t border-border/60 w-full">
        {totalItems > mobileLimit ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <span className="text-xs text-muted-foreground font-medium">
              Exibindo {mobileLimit} de {totalItems} registros
            </span>
            <Button
              variant="outline"
              className="w-full h-11 font-semibold rounded-md cursor-pointer border-border hover:bg-muted active:scale-[0.98] transition-transform"
              onClick={handleLoadMore}
            >
              Carregar Mais
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">
            Exibindo todos os {totalItems} registros
          </span>
        )}
      </div>
    </>
  )
}
