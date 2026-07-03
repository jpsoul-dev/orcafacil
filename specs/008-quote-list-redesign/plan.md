# Implementation Plan: Redesign Quote List

**Branch**: `008-quote-list-redesign` | **Date**: 2026-07-03 | **Spec**: [spec.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/spec.md)

**Input**: Feature specification from `/specs/008-quote-list-redesign/spec.md`

## Summary

Refatorar a tela de listagem de orçamentos do OrçaFácil para adotar uma interface em lista de alta densidade e minimalista, inspirada no design da tela de Catálogo. O projeto substitui o layout atual de cartões (grid de cards) por linhas simples e compactas com divisores sutis. Ele consolida os controles dispersos de busca, data, status e ordenação em uma barra de busca otimizada (com debounce de 300ms) compartilhada com um botão de Filtros. O botão abre um painel Sheet lateral (desktop) ou Modal Fullscreen (mobile), que abriga a seleção de múltiplos status (via checkboxes inline), filtro de data e ordenação. No mobile, o seletor de status abre um Drawer inferior, o título vai para o header do app, e o botão de criar orçamento vira um botão de ação flutuante na parte inferior. O carregamento de dados será paginado de forma acumulada com um botão "Carregar mais".

## Technical Context

**Language/Version**: TypeScript, React 19, Next.js 16 (App Router)

**Primary Dependencies**: Tailwind CSS v4, Lucide React, Zod, React Hook Form, `@base-ui-components/react` (Base UI components para Sheet e Drawer)

**Storage**: Supabase PostgreSQL (Tabela `quotes`, View `vw_quotes`, Tabela `customers`)

**Testing**: Playwright (testes de fluxo e responsividade)

**Target Platform**: Web Browser (Desktop e Mobile PWA)

**Project Type**: Full-stack Next.js Web Application

**Performance Goals**: FCP < 1.0s, transição de abertura do painel de filtros < 100ms, debounce de busca de 300ms.

**Constraints**:
- Sem suporte offline: exige conexão ativa de rede para buscar dados atualizados (exibindo tela de aviso de offline em caso de desconexão).
- Paginação acumulativa utilizando botão "Carregar mais" na listagem.
- Uso estrito dos tokens de cores semânticas de status do Design System (`--ds-color-status-*` para fg e bg).

**Scale/Scope**: Módulo de listagem de orçamentos no app logado (`/app/quotes`), afetando a página e seus componentes secundários.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (SRP & Services Pattern)**: A lógica de banco de dados e filtros deve ser extraída de `app/app/quotes/page.tsx` para funções dedicadas em `lib/services/quote-service.ts`.
- **Princípio II (Server Components por Padrão)**: A página principal em `page.tsx` é um Server Component que passa as propriedades para o Client Component `<QuotesList>`. O estado de filtros e interações com a UI fica empurrado para os nós filhos interativos.
- **Princípio III (Isolamento Multi-Tenant via RLS)**: O serviço em `lib/services/quote-service.ts` deve usar o cliente do Supabase e garantir o filtro pelo `user_id` (que é resolvido via token de autenticação no RLS do Supabase).
- **Princípio IV (TS Estrito e Nomenclatura em Inglês)**: Proibido o uso de `any`. Toda a lógica, tipos e variáveis devem ser nomeados em inglês.
- **Princípio V (Mobile-First)**: O CSS do Tailwind deve ser escrito mobile-first (por exemplo, display vertical por padrão e expandindo para horizontal no desktop via breakpoints).

## Project Structure

### Documentation (this feature)

```text
specs/008-quote-list-redesign/
├── plan.md              # Este arquivo de planejamento
├── research.md          # Fase 0 output: Decisões técnicas e PWA
├── data-model.md        # Phase 1 output: Estruturas de dados e filtros
├── quickstart.md        # Phase 1 output: Guia rápido de uso/validação
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code (repository root)

```text
app/
└── app/
    └── quotes/
        ├── page.tsx               # Server Component (Orquestra chamadas e serviços)
        ├── quotes-list.tsx        # Client Component (Layout da lista, busca e controle de filtros)
        ├── actions.ts             # Server Actions do módulo de orçamentos
        └── components/
            ├── date-range-picker.tsx # Componente de seleção de data
            ├── filter-panel.tsx   # [NEW] Painel de filtros unificado (Sheet / Drawer)
            ├── quote-item.tsx     # [NEW] Item compacto da lista (ex-QuoteCard)
            └── skeleton-loader.tsx # [NEW] Skeleton loader para a listagem
lib/
└── services/
    └── quote-service.ts           # Camada de serviços (Queries Supabase e tratamento de lógica)
```

**Structure Decision**: Refatoração do fluxo de renderização e modularização de componentes dentro de `app/app/quotes/` e `lib/services/`.

## Complexity Tracking

*Nenhuma violação identificada no Constitution Check.*
