import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileText, MoreHorizontal, ExternalLink, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, customer:customers(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">Crie e gerencie seus orçamentos.</p>
        </div>
        <Link href="/app/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Orçamento
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes && quotes.length > 0 ? (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      ORC-{quote.quote_number?.toString().padStart(4, '0')}
                    </span>
                  </TableCell>
                  <TableCell>{quote.customer?.name || 'Cliente Avulso'}</TableCell>
                  <TableCell>{format(new Date(quote.created_at), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{quote.valid_until ? format(new Date(quote.valid_until), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell className="font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}
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
                          <DropdownMenuItem render={
                            <Link href={`/quote/${quote.public_uuid}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" /> Ver / Imprimir
                            </Link>
                          } />
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum orçamento gerado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
