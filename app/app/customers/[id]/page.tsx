import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CustomerQuotesClient } from './customer-quotes-client'
import { Mail, Phone, MapPin, Calendar, FileText, User, Pencil } from 'lucide-react'
import { CustomerForm } from '../customer-form'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (!customer) {
    notFound()
  }

  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      *,
      customers ( name )
    `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">
                cliente desde: {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomerForm
            initialData={customer}
            trigger={
              <Button className="gap-2 font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-lg">
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
            <FileText className="h-4 w-4" /> Orcamentos
            {quotes && quotes.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 min-w-[1.2rem] flex items-center justify-center text-[10px]">
                {quotes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">WhatsApp / Telefone</span>
                  <div className="space-y-2 mt-1">
                    {customer.whatsapp && (
                      <div className="flex items-center gap-2 text-slate-900">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">WhatsApp:</span>
                        <span className="text-sm">{customer.whatsapp}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-slate-900">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">Telefone:</span>
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    )}
                    {!customer.whatsapp && !customer.phone && (
                      <div className="text-slate-400 text-sm italic">Não informado</div>
                    )}
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">E-mail</span>
                  <div className="flex items-center gap-2 text-slate-900 mt-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{customer.email || 'Não informado'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Dados de Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div className="text-sm leading-relaxed">
                      {customer.address_street ? (
                        <>
                          {customer.address_street}, {customer.address_number}
                          {customer.address_complement && ` - ${customer.address_complement}`}
                          <br />
                          {customer.address_neighborhood}
                          <br />
                          {customer.address_city}/{customer.address_state}
                          <br />
                          CEP: {customer.address_zip}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Endereço não informado</span>
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
              <h3 className="text-lg font-bold text-slate-900">Histórico de Orçamentos</h3>
            </div>
            <CustomerQuotesClient quotes={quotes || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
