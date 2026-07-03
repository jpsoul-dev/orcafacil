'use client'

import { QuoteStatusBadge } from '@/components/quote-status-badge'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ListContainer } from '@/components/ui/list-container'
import {
  SidebarSheet,
  SidebarSheetContent,
  SidebarSheetHeader,
} from '@/components/ui/sidebar-sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { triggerHaptic } from '@/lib/haptic'
import type { Customer, CustomerQuote, CustomerReceipt } from '@/lib/services/customer-service'
import { formatBRL } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, FileIcon, Mail, MapPin, MessageSquare, MoreVertical, Pencil, Phone, Receipt, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { getCustomerQuotesAction, getCustomerReceiptsAction } from '../actions'

interface CustomerViewSheetProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (customer: Customer) => void
  onDeleteClick: (customer: Customer) => void
}

/**
 * Read-Only Sheet to display customer details (FR-001).
 * Supports actions for desktop (buttons) and mobile (dropdown menu).
 * Integrates Tabs: Perfil (details/address) and Documentos (Quotes/Receipts) lazy loaded.
 */
export function CustomerViewSheet({
  customer,
  open,
  onOpenChange,
  onEdit,
  onDeleteClick,
}: CustomerViewSheetProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [quotes, setQuotes] = useState<CustomerQuote[]>([])
  const [receipts, setReceipts] = useState<CustomerReceipt[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [hasLoadedDocs, setHasLoadedDocs] = useState(false)

  const [prevCustomerId, setPrevCustomerId] = useState<string | undefined>(undefined)
  const [prevOpen, setPrevOpen] = useState<boolean>(false)

  // Reset tab and documents state during render phase when active customer or open state changes
  if (customer?.id !== prevCustomerId || open !== prevOpen) {
    setPrevCustomerId(customer?.id)
    setPrevOpen(open)
    if (open && customer?.id) {
      setActiveTab('profile')
      setQuotes([])
      setReceipts([])
      setHasLoadedDocs(false)
    }
  }

  const customerId = customer?.id

  const loadDocuments = useCallback(async () => {
    if (!customerId || hasLoadedDocs || loadingDocs) return

    setLoadingDocs(true)
    try {
      const [quotesRes, receiptsRes] = await Promise.all([
        getCustomerQuotesAction(customerId),
        getCustomerReceiptsAction(customerId),
      ])

      if (quotesRes.success && quotesRes.data) {
        setQuotes(quotesRes.data)
      }
      if (receiptsRes.success && receiptsRes.data) {
        setReceipts(receiptsRes.data)
      }
      setHasLoadedDocs(true)
    } catch (error) {
      console.error('Error loading customer documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }, [customerId, hasLoadedDocs, loadingDocs])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'documents') {
      loadDocuments()
    }
  }

  if (!customer) return null

  const handleClose = () => {
    triggerHaptic('light')
    onOpenChange(false)
  }

  const handleEditClick = () => {
    triggerHaptic('light')
    onEdit(customer)
  }

  const handleDeleteClickLocal = () => {
    triggerHaptic('light')
    onDeleteClick(customer)
  }

  const cleanNumber = (num?: string | null) => {
    if (!num) return ''
    return num.replace(/\D/g, '')
  }

  const phoneClean = cleanNumber(customer.phone)
  const whatsappClean = cleanNumber(customer.whatsapp || customer.phone)

  return (
    <SidebarSheet open={open} onOpenChange={onOpenChange}>
      <SidebarSheetContent className="flex flex-col h-full bg-card">
        {/* Header com botão de voltar à esquerda e ações à direita */}
        <SidebarSheetHeader
          title="Visualizar Cliente"
          showCloseButton={false}
          leftAction={
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-muted-foreground hover:text-foreground cursor-pointer rounded-md -ml-3.5 flex items-center justify-center"
              onClick={handleClose}
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          }
          rightAction={
            <div className="flex items-center gap-1.5 select-none">
              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <SubscriptionGuard>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-md font-semibold cursor-pointer"
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                </SubscriptionGuard>
                <SubscriptionGuard>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-md font-semibold text-destructive hover:text-destructive-foreground hover:bg-destructive cursor-pointer"
                    onClick={handleDeleteClickLocal}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Deletar
                  </Button>
                </SubscriptionGuard>
              </div>

              {/* Mobile Actions Dropdown */}
              <div className="flex sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    nativeButton={true}
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-muted-foreground hover:text-foreground cursor-pointer rounded-md flex items-center justify-center"
                        onClick={() => triggerHaptic('light')}
                      >
                        <MoreVertical className="h-5 w-5" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent
                    align="end"
                    className="w-48 p-1.5 rounded-sm border border-border/60 bg-popover text-popover-foreground shadow-md"
                  >
                    <SubscriptionGuard>
                      <DropdownMenuItem
                        onClick={handleEditClick}
                        className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold rounded-xs py-3 px-4 focus:bg-accent focus:text-accent-foreground"
                        render={<div />}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar cliente
                      </DropdownMenuItem>
                    </SubscriptionGuard>
                    <SubscriptionGuard>
                      <DropdownMenuItem
                        onClick={handleDeleteClickLocal}
                        className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold rounded-xs py-3 px-4 text-destructive focus:text-destructive focus:bg-destructive/10"
                        render={<div />}
                      >
                        <Trash2 className="h-4 w-4" />
                        Deletar cliente
                      </DropdownMenuItem>
                    </SubscriptionGuard>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          }
        />

        {/* Abas e conteúdo - Tabs de Nível Superior (Perfil / Documentos) */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0 bg-background">
          <TabsList variant="line" className="px-6 bg-card border-b border-border/60 justify-start w-full">
            <TabsTrigger value="profile" className="flex-1 py-3 text-sm font-bold">Perfil</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 py-3 text-sm font-bold">Documentos</TabsTrigger>
          </TabsList>

          {/* ABA 1: Perfil */}
          <TabsContent value="profile" className="p-6 space-y-6 overflow-y-auto outline-none flex-1">
            <div className="flex flex-col gap-2">
              <div className="space-y-2.5">
                <h3 className="text-xl font-bold font-display text-foreground leading-tight break-words">
                  {customer.name}
                </h3>
                <span className="inline-flex items-center rounded-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                  {customer.document_type === 'cnpj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </span>
              </div>
            </div>

            {/* Quick Actions (WhatsApp, E-mail, Call) */}
            <div className="flex items-center gap-3 border-y border-border/60 py-4 select-none justify-around sm:justify-start sm:gap-6">
              {whatsappClean && (
                <a
                  href={`https://wa.me/55${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="flex flex-col items-center gap-1 group/btn cursor-pointer min-w-16"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover/btn:bg-[#25D366] group-hover/btn:text-white transition-all shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground group-hover/btn:text-[#25D366] transition-colors">WhatsApp</span>
                </a>
              )}
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  onClick={() => triggerHaptic('light')}
                  className="flex flex-col items-center gap-1 group/btn cursor-pointer min-w-16"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-all shadow-sm">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground group-hover/btn:text-primary transition-colors">Email</span>
                </a>
              )}
              {phoneClean && (
                <a
                  href={`tel:${phoneClean}`}
                  onClick={() => triggerHaptic('light')}
                  className="flex flex-col items-center gap-1 group/btn cursor-pointer min-w-16"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-all shadow-sm">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground group-hover/btn:text-primary transition-colors">Ligar</span>
                </a>
              )}
            </div>



            {/* Dados Gerais / Contato */}
            <div className="space-y-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                Dados de Contato
              </span>
              <div className="bg-card border border-border/50 rounded-lg divide-y divide-border/40 overflow-hidden">
                {customer.document && (
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-xs text-muted-foreground font-semibold">CPF/CNPJ</span>
                    <span className="text-ds-body-sm font-semibold text-foreground tabular-nums">{customer.document}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-xs text-muted-foreground font-semibold">E-mail</span>
                    <span className="text-ds-body-sm font-semibold text-foreground truncate max-w-48 ml-2">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-xs text-muted-foreground font-semibold">Telefone</span>
                    <span className="text-ds-body-sm font-semibold text-foreground tabular-nums">{customer.phone}</span>
                  </div>
                )}
                {customer.whatsapp && (
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-xs text-muted-foreground font-semibold">WhatsApp</span>
                    <span className="text-ds-body-sm font-semibold text-foreground tabular-nums">{customer.whatsapp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                Endereço
              </span>
              <div className="flex items-start gap-3 bg-card border border-border/50 rounded-lg p-4">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-ds-body-sm leading-relaxed font-semibold text-foreground">
                  {customer.address_street ? (
                    <>
                      {customer.address_street}, {customer.address_number}
                      {customer.address_complement && ` - ${customer.address_complement}`}
                      <br />
                      {customer.address_neighborhood}
                      <br />
                      {customer.address_city} - {customer.address_state}
                      {customer.address_zip && <><br /><span className="tabular-nums text-muted-foreground text-xs">CEP: {customer.address_zip}</span></>}
                    </>
                  ) : (
                    <span className="text-muted-foreground opacity-60 italic font-medium">
                      Endereço não informado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: Documentos (Orçamentos / Recibos) */}
          <TabsContent value="documents" className="flex-1 flex flex-col min-h-0 overflow-hidden outline-none">
            <Tabs defaultValue="quotes" className="flex-1 flex flex-col min-h-0">
              {/* Navegação Segmentada Interna */}
              <div className="p-4 bg-card border-b border-border/40">
                <TabsList variant="default" className="w-full bg-muted/60 p-1.5 rounded-lg flex">
                  <TabsTrigger value="quotes" className="flex-1 text-xs py-2">Orçamentos</TabsTrigger>
                  <TabsTrigger value="receipts" className="flex-1 text-xs py-2">Recibos</TabsTrigger>
                </TabsList>
              </div>

              {/* Sub-Aba 1: Orçamentos */}
              <TabsContent value="quotes" className="flex-1 overflow-y-auto p-4 min-h-0 outline-none">
                {loadingDocs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex items-center justify-between p-3.5 border border-border/40 rounded-lg bg-card/60 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-muted rounded"></div>
                          <div className="h-3 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="space-y-2 flex flex-col items-end">
                          <div className="h-4 w-14 bg-muted rounded"></div>
                          <div className="h-3.5 w-10 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : quotes && quotes.length > 0 ? (
                  <ListContainer>
                    {quotes.map((quote) => {
                      let status = quote.status
                      if (status === 'open') status = 'pending'
                      else if (status === 'accepted') status = 'approved'
                      else if (status === 'vencido') status = 'expired'
                      if (status === 'pending' && quote.valid_until) {
                        if (new Date() > new Date(quote.valid_until)) status = 'expired'
                      }

                      return (
                        <Link
                          key={quote.id}
                          href={`/app/quotes/${quote.id}`}
                          onClick={handleClose}
                          className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors group cursor-pointer"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                            <span className="font-semibold text-foreground text-xs font-display truncate">
                              {quote.title ? quote.title : `#${String(quote.quote_number).padStart(6, '0')}`}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                              {quote.created_at ? format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 select-none">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-foreground text-xs tabular-nums">
                                {formatBRL(quote.total)}
                              </span>
                              <QuoteStatusBadge status={status} className="scale-85 origin-right" />
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      )
                    })}
                  </ListContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg border-border bg-card/40">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-foreground text-xs font-display">
                      Nenhum orçamento
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-48 font-medium">
                      Este cliente ainda não possui orçamentos registrados.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Sub-Aba 2: Recibos */}
              <TabsContent value="receipts" className="flex-1 overflow-y-auto p-4 min-h-0 outline-none">
                {loadingDocs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex items-center justify-between p-3.5 border border-border/40 rounded-lg bg-card/60 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-muted rounded"></div>
                          <div className="h-3 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="space-y-2 flex flex-col items-end">
                          <div className="h-4 w-14 bg-muted rounded"></div>
                          <div className="h-3.5 w-10 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : receipts && receipts.length > 0 ? (
                  <ListContainer>
                    {receipts.map((receipt) => {
                      const price = receipt.amount
                      const title = receipt.title || `Recibo #${receipt.receipt_number}`

                      return (
                        <Link
                          key={receipt.id}
                          href={`/app/receipts/${receipt.id}`}
                          onClick={handleClose}
                          className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors group cursor-pointer"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                            <span className="font-semibold text-foreground text-xs font-display truncate">
                              {title}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                              {receipt.issued_at
                                ? format(new Date(receipt.issued_at + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                                : '—'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 select-none">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-bold text-foreground text-xs tabular-nums">
                                {formatBRL(isNaN(price) ? 0 : price)}
                              </span>
                              {receipt.quote_id ? (
                                <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-none font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-85 origin-right">
                                  Vinculado
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-500/10 text-slate-500 border border-slate-500/20 shadow-none font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-85 origin-right">
                                  Avulso
                                </Badge>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      )
                    })}
                  </ListContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg border-border bg-card/40">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-foreground text-xs font-display">
                      Nenhum recibo
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-48 font-medium">
                      Este cliente ainda não possui recibos emitidos.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </SidebarSheetContent>
    </SidebarSheet>
  )
}
