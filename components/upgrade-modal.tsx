'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Zap, Check, Sparkles } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const benefits = [
    'Criação ilimitada de orçamentos profissionais',
    'PDFs personalizados com a identidade do seu negócio',
    'Catálogo ilimitado de itens e serviços',
    'Painel financeiro de alto desempenho e relatórios',
    'Suporte prioritário via WhatsApp e e-mail',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-border shadow-lg bg-card rounded-xl animate-in fade-in-50 zoom-in-95 duration-ds-normal">
        {/* Header com Gradiente Estiloso */}
        <div className="relative h-32 gradient-primary flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-40" />
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-black/10 blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center gap-1.5 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/20 backdrop-blur-md shadow-sm border border-white/20">
              <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-ds-heading-sm font-bold text-foreground flex items-center justify-center gap-2">
              Assine o Plano Pro <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
            </DialogTitle>
            <DialogDescription className="text-ds-body-sm text-muted-foreground font-medium px-4">
              Seu período de teste terminou. Mas seu negócio não precisa parar. Continue criando orçamentos incríveis e feche mais negócios!
            </DialogDescription>
          </DialogHeader>

          {/* Lista de Benefícios */}
          <div className="bg-muted/40 rounded-md p-4 border border-border/50 space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2.5 text-ds-body-sm font-medium text-foreground/80">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-2.5 pt-2">
            <Link href="/pricing" onClick={() => onOpenChange(false)} className="block w-full">
              <Button className="w-full h-11 rounded-md font-semibold bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-ds-fast shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                Ativar Minha Assinatura
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground text-xs font-semibold rounded-sm h-8 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Talvez mais tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
