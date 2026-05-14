"use client";

import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para console (pode ser integrado com Sentry/etc no futuro)
    console.error("Erro capturado pela rota /app:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-sm border border-destructive/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Ops! Algo deu errado.</h2>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        Não conseguimos carregar as informações desta página. Isso pode ser um problema temporário de conexão ou um erro inesperado no sistema.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-sm sm:max-w-none">
        <Button 
          onClick={() => reset()} 
          size="lg" 
          variant="default"
          className="font-semibold px-8 h-12 shadow-md transition-all hover:scale-105 w-full sm:w-auto"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Tentar novamente
        </Button>
        
        <Link 
          href="/app" 
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "font-semibold px-8 h-12 hover:bg-secondary w-full sm:w-auto"
          )}
        >
          <Home className="mr-2 h-5 w-5" />
          Voltar ao Início
        </Link>
      </div>

      <div className="mt-12 p-4 bg-muted/30 rounded-lg border border-dashed max-w-lg w-full">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Detalhes técnicos</p>
        <p className="text-xs text-muted-foreground font-mono break-all opacity-70">
          ID: {error.digest || 'N/A'}
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Se o problema persistir, entre em contato com nossa equipe de suporte.
        </p>
      </div>
    </div>
  );
}
