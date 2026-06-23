'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { Combobox } from '@/components/ui/combobox'
import { CustomerForm } from '@/app/app/customers/customer-form'
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
      <div className="flex items-center gap-2">
        <Combobox<Customer>
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
            <CustomerForm
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-semibold border-input rounded-sm"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-2" />
                  Cadastrar novo cliente
                </Button>
              }
            />
          )}
        />

        <CustomerForm
          trigger={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-sm border-input hover:bg-muted/80 transition-all duration-ds-fast cursor-pointer flex items-center justify-center"
              title="Cadastrar novo cliente"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <FormError message={error} className="mt-1.5" />
    </div>
  )
}
