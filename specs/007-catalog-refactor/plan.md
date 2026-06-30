# Implementation Plan: Catalog Refactoring & Improvements

**Branch**: `007-catalog-refactor` | **Date**: 2026-06-30 | **Spec**: [spec.md](file:///c:/DEV/orcafacil/specs/007-catalog-refactor/spec.md)

**Input**: Feature specification from `/specs/007-catalog-refactor/spec.md`

---

## Summary

O objetivo desta feature é refatorar o Catálogo de Itens (produtos e serviços) na rota `/app/catalog`. O projeto focará na melhoria da experiência mobile-first (PWA), alinhamento com a constituição do projeto (SRP & Services Pattern), e no aprimoramento estético da listagem e filtragem de acordo com o design system do Orca Fácil.

Principais entregas:
1. **Isolamento de Banco**: Migrar todas as queries e mutações diretas do Supabase para um serviço isolado (`CatalogService`).
2. **Nova UX de Detalhes**: Criar um sheet de visualização em modo leitura intermediário para evitar modificações/exclusões acidentais.
3. **Refatoração da Lista**: Substituir o grid de cartões por uma listagem de linhas simples e limpa, com cabeçalho fixo no topo.
4. **Filtros Avançados**: Implementar um filtro lateral (desktop) / w-full (mobile) usando URL params e chips removíveis ativos.
5. **Ajustes de PWA**: Forçar teclado numérico para preço em dispositivos móveis, validar obrigatoriedade da unidade de medida, sanitizar inputs no frontend (Zod), e fixar botão de cadastro no rodapé no mobile (no lugar da barra de navegação inferior).

---

## Technical Context

- **Language/Version**: TypeScript / Node.js 20+
- **Primary Dependencies**: React 19, Next.js 16 (App Router), Tailwind CSS v4, `@base-ui-components/react` (Base UI), `sonner` (toasts), `lucide-react` (ícones), `zod` e `react-hook-form`
- **Storage**: Supabase PostgreSQL (tabela `catalog_items`)
- **Testing**: Verificação manual e testes de fluxo baseados na UI
- **Target Platform**: Desktop (Web) e PWA Mobile (iOS/Android)
- **Project Type**: Web Application
- **Performance Goals**: Carregamento instantâneo da listagem, transição suave de sheets (< 100ms)
- **Constraints**: Sem acoplamento de lógica de banco no componente visual; responsividade até 320px sem quebras de layout
- **Scale/Scope**: Mapeado apenas para a rota `/app/catalog` e seus subcomponentes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Status | Implementation Strategy |
|---|---|---|
| **I. SRP & Services Pattern** | Pass | Criar a classe `CatalogService` em `lib/services/catalog-service.ts` e usá-la em Server Components e Server Actions. |
| **II. Server Components & Actions** | Pass | Manter `page.tsx` como Server Component e as ações mutativas dentro de `actions.ts` usando `'use server'`. |
| **III. Multi-Tenant Isolation** | Pass | Filtrar todas as consultas e mutations no `CatalogService` com o `user.id` do usuário autenticado no Supabase. |
| **IV. TS Extrito & Naming** | Pass | Zero uso de `any`, tipagens explícitas das interfaces de propriedades, nomes em inglês iniciando com verbos de ação. |
| **V. Error Handling & Mobile-First** | Pass | Uso de *Early Returns* nas funções, blocos `try/catch` centralizados nas Server Actions, layouts usando flexbox/grid nativos do Tailwind v4 com breakpoints mobile-first. |
| **Higiene de Código** | Pass | Extração de strings mágicas para constantes. Remoção de componentes inutilizados como `catalog-card.tsx`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/007-catalog-refactor/
├── plan.md              # Este arquivo de planejamento
├── research.md          # Pesquisa técnica e alternativas estruturais (Phase 0)
├── data-model.md        # Especificação lógica do banco e do validador Zod (Phase 1)
├── quickstart.md        # Instruções de setup e manual de teste (Phase 1)
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code Modifications

```text
app/
└── app/
    └── catalog/
        ├── page.tsx                             # [MODIFY] Consome o CatalogService para buscar dados e estruturar o layout sticky
        ├── actions.ts                           # [MODIFY] Adapta para chamar o CatalogService e adiciona sanitizações
        ├── catalog-list.tsx                     # [MODIFY] Controla estados dos painéis de visualização/edição, renderiza linhas simples, busca e chips
        ├── catalog-form.tsx                     # [MODIFY] Campo de unidade obrigatório, inputMode="decimal" para o preço, sem botão trigger inline
        ├── components/
        │   ├── catalog-view-sheet.tsx           # [NEW] Exibe detalhes em modo leitura com menu de ações (desktop vs dropdown mobile)
        │   ├── catalog-filter-sheet.tsx         # [NEW] Filtro avançado (checkboxes de tipo, radio buttons de ordenação)
        │   ├── catalog-card.tsx                 # [DELETE] Removido por não ser mais necessário
        │   └── catalog-filter.tsx               # [DELETE] Substituído pelo catalog-filter-sheet.tsx
        └── delete-item-dialog.tsx               # [MODIFY] Adaptado para ser invocado pelo catalog-view-sheet.tsx

lib/
└── services/
    └── catalog-service.ts                       # [NEW] Camada isolada de interação com o Supabase
```

---

## Proposed Changes

### Layer 1: Services (Data Isolation)
*   **[NEW]** [catalog-service.ts](file:///c:/DEV/orcafacil/lib/services/catalog-service.ts): Classe utilitária estática contendo as funções `getCatalogItemsPaged`, `saveCatalogItem` e `deleteCatalogItem`.
*   **[MODIFY]** [actions.ts](file:///c:/DEV/orcafacil/app/app/catalog/actions.ts): Refatoração para sanitizar inputs no esquema Zod e repassar a chamada para `CatalogService`.

### Layer 2: Components (Visual and State Redesign)
*   **[NEW]** [catalog-view-sheet.tsx](file:///c:/DEV/orcafacil/app/app/catalog/components/catalog-view-sheet.tsx): Componente que implementa o sheet de visualização em leitura com botões/dropdown de ações.
*   **[NEW]** [catalog-filter-sheet.tsx](file:///c:/DEV/orcafacil/app/app/catalog/components/catalog-filter-sheet.tsx): Componente de filtros contendo seleções de tipo e ordenação.
*   **[DELETE]** [catalog-card.tsx](file:///c:/DEV/orcafacil/app/app/catalog/components/catalog-card.tsx) e [catalog-filter.tsx](file:///c:/DEV/orcafacil/app/app/catalog/components/catalog-filter.tsx): Removidos para despoluir a pasta do catálogo.
*   **[MODIFY]** [catalog-form.tsx](file:///c:/DEV/orcafacil/app/app/catalog/catalog-form.tsx): Adicionado `inputMode="decimal"` no input de preço e tornada a unidade de medida obrigatória.
*   **[MODIFY]** [catalog-list.tsx](file:///c:/DEV/orcafacil/app/app/catalog/catalog-list.tsx): Refatorado para exibir o novo layout de listagem simples com chips de filtros e coordenar os estados de visualização, formulário e deleção.
*   **[MODIFY]** [page.tsx](file:///c:/DEV/orcafacil/app/app/catalog/page.tsx): Removido o import de abas antigas de filtro, configurado para consumir o `CatalogService` e implementado o header fixo no topo.

---

## Verification Plan

### Manual Verification
1. **Teclado Decimal**: Abrir formulário no mobile (Chrome DevTools Mobile Mode) e certificar-se de que o teclado invocado para "Valor Unitário" é estritamente decimal.
2. **Obrigatoriedade e Sanitização**: Tentar salvar sem unidade de medida; salvar contendo códigos HTML no nome e descrição, e constatar que a validação bloqueia ou a sanitização os remove.
3. **Prevenção de Empilhamento**: Clicar em um item da lista -> Abre visualização -> Clicar em "Editar" -> O sheet de visualização fecha e o de formulário abre na mesma posição sem sobrepor.
4. **Filtros e Chips**: Testar a ativação dos filtros de tipo e ordenação, observar a URL mudar e os chips aparecerem. Clicar no `×` de um chip ou em `[ Limpar filtros ]` para ver a lista recarregar com os parâmetros atualizados instantaneamente.
5. **Pill Toasts**: Salvar, editar ou excluir um item e verificar a animação e o posicionamento da pill toast na parte inferior central da tela.
