'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  className?: string
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => router.back()}
      className={cn('h-10 w-10 rounded-full cursor-pointer shrink-0', className)}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Voltar</span>
    </Button>
  )
}
