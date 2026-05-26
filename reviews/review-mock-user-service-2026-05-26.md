# 🔍 Code Review: Mock User Service (`mock-user-service.ts`)
**Data**: 2026-05-26 | **Revisor**: Antigravity Code Review Agent

---

## 📋 Resumo Geral
O código revisado em `mock-user-service.ts` apresenta múltiplas falhas de alta severidade que violam as regras fundamentais de segurança multi-tenant, qualidade de tipos do TypeScript, separação de responsabilidades (SRP) e o design system do **Orca Fácil**. A persistência de lógica de renderização HTML dentro de uma camada de serviço e a ausência completa de validação de propriedade do tenant em mutações de banco de dados são pontos de atenção imediata que impedem o envio desse arquivo para produção.

---

## 🔴 Problemas Críticos (Gravidade Máxima)

### 1. Ausência de Validação de Tenant / RLS Bypass em Lógica de Aplicação
- **Onde**: `mock-user-service.ts` (linhas 27-46)
- **Impacto**: O método `updateBilling` atualiza registros na tabela `billing_records` confiando unicamente na chave primária `id` do registro enviada pelo cliente. Isso representa uma falha crítica de segurança (*Insecure Direct Object Reference* / IDOR), permitindo que um usuário autenticado malicioso altere dados de faturamento de outro tenant se descobrir ou adivinhar o UUID/ID do registro.
- **Como Corrigir**: O servidor deve validar a sessão do usuário e garantir que a consulta cruze o registro com o `tenant_id` do usuário logado ou que a propriedade de tenant seja comprovada antes da mutação.
  ```typescript
  import { supabaseServerClient } from '@/lib/supabase/server'; // Exemplo usando cliente seguro do servidor

  export async function updateBilling(id: string, payload: UpdateBillingDTO, tenantId: string) {
    // Validação estrita de propriedade na query
    const { data, error } = await supabase
      .from('billing_records')
      .update({ amount: payload.amount, currency: payload.currency })
      .eq('id', id)
      .eq('tenant_id', tenantId); // Validação de barreira multi-tenant obrigatória
  }
  ```

### 2. Uso Banido do Tipo `any`
- **Onde**: `mock-user-service.ts` (linhas 15, 27, 47)
- **Impacto**: O tipo `any` silencia o compilador do TypeScript, removendo todas as garantias de segurança em tempo de compilação. Isso expõe o código a falhas em produção caso a estrutura de dados seja modificada e viola diretamente a regra estrita do Orca Fácil.
- **Como Corrigir**: Tipar explicitamente as interfaces de payload e dados e usar o tipo `unknown` para erros em blocos catch, executando type narrowing.
  ```typescript
  export interface UserProfile {
    id: string;
    email: string;
    // outros campos necessários
  }

  export async function getUserById(id: string): Promise<UserProfile | null> {
    // implementação tipada...
  }
  ```

---

## 🟠 Problemas Importantes (Gravidade Alta)

### 1. Violação de Early Returns e Callback Hell
- **Onde**: `mock-user-service.ts` (linhas 30-43)
- **Impacto**: A função `updateBilling` possui 5 níveis de aninhamento de instruções `if`, dificultando consideravelmente a leitura e manutenção do código, além de ferir a regra de limite máximo de 3 níveis de aninhamento.
- **Como Corrigir**: Achatar a estrutura de decisão usando Early Returns imediatos.
  ```typescript
  if (!id) return null;
  if (!payload || payload.amount <= 0) return null;
  if (payload.currency !== 'BRL') return null;

  // Lógica principal sem aninhamento profundo
  const { data, error } = await supabase
    .from('billing_records')
    .update({ amount: payload.amount })
    .eq('id', id)
    .eq('tenant_id', tenantId);
  ```

