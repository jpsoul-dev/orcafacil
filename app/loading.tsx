import { Spinner } from "@/components/ui/spinner";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center">
          {/* Animated rings for a premium feel */}
          <div className="absolute w-24 h-24 border-4 border-primary/5 rounded-full animate-[ping_2s_ease-in-out_infinite]" />
          <div className="absolute w-16 h-16 border-4 border-primary/10 rounded-full animate-[ping_1.5s_ease-in-out_infinite]" />
          
          <div className="bg-primary/10 p-5 rounded-full backdrop-blur-sm border border-primary/20 shadow-2xl relative z-10">
            <Spinner className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground animate-pulse">Orça Fácil</h2>
          <p className="text-muted-foreground font-medium opacity-80">Preparando seu ambiente...</p>
        </div>
      </div>
    </div>
  );
}
