import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6 animate-in fade-in duration-500">
      {/* Header Loading State */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-[80%] rounded-md" />
      </div>

      {/* Stats/Grid Loading State */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl border border-border/40 shadow-sm" />
        <Skeleton className="h-32 rounded-2xl border border-border/40 shadow-sm" />
        <Skeleton className="h-32 rounded-2xl border border-border/40 shadow-sm" />
      </div>

      {/* Main Content Area Loading State */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
        
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-1 overflow-hidden shadow-sm">
          <div className="space-y-4 p-6">
            <div className="flex gap-4 border-b pb-4 border-border/40">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle floating indicator for ongoing background processes */}
      <div className="fixed bottom-10 right-10 z-50 pointer-events-none">
        <div className="bg-primary/5 backdrop-blur-xl p-4 rounded-full border border-primary/20 shadow-2xl animate-pulse">
          <Spinner className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
