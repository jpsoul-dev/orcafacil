import { createClient } from '@/lib/supabase/server'
import { CustomerForm } from './customer-form'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase.from('customers').select('*').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gerencie sua carteira de clientes.</p>
        </div>
        <CustomerForm />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.document || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {customer.phone && <span>{customer.phone}</span>}
                      {customer.email && <span className="text-muted-foreground">{customer.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.address_city ? `${customer.address_city}/${customer.address_state}` : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {/* We will trigger the form directly, so we need a client component for the menu actions or just embed it. 
                              For simplicity, we'll embed the CustomerForm as a child of DropdownMenuItem to act as a trigger 
                          */}
                          <CustomerForm 
                            initialData={customer} 
                            asMenuItem={true}
                          />
                          {/* Ação de excluir precisa de um form ou transition para server action */}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
