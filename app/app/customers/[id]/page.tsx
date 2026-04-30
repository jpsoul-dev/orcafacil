import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CustomerQuotesClient } from './customer-quotes-client'
import { Mail, Phone, MapPin, Calendar, FileText, User, Pencil } from 'lucide-react'
import { CustomerForm } from '../customer-form'
import { Button } from '@/components/ui/button'

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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                Cliente
              </Badge>
              {customer.document && (
                <span className="text-sm text-muted-foreground">{customer.document}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomerForm
            initialData={customer}
            trigger={
              <Button variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-xl">
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
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 min-w-[1.2rem] flex items-center justify-center text-[10px]">
                {quotes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1 sm:col-span-1">
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
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">E-mail</span>
                  <div className="flex items-center gap-2 text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {customer.email || 'Não informado'}
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Endereço</span>
                  <div className="flex items-start gap-2 text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      {customer.address_street ? (
                        <>
                          {customer.address_street}, {customer.address_number}
                          {customer.address_complement && ` - ${customer.address_complement}`}
                          <br />
                          {customer.address_neighborhood}, {customer.address_city}/{customer.address_state}
                          <br />
                          CEP: {customer.address_zip}
                        </>
                      ) : 'Endereço não informado'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Cliente desde
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Total de Orçamentos
                  </span>
                  <span className="text-sm font-medium">
                    {quotes?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Histórico de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerQuotesClient quotes={quotes || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
