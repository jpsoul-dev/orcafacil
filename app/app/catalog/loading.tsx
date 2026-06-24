import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex gap-2 pb-1 border-b border-border/40">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md shrink-0" />
        ))}
      </div>

      {/* Grid of items (Mobile & Desktop layout unified skeleton) */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border p-4 rounded-md flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-4 w-12 rounded-sm" />
              </div>
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