### 2. Ausência de Tratamento de Erros e Silenciamento de Exceptions
- **Onde**: `mock-user-service.ts` (linha 15 e linha 47)
- **Impacto**: A função `getUsr` não envolve a chamada de rede assíncrona em blocos de exceção. Se a conexão falhar, o servidor quebrará de forma não tratada. Na função `updateBilling`, o bloco catch apenas registra um log genérico `console.log("Erro")` que não fornece stack trace útil para depuração em logs.
- **Como Corrigir**: Implementar try/catch com logs adequados.
  ```typescript
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error(`[UserService] Error fetching user by ID: ${errorDetails}`);
    throw new Error('Failed to retrieve user profile.');
  }
  ```

---

## 🟡 Melhorias Recomendadas (Gravidade Média)

### 1. Violação do Princípio de Responsabilidade Única (SRP)
- **Onde**: `mock-user-service.ts` (linhas 54-63)
- **Impacto**: O arquivo contém funções de persistência e serviços de negócio misturadas com uma função de renderização HTML (`UserBadge`). Isso quebra a arquitetura limpa do Orca Fácil, onde a UI deve estar totalmente desacoplada da lógica de negócios e persistência.
- **Como Corrigir**: Remover a função `UserBadge` deste arquivo de serviço e movê-la para um arquivo de componente de UI apropriado (ex: `components/ui/user-badge.tsx`).

---

## 🟢 Melhorias de Qualidade & Nomenclatura (Gravidade Baixa)

### 1. Padrões de Nomenclatura em Inglês & Clareza
- **Função `getUsr`**: Abreviações obscuras como `Usr` violam a clareza. Use `getUserById`.
- **Variável `usrAtivo`**: Está escrita em português misturado e é um booleano sem prefixo padrão. Deve ser renomeada para inglês e receber o prefixo `is` ou `has`, por exemplo: `isUserActive` ou `isActive`.

### 2. Uso Incorreto de Estilização Arbitrária (Tailwind CSS v4 Anti-Pattern)
- **Onde**: `mock-user-service.ts` (linhas 57-61)
- **Impacto**: Classes como `h-[47px]`, `w-[230px]`, `bg-[#f3a123]` e `p-[13px]` usam valores mágicos soltos, ignorando as variáveis de tema do Tailwind CSS v4 e quebrando a consistência visual do Orca Fácil.
- **Como Corrigir**: Empregar espaçamentos e tokens nativos do design system e prever layout flexível e responsivo (ex: `h-12 w-full max-w-xs bg-warning p-3`).

---

## ✅ Pontos Positivos
- **Uso de Variáveis de Ambiente**: O arquivo de mock inicializa a conexão com o Supabase utilizando corretamente as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, evitando chaves privadas expostas diretamente no código.

---

## 📝 Checklist de Validação da Stack do Orca Fácil

### Segurança & Multi-Tenancy
- [ ] O código backend/Server Action não confia no ID de cliente e valida rigorosamente o `tenant_id` ou propriedade do registro. *(Falhou no updateBilling)*
- [x] RLS está ativo na tabela e nenhuma query burla políticas do banco de dados. *(Considerado em nível de Supabase)*
- [x] Chaves de API, credenciais ou secrets usam estritamente variáveis de ambiente.

### Arquitetura & SRP
- [ ] Lógica de negócio está isolada em serviços (`lib/services/`) e não está misturada em componentes de UI. *(Falhou devido ao componente UserBadge)*
- [x] Server Components são usados por padrão para carregar dados; `"use client"` está limitado à interatividade obrigatória.
- [ ] Server Actions validam inputs com Zod e autenticam o usuário no lado do servidor. *(Falhou na falta de Zod para o payload de billing)*

### Qualidade TypeScript & Higiene
- [ ] Nenhum tipo `any` foi utilizado. Tipos explícitos ou `unknown` com narrowing são usados. *(Falhou pelo uso massivo de any)*
- [ ] Padrão de Nomenclatura em Inglês: Funções começam com verbo de ação; booleanos começam com `is`, `has`, `should`, `can`. *(Falhou em usrAtivo e getUsr)*
- [ ] Early Returns aplicados para achatar estruturas condicionais (limite de 3 níveis de aninhamento). *(Falhou no updateBilling)*
