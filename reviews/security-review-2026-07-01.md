# Relatório de Auditoria de Segurança — Orca Fácil

**Data:** 01/07/2026 · **Escopo:** Repositório completo (Next.js v16 App Router, Supabase, Stripe) · **Metodologia:** Whitebox (revisão de código-fonte) · **Auditor:** Security Audit Expert

---

## Resumo Executivo

A postura geral de segurança do **Orca Fácil** é bastante madura. O banco de dados do Supabase possui Row Level Security (RLS) habilitado e configurado corretamente em todas as tabelas, mitigando riscos de vazamento em massa de dados de multi-tenancy. A aplicação utiliza o middleware do Next.js 16 (`proxy.ts`) para autenticar rotas e barrar mutações de usuários inadimplentes, e as Server Actions usam o método seguro `getUser()` para identificação no servidor.

No entanto, a aplicação apresenta vulnerabilidades lógicas e de validação de dados que precisam de atenção antes do deploy em produção. A principal falha identificada é um **Open Redirect com vazamento de Token de Redefinição de Senha** nas Server Actions de autenticação, o que permite o sequestro de contas por atacantes externos. Outros achados incluem a possibilidade de manipulação de preços em assinaturas do Stripe Checkout e ausência de sanitização de HTML na exibição de termos/notas de orçamentos (Stored XSS).

**Contagem de achados:** 🔴 0 Crítico(s) · 🟠 3 Alto(s) · 🟡 2 Médio(s) · 🔵 4 Baixo(s) · ⚪ 0 Informativo(s)

**Top 3 prioridades:**
1. **[SEC-01]** Corrigir o Open Redirect e vazamento de token de reset em `sendPasswordReset`.
2. **[SEC-02]** Remover a injeção dinâmica de origem do client in `signInWithGoogle`.
3. **[SEC-03]** Validar IDs de Preços de Checkout do Stripe de forma server-side em `createCheckoutAction`.

---

## 🔴 Achados Críticos

*Nenhum achado de severidade crítica imediata foi identificado durante esta revisão.*

---

## 🟠 Achados de Alta Severidade

### [SEC-01] Open Redirect e Sequestro de Token em Redefinição de Senha via parâmetro `origin`

