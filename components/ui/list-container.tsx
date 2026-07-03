'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ListContainerProps {
  children: React.ReactNode
  isPending?: boolean
  className?: string
}

/**
 * Reusable List Container component (FR-006 / UX-Layout).
 * Standardizes the list layouts across different views (Quotes, Catalog, Customers, etc.)
 * by unifying borders, dividers, background card, and loading/transition states.
 */
export function ListContainer({
  children,
  isPending = false,
  className,
}: ListContainerProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-md bg-card divide-y divide-border overflow-hidden select-none transition-opacity duration-200",
        isPending && "opacity-60 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  )
}
