# Tasks: Catálogo de Produtos e Serviços e Identidade Visual

**Input**: Design documents from `/specs/004-catalog-and-branding/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/layout.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Assets setup and favicon integration

- [x] T001 Copiar as imagens oficiais SVG de `c:\DEV\orcafacil\.DOCS\SVG\` para a pasta `c:\DEV\orcafacil\public/` renomeando-as conforme o plano de implementação
- [x] T002 [P] Atualizar a referência de favicon no objeto `metadata` de `c:\DEV\orcafacil\app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema and action validation configurations

- [x] T003 Atualizar o Zod Schema de validação e payload do servidor no arquivo `c:\DEV\orcafacil\app\app\catalog\actions.ts` para suportar `unit_measure`

---

## Phase 3: User Story 1 - Identidade Visual de Marca Oficial (Priority: P1) 🎯 MVP

**Goal**: Exibir os logotipos oficiais (horizontal e símbolo compacto) na Sidebar de navegação nos dois temas da aplicação.

**Independent Test**: Acessar o painel logado no desktop e no tablet e verificar se a logo oficial horizontal e a logo símbolo compacto aparecem nos dois temas (claro/escuro) sem pulos de layout ou piscar.

### Implementation for User Story 1

- [x] T004 [US1] Implementar no cabeçalho da Sidebar em `c:\DEV\orcafacil\components\app-sidebar.tsx` a exibição dinâmica dos logotipos correspondentes aos modos expandido e colapsado da barra de navegação

---

## Phase 4: User Story 2 - Listagem Dinâmica e Filtros do Catálogo (Priority: P1)

**Goal**: Criar listagem adaptativa de catálogo no Desktop (tabela) e no Mobile (cards), incluindo filtros de tipo e busca por texto em tempo real.

**Independent Test**: Acessar `/app/catalog`, testar se a visualização muda automaticamente para cards quando redimensionada para móvel (< 768px). Testar a busca e filtros por categoria.

### Implementation for User Story 2

- [x] T005 [US2] Ajustar as definições de colunas e estilização de badges de tipo da tabela de catálogo em `c:\DEV\orcafacil\app\app\catalog\columns.tsx`
- [x] T006 [US2] Implementar na página do catálogo em `c:\DEV\orcafacil\app\app\catalog\page.tsx` a renderização responsiva chaveando entre tabela desktop e lista de cards interativos para telas móveis

---

## Phase 5: User Story 3 - Cadastro e Edição de Itens com Unidade de Medida (Priority: P1)

**Goal**: Coletar e validar a unidade de medida no formulário, exibindo feedback de erros e salvando os dados de forma persistente.

**Independent Test**: Preencher o formulário definindo preço positivo e unidade, salvar e verificar a persistência. Tentar salvar preço menor ou igual a zero e conferir os erros de validação visual.

### Implementation for User Story 3

- [x] T007 [US3] Inserir no formulário em `c:\DEV\orcafacil\app\app\catalog\catalog-form.tsx` o campo de input para Unidade de Medida e ajustar o design visual de todo o modal (DialogHeader, DialogContent, seletor de tipo, inputs e rodapé) utilizando estritamente as classes de cores semânticas do Design System (`bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`), garantindo suporte perfeito e contraste a ambos os temas e removendo qualquer cor estática.

---

## Phase 6: User Story 4 - Remoção Segura de Itens (Priority: P2)

**Goal**: Implementar a ação de exclusão protegida por diálogo Alert Dialog.

**Independent Test**: Clicar na lixeira de um item da listagem, testar que o cancelamento mantém o item, e a confirmação remove o item do catálogo imediatamente com toast de sucesso.

### Implementation for User Story 4

- [x] T008 [US4] Implementar a ação de deleção e confirmação segura em `c:\DEV\orcafacil\app\app\catalog\delete-item-dialog.tsx` garantindo suporte nativo a ambos os temas (claro e escuro) por meio de classes semânticas do Design System.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final formatting, validation checklists, and compilation check

- [x] T009 Executar o linter nos arquivos modificados e criados no repositório `c:\DEV\orcafacil\`
- [x] T010 [P] Validar a compilação geral da aplicação executando `npm run build` na raiz do projeto
- [x] T011 Rodar o roteiro de testes e checklist de conformidade contido in `c:\DEV\orcafacil\specs\004-catalog-and-branding\quickstart.md` incluindo verificação visual do modo claro e do modo escuro.

---

## Phase 8: Mobile Navigation Overhaul (Mais Menu)

**Purpose**: Implement the 'Mais' menu drawer in mobile layout for complete navigation accessibility

- [x] T012 [US5] Implementar o botão "Mais" (Menu) e a gaveta inferior (Sheet) no arquivo `c:\DEV\orcafacil\components\mobile-tab-bar.tsx` integrando a navegação para Clientes, Catálogo, Conta e ação de Logout
- [x] T013 Executar o linter no arquivo modificado (`components/mobile-tab-bar.tsx`)
- [x] T014 Validar a compilação geral da aplicação executando `npm run build` na raiz do projeto

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - pode iniciar imediatamente
- **Foundational (Phase 2)**: Depende do Setup completo - BLOQUEIA as histórias de catálogo
- **User Stories (Phase 3+)**: Dependem de Setup e Foundational completos
  - As User Stories 1, 2 e 3 podem rodar em paralelo ou de forma sequencial (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depende de todas as User Stories anteriores estarem implementadas
- **Mobile Navigation Overhaul (Phase 8)**: Depende de todas as Fases anteriores estarem implementadas

### User Story Dependencies

- **User Story 1 (P1)**: Independente de outras histórias.
- **User Story 2 (P1)**: Depende de Foundational (T003) e Setup (T001).
- **User Story 3 (P1)**: Depende de Foundational (T003).
- **User Story 4 (P2)**: Depende de User Story 2 (listagem responsiva para gatilho de deleção).
- **User Story 5 (P2)**: Depende das demais histórias de catálogo de produtos e serviços estarem implementadas para permitir testes em mobile.

### Parallel Opportunities

- T001 e T002 podem rodar em paralelo.
- Uma vez completada a Fase 2, a história visual US1 (T004) pode rodar em paralelo com a história funcional de catálogo US2/US3/US4.

---

## Implementation Strategy

### MVP First (User Story 1, 2 e 3)

1. Completar Fase 1: Setup
2. Completar Fase 2: Foundational (T003)
3. Implementar Fase 3: User Story 1 (Logos), Fase 4: User Story 2 (Listagem/Cards) e Fase 5: User Story 3 (Cadastro/Edição/Métrica)
4. **STOP and VALIDATE**: Testar e certificar que a listagem responsiva e cadastro/edição persistem no Supabase.
5. Implementar Fase 6: User Story 4 (Exclusão segura)
6. Finalizar Fase 7: Polish
7. Implementar Fase 8: Mobile Navigation Overhaul (Mais Menu) e realizar os testes finais de compilação e qualidade.
