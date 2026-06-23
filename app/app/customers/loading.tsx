import { Skeleton } from '@/components/ui/skeleton'

export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-slate-50/50 flex justify-between items-center gap-4">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <div className="p-4 space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 pb-2 border-b border-border">
            <Skeleton className="h-4 col-span-3 rounded" />
            <Skeleton className="h-4 col-span-3 rounded" />
            <Skeleton className="h-4 col-span-2 rounded" />
            <Skeleton className="h-4 col-span-2 rounded" />
            <Skeleton className="h-4 col-span-2 rounded" />
          </div>
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 py-2 items-center">
              <Skeleton className="h-5 col-span-3 rounded" />
              <Skeleton className="h-5 col-span-3 rounded" />
              <Skeleton className="h-5 col-span-2 rounded" />
              <Skeleton className="h-5 col-span-2 rounded" />
              <div className="col-span-2 flex justify-end">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
