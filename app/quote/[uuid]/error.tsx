"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { FileQuestion, RefreshCcw, Mail } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function PublicQuoteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na visualização pública do orçamento:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-50/50">
      <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-xl border border-blue-200 animate-bounce">
        <FileQuestion className="w-12 h-12" />
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-slate-900">
        Não conseguimos carregar este orçamento
      </h1>
      
      <p className="text-slate-600 text-xl max-w-lg mb-10 leading-relaxed">
        Houve um problema técnico ao tentar recuperar as informações. 
        Isso pode ser uma oscilação momentânea no servidor.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
        <Button 
          onClick={() => reset()} 
          size="lg" 
          className="font-bold px-10 h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:scale-105 w-full sm:w-auto"
        >
          <RefreshCcw className="mr-2 h-6 w-6" />
          Tentar Novamente
        </Button>
        
        <a 
          href="mailto:suporte@orcafacil.com.br"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "font-bold px-10 h-14 text-lg border-slate-300 text-slate-700 hover:bg-slate-100 w-full sm:w-auto"
          )}
        >
          <Mail className="mr-2 h-6 w-6" />
          Suporte
        </a>
      </div>
      
      <div className="mt-16 pt-8 border-t border-slate-200 w-full max-w-sm">
        <p className="text-sm text-slate-400">
          Se você recebeu este link de uma empresa, recomendamos entrar em contato diretamente com eles.
        </p>
      </div>
    </div>
  );
}
