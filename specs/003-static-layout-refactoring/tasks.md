# Tasks: Componentes Globais Estáticos e Refatoração de Layout

**Input**: Design documents from `/specs/003-static-layout-refactoring/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/layout.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic font structure

- [x] T001 Configure global Sora font integration in `app/layout.tsx`
- [x] T002 [P] Register Sora as the main sans font variable `--font-sans` in `app/globals.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core variables configuration that MUST be complete before user stories can be implemented

- [x] T003 Configure semantic color variables in `:root` and `.dark` blocks in `app/globals.css` mapping brand colors for shadcn/ui primitives

---

## Phase 3: User Story 1 - Header Global Estético e Alinhado com a Marca (Priority: P1) 🎯 MVP

**Goal**: Header global limpo e alinhado usando Sora, exibindo Breadcrumb, nome da empresa e botões utilitários de configurações, toggle de tema e notificações à direita (sem avatar).

**Independent Test**: Acessar o painel no desktop e validar que o header exibe breadcrumb à esquerda, nome da empresa e ações utilitárias à direita, e sem o avatar do usuário.

### Implementation for User Story 1

- [x] T004 [US1] Adjust layout, margins, and padding of the global header container in `app/app/layout.tsx`
- [x] T005 [US1] Add placeholder icons/buttons for settings and theme toggle actions in `app/app/layout.tsx`

---

## Phase 4: User Story 2 - Sidebar de Navegação com Perfil e Avatar (Priority: P1)

**Goal**: Sidebar lateral desktop/tablet com logo, links principais e rodapé contendo o avatar e perfil do usuário logado.

**Independent Test**: Passar o mouse nos itens inativos da sidebar (hover) e validar se o active/hover se comportam conforme o design system. Clicar nas reticências no rodapé para testar o dropdown.

### Implementation for User Story 2

- [x] T006 [P] [US2] Refactor typography, background, border, active state, and hover state transitions of the navigation menu items in `components/app-sidebar.tsx`
- [x] T007 [US2] Structure and style the `SidebarFooter` to include the user avatar (with initials fallback), name, email, and dropdown menu trigger in `components/app-sidebar.tsx`

---

## Phase 5: User Story 3 - Tab Bar de Navegação Inferior para Dispositivos Móveis (Priority: P1)

**Goal**: Ocultar a sidebar e exibir a Tab Bar fixa na base da tela com 4 atalhos em dispositivos móveis (< 768px).

**Independent Test**: Redimensionar a tela para < 768px de largura e verificar que a sidebar e o SidebarTrigger somem, e a Tab Bar mobile inferior surge contendo Dashboard, Orçamentos, Recibos e Conta.

### Implementation for User Story 3

- [x] T008 [P] [US3] Create the custom mobile tab bar component `<MobileTabBar />` in `components/mobile-tab-bar.tsx` with links for Dashboard, Quotes, Receipts, and Account (Avatar)
- [x] T009 [US3] Modify the main app layout in `app/app/layout.tsx` to hide sidebar components and render `<MobileTabBar />` fixed at the bottom on screen widths < 768px

---

## Phase 6: User Story 4 - Adaptação Temática e Modo Escuro no Layout Estrutural (Priority: P2)

**Goal**: Layout global (header, sidebar, mobile tab bar) adaptável aos temas claro e escuro.

**Independent Test**: Clicar no toggle de tema e verificar as cores do layout no modo escuro.

### Implementation for User Story 4

- [x] T010 [US4] Implement theme toggle trigger logic using next-themes inside the header in `app/app/layout.tsx`
- [x] T011 [US4] Refine dark mode style properties and class conditions for active/hover states in `components/app-sidebar.tsx` and `components/mobile-tab-bar.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final formatting, lint checks, and quickstart validation

- [x] T012 Run linting tools validation via project command line `npm run lint`
- [x] T013 [P] Verify layout and compilation through build execution `npm run build`
- [x] T014 Run validation checklist according to specs/003-static-layout-refactoring/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Depends on completion of User Story 1, 2, and 3 implementation to apply dark theme styles correctly.

### Parallel Opportunities

- Setup tasks T001 and T002 can run in parallel.
- Once Phase 2 completes, implementation of User Story 1 (T004, T005), User Story 2 (T006, T007) and User Story 3 (T008, T009) can run in parallel as they target separate files:
  - US1: `app/app/layout.tsx` (header)
  - US2: `components/app-sidebar.tsx`
  - US3: `components/mobile-tab-bar.tsx`

---

## Implementation Strategy

### MVP First (User Story 1, 2, 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Header), Phase 4: User Story 2 (Sidebar), and Phase 5: User Story 3 (Mobile Tab Bar)
4. **STOP and VALIDATE**: Verify responsiveness and core layout features.
5. Add User Story 4: Dark Theme support.
