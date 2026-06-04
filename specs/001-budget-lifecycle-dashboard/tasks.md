# Tasks: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo, Recibos e UI/UX (Linear Style)

**Input**: Design documents from `specs/001-budget-lifecycle-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: As tarefas são agrupadas por fase e por história de usuário para permitir a implementação e validação independente de cada entrega.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização da infraestrutura do banco de dados e migrações necessárias para a feature.

- [x] T001 Criar o script de migração SQL em `supabase/migrations/20260603000000_budget_lifecycle_improvements.sql` contendo a coluna de motivo de cancelamento, a nova check constraint de status, a recriação da view de expiração e a estrutura da tabela de recibos com RLS.
- [x] T002 Aplicar a migração DDL/DML criada no console SQL do Supabase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura lógica e regras básicas no backend que bloqueiam todas as demais histórias de usuário.

- [x] T003 [P] Atualizar as definições de status e schemas Zod em `app/app/quotes/schemas.ts` com o novo domínio de status (`draft`, `pending`, `approved`, `rejected`, `cancelled`, `completed`) e os novos schemas de cancelamento.
- [x] T004 Atualizar a Server Action `updateQuoteStatus` em `app/app/quotes/actions.ts` para forçar validação de motivo no status `cancelled` e suportar os novos fluxos de transição.
- [x] T005 [P] Atualizar a UI do badge de status em `components/quote-status-badge.tsx` para mapear os novos status com cores condicionais e rótulos traduzidos.

**Checkpoint**: Fundação pronta - a implementação das telas e gráficos pode começar.

---

## Phase 3: User Story 1 - Ciclo de Vida do Orçamento (Priority: P1) 🎯 MVP

**Goal**: Permitir que o prestador de serviços gerencie as transições manuais do orçamento entre rascunho, pendente, aprovado, rejeitado, cancelado (com motivo) e concluído.

**Independent Test**: Criar um orçamento como rascunho, gerar para pendente, aprovar, e depois cancelar informando o motivo.

- [x] T006 [US1] Atualizar a lógica de exclusão física em `app/app/quotes/actions.ts` (na Server Action `deleteQuote`) para permitir a exclusão de registros exclusivamente com status `draft`.
- [x] T007 [US1] Atualizar a lógica do formulário de criação/edição e salvar em `app/app/quotes/actions.ts` para lidar com a transição de `draft` para `pending` ao clicar no botão "Gerar Orçamento".
- [x] T008 [US1] Implementar na página de visualização de detalhes do orçamento `app/app/quotes/[id]/page.tsx` e no visualizador `components/quote-viewer.tsx` as ações manuais permitidas de status e o diálogo popup para digitação de motivo de cancelamento.
- [x] T009 [US1] Adaptar as ações condicionais de listagem e menu de ações em `app/app/quotes/columns.tsx` de acordo com a situação de cada orçamento.
- [x] T022 [US1] Estender o menu de ações em `app/app/quotes/columns.tsx` para incluir opções contextuais completas de imprimir, reabrir (se vencido), excluir (apenas rascunhos) e gerar recibo (apenas concluídos) de acordo com o status atual do orçamento.
- [x] T023 [US1] Otimizar o layout de visualização de orçamento em `components/quote-viewer.tsx` and `/app/quotes/[id]` para impressão nativa (`window.print()`) e exportação de PDF, ocultando cabeçalhos do app, menus de ações e elementos administrativos com regras de CSS de impressão (`print:hidden`, etc.).

**Checkpoint**: Ciclo de vida funcional e testável de ponta a ponta.

---

## Phase 4: User Story 2 - Filtro por Situação na Lista com UX Melhorada (Priority: P1)

**Goal**: Filtrar e buscar orçamentos rapidamente na listagem de acordo com sua situação.

**Independent Test**: Acessar a tela de orçamentos, selecionar o status no filtro (ex: "Cancelado") e verificar se a tabela exibe apenas os registros com esse status de forma instantânea.

- [x] T010 [P] [US2] Implementar filtros de tabulação/segmentação por situação no componente principal de listagem em `app/app/quotes/quotes-list.tsx`.
- [x] T024 [US2] Redesenhar o componente de abas de filtro em `app/app/quotes/quotes-list.tsx` para estilo premium do Linear App, exibindo contadores volumétricos dinâmicos de orçamentos por status (ex: "Pendente (3)") e adicionando scroll horizontal no mobile (`overflow-x-auto flex-nowrap scrollbar-none`), eliminando a quebra de linhas.

**Checkpoint**: Filtragem operacional na tela de listagem com UX premium.

---

## Phase 5: User Story 3 - Painel Administrativo de Métricas (Priority: P2)

**Goal**: Disponibilizar um painel gerencial consolidando novos orçamentos, distribuição de status e faturamento faturado mensal.

**Independent Test**: Abrir a rota de painel gerencial `/app/app` (home do prestador) e verificar o carregamento de 3 gráficos consistentes com dados do banco.

- [x] T011 [P] [US3] Criar o componente de gráfico de pizza/rosca em `app/app/components/status-pie-chart.tsx` para apresentar a quantidade de orçamentos por situação.
- [x] T012 [P] [US3] Criar o componente de gráfico de barras em `app/app/components/revenue-bar-chart.tsx` para apresentar o faturamento mensal faturado consolidado.
- [x] T013 [US3] Ajustar a lógica do gráfico de linha em `app/app/components/quotes-chart.tsx` para agrupar e exibir a contagem de novos orçamentos criados.
- [x] T014 [US3] Atualizar a página inicial `app/app/page.tsx` para realizar a agregação segura das queries de faturamento e status no banco de dados e passar os dados consolidados para os três gráficos.

**Checkpoint**: Painel gerencial analítico funcional com gráficos integrados.

---

## Phase 6: User Story 4 - Geração de Recibo para Orçamentos Finalizados (Priority: P2)

**Goal**: Gerar recibos de quitação e exportar/imprimir em folha limpa sem cabeçalhos do app.

**Independent Test**: Abrir um orçamento com status "Finalizado", clicar em "Gerar Recibo", preencher a descrição dos serviços e testar a impressão nativa/PDF do recibo.

- [x] T015 [P] [US4] Desenvolver a camada de serviços em `lib/services/receipt-service.ts` contendo métodos para buscar, salvar e deletar recibos de quitação.
- [x] T016 [US4] Implementar as Server Actions de recibo em `app/app/quotes/receipt-actions.ts` validando propriedade do tenant do usuário antes do upsert.
- [x] T017 [US4] Desenvolver a página de formulário de emissão/edição de recibo em `app/app/quotes/[id]/receipt/edit/page.tsx` carregando valores padrão e permitindo digitação da descrição do serviço.
- [x] T018 [US4] Desenvolver a página de visualização de recibo in `app/app/quotes/[id]/receipt/page.tsx` contendo o layout do recibo (valores em destaque no topo, dados do cliente e linhas estáticas de assinaturas).
- [x] T019 [US4] Adicionar tags e classes do Tailwind de impressão (`print:hidden`, `print:p-0`, `print:shadow-none`) em `app/app/quotes/[id]/page.tsx` e `app/app/quotes/[id]/receipt/page.tsx` para otimizar a visualização em PDF/impressão nativa de orçamentos e recibos.
- [x] T025 [US4] Otimizar o layout de visualização de recibo em `/app/quotes/[id]/receipt/page.tsx` para impressão nativa (`window.print()`) e PDF, escondendo menus e botões administrativos por meio de CSS `@media print`.

**Checkpoint**: Recibos emitidos, consultados e impressos com sucesso.

---

## Phase 7: User Story 5 - Consistência Visual, Responsividade PWA e Correções de UI/UX (Linear Style) (Priority: P1)

**Goal**: Adequar a estética visual e a usabilidade de toda a aplicação seguindo os padrões do Linear App, corrigindo a sidebar, formulários e ativando capacidades PWA.

**Independent Test**: Redimensionar o navegador, testar a sidebar recolhida no desktop e no mobile. Acessar as configurações de Meu Negócio e verificar o alinhamento do endereço. Testar a detecção do PWA no Lighthouse ou navegador.

- [x] T026 [P] [US5] Corrigir quebra de layout na sidebar recolhida em `components/app-sidebar.tsx` ocultando rótulos textuais (`SidebarGroupLabel`), chevrons de itens ativos e textos de botão com a classe `group-data-[collapsible=icon]:hidden`.
- [x] T027 [US5] Reestruturar o formulário de endereço do negócio em `app/app/settings/settings-form.tsx` para alinhar visualmente com o formulário de cadastro de clientes em `app/app/customers/customer-form.tsx` usando um grid de 12 colunas, dropdown/select para estados (UF) e o utilitário de busca de CEP com máscara e lupa de pesquisa.
- [x] T028 [P] [US5] Unificar os badges indicadores de situação de orçamentos na página de detalhes do cliente em `app/app/customers/[id]/customer-quotes-client.tsx` para importar e utilizar o componente `QuoteStatusBadge` centralizado.
- [x] T029 [P] [US5] Criar o arquivo de manifest do PWA em `app/manifest.ts` retornando as configurações dinâmicas de cores e metadados e registrar as meta-tags do PWA no layout principal em `app/layout.tsx`.
- [x] T030 [P] [US5] Criar o ícone oficial da marca em `public/icon.svg` composto por um raio com gradiente indigo-cyan de cantos arredondados para suporte visual ao PWA e favicon.

**Checkpoint**: Interface 100% responsiva, consistente, no estilo Linear e instalável via PWA.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes finais, higiene de código e validações finais de compilação.

- [x] T020 [P] Remover imports e variáveis não utilizadas, garantindo a higiene do código.
- [x] T021 Validar testes de builds locais do Next.js executando `npx tsc --noEmit` e `npm run build`.

---

## Dependencies & Execution Order

```mermaid
graph TD
    T001[Setup DB Schema - T001/T002] --> T003[Setup Schemas Zod - T003]
    T003 --> T004[Action updateQuoteStatus - T004]
    T004 --> T005[UI Badge - T005]
    T005 --> T006[US1: Ciclo de Vida - T006 a T009]
    T009 --> T022[US1: Novo Menu Ações - T022]
    T008 --> T023[US1: Print CSS Orçamento - T023]
    T005 --> T010[US2: Filtro por Situação - T010]
    T010 --> T024[US2: Tabs Linear e Contadores - T024]
    T005 --> T011[US3: Dashboard - T011 a T014]
    T005 --> T015[US4: Recibos - T015 a T019]
    T019 --> T025[US4: Print CSS Recibo - T025]
    T005 --> T026[US5: Sidebar Layout - T026]
    T005 --> T027[US5: Endereço Settings - T027]
    T005 --> T028[US5: Badge Cliente - T028]
    T005 --> T029[US5: PWA Manifest - T029/T030]
    
    T022 --> T020[Polish & Build - T020/T021]
    T023 --> T020
    T024 --> T020
    T025 --> T020
    T026 --> T020
    T027 --> T020
    T028 --> T020
    T029 --> T020
