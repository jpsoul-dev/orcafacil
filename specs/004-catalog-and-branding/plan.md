# Implementation Plan: Catálogo de Produtos e Serviços e Identidade Visual

**Branch**: `004-catalog-and-branding` | **Date**: 2026-06-22 | **Spec**: [spec.md](file:///c:/DEV/orcafacil/specs/004-catalog-and-branding/spec.md)

**Input**: Feature specification from `/specs/004-catalog-and-branding/spec.md`

## Summary

Esta fase de implementação integra os logotipos e favicons oficiais da marca OrçaFácil, além de refatorar por completo o módulo de Catálogo de Produtos e Serviços (`app/catalog`). O foco está em aprimorar a usabilidade responsiva (substituindo a listagem linear por cards interativos em celulares), capturar a Unidade de Medida no formulário de cadastro, validar rigidamente os dados de entrada usando Zod e React Hook Form, e fornecer feedbacks visuais adequados (skeletons, loadings nos botões e toasts).

---

## Technical Context

*   **Language/Version**: TypeScript 5.x, React 19.x, Next.js 16.x (App Router)
*   **Primary Dependencies**: Tailwind CSS v4, shadcn/ui, `react-hook-form`, `zod`, `lucide-react`, `next-themes`, `@hookform/resolvers`
*   **Storage**: Supabase Client (persiste na tabela `catalog_items` existente no banco de dados)
*   **Testing**: Compilação de produção Next.js (`npm run build`), verificação do linter específico (`npx eslint`) e validação manual responsiva no navegador
*   **Target Platform**: Web browsers modernos, PWA móvel e desktop
*   **Project Type**: Web Application Front-end (Next.js)
*   **Performance Goals**: Tempo de resposta de busca e filtros abaixo de 300ms, toasts de confirmação de mutação exibidos em menos de 200ms
*   **Constraints**:
    *   Contraste visual de textos e badges em conformidade com o nível WCAG AA (taxa mínima de 4.5:1)
    *   Tabela com RLS habilitada e políticas estritas de isolamento por usuário autenticado
    *   Abordagem Mobile-First de layout para a listagem
    *   Proibição estrita de cores de fundo e borda estáticas e hardcoded (ex: `bg-white`, `border-slate-200`, `bg-[#F8FAFC]`) nos componentes visuais (`catalog-form`, `delete-item-dialog`, etc.). Todo o layout deve usar tokens semânticos nativos baseados em variáveis do CSS (`bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`), garantindo suporte perfeito e contraste adequado a ambos os temas (claro e escuro).
*   **Scale/Scope**: ~1 página (`app/catalog`), ~1 formulário de cadastro/edição (`catalog-form`), 4 arquivos de logos SVG copiados estaticamente para `public/`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Princípio I (SRP & Services Pattern)**: Passa. A lógica de persistência e deleção de dados é isolada em Server Actions de `actions.ts`. O componente de visualização apenas consome e renderiza os estados e ações correspondentes.
*   **Princípio II (Server Components & Server Actions)**: Passa. O layout e a página principal (`page.tsx`) permanecem Server Components. Formulários e modais interativos específicos usam `"use client"` de forma isolada.
*   **Princípio III (Isolamento Multi-Tenant Rigoroso)**: Passa. Nenhuma nova tabela ou view é criada. As mutações e consultas do Supabase sempre utilizam filtros rigorosos confrontando o ID do usuário autenticado no servidor.
*   **Princípio IV (TypeScript Estrito & Nomenclatura em Inglês)**: Passa. Nenhuma tipagem com `any` é permitida. As propriedades e payloads são estritamente descritos via TypeScript e validados dinamicamente por Zod. Toda a nomenclatura de pastas, arquivos e termos segue o inglês.
*   **Princípio V (Mobile-First)**: Passa. A visualização de catálogo substitui de forma dinâmica a tabela linear por cards táteis empilhados em telas móveis (`< 768px`), garantindo que não haja scrolls laterais.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-catalog-and-branding/
├── spec.md              # Feature Specification
├── plan.md              # This file (Implementation Plan)
├── research.md          # Technical Decisions & Brand Assets Mapping (Phase 0)
├── data-model.md        # DB Entity & Zod Form Schemas (Phase 1)
├── quickstart.md        # Execution & Verification manual (Phase 1)
├── checklists/
│   └── requirements.md  # Spec quality validation checklist (Phase 1)
└── contracts/
    └── layout.md        # Sidebar & MobileTabBar branding contracts (Phase 1)
```

### Source Code

```text
app/
├── app/
│   └── catalog/
│       ├── actions.ts             # Regras de persistência e deleção (Zod + Supabase)
│       ├── catalog-form.tsx       # Formulário com suporte a unit_measure
│       ├── columns.tsx            # Colunas da tabela Desktop e Badges de tipo
│       ├── delete-item-dialog.tsx # Modal preventivo de exclusão
│       ├── page.tsx               # Interface responsiva Desktop Tabela / Mobile Cards
│       └── components/
│           └── catalog-filter.tsx # Abas de filtros do catálogo
components/
├── app-sidebar.tsx                # Sidebar adaptada com as novas logos oficiais
public/
├── logo-horizontal-claro.svg      # Logo horizontal oficial para fundo claro
├── logo-horizontal-escuro.svg      # Logo horizontal oficial para fundo escuro
├── logo-simbolo-claro.svg         # Logo símbolo oficial para fundo claro
├── logo-simbolo-escuro.svg         # Logo símbolo oficial para fundo escuro
└── favicon.svg                    # Favicon oficial atualizado
```

**Structure Decision**: A aplicação segue a estrutura padrão de projeto Next.js (Single project), mantendo os componentes locais de catálogo no próprio diretório do catálogo e importando as novas imagens oficiais do diretório `public/`.

---

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição do OrçaFácil identificada.*
