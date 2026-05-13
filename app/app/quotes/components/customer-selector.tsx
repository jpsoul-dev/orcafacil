'use client'

import { useState, useMemo } from 'react'
import { Check, UserPlus, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Customer, CustomerForm } from '@/app/app/customers/customer-form'

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
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === value)
  }, [value, customers])

  // Filtra clientes localmente baseado no termo de busca
  const filteredCustomers = useMemo(() => {
    const s = search.toLowerCase().trim()
    if (s === '') return customers.slice(0, 10) // Mostra os primeiros 10 por padrão

    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          (c.document && c.document.includes(s)) ||
          (c.whatsapp && c.whatsapp.includes(s)),
      )
      .slice(0, 20) // Limita resultados para performance
  }, [customers, search])

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            nativeButton={true}
            render={
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  'flex-1 justify-between h-10 px-4 border-slate-200 rounded-lg bg-white hover:bg-slate-50 font-normal transition-all',
                  !selectedCustomer && 'text-slate-500',
                  selectedCustomer &&
                    'text-slate-900 font-medium border-slate-300 shadow-sm',
                  error && 'border-red-500 ring-red-50/50',
                )}
              >
                <span className="truncate">
                  {selectedCustomer
                    ? selectedCustomer.name
                    : 'Selecionar cliente'}
                </span>
                <div className="flex items-center gap-1.5">
                  {value && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        onChange(null)
                      }}
                      className="p-1 hover:bg-slate-100 rounded-md transition-colors mr-1 group"
                      title="Remover seleção"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </div>
                  )}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200',
                      open && 'rotate-180',
                    )}
                  />
                </div>
              </Button>
            }
          />

          <PopoverContent
            className="w-(--base-ui-popover-trigger-width) min-w-(--base-ui-popover-trigger-width) p-0 shadow-2xl border-slate-200 rounded-xl overflow-hidden"
            align="start"
            sideOffset={4}
          >
            <Command shouldFilter={false} className="w-full">
              <CommandInput
                placeholder="Buscar por nome, CPF/CNPJ ou WhatsApp..."
                value={search}
                onValueChange={setSearch}
                className="h-11 border-none focus:ring-0"
              />
              <CommandList className="max-h-[300px] no-scrollbar p-1">
                <CommandEmpty className="py-6 flex flex-col items-center justify-center text-center px-4">
                  <p className="text-sm text-slate-500 mb-3">
                    Nenhum cliente encontrado
                  </p>
                  <CustomerForm
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold border-slate-200"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-2" />
                        Criar novo cliente
                      </Button>
                    }
                  />
                </CommandEmpty>

                <div className="overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => {
                        onChange(customer.id)
                        setOpen(false)
                        setSearch('')
                      }}
                      className="flex items-center justify-between py-2 px-3 cursor-pointer rounded-md data-[selected=true]:bg-slate-100 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {customer.name}
                        </span>
                        {(customer.document || customer.whatsapp) && (
                          <div className="flex items-center gap-2 mt-0.5 opacity-60">
                            {customer.document && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {customer.document}
                              </span>
                            )}
                            {customer.whatsapp && (
                              <span className="text-[10px] text-slate-400">
                                {customer.whatsapp}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {value === customer.id && (
                        <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </div>
              </CommandList>

              <div className="p-1 border-t border-slate-100">
                <CustomerForm
                  trigger={
                    <button
                      type="button"
                      className="flex w-full items-center py-2 px-3 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar novo cliente
                    </button>
                  }
                />
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        <CustomerForm
          trigger={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg border-slate-200 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-sm"
              title="Cadastrar novo cliente"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {error && (
        <p className="text-[11px] font-medium text-red-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}
