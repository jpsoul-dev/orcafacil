"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Erro global capturado:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 border border-destructive/20 shadow-lg">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
        Algo não saiu como planejado
      </h1>
      
      <p className="text-muted-foreground text-xl max-w-lg mb-10 leading-relaxed">
        Ocorreu um erro inesperado. Nossa equipe técnica já foi notificada. 
        Por favor, tente recarregar a página ou voltar para onde você estava.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
        <Button 
          onClick={() => reset()} 
          size="lg" 
          className="font-bold px-8 h-14 text-lg shadow-xl hover:scale-105 transition-transform w-full sm:w-auto"
        >
          <RefreshCcw className="mr-2 h-6 w-6" />
          Recarregar Página
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => router.back()}
          className="font-bold px-8 h-14 text-lg w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-6 w-6" />
          Voltar
        </Button>
      </div>

      <div className="mt-16 text-sm text-muted-foreground/60">
        <p>Código de rastreamento: <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{error.digest || 'ERR-ROOT'}</span></p>
      </div>
    </div>
  );
}
