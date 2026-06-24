import { Skeleton } from '@/components/ui/skeleton'

export default function ReceiptsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Action Bar Skeleton */}
      <div className="flex flex-col gap-4 bg-card border border-border p-4 rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <Skeleton className="h-10 flex-1 max-w-md rounded-md" />
          <Skeleton className="h-10 w-full md:w-64 rounded-md" />
        </div>
        
        {/* Tabs/Filter Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* List/Cards Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-md shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
