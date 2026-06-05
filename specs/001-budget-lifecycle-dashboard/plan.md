# Implementation Plan: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo, Recibos e UI/UX (Linear Style)

**Branch**: `001-budget-lifecycle-dashboard` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-budget-lifecycle-dashboard/spec.md`

## Summary

O objetivo desta funcionalidade é aprimorar o fluxo operacional e estético de orçamentos no Orça Fácil. Isso engloba estender o ciclo de vida dos orçamentos, criar um painel analítico gerencial para o negócio, habilitar a emissão e impressão de recibos de quitação e aplicar um conjunto robusto de melhorias visuais e de usabilidade (UI/UX) inspiradas no design premium do Linear App, incluindo suporte PWA.

A abordagem técnica consiste em:
1.  **Banco de Dados**: 
    *   Alterar o schema da tabela `quotes` (adicionar `cancellation_reason`, ajustar a check constraint de status e migrar status legados) e criar a tabela `quote_receipts` com RLS ativo.
    *   Estender a tabela `companies` adicionando a coluna `industry` (text) e alterando a coluna `phone` para ser opcional (`nullable`).
    *   Criar a função Postgres `public.close_account()` (SECURITY DEFINER) para exclusão segura do usuário e seus dados em cascata de forma multi-tenant.
2.  **Serviços (SRP)**: Implementar a lógica de negócio de recibos em `lib/services/receipt-service.ts`, de orçamentos em `lib/services/quote-service.ts` e de exclusão/perfil em `lib/services/user-service.ts`.
3.  **UI/UX (Linear Style & Responsividade)**:
    *   **Sidebar**: Ajustar o componente de menu lateral para recolhimento limpo no desktop e responsividade mobile.
    *   **Settings**: Alinhar formulários de endereço no grid unificado e adicionar a seção de perigo para o Encerramento Seguro de Conta.
    *   **Onboarding**: Redesenhar a interface do onboarding no estilo Linear (tema escuro premium), solicitando obrigatoriamente o ramo de atuação (`industry`) e removendo a obrigatoriedade de telefone.
    *   **Clonagem de Orçamentos**: Implementar a ação "Clonar" na listagem que cria um novo orçamento como `draft` contendo os dados copiados do orçamento original.
    *   **Notificações**: Atualizar o componente `NotificationBell` para segmentar os alertas em abas "Não lidas" e "Lidas", além de filtrar no carregamento para exibir apenas as notificações criadas a partir do timestamp de cadastro do usuário.
    *   **Filtros & Ações**: Redesenhar os filtros de status na listagem geral para utilizar Tabs organizadas com scroll horizontal e estender o menu de ações contextuais.
4.  **PWA**: Criar o manifest dinâmico e o ícone vetorial correspondente para habilitar a instalabilidade básica.
5.  **Impressão & Recibos**: Desenhar a folha de recibo e otimizar as telas de visualização para impressão/PDF removendo elementos administrativos com print-CSS.

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js 16 (App Router)

**Primary Dependencies**: `@supabase/ssr`, `lucide-react`, `recharts`, `date-fns`, `tailwind-merge`, `zod`, `react-hook-form`

**Storage**: PostgreSQL (Supabase BaaS) com RLS ativado

**Testing**: Validação pontual através de testes funcionais manuais e validação de contratos Zod nas Server Actions

**Target Platform**: Navegadores Web Modernos (Responsivo / Mobile-First / PWA)

**Project Type**: Aplicativo Web Fullstack

**Performance Goals**: Carregamento do Painel Administrativo em < 2 segundos; transições de status, clonagem e gravação de recibos em < 3 segundos; responsividade fluida sem quebras de layout.

**Constraints**:
*   Segurança multi-tenant estrita (RLS).
*   Visualizações, orçamentos e recibos restritos a usuários autenticados proprietários do tenant.
*   Conformidade com os padrões estéticos do Linear App (minimalismo, neutralidade de cores, cantos arredondados, contrastes elegantes).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1.  **Princípio I: Separação de Responsabilidades (SRP)**:
    *   *Check*: Toda a lógica de criação e busca de recibos deve residir em um serviço próprio (`lib/services/receipt-service.ts`). As lógicas de conta e perfil devem residir em `lib/services/user-service.ts`.
2.  **Princípio II: Componentes de Servidor e Server Actions Seguras**:
    *   *Check*: As novas páginas de recibo devem ser Server Components por padrão. As Server Actions de manipulação de status, clonagem e exclusão devem validar a sessão e dados com Zod no servidor.
3.  **Princípio III: Isolamento Multi-Tenant Rigoroso via RLS**:
    *   *Check*: A tabela `quote_receipts` deve possuir RLS ativo restringindo leituras e escritas via `auth.uid() = user_id`.
4.  **Princípio IV: Tipagem TypeScript Estrita e Nomenclatura em Inglês**:
    *   *Check*: Proibido o uso de `any`. Todos os tipos devem ser declarados com interfaces ou tipos inferidos do Zod. O código de novos serviços e actions deve ser escrito em Inglês.
5.  **Princípio V: Tratamento de Erros e Mobile-First**:
    *   *Check*: Validações iniciais com early returns nas actions. Estilização do onboarding, notificações e tabelas com design mobile-first usando Grid e Flexbox nativos, além de print-CSS adequado.

## Project Structure

### Documentation (this feature)

```text
specs/001-budget-lifecycle-dashboard/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code

