# Referência: Pagamentos e Stripe

## Webhooks — a checagem mais crítica desta categoria

```typescript
// 🔴 CRÍTICO: aceita qualquer POST como se fosse um evento real do Stripe.
// Um atacante pode forjar um evento "checkout.session.completed" e liberar
// acesso pago sem nunca ter pagado.
export async function POST(req: Request) {
  const event = await req.json()
  if (event.type === 'checkout.session.completed') {
    await liberarAcessoPago(event.data.object.customer)
  }
}

// ✅ CORRETO: verifica a assinatura enviada pelo Stripe usando o webhook secret
export async function POST(req: Request) {
  const body = await req.text() // precisa do raw body, não do JSON já parseado
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return Response.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    await liberarAcessoPago(event.data.object.customer)
  }
  return Response.json({ received: true })
}
```

Pontos a confirmar especificamente:
- O endpoint usa `req.text()` (raw body) para a verificação, não `req.json()` — o Stripe assina os bytes exatos, um JSON re-serializado quebra a verificação (e às vezes o dev "corrige" isso desabilitando a checagem, o que é o pior cenário).
- `STRIPE_WEBHOOK_SECRET` é diferente da secret key da API e específico do endpoint configurado no dashboard do Stripe.
- O handler é **idempotente** — o Stripe reenvia eventos em caso de timeout/erro; processar o mesmo `checkout.session.completed` duas vezes não deveria liberar acesso duplicado ou cobrar duas vezes. Verificar por `event.id` já processado antes de agir.

## Preço decidido pelo servidor, nunca pelo client

```typescript
// 🔴 CRÍTICO: o valor cobrado vem do payload que o client enviou
export async function POST(req: Request) {
  const { plano, valor } = await req.json()
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price_data: { currency: 'brl', unit_amount: valor * 100 }, quantity: 1 }],
    mode: 'payment',
  })
}

// ✅ CORRETO: valor derivado de uma tabela/config no server a partir de um ID de plano
const PLANOS = { basico: 4990, pro: 9990 } as const // em centavos, fonte da verdade no server

export async function POST(req: Request) {
  const { plano } = z.object({ plano: z.enum(['basico', 'pro']) }).parse(await req.json())
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: STRIPE_PRICE_IDS[plano], quantity: 1 }], // melhor ainda: usar Price IDs do Stripe
    mode: 'payment',
  })
}
```

O ideal é usar **Price IDs criados no dashboard/API do Stripe** em vez de `price_data` dinâmico sempre que o catálogo de planos for fixo — isso elimina a categoria inteira de "cliente manda o preço" porque o valor nem trafega no payload.

## Autorização em rotas de billing

- O endpoint que cria a Checkout Session/Portal Session pega o `customer_id`/`user_id` da sessão autenticada no server, ou do payload enviado pelo client? Deveria ser sempre da sessão.
- Rotas que consultam status de assinatura ("sou premium?") escopam pelo usuário logado, ou aceitam um `customerId` arbitrário na query string?

## Ambiente de teste vs produção

- Confirme que chaves `sk_test_`/`pk_test_` não estão sendo usadas em produção (e vice-versa) — normalmente resolvido corretamente por variáveis de ambiente por ambiente Vercel, mas vale confirmar que não há chave de produção hardcoded como fallback em algum lugar do código.

## Checklist rápido
- [ ] Webhook verifica assinatura com `stripe.webhooks.constructEvent` usando raw body
- [ ] Handler de webhook é idempotente (checa `event.id` já processado)
- [ ] Preço/valor cobrado é determinado no server (idealmente via Price ID), nunca aceito do client
- [ ] Rotas de billing derivam o `customer`/`user` da sessão autenticada, não do payload
- [ ] Nenhuma chave de produção hardcoded como fallback
