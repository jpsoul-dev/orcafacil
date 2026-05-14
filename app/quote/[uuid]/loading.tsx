import { Skeleton } from "@/components/ui/skeleton";

export default function PublicQuoteLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8 animate-in fade-in duration-700">
      {/* Simulation of the A4 Document Header */}
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm p-8 md:p-16 space-y-12 min-h-[90vh]">
        
        {/* Company Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-12 w-64 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>

        <div className="h-px bg-slate-100 w-full" />

        {/* Customer & Quote Info */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-slate-100" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="space-y-4 md:text-right flex flex-col md:items-end">
            <Skeleton className="h-6 w-32 bg-slate-100" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Items Table Skeleton */}
        <div className="space-y-4 pt-8">
          <div className="grid grid-cols-5 gap-4 border-b pb-4">
            <Skeleton className="h-6 col-span-2" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
            <Skeleton className="h-6" />
          </div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <Skeleton className="h-10 col-span-2 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex flex-col items-end gap-4 pt-12">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between items-center border-t pt-4 border-slate-200">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-40 bg-primary/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating loading indicator */}
      <div className="mt-8 text-slate-400 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
        <span className="text-sm font-medium ml-2">Carregando documento...</span>
      </div>
    </div>
  );
}
