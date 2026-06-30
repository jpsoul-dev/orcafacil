'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { EntitySelector } from '@/components/ui/entity-selector'
import Link from 'next/link'
import type { Customer } from '@/lib/services/customer-service'

interface CustomerSelectorProps {
  customers: Customer[]
  value: string | null
  onChange: (value: string | null) => void
  error?: string
}

export function CustomerSelector({
  customers,
  value,
  onChange,
  error,
}: CustomerSelectorProps) {
  return (
    <div className="w-full">
      <EntitySelector<Customer>
        title="Selecionar Cliente"
        items={customers}
        value={value}
        onChange={onChange}
        getItemKey={(c) => c.id}
        getItemLabel={(c) => c.name}
        getItemDescription={(c) => c.document || ""}
        getItemSecondaryLabel={(c) => c.whatsapp || ""}
        placeholder="Selecionar cliente"
        searchPlaceholder="Buscar por nome, CPF/CNPJ ou WhatsApp"
        emptyStateText="Nenhum cliente encontrado"
        error={!!error}
        renderCreateAction={() => (
          <Link href="/app/customers/new" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-full text-sm font-semibold border-input rounded-md flex items-center justify-center transition-all duration-ds-fast hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar novo cliente
            </Button>
          </Link>
        )}
      />

      <FormError message={error} className="mt-1.5" />
    </div>
  )
}
