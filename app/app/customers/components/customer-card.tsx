'use client'

import { Phone, Mail, MessageSquare, MoreVertical, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomerForm } from '../customer-form'
import { DeleteCustomerDialog } from './delete-customer-dialog'
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

  const cleanNumber = (num?: string | null) => {
    if (!num) return ''
    return num.replace(/\D/g, '')
  }

  const initials = getInitials(customer.name)
  const phoneClean = cleanNumber(customer.phone)
  const whatsappClean = cleanNumber(customer.whatsapp || customer.phone)

  return (
    <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm animate-fade-in font-display">
      <div className="flex items-center gap-3 min-w-0">
        <Link href={`/app/customers/${customer.id}`} className="shrink-0">
          <Avatar className="h-10 w-10 border border-slate-100 bg-slate-50">
            <AvatarFallback className="font-bold text-sm text-primary font-display bg-blue-50">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0">
          <Link
            href={`/app/customers/${customer.id}`}
            className="font-bold text-foreground hover:text-primary transition-colors text-sm block truncate font-display"
          >
            {customer.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {customer.email ? (
              <span className="text-xs text-muted-foreground truncate block">
                {customer.email}
              </span>
            ) : (
              <span className="text-xs text-slate-300">Sem e-mail</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Links de Contato Rápido */}
        {phoneClean && (
          <a
            href={`tel:${phoneClean}`}
            aria-label="Ligar para cliente"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 shrink-0 transition-colors"
          >
            <Phone className="h-4 w-4" />
          </a>
        )}

        {whatsappClean && (
          <a
            href={`https://wa.me/55${whatsappClean}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enviar mensagem no WhatsApp"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-green-600 hover:bg-green-50 shrink-0 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </a>
        )}

        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            aria-label="Enviar e-mail para cliente"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 shrink-0 transition-colors"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              />
            }
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Opções</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <CustomerForm
              initialData={customer}
              trigger={
                <button className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left font-medium">
                  <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                  Editar
                </button>
              }
            />
            <DeleteCustomerDialog
              id={customer.id}
              name={customer.name}
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 font-medium cursor-pointer"
                >
                  <Trash className="h-4 w-4 mr-2 text-red-400" />
                  Excluir
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
