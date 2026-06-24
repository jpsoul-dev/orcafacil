'use client'

import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-static'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center select-none">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20">
          <WifiOff className="size-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Sem conexão com a internet
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Parece que você está offline. Verifique sua conexão com a rede e tente novamente para continuar usando o OrçaFácil.
          </p>
        </div>

        <Button onClick={handleRetry} className="w-full sm:w-auto" variant="default">
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
