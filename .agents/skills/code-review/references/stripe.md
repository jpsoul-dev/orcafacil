# Referência: Stripe — Pagamentos e Assinaturas

## Checklist de Segurança — Stripe

### Chaves de API

- [ ] `STRIPE_SECRET_KEY` **jamais** exposta no client-side — somente em servidor
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` é a única chave segura para o cliente
- [ ] Chaves de teste (`sk_test_`, `pk_test_`) nunca vão para produção
- [ ] Chaves rotacionadas se houver qualquer suspeita de exposição

### Webhooks

- [ ] Toda rota de webhook **verifica a assinatura** com `stripe.webhooks.constructEvent()`
- [ ] `STRIPE_WEBHOOK_SECRET` armazenado em variável de ambiente
- [ ] Webhook handler é idempotente (pode receber o mesmo evento mais de uma vez)
- [ ] Eventos processados de forma assíncrona quando necessário (resposta 200 rápida ao Stripe)
- [ ] Eventos sensíveis tratados: `customer.subscription.deleted`, `invoice.payment_failed`, `checkout.session.completed`

### Padrão correto para Webhook:

```typescript
// ✅ API Route: /app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text() // texto bruto, não JSON
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, { status: 400 })
  }

  // Processar evento de forma idempotente
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
  }

  return new Response(null, { status: 200 })
}
```

### Checkout e Pagamentos

- [ ] Nunca calcular valor no cliente e enviar para o servidor — valor deve vir do banco/configuração server-side
- [ ] `idempotencyKey` usado em operações de cobrança para evitar duplicação
- [ ] Metadata útil adicionada nos Checkout Sessions (ex: `userId`, `planId`)
- [ ] Redirecionamento pós-checkout verificado no servidor, não apenas no cliente
- [ ] `success_url` e `cancel_url` absolutos e corretos para cada ambiente

### Assinaturas

- [ ] Status da assinatura verificado no banco (sincronizado via webhook) — não consultar Stripe a cada request
- [ ] Campos sincronizados: `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `current_period_end`
- [ ] Trial periods configurados via Stripe, não manualmente no banco
- [ ] Cancelamento desativa acesso apenas após `current_period_end`

### Anti-patterns comuns a detectar:

```typescript
// ❌ CRÍTICO: Secret key no cliente
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!) // ❌ NUNCA

// ❌ CRÍTICO: Webhook sem verificação de assinatura
export async function POST(req: Request) {
  const body = await req.json() // ❌ Sem verificação = qualquer um pode chamar
  await processPayment(body)
}

// ❌ ALTO: Preço calculado no cliente
// Client envia: { amount: 9.99 }
// Server usa esse valor diretamente ← ❌ manipulável

// ❌ ALTO: Consultar Stripe a cada verificação de acesso
const subscription = await stripe.subscriptions.retrieve(subId) // ❌ lento e caro
// ✅ Consultar banco local (sincronizado por webhook)
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_status, current_period_end')
  .eq('id', userId)
  .single()
```

### Ambiente e Configuração

- [ ] Variáveis de ambiente separadas para dev/staging/prod
- [ ] Webhook endpoint registrado no dashboard do Stripe para cada ambiente
- [ ] Stripe CLI usado para testar webhooks localmente (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