- **Severidade:** 🟠 Alta
- **Categoria:** Autenticação / Open Redirect
- **Localização:** [app/auth/actions.ts](file:///c:/DEV/orcafacil/app/auth/actions.ts), linha 124
- **Descrição:** A Server Action `sendPasswordReset` aceita o parâmetro `origin` vindo diretamente do client-side e o utiliza para construir a URL de redirecionamento (`redirectUrl`) enviada ao Supabase Auth. Um atacante pode invocar a Server Action de forma direta e programática (via `fetch` ou `curl`), informando o e-mail de qualquer usuário cadastrado e uma origem maliciosa sob seu controle (ex: `https://attacker.com`). O Supabase gerará e enviará um e-mail oficial de redefinição de senha para a vítima. Quando a vítima clicar no botão legítimo do e-mail, o token de uso único será anexado como parâmetro de consulta (`code`) e enviado para o servidor do atacante, permitindo o sequestro da conta (Account Takeover).
- **Cenário de exploração:**
  1. O atacante descobre o e-mail da vítima cadastrada no Orca Fácil.
  2. O atacante executa a Server Action `sendPasswordReset` passando o e-mail da vítima e o parâmetro `origin` definido como `https://evil-site.com`.
  3. A vítima recebe o e-mail de redefinição de senha real e oficial do Supabase/Orca Fácil.
  4. Ao clicar no link, ela é levada para `https://evil-site.com/auth/callback?code=TOKEN_DE_RESET`.
  5. O servidor do atacante captura o `code`, realiza a troca por sessão no Supabase e redefine a senha da vítima.
- **Evidência:**
  ```typescript
  export async function sendPasswordReset(email: string, origin: string) {
    if (!email || !email.includes('@')) {
      return { error: 'E-mail inválido.' }
    }

    const supabase = await createClient()
    const redirectUrl = `${origin}/auth/callback?next=/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
  ```
- **Correção sugerida:**
  Obter a URL base da aplicação exclusivamente através das variáveis de ambiente do backend para garantir que os e-mails apontem para domínios autorizados.
  ```typescript
  export async function sendPasswordReset(email: string) {
    if (!email || !email.includes('@')) {
      return { error: 'E-mail inválido.' }
    }

    const supabase = await createClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/auth/callback?next=/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
  ```
  *(Ajustar também a chamada no componente de página de redefinição de senha em [app/forgot-password/page.tsx](file:///c:/DEV/orcafacil/app/forgot-password/page.tsx) para não enviar o `window.location.origin`)*
- **Referência:** OWASP A01:2021 – Broken Access Control / CWE-601

---

### [SEC-02] Vulnerabilidade de Open Redirect em Login Social (OAuth) via parâmetro `origin`

- **Severidade:** 🟠 Alta
- **Categoria:** Autenticação / Open Redirect
- **Localização:** [app/auth/actions.ts](file:///c:/DEV/orcafacil/app/auth/actions.ts), linha 102
- **Descrição:** A Server Action `signInWithGoogle` aceita e utiliza um parâmetro `origin` dinâmico do client-side para estruturar a URI de retorno de autenticação. Um atacante pode explorar essa rota para redirecionar usuários autenticados para sites maliciosos (phishing) sob o pretexto de concluir o login.
- **Cenário de exploração:**
  1. O atacante cria um link para redirecionar um usuário para o fluxo de login social do Orca Fácil, mas modificando a chamada para passar `origin=https://phishing-site.com`.
  2. O usuário faz login no Google e é redirecionado de volta para `https://phishing-site.com/auth/callback` com o código de sessão, possibilitando roubo de sessão ou manipulação do usuário em um site visualmente idêntico.
- **Evidência:**
  ```typescript
  export async function signInWithGoogle(origin?: string) {
    const supabase = await createClient()
    const redirectUrl = origin
      ? `${origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  ```
- **Correção sugerida:**
  ```typescript
  export async function signInWithGoogle() {
    const supabase = await createClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  ```
- **Referência:** OWASP A01:2021 – Broken Access Control / CWE-601

---

### [SEC-03] Manipulação de Parâmetros de Preço no Stripe Checkout

- **Severidade:** 🟠 Alta
- **Categoria:** Pagamentos / Integridade de Dados
- **Localização:** [app/pricing/server-actions.ts](file:///c:/DEV/orcafacil/app/pricing/server-actions.ts), linha 55
- **Descrição:** A Server Action `createCheckoutAction` obtém o `priceId` enviado pelo client-side via FormData (`formData.get('priceId')`). Embora o Stripe restrinja preços apenas à conta proprietária das chaves de API do app, um usuário malicioso pode enviar um `priceId` de homologação (ex: de valor R$ 1,00) ou um ID de preço inativo/antigo que esteja cadastrado na mesma conta Stripe para assinar a plataforma Pro por um preço indevido.
- **Cenário de exploração:**
  1. O usuário malicioso acessa a página de preços e intercepta a requisição de Checkout.
  2. Ele altera o valor do campo `priceId` no formulário para um ID de preço de R$ 1,00 (preço de testes/desconto que ainda se encontra ativo na conta do Stripe).
  3. O backend do Next.js aceita o ID sem validação e cria a Checkout Session no Stripe.
  4. O usuário realiza o pagamento de R$ 1,00 e o webhook ativa sua assinatura Pro normalmente.
- **Evidência:**
  ```typescript
  const selectedPriceId = formData ? (formData.get('priceId') as string | null) : null
  let priceId = selectedPriceId || process.env.STRIPE_PRICE_ID
  ```
- **Correção sugerida:**
  Derivar os IDs de preços unicamente no servidor com base em identificadores lógicos do plano (ex: `'monthly'` ou `'yearly'`), em vez de aceitar o ID bruto do Stripe enviado pelo client.
  ```typescript
  // app/pricing/server-actions.ts
  const PRICING_PLANS: Record<string, string> = {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY!, // mapeado em variáveis de ambiente
    yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
  }

  export async function createCheckoutAction(formData?: FormData) {
    // ...
    const selectedPlan = formData ? (formData.get('plan') as string | null) : null
    let priceId = selectedPlan ? PRICING_PLANS[selectedPlan] : process.env.STRIPE_PRICE_ID
    // ...
  ```
- **Referência:** OWASP A08:2021 – Software and Data Integrity Failures / CWE-807

---

## 🟡 Achados de Média Severidade

### [SEC-04] Stored XSS em Notas de Orçamento via `dangerouslySetInnerHTML`

- **Severidade:** 🟡 Média
- **Categoria:** Injeção / XSS
- **Localização:** [components/quote-viewer.tsx](file:///c:/DEV/orcafacil/components/quote-viewer.tsx), linha 445
- **Descrição:** O componente `QuoteViewer` exibe o campo `quote.notes` utilizando a propriedade `dangerouslySetInnerHTML` sem qualquer sanitização prévia. Se um orçador malicioso inserir um payload de script (ex: `<img src=x onerror=...>` ou `<script>`) nas notas ao criar/editar o orçamento, esse script será executado no contexto do navegador de qualquer pessoa da organização ou administrador que visualizar o orçamento dentro do painel.
- **Cenário de exploração:**
  1. Um membro malicioso de uma equipe cria um orçamento com código JavaScript malicioso embutido no campo `notes`.
  2. O administrador do SaaS ou outro membro da equipe abre o orçamento no painel administrativo.
  3. O script injetado é executado no painel da vítima, roubando tokens de autenticação ou disparando ações em seu nome (como criar administradores ou alterar contas de e-mail).
- **Evidência:**
  ```typescript
  {quote.notes && (
    <div>
      <h4 className="text-ds-caption font-bold text-muted-foreground uppercase tracking-wider mb-1">
        TERMOS E CONDIÇÕES
      </h4>
      <div
        className="text-ds-body-sm text-muted-foreground leading-ds-relaxed font-medium prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
        dangerouslySetInnerHTML={{ __html: quote.notes }}
      />
    </div>
  )}
  ```
- **Correção sugerida:**
  Instalar uma biblioteca de sanitização de HTML como `dompurify` ou `isomorphic-dompurify` e limpar as notas antes de renderizá-las:
  ```typescript
  import DOMPurify from 'isomorphic-dompurify'
  
  // ...
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(quote.notes) }}
  ```
- **Referência:** OWASP A03:2021 – Injection / CWE-79

---

### [SEC-05] Vulnerabilidades em Dependências Críticas de Produção

- **Severidade:** 🟡 Média
- **Categoria:** Componentes Vulneráveis/Desatualizados
- **Localização:** [package.json](file:///c:/DEV/orcafacil/package.json) / `npm audit`
- **Descrição:** O comando `npm audit` identificou 14 vulnerabilidades no total (6 delas de severidade Alta). Há riscos conhecidos no Next.js (bypasses do middleware através de requisições de prefetch no App Router e injeção de parâmetros dinâmicos) e no pacote `pdfjs-dist` (execução arbitrária de código JS ao processar PDFs manipulados).
- **Evidência:** Relatório do `npm audit` mostrando bypasses de segurança em `next` (versões < 16.3.0) e execução de script em `pdfjs-dist`.
- **Correção sugerida:**
  Atualizar os pacotes de runtime para suas últimas versões de segurança e corrigir dependências vulneráveis transitivas executando:
  ```bash
  npm install next@latest
  npm audit fix
  ```
- **Referência:** OWASP A06:2021 – Vulnerable and Outdated Components / CWE-1395

---

## 🔵 Achados de Baixa Severidade / Hardening

### [SEC-06] Injeção de Scripts em Logotipos via Upload de SVG

- **Severidade:** 🔵 Baixa
- **Categoria:** Injeção / SVG XSS
- **Localização:** [app/app/settings/actions.ts](file:///c:/DEV/orcafacil/app/app/settings/actions.ts), linha 63
- **Descrição:** O formulário de configurações permite o upload de imagens no formato `image/svg+xml`. O formato SVG permite incluir elementos XML `<script>` ou manipuladores de eventos HTML. Embora o arquivo seja servido em um subdomínio do Supabase e renderizado via tag `<img>` (bloqueando a execução automática de scripts na maioria dos navegadores modernos), a abertura direta do link público do SVG pode executar códigos no domínio do Supabase.
- **Correção sugerida:** Remover `image/svg+xml` da allowlist de uploads de logotipo nas configurações ou sanitizar o SVG usando um parser de XML no backend antes de armazená-lo.

---

### [SEC-07] Leitura Aberta de Notificações (`SELECT` sem autenticação)

- **Severidade:** 🔵 Baixa
- **Categoria:** Autorização
- **Localização:** [supabase/migrations/20260613032313_remote_schema.sql](file:///c:/DEV/orcafacil/supabase/migrations/20260613032313_remote_schema.sql), linha 939
- **Descrição:** A política `Anyone can view notifications` permite a execução de `SELECT` com `USING (true)` sem restringir o acesso a usuários autenticados. Isso expõe todos os comunicados e anúncios globais do sistema para usuários anônimos com a chave pública anônima.
- **Evidência:**
  ```sql
  CREATE POLICY "Anyone can view notifications" ON "public"."notifications" FOR SELECT USING (true);
  ```
- **Correção sugerida:** Restringir a leitura da tabela `notifications` apenas para usuários logados:
  ```sql
  CREATE POLICY "Authenticated users can view notifications" ON "public"."notifications"
    FOR SELECT TO authenticated USING (true);
  ```

---

### [SEC-08] Ausência de Cabeçalhos de Segurança HTTP básicos

- **Severidade:** 🔵 Baixa
- **Categoria:** Configurações de Segurança / Hardening
- **Localização:** [next.config.ts](file:///c:/DEV/orcafacil/next.config.ts)
- **Descrição:** O arquivo `next.config.ts` não possui as configurações de cabeçalhos de segurança básicos (como `X-Frame-Options` para evitar Clickjacking ou `X-Content-Type-Options: nosniff`).
- **Correção sugerida:** Adicionar um bloco `headers()` na configuração do Next.js aplicando cabeçalhos padrão como:
  ```typescript
  const securityHeaders = [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
  ]
  ```

---

### [SEC-09] Falta de Controle de Idempotência no Webhook do Stripe

- **Severidade:** 🔵 Baixa
- **Categoria:** Integridade de Dados / Hardening
- **Localização:** [app/api/webhook/route.ts](file:///c:/DEV/orcafacil/app/api/webhook/route.ts)
- **Descrição:** O processador do webhook do Stripe não armazena ou valida se o `event.id` do Stripe já foi processado anteriormente. Embora a operação atual do banco de dados seja idempotente (apenas executa `UPDATE` de colunas de assinatura), o envio de e-mails transacionais ou outros efeitos colaterais integrados no futuro podem disparar repetidamente em reenvios automáticos de webhook do Stripe.
- **Correção sugerida:** Registrar eventos processados em uma tabela de controle e realizar early return caso o ID do evento do Stripe já tenha sido registrado.

---

## ⚪ Observações e Notas de Conformidade

- **Mapeamento de Dados e LGPD:** A plataforma coleta dados como CNPJ, e-mail corporativo, números de telefone, endereços de empresas e dados cadastrais de clientes. Recomenda-se assegurar que os termos de uso e a política de privacidade (cujo link está presente na rota pública `/termos`) detalhem o tratamento desses dados de forma transparente, além de disponibilizar um fluxo (mesmo que por e-mail de suporte) para a exclusão total dos dados dos usuários em cumprimento às diretrizes de exclusão da LGPD.

---

## ✅ Pontos Fortes

- **RLS Ativo Globalmente:** Todas as 10 tabelas públicas mapeadas no banco de dados do Supabase possuem Row Level Security (RLS) habilitado e políticas estritas de isolamento por `user_id`, prevenindo vazamento de dados de multi-tenancy.
- **Validação com Zod no Servidor:** Todas as Server Actions essenciais que alteram dados do banco (`saveQuote`, `deleteQuote`, `saveCatalogItem`, `saveCustomer`) aplicam validação rigorosa de tipos e regras de negócios com esquemas Zod antes de prosseguir.
- **Autenticação Segura via `getUser()`:** A revalidação das sessões de usuário no middleware/proxy e nas Server Actions utiliza `auth.getUser()`, evitando fraudes baseadas em manipulação de cookies locais do navegador (`getSession()`).
- **Verificação de Webhook:** O webhook do Stripe faz o uso correto e seguro da constructEvent para validar assinaturas com segredo de webhook exclusivo.

---

## 📋 Plano de Ação Priorizado

**Corrigir antes de qualquer deploy adicional (Imediato):**
- [x] **[SEC-01]** Corrigir a injeção do parâmetro `origin` em `sendPasswordReset` no arquivo `app/auth/actions.ts` e `app/forgot-password/page.tsx`.
- [x] **[SEC-02]** Remover a injeção do parâmetro `origin` em `signInWithGoogle` no arquivo `app/auth/actions.ts` e páginas de Login/Registro.

**Corrigir nesta semana:**
- [x] **[SEC-03]** Alterar a Server Action `createCheckoutAction` para derivar o `priceId` no servidor com base em um parâmetro de plano simplificado (ex: `'monthly' | 'yearly'`).
- [x] **[SEC-04]** Integrar sanitização com `isomorphic-dompurify` no renderizador `QuoteViewer` para exibir o campo `quote.notes` de forma segura contra XSS.
- [x] **[SEC-05]** Atualizar a versão do Next.js no `package.json` para a mais recente do branch principal e rodar `npm audit fix` para mitigar bypasses no middleware.

**Quando houver disponibilidade (Hardening):**
- [x] **[SEC-06]** Desabilitar ou processar uploads de imagens no formato SVG para logotipos no formulário de configurações.
- [x] **[SEC-07]** Ajustar a política RLS da tabela `notifications` de `USING (true)` para `TO authenticated USING (true)`.
- [x] **[SEC-08]** Adicionar cabeçalhos de segurança básicos em `next.config.ts`.
- [x] **[SEC-09]** Criar mecanismo de controle de idempotência registrando IDs de eventos do Stripe processados pelo webhook.

---

## Apêndice — Escopo e Limitações

Esta auditoria cobriu revisão estática do código-fonte (whitebox) com foco na integridade das APIs, Server Actions, controle de fluxo e permissões de dados (RLS). Não incluiu testes de intrusão ativos contra os servidores de homologação ou produção, varredura de portas de infraestrutura de rede, ataques de engenharia social física ou auditoria de conformidade formal. Recomenda-se revisões periódicas das políticas de segurança à medida que novos endpoints forem adicionados à plataforma.
