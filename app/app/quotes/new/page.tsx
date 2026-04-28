import { createClient } from '@/lib/supabase/server'
import { QuoteForm } from './quote-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewQuotePage() {
  const supabase = await createClient()

  const { data: customers } = await supabase.from('customers').select('id, name').order('name')
  const { data: catalogItems } = await supabase.from('catalog_items').select('*').order('name')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/app/quotes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Orçamento</h2>
          <p className="text-muted-foreground">Preencha os dados abaixo para gerar um orçamento.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Orçamento</CardTitle>
          <CardDescription>Adicione o cliente, os itens e defina os fechamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteForm customers={customers || []} catalogItems={catalogItems || []} />
        </CardContent>
      </Card>
    </div>
  )
}
