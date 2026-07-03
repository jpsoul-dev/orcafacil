# Tasks: Redesign Quote List

**Input**: Design documents from `/specs/008-quote-list-redesign/`

**Prerequisites**: [plan.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/plan.md) (required), [spec.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/spec.md) (required for user stories), [research.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/research.md), [data-model.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/data-model.md)

**Tests**: A validação será executada de forma manual seguindo o roteiro de testes e o guia rápido descritos em [quickstart.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/quickstart.md).

**Organization**: As tarefas estão agrupadas por User Story para permitir a implementação independente de cada funcionalidade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (sem dependências de arquivos/tarefas incompletas)
- **[Story]**: História de usuário associada (ex: US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização básica e alinhamento do ambiente local

- [X] T001 Inicializar a branch de desenvolvimento e sincronizar as definições de especificação no projeto

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refatoração da camada de dados e serviços para seguir o princípio constitucional de Separação de Lógicas (SRP)

**⚠️ CRITICAL**: Nenhuma alteração visual de interface de usuário (UI) pode começar antes desta fase ser concluída.

- [X] T002 [P] Criar as funções de serviço `getQuotesList` (com suporte a filtros múltiplos, ordenação, busca por texto e limite de paginação) no arquivo [quote-service.ts](file:///c:/DEV/orcafacil/lib/services/quote-service.ts)
- [X] T003 Refatorar a página [page.tsx](file:///c:/DEV/orcafacil/app/app/quotes/page.tsx) para consumir o serviço [quote-service.ts](file:///c:/DEV/orcafacil/lib/services/quote-service.ts) invez de executar queries diretas no banco de dados do Supabase

**Checkpoint**: Foundation ready - A API de dados está preparada para receber os múltiplos filtros e paginação acumulada.

---

## Phase 3: User Story 1 - Desktop Layout Redesign and List View (Priority: P1) 🎯 MVP

**Goal**: Substituição do grid de cards grandes pela tabela/lista densa e compacta com cabeçalho limpo no desktop.

**Independent Test**: Carregar `/app/quotes` no desktop e verificar se a lista de orçamentos exibe linhas simples com divisores, destacando o título e mostrando o código do orçamento, data de criação, cliente e valor total em pesos de fonte adequados, mantendo o status pill em baixo contraste.

- [X] T004 [P] [US1] Criar o componente compacto [quote-item.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-item.tsx) para renderizar a linha de cada orçamento com divisores discretos e alinhamento do design system
- [X] T005 [US1] Modificar o componente principal [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx) para substituir o Grid de cards grandes pelo loop de linhas que renderiza o componente [quote-item.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-item.tsx)
- [X] T006 [US1] Ajustar o layout do cabeçalho da listagem em [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx) para dispor o título "Meus orçamentos", o botão de voltar e o botão de "Criar Orçamento" na mesma linha horizontal no desktop

**Checkpoint**: User Story 1 está pronta e testável no desktop. A listagem passou a ser compacta e alinhada às especificações visuais de alta densidade.

---

## Phase 4: User Story 2 - Real-time Search with Debounce and Active Filter Chips (Priority: P1)

**Goal**: Busca instantânea otimizada com debounce e chips clicáveis de filtros ativos.

**Independent Test**: Digitar na busca e ver a lista filtrar automaticamente após 300ms. Adicionar um filtro na URL e verificar se o chip de filtro correspondente aparece abaixo da busca e se, ao clicar no seu ícone de fechar (x), o filtro é removido.

- [X] T007 [P] [US2] Adicionar controle de debounce de 300ms na entrada de busca de texto no componente [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx)
- [X] T008 [US2] Desenhar os chips de filtros ativos abaixo da barra de busca no componente [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx), permitindo a remoção individual de filtros clicando no fechar (x) e exibindo o botão "Limpar filtros" se houver filtros ativos

**Checkpoint**: User Story 2 está pronta. A busca é dinâmica e o gerenciamento de chips de filtros é interativo.

---

## Phase 5: User Story 3 - Unified Filtering and Sorting Panel (Priority: P1)

**Goal**: Painel lateral (Sheet) unificando filtros de data, ordenação e checkboxes inline de status no desktop.

**Independent Test**: Clicar no botão "Filtros" e verificar se o Sheet lateral do Base UI abre suavemente. Selecionar múltiplos status via checkboxes inline e aplicar a ordenação, verificando se a lista se atualiza de imediato.

- [X] T009 [P] [US3] Criar o componente do painel de filtros [filter-panel.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/filter-panel.tsx) utilizando a estrutura de Sheet da biblioteca `@base-ui/react`
- [X] T010 [US3] Desenhar a interface interna do painel [filter-panel.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/filter-panel.tsx) com checkboxes inline para múltiplos status, filtros de data e seleção de ordenação
- [X] T011 [US3] Conectar o painel de filtros [filter-panel.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/filter-panel.tsx) ao botão "Filtros" e gerenciar o estado e envio de dados para atualização na URL em [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx)

**Checkpoint**: User Story 3 está funcional. O microempreendedor consegue configurar buscas complexas de dados e ordenação de forma fluida no desktop.

---

## Phase 6: User Story 4 - Mobile View Enhancements (Priority: P2)

**Goal**: Experiência móvel nativa (PWA): botão flutuante, filtros em tela cheia, drawer inferior de status e paginação com "Carregar mais".

**Independent Test**: Abrir a listagem em viewport móvel. O título deve sumir da tela principal e o botão criar orçamento virar um botão de ação flutuante. O botão "Filtros" abre o painel em tela cheia e os status abrem em uma gaveta de baixo para cima (Drawer). A paginação funciona por clique no botão "Carregar mais".

- [X] T012 [P] [US4] Ajustar cabeçalho móvel e dispor o botão de criar orçamento como Floating Action Button (FAB) na base direita da viewport no componente [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx)
- [X] T013 [US4] Adaptar o painel em [filter-panel.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/filter-panel.tsx) para abrir em largura total (fullscreen) em telas pequenas
- [X] T014 [US4] Implementar o seletor de status para mobile utilizando o componente Drawer (gaveta de baixo para cima) da biblioteca `@base-ui/react` em [filter-panel.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/filter-panel.tsx)
- [X] T015 [US4] Substituir o componente de paginação clássica em [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx) por um botão acumulativo "Carregar mais" na parte inferior da lista

**Checkpoint**: A listagem está totalmente responsiva e oferece uma experiência indistinguível de um app móvel nativo no celular.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Polimento final de interface, estados de carregamento e validação de tokens

- [X] T016 [P] Criar o componente skeleton [skeleton-loader.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/skeleton-loader.tsx) contendo linhas animadas e adicioná-lo ao arquivo [loading.tsx](file:///c:/DEV/orcafacil/app/app/quotes/loading.tsx)
- [X] T017 Adicionar a tela de estado offline/erro caso o dispositivo perca conexão de rede ativa no componente [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx)
- [X] T018 Executar os testes manuais e o roteiro de validação previstos no guia de início rápido [quickstart.md](file:///c:/DEV/orcafacil/specs/008-quote-list-redesign/quickstart.md) no desktop e em viewports móveis
- [X] T019 Validar que nenhuma regra visual banida (bordas de destaque nas laterais esquerda/direita de badges, degradês decorativos ou sombras pesadas) foi adicionada nos novos componentes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências, inicia o fluxo.
- **Foundational (Phase 2)**: Depende da Setup. BLOCKS todas as User Stories subsequentes (a refatoração do quote-service e page.tsx é necessária para receber os múltiplos filtros e limites de dados).
- **User Stories (Phase 3+)**: Dependem da conclusão da Foundational. Podem ser implementadas em sequência (US1 → US2 → US3 → US4).
- **Polish (Phase 7)**: Executado após todas as histórias estarem concluídas e integradas.

---

## Parallel Opportunities

- As tarefas marcadas com `[P]` em fases diferentes ou na mesma fase podem ser desenvolvidas de forma paralela (ex: criar o `quote-item.tsx` em paralelo à refatoração do `quote-service.ts` no início).
- Developer A pode trabalhar na interface de desktop da lista (`US1` e `US2`), enquanto Developer B cria o painel de filtros com componentes Base UI (`US3` e `US4`).

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Implementar User Story 1 (Linhas de lista compacta e cabeçalho desktop).
3. **Validar MVP**: Verificar se a listagem em formato de lista simples funciona perfeitamente sem quebrar as buscas e filtros legados do sistema.

### Incremental Delivery
1. Implementar busca otimizada com debounce e chips (`US2`).
2. Adicionar o painel de filtros lateral (`US3`).
3. Ajustar responsividade móvel com FAB, fullscreen modal, status drawer e botão "Carregar mais" (`US4`).
4. Aplicar o polimento de design, skeleton e validação final (`Phase 7`).
