import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerForm } from './customer-form'
import { Users } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { CustomerService } from '@/lib/services/customer-service'
import { CustomerCard } from './components/customer-card'

export default async function CustomersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await CustomerService.getCustomers(user.id)
  const customers = result.success ? result.data : []

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Gerenciar Clientes
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Cadastre e consulte os dados dos seus clientes.
          </p>
        </div>
        <CustomerForm />
      </div>

      {/* Tabela, Cards ou Empty State */}
      {customers.length > 0 ? (
        <>
          {/* Listagem Desktop/Tablet */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={customers}
              searchKey="name"
              searchPlaceholder="Buscar por nome, e-mail ou telefone..."
            />
          </div>

          {/* Listagem Mobile */}
          <div className="space-y-3 md:hidden">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg font-display text-foreground">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Adicione seu primeiro cliente para vinculá-lo aos orçamentos.
          </p>
          <div className="mt-5">
            <CustomerForm />
          </div>
        </div>
      )}
    </div>
  )
}
