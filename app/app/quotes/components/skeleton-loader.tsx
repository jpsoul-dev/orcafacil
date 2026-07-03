'use client'

import React from 'react'

export function SkeletonLoader() {
  // Simular 5 linhas de carregamento compactas
  const skeletonRows = Array.from({ length: 5 })

  return (
    <div className="space-y-6">
      {/* 1. Header Desktop Skeleton */}
      <div className="hidden sm:flex items-center justify-between pb-4 border-b border-slate-100 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-200 rounded-md" />
            <div className="h-4 w-48 bg-slate-200 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-md" />
      </div>

      {/* 2. Search Bar Skeleton */}
      <div className="flex items-center gap-3 w-full animate-pulse">
        <div className="flex-1 h-10 bg-slate-200 rounded-md" />
        <div className="h-10 w-24 bg-slate-200 rounded-md shrink-0" />
      </div>

      {/* 3. List Lines Skeleton */}
      <div className="border border-slate-100 rounded-md bg-card divide-y divide-slate-100 overflow-hidden shadow-xs animate-pulse">
        {skeletonRows.map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1">
              {/* ID & Date */}
              <div className="space-y-1 shrink-0">
                <div className="h-3 w-12 bg-slate-200 rounded-sm" />
                <div className="h-2.5 w-16 bg-slate-200 rounded-sm" />
              </div>
              {/* Title & Customer */}
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-1/3 bg-slate-200 rounded-sm" />
                <div className="h-3 w-1/4 bg-slate-200 rounded-sm" />
              </div>
            </div>
            {/* Total & Status */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
              <div className="h-4 w-16 bg-slate-200 rounded-sm" />
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