```

### Oportunidades de Paralelismo
*   Os desenvolvedores podem trabalhar em paralelo nas fases **US1**, **US2**, **US3**, **US4** e **US5** assim que a fase **Foundational** estiver concluída.
*   Dentro de cada fase, tarefas marcadas com `[P]` podem ser codificadas concorrentemente devido ao isolamento de arquivos.

---

## Parallel Example: User Story 5
```bash
# Desenvolvedor A ajusta a consistência de Settings:
Task: "Reestruturar o formulário de endereço da empresa em settings-form.tsx"

# Desenvolvedor B cria o manifesto PWA e ícones em paralelo:
Task: "Criar manifest.ts em app/manifest.ts"
Task: "Criar icon.svg em public/icon.svg"
```

---

## Implementation Strategy

### MVP First (Fase 1, 2 e US1 apenas)
1. Complete a **Fase 1 (Setup)** executando o script SQL no Supabase.
2. Complete a **Fase 2 (Foundational)** aplicando os schemas Zod e Server Actions atualizadas.
3. Complete a **Fase 3 (User Story 1)** para obter um fluxo completo de transição de status na tela de detalhes de orçamentos e o menu de ações contextuais.
4. **Validar**: Teste manualmente a mudança do ciclo de vida em orçamentos rascunhos, ativos, cancelados com justificativa e concluídos.

### Incrementos Posteriores
1. Adicione a filtragem de status premium com abas (US2).
2. Adicione os recibos (US4).
3. Adicione o Painel analítico gerencial com gráficos integrados (US3).
4. Adicione as melhorias de layout, consistência Settings/Badges e PWA (US5).
