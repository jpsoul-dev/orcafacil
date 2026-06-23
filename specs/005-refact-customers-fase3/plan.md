# Implementation Plan: Refatoração do Módulo de Clientes (Fase 3)

**Branch**: `005-refact-customers-fase3` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-refact-customers-fase3/spec.md`

## Summary

Refatorar o módulo de Clientes (`app/app/customers` e sub-rotas) para alinhar visualmente com o Design System da OrçaFácil (tipografia Sora, cores da paleta, tratamento de contrastes, modo escuro, etc.) e melhorar a usabilidade responsiva (conversão de tabela desktop para cards táteis no mobile). Em conformidade com a Constituição do projeto, a lógica de persistência e validação RLS del Supabase será centralizada em `lib/services/customer-service.ts` (Princípio I - SRP & Services Pattern).

## Technical Context

**Language/Version**: Next.js 16 (App Router), React 19, TypeScript 5+

**Primary Dependencies**: Tailwind CSS v4, Lucide React, Zod, React Hook Form, @hookform/resolvers, shadcn/ui (Alert Dialog, Form, Badge, Tabs, Dialog)

**Storage**: Supabase (PostgreSQL) com políticas Row Level Security (RLS) habilitadas

**Testing**: Validação visual de responsividade nos breakpoints (`< 768px` para mobile) e testes manuais de validação de formulário (Zod) e fluxos de exclusão

**Target Platform**: Navegadores Web Desktop, Tablet e Mobile-First (PWA)

**Project Type**: Web Application (Next.js 16 App Router)

**Performance Goals**: Tempo de carregamento/renderização menor que 200ms para alternância temática e feedbacks visuais em menos de 120ms para micro-animações/hovers

**Constraints**: conformidade WCAG AA (contraste >= 4.5:1), área tátil mínima de 44x44px em botões e links de toque em dispositivos móveis

**Scale/Scope**: Refatoração completa das rotas `app/app/customers/*` e criação do arquivo de serviço `lib/services/customer-service.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Separação Estrita de Lógicas (SRP & Services Pattern)**: **PASS**. Vamos criar `lib/services/customer-service.ts` que centraliza as chamadas de banco do Supabase de clientes. As Server Actions em `app/app/customers/actions.ts` apenas orquestrarão o fluxo e delegarão as operações para o serviço.
- **Componentes de Servidor por Padrão**: **PASS**. `page.tsx` continuará sendo Server Component. Nós separaremos os elementos interativos como `customer-form.tsx` e `delete-customer-dialog.tsx` como Client Components ("use client").
- **Isolamento Multi-tenant via RLS**: **PASS**. Toda consulta ou modificação no banco de dados incluirá a cláusula `eq('user_id', user.id)` baseada no usuário autenticado via auth.uid() em subquery.
- **Tipagem TypeScript Estrita**: **PASS**. Uso proibido do tipo `any`. Tipagem adequada baseada no schema do banco de dados e Zod schemas.
- **Tratamento Centralizado de Erros e Design Responsivo**: **PASS**. As validações são feitas na entrada via Zod. Layout mobile-first adaptará a tabela desktop em cards verticais ergonômicos no mobile (`< 768px`).
- **Eliminação de Magic Values**: **PASS**. Mapeamento de status e tipos de documento usando constantes/enums específicos do TypeScript.

## Project Structure

### Documentation (this feature)

```text
specs/005-refact-customers-fase3/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── checklists/
    └── requirements.md  # Specification checklist validated
```

### Source Code (repository root)

```text
app/
└── app/
    └── customers/
        ├── [id]/
        │   ├── customer-quotes-client.tsx   # Visualização e abas com histórico
        │   └── page.tsx                      # Perfil com abas (Server Component)
        ├── components/
        │   ├── customer-card.tsx            # [NEW] Card ergonômico para mobile (< 768px)
        │   └── delete-customer-dialog.tsx   # [NEW] Caixa de confirmação de exclusão protegida
        ├── actions.ts                        # Server Actions integradas com o serviço
        ├── columns.tsx                      # Definição das colunas da tabela desktop
        ├── customer-form.tsx                # Modal de formulário com React Hook Form e Zod
        └── page.tsx                          # Página de listagem com DataTable e Cards

lib/
└── services/
    └── customer-service.ts                  # [NEW] Camada de serviços para CRUD e regras de clientes
```

**Structure Decision**: A aplicação segue a estrutura padrão do Next.js 16 App Router com as rotas autenticadas sob a pasta `app/app/`. As lógicas de dados estarão concentradas em `lib/services/` e a interface de UI em componentes específicos e modais dedicados.

## Complexity Tracking

*Nenhuma violação aos princípios constitucionais do projeto foi realizada. O plano está em total conformidade.*
