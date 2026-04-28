import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { PrintButton } from './print-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function PublicQuotePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const supabase = await createClient()

  // @ts-ignore - Supabase types might not include the RPC yet
  const { data: quote, error } = await supabase.rpc('get_public_quote', { p_uuid: uuid })

  if (error || !quote) {
    console.error(error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-sm sm:rounded-lg overflow-hidden print:shadow-none print:dark:bg-white">
        {/* Actions - hidden on print */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 flex justify-end print:hidden">
          <PrintButton />
        </div>

        <div className="p-8 print:p-0 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-8">
            <div className="flex items-center gap-4">
              {quote.company?.logo_url ? (
                <div className="relative w-24 h-24">
                  <Image src={quote.company.logo_url} alt="Logo" fill className="object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-slate-400 rounded">
                  Sem logo
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{quote.company?.name || 'Empresa'}</h1>
                <p className="text-muted-foreground print:text-slate-600">{quote.company?.phone}</p>
                {quote.company?.address_city && (
                  <p className="text-sm text-muted-foreground print:text-slate-600">
                    {quote.company.address_city} - {quote.company.address_state}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-3xl font-light text-slate-400">ORÇAMENTO</h2>
              <p className="text-xl font-medium mt-1">Nº ORC-{quote.quote_number?.toString().padStart(4, '0')}</p>
              <div className="mt-4 text-sm">
                <p><span className="font-semibold">Data:</span> {format(new Date(quote.created_at), 'dd/MM/yyyy')}</p>
                {quote.valid_until && (
                  <p><span className="font-semibold">Válido até:</span> {format(new Date(quote.valid_until), 'dd/MM/yyyy')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="py-6 border-b">
            <h3 className="font-semibold text-lg mb-2">Orçamento para:</h3>
            {quote.customer ? (
              <div className="text-sm space-y-1">
                <p className="font-medium text-base">{quote.customer.name}</p>
                {quote.customer.document && <p>CPF/CNPJ: {quote.customer.document}</p>}
                {quote.customer.phone && <p>Tel: {quote.customer.phone}</p>}
                {quote.customer.address_city && (
                  <p>{quote.customer.address_street}, {quote.customer.address_number} - {quote.customer.address_city}/{quote.customer.address_state}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground print:text-slate-600">Cliente Avulso</p>
            )}
          </div>

          {/* Items */}
          <div className="py-6">
            <Table>
              <TableHeader className="bg-slate-50 print:bg-slate-100">
                <TableRow>
                  <TableHead className="w-[50%]">Descrição</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Vlr. Unit</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items?.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals & Footer */}
          <div className="flex flex-col sm:flex-row justify-between gap-8 pt-6">
            <div className="flex-1 space-y-4 text-sm">
              {quote.payment_method && (
                <div>
                  <h4 className="font-semibold">Forma de Pagamento</h4>
                  <p>{quote.payment_method}</p>
                </div>
              )}
              {quote.notes && (
                <div>
                  <h4 className="font-semibold">Observações</h4>
                  <p className="whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-64 space-y-2 border p-4 rounded-md bg-slate-50 print:border-none print:p-0 print:bg-white">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.subtotal)}</span>
              </div>
              {quote.discount_value > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto:</span>
                  <span>
                    - {quote.discount_type === 'percentage' 
                        ? `${quote.discount_value}%` 
                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.discount_value)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
