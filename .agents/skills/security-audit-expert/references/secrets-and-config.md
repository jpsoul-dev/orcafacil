# Referência: Segredos, Variáveis de Ambiente e Configuração de Deploy

## Por que esta é a categoria mais comum de Crítico

Uma chave vazada não precisa de "exploração sofisticada" — ela é a exploração. Priorize esta varredura no início da auditoria.

## Onde procurar

- Qualquer arquivo dentro de `app/`, `components/`, `lib/` (client-side) que referencie:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Chaves secretas do Stripe (`sk_live_`, `sk_test_` usadas fora de rotas server)
  - Tokens de API de terceiros (Resend, SendGrid, etc.)
  - Qualquer `process.env.X` onde `X` **não** começa com `NEXT_PUBLIC_` mas é usado dentro de um componente marcado `"use client"`
- Strings que parecem chaves hardcoded diretamente no código (não via `process.env`) — regex úteis: `sk_live_`, `sk_test_`, `eyJ` (início comum de JWT), `AKIA` (AWS), `-----BEGIN`
- `.env`, `.env.local` acidentalmente commitados (verifique `.gitignore` e, se houver acesso, o histórico do git)
- Arquivos de configuração de CI/CD (`vercel.json`, GitHub Actions) com segredos em texto plano

## A regra do `NEXT_PUBLIC_`

Tudo que tem prefixo `NEXT_PUBLIC_` é **embutido no bundle JavaScript enviado ao navegador**. Não é "quase público" — é público, qualquer pessoa pode abrir o DevTools e ler. A pergunta correta para cada variável `NEXT_PUBLIC_*` é: *"eu ficaria confortável colando o valor disso em uma issue pública do GitHub?"*. Se não, ela não deveria ter esse prefixo.

Confusões comuns:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **correto ser pública**, desde que RLS esteja implementado corretamente (a anon key só tem os privilégios que as policies permitem).
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — **catastrófico**. A service role key ignora RLS inteiramente. Se isso existir com o prefixo público, é Crítico automático, sem necessidade de raciocínio adicional de exploração (a exploração é: "copiar a chave do bundle e fazer qualquer query no banco").
- Chaves do Stripe: `pk_` (publishable) pode ser pública; `sk_` (secret) nunca pode.

## Ambientes Vercel (Production / Preview / Development)

- Variáveis de ambiente sensíveis de Production não deveriam vazar para Preview se Preview aponta para um projeto Supabase/Stripe de teste diferente — verifique se o time não está reusando credenciais de produção em ambientes de preview publicamente acessíveis (URLs de preview do Vercel são adivinháveis e às vezes indexadas).
- Verifique se branches de Preview de PRs externos (se o repo for público ou tiver colaboradores externos) têm acesso às mesmas env vars de produção — isso é um vetor real em projetos open-source ou com colaboradores.

## Padrões a sinalizar

```typescript
// 🔴 CRÍTICO: service role key acessível no client
"use client"
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY!)

// 🔴 CRÍTICO: chave hardcoded, sem nem usar env var
const stripe = new Stripe("sk_live_51H...")

// 🟡 MÉDIO: variável sensível sem prefixo, mas usada em local que poderia
// acidentalmente ir para o client em uma refatoração futura — considere isolar
// em um módulo `server-only` (pacote `server-only` do Next.js) para o build
// falhar caso alguém importe em um Client Component por engano
import 'server-only'
const resendKey = process.env.RESEND_API_KEY
```

## Correção padrão para blindar contra import acidental

```typescript
// lib/server/env.ts
import 'server-only' // faz o build falhar se importado num Client Component

export const serverEnv = {
  supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  stripeSecret: process.env.STRIPE_SECRET_KEY!,
}
```

## Checklist rápido
- [ ] Nenhuma chave secreta com prefixo `NEXT_PUBLIC_`
- [ ] Nenhuma chave hardcoded em texto plano no código
- [ ] `.env*` no `.gitignore`, sem histórico de commit de segredo real
- [ ] Segredos server-only isolados com o pacote `server-only` onde fizer sentido
- [ ] Ambientes de Preview não compartilham credenciais de produção