```text
app/
├── app/
│   ├── manifest.ts          # [NEW] Arquivo de manifest dinâmico do PWA
│   ├── quotes/
│   │   ├── [id]/
│   │   │   ├── receipt/
│   │   │   │   ├── page.tsx  # [NEW] Visualização e impressão do recibo
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx # [NEW] Formulário de criação/edição do recibo
│   │   │   └── page.tsx      # [MODIFY] Exibir botão de recibo se status === 'completed'
│   │   ├── actions.ts        # [MODIFY] Adicionar cloneQuoteAction, salvar e deletar se draft
│   │   ├── columns.tsx      # [MODIFY] Atualizar menu de ações contextuais (incluir Clonar)
│   │   ├── quotes-list.tsx  # [MODIFY] Filtros de status por abas (scroll horizontal e contadores)
│   │   └── schemas.ts        # [MODIFY] Novos enums de status e schemas do recibo
│   ├── settings/
│   │   ├── settings-form.tsx # [MODIFY] Reestruturar campos de endereço e incluir botão Encerrar Conta
│   │   └── actions.ts        # [NEW] Adicionar closeAccountAction para exclusão de conta
│   ├── customers/
│   │   └── [id]/
│   │       └── customer-quotes-client.tsx # [MODIFY] Usar QuoteStatusBadge centralizado
│   ├── page.tsx             # [MODIFY] Dashboard do Prestador (Pizza, Barras e Linhas Recharts)
│   └── components/
│       ├── quotes-chart.tsx # [MODIFY] Atualizado para novos status e lógica de contagem
│       ├── status-pie-chart.tsx # [NEW] Gráfico de pizza de distribuição por status
│       └── revenue-bar-chart.tsx # [NEW] Gráfico de barras de faturamento por mês
├── onboarding/
│   ├── page.tsx             # [MODIFY] Novo design estilo Linear, com Ramo de Atuação e sem Telefone
│   ├── actions.ts        # [MODIFY] Atualizar saveOnboarding para salvar Ramo de Atuação e phone opcional
│   └── schemas.ts        # [MODIFY] Schema atualizado sem phone e com industry obrigatório
components/
├── app-sidebar.tsx          # [MODIFY] Ocultar rótulos/chevrons ao recolher sidebar no desktop
├── quote-status-badge.tsx   # [MODIFY] Mapear novos badges (pending, approved, rejected, cancelled, completed)
├── notification-bell.tsx    # [MODIFY] Adicionar abas Lidas/Não Lidas e lógica de novas contas
lib/
├── services/
│   ├── receipt-service.ts   # [NEW] Serviço de banco de dados para recibos
│   ├── quote-service.ts     # [NEW/MODIFY] Lógica de negócio de transições de status e clonagem
│   └── user-service.ts      # [NEW] Serviço para encerramento de conta e perfil
public/
├── icon.svg                 # [NEW] Ícone vetorial da marca (raio com gradiente) para o PWA
supabase/
└── migrations/
    └── 20260603000000_budget_lifecycle_improvements.sql # [MODIFY/NEW] Migration estendida
```

**Structure Decision**: A estrutura foi planejada seguindo o padrão de rotas do Next.js App Router em `/app/app/quotes` e regras de negócio isoladas em `lib/services/`.

## Complexity Tracking

*Não há violações identificadas dos princípios da constituição.*
