import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="px-6 h-16 flex items-center border-b bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-700 dark:text-blue-400">
          OrçaFácil
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Criar Conta</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Orçamentos rápidos e <span className="text-blue-600 dark:text-blue-400">profissionais</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
          Crie, gerencie e envie orçamentos para seus clientes em poucos cliques. O sistema ideal para MEIs e pequenos negócios.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-base">
              Começar agora gratuitamente
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
              Acessar minha conta
            </Button>
          </Link>
        </div>
      </main>
      <footer className="py-6 flex flex-col sm:flex-row items-center justify-center border-t bg-white dark:bg-slate-900 text-sm text-slate-500">
        © {new Date().getFullYear()} OrçaFácil. Todos os direitos reservados.
      </footer>
    </div>
  );
}
