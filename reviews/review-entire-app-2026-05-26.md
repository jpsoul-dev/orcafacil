# 🔍 Code Review: Toda a Aplicação (Revisão Geral de Arquitetura)
**Data**: 2026-05-26 | **Revisor**: Antigravity Code Review Agent

---

## 📋 Resumo Geral
Realizei uma varredura e análise estrutural de todo o ecossistema do **Orca Fácil**, cobrindo o middleware (`proxy.ts` / `lib/supabase/proxy.ts`), as Server Actions (`app/app/quotes/actions.ts`, `app/onboarding/actions.ts`, `app/pricing/server-actions.ts`), a rota de webhook do Stripe (`app/api/webhook/route.ts`), e componentes críticos da interface de usuário (`components/quote-viewer.tsx`, `app/onboarding/page.tsx`).

A aplicação demonstra um nível de engenharia muito bom, com excelente uso de transações via RPC para upserts atômicos e validação no frontend usando React Hook Form + Zod + shadcn/ui. No entanto, foram descobertos **dois problemas críticos de segurança e arquitetura** (incluindo o middleware do Supabase que não está sendo executado no Next.js devido a um erro de nomenclatura de arquivo, o que desativa a segurança e o controle de sessões global da aplicação) e várias oportunidades de melhoria de qualidade de acordo com os padrões corporativos.

---

## 🔴 Problemas Críticos (Gravidade Máxima)

### 1. Ausência de Execução do Middleware do Next.js (Middleware Bypass)
- **Onde**: Raiz do projeto, arquivo `proxy.ts` (linhas 1-20)
- **Impacto**: O Next.js procura estritamente por um arquivo com o nome exato `middleware.ts` (ou `src/middleware.ts`) para rodar os interceptores de requisição na Edge. A presença de um arquivo `proxy.ts` na raiz contendo as configurações de matcher e o redirecionamento de rotas privadas significa que **o middleware do Supabase nunca é invocado**. As páginas privadas sob `/app` estão expostas a carregamentos de layout anônimos desnecessários, e a sessão do Supabase não está sendo atualizada de forma transparente em todas as rotas.
- **Como Corrigir**:
  Renomear o arquivo `c:\DEV\orcafacil\proxy.ts` para `middleware.ts` na raiz do projeto e exportar a função como padrão (`default`) ou nomeada (`middleware`), conforme o padrão Next.js:
  ```typescript
  // c:\DEV\orcafacil\middleware.ts
  import { type NextRequest } from 'next/server'
  import { updateSession } from '@/lib/supabase/proxy'

  export async function middleware(request: NextRequest) {
    return await updateSession(request)
  }

  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  }
  ```

### 2. Ausência de Validação com Zod no Backend / Server Actions
- **Onde**: `app/onboarding/actions.ts` (linhas 6-40)
- **Impacto**: A Server Action `saveOnboarding` recebe o argumento `data` do tipo `{ name: string; phone: string }` diretamente no servidor sem realizar nenhuma validação técnica no backend. Embora o formulário no frontend valide os dados via Zod (`onboardingSchema`), um invasor ou script automatizado pode enviar payloads maliciosos, vazios, ou com tamanhos excessivos diretamente para o endpoint POST exposto da Server Action, causando injeções potenciais ou quebras no banco de dados.
- **Como Corrigir**:
  Defina ou importe o schema do Zod no backend e faça a validação com `safeParse` imediatamente no início da Server Action (Early Return):
  ```typescript
  import { z } from 'zod'
  import { logger } from '@/lib/logger' // Usar o logger corporativo

  const onboardingInputSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100),
    phone: z.string().min(14, 'Telefone inválido'),
  })

  export async function saveOnboarding(rawData: unknown) {
    const validation = onboardingInputSchema.safeParse(rawData)
    if (!validation.success) {
      return { error: 'Dados inválidos fornecidos' }
    }

    const { name, phone } = validation.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    // ... restante da lógica
  }
  ```

---

## 🟠 Problemas Importantes (Gravidade Alta)

### 1. Ausência de Uso do Logger Corporativo Consistente
- **Onde**: `app/onboarding/actions.ts` (linha 34)
- **Impacto**: O arquivo utiliza `console.error('Erro ao salvar onboarding:', error)` em vez do logger customizado do projeto (`lib/logger`). Isso fragmenta o monitoramento de logs da aplicação em produção, impedindo que esses erros sejam formatados ou centralizados corretamente em provedores de observabilidade (ex: Datadog, Axiom).
- **Como Corrigir**:
  ```typescript
  import { logger } from '@/lib/logger'
  // ...
  if (error) {
    logger.error('Erro ao salvar onboarding:', error)
    return { error: 'Erro ao salvar os dados do negócio' }
  }
  ```

