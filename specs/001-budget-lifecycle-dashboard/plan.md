# Implementation Plan: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo e Recibos

**Branch**: `001-budget-lifecycle-dashboard` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-budget-lifecycle-dashboard/spec.md`

## Summary

O objetivo desta funcionalidade é aprimorar o fluxo operacional de orçamentos no Orça Fácil, expandindo o ciclo de vida dos orçamentos, implementando um painel analítico gerencial e permitindo a emissão de recibos físicos/PDF para orçamentos finalizados. 

A abordagem técnica consiste em:
1.  **Banco de Dados**: Alterar o schema da tabela `quotes` (adicionar `cancellation_reason`, ajustar a check constraint de status e migrar status legados) e criar a tabela `quote_receipts` com políticas de RLS ativas para isolamento multi-tenant.
2.  **Serviços (SRP)**: Implementar a lógica de negócio de recibos em `lib/services/receipt-service.ts` e de orçamentos em `lib/services/quote-service.ts` (ou estender em `app/app/quotes/actions.ts`).
3.  **UI & Dashboard**: Aprimorar o painel em `app/app/page.tsx` utilizando Recharts para exibir gráficos de linha (novos orçamentos), rosca (distribuição por status) e barras (faturamento mensal).
4.  **Recibos**: Implementar formulário de emissão/edição e layout de impressão otimizado com print-CSS.

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js 16 (App Router)

**Primary Dependencies**: `@supabase/ssr`, `lucide-react`, `recharts`, `date-fns`, `tailwind-merge`, `zod`, `react-hook-form`

**Storage**: PostgreSQL (Supabase BaaS) com RLS ativado

**Testing**: Validação pontual através de testes funcionais manuais e validação de contratos Zod nas Server Actions

**Target Platform**: Navegadores Web Modernos (Responsivo / Mobile-First)

**Project Type**: Aplicativo Web Fullstack

**Performance Goals**: Carregamento do Painel Administrativo em < 2 segundos; transições de status e gravação de recibos em < 3 segundos.

**Constraints**:
*   Segurança multi-tenant estrita (RLS).
*   Visualizações, orçamentos e recibos restritos a usuários autenticados proprietários do tenant.
*   Ausência de assinaturas eletrônicas complexas e de compartilhamento de links públicos sem autenticação.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1.  **Princípio I: Separação de Responsabilidades (SRP)**:
    *   *Check*: Toda a lógica de criação e busca de recibos deve residir em um serviço próprio (`lib/services/receipt-service.ts`). As Server Actions devem apenas chamar esses serviços.
2.  **Princípio II: Componentes de Servidor e Server Actions Seguras**:
    *   *Check*: As novas páginas de recibo devem ser Server Components por padrão. As Server Actions de manipulação do status de orçamentos e gravação de recibos devem validar a sessão do usuário no servidor e validar os inputs com Zod.
3.  **Princípio III: Isolamento Multi-Tenant Rigoroso via RLS**:
    *   *Check*: A tabela `quote_receipts` deve possuir RLS ativo restringindo leituras e escritas via `auth.uid() = user_id`.
4.  **Princípio IV: Tipagem TypeScript Estrita e Nomenclatura em Inglês**:
    *   *Check*: Proibido o uso de `any`. Todos os tipos devem ser declarados com interfaces ou tipos inferidos do Zod. O código de serviços e actions de recibos deve ser escrito em Inglês.
5.  **Princípio V: Tratamento de Erros e Mobile-First**:
    *   *Check*: Validações iniciais nas Server Actions com early returns. Estilização do recibo e gráficos mobile-first usando Grid e Flexbox nativos.

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
│   ├── admin/
│   │   └── page.tsx         # [MODIFY] Dashboard do super-admin da plataforma (inalterado)
│   ├── quotes/
│   │   ├── [id]/
│   │   │   ├── receipt/
│   │   │   │   ├── page.tsx  # [NEW] Visualização e impressão do recibo
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx # [NEW] Formulário de criação/edição do recibo
│   │   │   └── page.tsx      # [MODIFY] Exibir botão de recibo se status === 'completed'
│   │   ├── actions.ts        # [MODIFY] Atualizar saveQuote, updateQuoteStatus e deletar se draft
│   │   ├── columns.tsx      # [MODIFY] Atualizar badges de status e ações do rascunho
│   │   ├── quotes-list.tsx  # [MODIFY] Filtros de situação por tab ou select
│   │   └── schemas.ts        # [MODIFY] Novos enums de status e schemas do recibo
│   ├── page.tsx             # [MODIFY] Dashboard do Prestador ( Pizza, Barras e Linhas Recharts)
│   └── components/
│       ├── quotes-chart.tsx # [MODIFY] Atualizado para novos status e lógica de contagem
│       ├── status-pie-chart.tsx # [NEW] Gráfico de pizza de distribuição por status
│       └── revenue-bar-chart.tsx # [NEW] Gráfico de barras de faturamento por mês
components/
├── quote-status-badge.tsx   # [MODIFY] Mapear novos badges (pending, approved, rejected, cancelled, completed)
lib/
├── services/
│   ├── receipt-service.ts   # [NEW] Serviço de banco de dados para recibos
│   └── quote-service.ts     # [NEW/MODIFY] Lógica de negócio de transições de status
supabase/
└── migrations/
    └── 20260603000000_budget_lifecycle_improvements.sql # [NEW] Migration de alteração do schema e RLS
```

**Structure Decision**: A estrutura foi planejada seguindo o padrão de rotas do Next.js App Router em `/app/app/quotes` e regras de negócio isoladas em `lib/services/`.

## Complexity Tracking

*Não há violações identificadas dos princípios da constituição.*
