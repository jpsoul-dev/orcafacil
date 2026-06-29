import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerQuotesClient } from './customer-quotes-client'
import { CustomerReceiptsClient } from './customer-receipts-client'
import { Mail, Phone, MapPin, User, Pencil, MessageSquare, MoreVertical, ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { DeleteCustomerDialog } from '../components/delete-customer-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CustomerService } from '@/lib/services/customer-service'
import { BackButton } from '@/components/ui/back-button'

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

  const cleanNumber = (num?: string | null) => {
    if (!num) return ''
    return num.replace(/\D/g, '')
  }

  const phoneClean = cleanNumber(customer.phone)
  const whatsappClean = cleanNumber(customer.whatsapp || customer.phone)
  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-5xl mx-auto animate-in fade-in duration-ds-normal hide-global-header-mobile">
      {/* Header Mobile Nativo (AppBar) */}
      <div className="sm:hidden flex items-center justify-between h-14 bg-card border-b border-border sticky top-0 z-40 px-4 -mx-4 -mt-4 mb-4 backdrop-blur-md">
        <Link href="/app/customers" className="flex items-center justify-center h-11 w-11 -ml-2 text-foreground active:opacity-60 cursor-pointer rounded-full" aria-label="Voltar">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-ds-body-md font-bold text-foreground font-display">
          Detalhes do cliente
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center h-11 w-11 -mr-2 text-foreground active:opacity-60 cursor-pointer rounded-full">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Opções</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link href={`/app/customers/${customer.id}/edit`}>
              <DropdownMenuItem className="cursor-pointer font-medium">
                <Pencil className="h-4 w-4 mr-2" /> Editar cliente
              </DropdownMenuItem>
            </Link>
            <DeleteCustomerDialog
              id={customer.id}
              name={customer.name}
              asDropdownItem={true}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header Desktop */}
      <div className="hidden sm:flex items-center justify-between sticky top-16 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 py-4 -mt-4 mb-4">
        <BackButton />

        {/* Ações Administrativas */}
        <div className="flex items-center gap-2 self-start sm:mt-0">
          <Link href={`/app/customers/${customer.id}/edit`}>
            <Button variant="outline" className="gap-2 font-bold cursor-pointer rounded-full h-10 px-4">
              <Pencil className="h-4 w-4" /> Editar cliente
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="icon" className="h-10 w-10 rounded-full shrink-0 cursor-pointer" />}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Opções</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DeleteCustomerDialog
                id={customer.id}
                name={customer.name}
                asDropdownItem={true}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Principal: Header (Avatar, Nome e Contatos Rápidos) */}
      <Card className="shadow-sm border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-display">
                  {customer.name}
                </h2>

                {/* Cliente desde - Mobile (2 linhas) */}
                <div className="flex sm:hidden flex-col gap-1 text-sm text-muted-foreground font-medium mt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Cliente desde:
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(customer.created_at), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                </div>

                {/* Cliente desde - Desktop (1 linha) */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium mt-1">
                  <Calendar className="h-4 w-4" />
                  Cliente desde:{' '}
                  {format(new Date(customer.created_at), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-around sm:justify-end gap-2 sm:gap-4 border-t sm:border-t-0 pt-6 sm:pt-0 border-border">
              {whatsappClean && (
                <a href={`https://wa.me/55${whatsappClean}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group/btn cursor-pointer min-w-18">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover/btn:bg-[#25D366] group-hover/btn:text-white transition-colors shadow-sm">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground group-hover/btn:text-[#25D366] transition-colors">WhatsApp</span>
                </a>
              )}
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex flex-col items-center gap-1.5 group/btn cursor-pointer min-w-18">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-colors shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground group-hover/btn:text-primary transition-colors">Email</span>
                </a>
              )}
              {phoneClean && (
                <a href={`tel:${phoneClean}`} className="flex flex-col items-center gap-1.5 group/btn cursor-pointer min-w-18">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-colors shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground group-hover/btn:text-primary transition-colors">Ligar</span>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold font-display text-foreground">
              Informações de contato
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/50">
              {customer.whatsapp && (
                <li className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 text-foreground">
                    <MessageSquare className="h-4 w-4 text-[#25D366]" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">{customer.whatsapp}</span>
                </li>
              )}
              {customer.phone && (
                <li className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 text-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Telefone</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">{customer.phone}</span>
                </li>
              )}
              {customer.email && (
                <li className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 text-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground truncate ml-4 max-w-37.5 sm:max-w-xs">{customer.email}</span>
                </li>
              )}
              {!customer.whatsapp && !customer.phone && !customer.email && (
                <li className="p-4 text-center">
                  <span className="text-muted-foreground opacity-60 text-sm italic">Não informado</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card h-full">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold font-display text-foreground">
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="flex items-start gap-3 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm leading-relaxed font-medium">
                  {customer.address_street ? (
                    <>
                      {customer.address_street}, {customer.address_number}
                      {customer.address_complement &&
                        ` - ${customer.address_complement}`}
                      <br />
                      {customer.address_neighborhood}
                      <br />
                      {customer.address_city} - {customer.address_state}{customer.address_zip ? `, CEP: ${customer.address_zip}` : ''}
                      <br />
                      Brasil
                    </>
                  ) : (
                    <span className="text-muted-foreground opacity-60 italic">
                      Endereço não informado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border bg-card overflow-hidden">
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList variant="line" className="px-4 pt-2 border-b border-border w-full justify-start h-auto gap-4">
            <TabsTrigger value="quotes" className="py-3 font-bold flex-none">
              Orçamentos
            </TabsTrigger>
            <TabsTrigger value="receipts" className="py-3 font-bold flex-none">
              Recibos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="m-0 p-0">
            <CustomerQuotesClient quotes={quotes || []} />
          </TabsContent>

          <TabsContent value="receipts" className="m-0 p-0">
            <CustomerReceiptsClient receipts={receipts || []} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
