import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createCheckoutAction } from './server-actions'
import { Button } from '@/components/ui/button'
import { Zap, CheckCircle2 } from 'lucide-react'

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar os produtos e preços do Stripe
  const products = await stripe.products.list({ active: true, limit: 1 })
  const product = products.data[0]

  let price = null
  if (product) {
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 1,
    })
    price = prices.data[0]
  }

  const productName = product?.name || 'Plano Pro'
  const productDescription =
    product?.description ||
    'Assine agora para continuar criando orçamentos profissionais.'

  // Formatando o preço
  const priceAmount = price
    ? (price.unit_amount! / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : 'R$ 49,00'

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 shadow-xl">
            <Zap className="h-8 w-8 text-white" fill="white" strokeWidth={0} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Conheças nossos planos
          </h1>
          <p className="text-muted-foreground text-lg">
            Esperamos que você esteja aproveitando o OrçaFácil!{' '}
            {productDescription}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-8 text-left shadow-lg">
          <h3 className="text-2xl font-bold mb-2">{productName}</h3>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-extrabold">{priceAmount}</span>
            <span className="text-muted-foreground font-medium">/mês</span>
          </div>

          <div className="space-y-4 mb-8">
            {[
              'Orçamentos ilimitados',
              'Catálogo inteligente',
              'Links públicos com sua marca',
              'Registro de auditoria (IP e Data)',
              'Suporte prioritário',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-card-foreground/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <form action={createCheckoutAction}>
            {/* O ID do preço será pego de forma segura na server action */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg font-bold h-14"
            >
              Assinar Agora
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