### 2. Hack de setTimeout no Componente Cliente `QuoteViewer`
- **Onde**: `components/quote-viewer.tsx` (linhas 170-175)
- **Impacto**: O uso de `setTimeout(() => { setCurrentStatus(quote.status) }, 0)` indica a resolução de um conflito de concorrência ou um remendo para renderização inconsistente do estado derivado da propriedade (`quote.status`). Isso introduz um atraso de micro-tarefa desnecessário e pode gerar flashings indesejados de UI ou race conditions secundárias.
- **Como Corrigir**:
  Se o estado `currentStatus` deve apenas refletir o status inicial e depois ser controlado localmente pelas ações, use o `useEffect` para sincronizá-lo diretamente, ou use o estado derivado diretamente se a propriedade puder guiar totalmente a UI:
  ```typescript
  useEffect(() => {
    setCurrentStatus(quote.status)
  }, [quote.status])
  ```

---

## 🟡 Melhorias Recomendadas (Gravidade Média)

### 1. Violação do Princípio DRY na Formatação de Moedas
- **Onde**: `components/quote-viewer.tsx` (linha 118)
- **Como Corrigir**:
  A função `brl` está declarada diretamente no componente de visualização. Ela deve ser extraída e centralizada em `lib/utils.ts` ou `lib/masks.ts` para que todas as partes do sistema (como listas de orçamentos, faturas, relatórios) usem a mesma lógica de formatação de moedas sem duplicação de código:
  ```typescript
  // lib/utils.ts ou lib/masks.ts
  export const formatBRL = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }
  ```

### 2. Segurança da Rota Pública de Orçamentos
- **Onde**: `app/app/quotes/actions.ts` - `updatePublicQuoteStatus` (linha 210)
- **Descrição**: O endpoint é intencionalmente anônimo para permitir que o cliente do usuário do SaaS aprove ou rejeite o orçamento sem fazer login. No entanto, ela utiliza o Supabase Client padrão `createClient()`. Para funcionar sob RLS sem bypass, a tabela `quotes` deve ter uma política de RLS que permite que a chave anônima (anon) dê UPDATE na coluna `status` contanto que o payload coincida com o `public_uuid`. Uma alternativa mais blindada seria realizar o update utilizando o `supabaseAdmin` especificamente para esta alteração crítica de status, restringindo a exposição de escrita da chave pública comum.

---

## 🟢 Melhorias de Qualidade & Nomenclatura (Gravidade Baixa)

### 1. Inconsistência de Idioma e Padrão de Nomenclatura em Enums
- **Onde**: `components/quote-viewer.tsx` (linhas 54-60 e 157)
- **Descrição**: O tipo `QuoteStatus` possui opções em inglês (`'draft' | 'open' | 'accepted' | 'rejected' | 'expired'`) e uma opção misturada em português (`'vencido'`). Isso viola a diretriz técnica que exige que todo o código-fonte técnico e enums sejam definidos estritamente em **Inglês**.
- **Como Corrigir**: Use apenas `'expired'` no enum e remova a variante `'vencido'`. O mapeamento para a palavra "Vencido" em português na UI deve ser feito exclusivamente no dicionário estático local (como já é feito para os outros termos).

---

## ✅ Pontos Positivos
- **Segurança Robusta de Sessão**: As principais Server Actions (como `saveQuote` e `deleteQuote`) utilizam ativamente o método seguro `supabase.auth.getUser()`, evitando o uso vulnerável de `getSession()`.
- **Transacionalidade e Atomicidade**: O uso de chamadas RPC no Supabase como `upsert_quote_with_items` garante que os itens e os orçamentos sejam sempre persistidos juntos, prevenindo orçamentos órfãos ou inconsistências no banco de dados.
- **Idempotência no Stripe**: O `stripe.customers.create` utiliza a chave de idempotência de forma exemplar na Service, evitando a duplicação de faturas e clientes se o backend falhar no meio do caminho.

---

## 📝 Checklist de Validação da Stack do Orca Fácil

### Segurança & Multi-Tenancy
- [x] O código backend/Server Action não confia no ID de cliente e valida rigorosamente o `tenant_id` ou propriedade do registro.
- [x] RLS está ativo na tabela e nenhuma query burla políticas do banco de dados (Validação via RLS e cruzamento manual de IDs).
- [x] Chaves de API, credenciais ou secrets usam estritamente variáveis de ambiente.

### Arquitetura & SRP
- [x] Lógica de negócio está isolada em serviços (`lib/services/`) e não está misturada em componentes de UI.
- [x] Server Components são usados por padrão para carregar dados; `"use client"` está limitado à interatividade obrigatória.
- [ ] Server Actions validam inputs com Zod e autenticam o usuário no lado do servidor (Nota: exceção da action de onboarding, que precisa ser corrigida).

### Qualidade TypeScript & Higiene
- [x] Nenhum tipo `any` foi utilizado. Tipos explícitos ou `unknown` com narrowing são usados.
- [ ] Padrão de Nomenclatura em Inglês: Funções começam com verbo de ação; booleanos começam com `is`, `has`, `should`, `can` (Nota: mistura de "vencido" e "expired" no enum de status).
- [x] Early Returns aplicados para achatar estruturas condicionais (limite de 3 níveis de aninhamento).