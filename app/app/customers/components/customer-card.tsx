'use client'

import { Phone, Mail, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import type { Customer } from '@/lib/services/customer-service'

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 0 || !parts[0]) return 'C'
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase()
  }

  const initials = getInitials(customer.name)

  return (
    <Link 
      href={`/app/customers/${customer.id}`}
      className="bg-card border border-border p-4 rounded-xl flex items-start gap-4 shadow-sm hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-md transition-all cursor-pointer font-display animate-fade-in w-full"
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarFallback className="font-bold text-sm text-primary font-display bg-primary/10 transition-colors">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <span className="font-bold text-foreground text-sm sm:text-base block truncate font-display">
          {customer.name}
        </span>
        
        <div className="flex flex-col gap-1.5 mt-2">
          {customer.email ? (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {customer.email}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground opacity-40 shrink-0" />
              <span className="text-xs text-muted-foreground opacity-60">Sem e-mail</span>
            </div>
          )}

          {(customer.whatsapp || customer.phone) ? (
            <div className="flex items-center gap-1.5">
              {customer.whatsapp ? (
                <MessageSquare className="h-3.5 w-3.5 text-[#25D366] shrink-0" />
              ) : (
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="text-xs font-medium text-muted-foreground truncate">
                {customer.whatsapp || customer.phone}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground opacity-40 shrink-0" />
              <span className="text-xs text-muted-foreground opacity-60">Sem telefone</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
