import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CustomerQuotesClient } from './customer-quotes-client'
import { CustomerReceiptsClient } from './customer-receipts-client'
import { Mail, Phone, MapPin, FileText, User, Pencil, Receipt } from 'lucide-react'
import { CustomerForm } from '../customer-form'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CustomerService } from '@/lib/services/customer-service'

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Carregar dados do cliente via serviço (Princípio I - SRP)
  const customerResult = await CustomerService.getCustomerById(id, user.id)
  if (!customerResult.success || !customerResult.data) {
    notFound()
  }

  const customer = customerResult.data

  // 2. Carregar orçamentos e recibos do cliente via serviço (Princípio I - SRP)
  const quotesResult = await CustomerService.getCustomerQuotes(id, user.id)
  const quotes = quotesResult.success ? quotesResult.data : []

  const receiptsResult = await CustomerService.getCustomerReceipts(id, user.id)
  const receipts = receiptsResult.success ? receiptsResult.data : []

  return (
    <div className="space-y-6">
      {/* Cabeçalho Sora */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
              {customer.name}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">
                cliente desde:{' '}
                {format(new Date(customer.created_at), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomerForm
            initialData={customer}
            trigger={
              <Button className="gap-2 font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer transition-colors shadow-sm">
                <Pencil className="h-4 w-4" /> Editar Cliente
              </Button>
            }
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4" /> Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="h-4 w-4" /> Orçamentos
            {quotes && quotes.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0 h-4 min-w-[1.2rem] flex items-center justify-center text-[10px] bg-blue-500/10 text-blue-500 hover:bg-blue-500/15 shadow-none border border-blue-500/20 font-bold"
              >
                {quotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="receipts" className="gap-2">
            <Receipt className="h-4 w-4" /> Recibos
            {receipts && receipts.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0 h-4 min-w-[1.2rem] flex items-center justify-center text-[10px] bg-green-500/10 text-green-600 hover:bg-green-500/15 shadow-none border border-green-500/20 font-bold"
              >
                {receipts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold font-display text-foreground">
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                    WhatsApp / Telefone
                  </span>
                  <div className="space-y-2 mt-1">
                    {customer.whatsapp && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">WhatsApp:</span>
                        <span className="text-sm font-medium tabular-nums">{customer.whatsapp}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Telefone:</span>
                        <span className="text-sm font-medium tabular-nums">{customer.phone}</span>
                      </div>
                    )}
                    {!customer.whatsapp && !customer.phone && (
                      <div className="text-slate-400 text-sm italic">
                        Não informado
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                    E-mail
                  </span>
                  <div className="flex items-center gap-2 text-foreground mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {customer.email || 'Não informado'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold font-display text-foreground">
                  Dados de Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm leading-relaxed font-medium">
                      {customer.address_street ? (
                        <>
                          {customer.address_street}, {customer.address_number}
                          {customer.address_complement &&
                            ` - ${customer.address_complement}`}
                          <br />
                          {customer.address_neighborhood}
                          <br />
                          {customer.address_city}/{customer.address_state}
                          <br />
                          CEP: {customer.address_zip}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">
                          Endereço não informado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground font-display">
                Histórico de Orçamentos
              </h3>
            </div>
            <CustomerQuotesClient quotes={quotes || []} />
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground font-display">
                Histórico de Recibos
              </h3>
            </div>
            <CustomerReceiptsClient receipts={receipts || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
