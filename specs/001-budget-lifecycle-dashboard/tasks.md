# Tasks: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo, Recibos e UI/UX (Linear Style)

**Input**: Design documents from `specs/001-budget-lifecycle-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Apenas testes funcionais manuais e validações Zod no servidor serão implementados nesta feature.

**Organization**: As tarefas são agrupadas por user story para permitir a implementação e teste independentes de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: A qual história de usuário a tarefa pertence (ex: US1, US2, US3)
- Caminhos exatos de arquivos estão inclusos nas descrições.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização da estrutura básica e arquivos de configuração

- [x] T001 Criar estrutura física dos novos arquivos de serviço e actions em `lib/services/` e `app/app/settings/`
- [x] T002 Configurar o manifesto dinâmico de PWA em `app/app/manifest.ts` e ícone vetorial em `public/icon.svg`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Banco de dados e infraestrutura base obrigatória antes de iniciar as user stories

**⚠️ CRITICAL**: Nenhuma tarefa de user story pode ser iniciada até que esta fase foundational esteja concluída.

- [x] T003 Criar o arquivo de migração SQL em `supabase/migrations/20260603000000_budget_lifecycle_improvements.sql` contendo alterações de status de orçamentos, tabela de recibos, novas colunas para onboarding em companies e a procedure Postgres `public.close_account()`
- [x] T004 Atualizar as definições de tipos gerados em `types/database.types.ts` refletindo o novo schema do banco
- [x] T005 [P] Atualizar as validações e schemas de status Zod em `app/app/quotes/schemas.ts`

**Checkpoint**: Fundação pronta - a implementação das user stories já pode começar.

---

## Phase 3: User Story 1 - Fluxo do Ciclo de Vida do Orçamento (Priority: P1) 🎯 MVP

**Goal**: Permitir salvar como rascunho, gerar orçamento e transicionar status entre draft, pending, approved, rejected, cancelled, completed.

**Independent Test**: Criar orçamento como draft, gerar orçamento para torná-lo pending, e atualizar status manualmente validando as restrições e o motivo de cancelamento.

- [x] T006 [US1] Implementar o serviço de negócio para orçamentos em `lib/services/quote-service.ts` gerenciando a persistência e restrições de transição de status
- [x] T007 [US1] Atualizar as Server Actions de orçamentos em `app/app/quotes/actions.ts` para usar o novo serviço `quote-service.ts` e validar regras de negócio
- [x] T008 [US1] Ajustar a página de detalhes de orçamentos em `app/app/quotes/[id]/page.tsx` para tratar a opção "Salvar como Rascunho" e "Gerar Orçamento"

**Checkpoint**: Ao finalizar esta fase, o ciclo de vida básico está 100% funcional.

---

## Phase 4: User Story 2 - Filtro por Situação na Lista de Orçamentos com UX Melhorada (Priority: P1)

**Goal**: Filtrar listagem de orçamentos por situação de forma fluida usando abas elegantes estilo Linear App.

**Independent Test**: Acessar a listagem de orçamentos, alternar as abas de status e verificar a atualização instantânea da listagem.

- [x] T009 [US2] Implementar filtros baseados em abas (Tabs) com scroll horizontal no topo da listagem em `app/app/quotes/quotes-list.tsx`
- [x] T010 [US2] Adicionar contadores de quantidade para cada status na consulta de listagem em `app/app/quotes/quotes-list.tsx`

**Checkpoint**: Listagem com abas de status filtráveis e contadores integrada com sucesso.

---

## Phase 5: User Story 3 - Menu de Ações Contextual na Listagem de Orçamentos (Priority: P1)

**Goal**: Executar ações comerciais de status, exclusão e impressão direto pela linha da tabela de orçamentos.

**Independent Test**: Clicar no menu Dropdown da linha de um orçamento e validar se as ações exibidas refletem estritamente seu status.

- [x] T011 [US3] Atualizar a definição das colunas de orçamento em `app/app/quotes/columns.tsx` incluindo o DropdownMenu com ações condicionais por status
- [x] T012 [US3] Ligar as ações de mudança de status rápidas (aprovar, rejeitar, reabrir, excluir) no DropdownMenu em `app/app/quotes/columns.tsx`

---

## Phase 6: User Story 4 - Visualização Otimizada para Impressão e PDF (Priority: P1)

**Goal**: Imprimir e exportar orçamentos sem elementos administrativos usando print-CSS nativo.

**Independent Test**: Abrir visualização de impressão e verificar a ausência de sidebar, cabeçalhos do app ou botões de ação.

- [x] T013 [P] [US4] Adicionar regras `@media print` e classes CSS print-friendly em `components/quote-viewer.tsx`
- [x] T014 [P] [US4] Implementar o botão de impressão nativa e estilo de visualização de PDF em `app/app/quotes/[id]/page.tsx`

---

## Phase 7: User Story 7 - Consistência Visual, Responsividade PWA e Correções de UI/UX (Linear Style) (Priority: P1)

**Goal**: Adequar sidebar, formulário de settings, badges e PWA para o visual minimalista e premium do Linear App.

**Independent Test**: Redimensionar para mobile, verificar o comportamento drawer da sidebar, validar se settings-form está idêntico a clientes-form e testar o manifesto PWA.

- [x] T015 [US7] Ajustar a responsividade da sidebar para ocultar chevrons e rótulos ao colapsar no desktop e abrir em gaveta no mobile em `components/app-sidebar.tsx`
- [x] T016 [US7] Redesenhar os campos de formulário de endereço no settings para compartilhar o mesmo alinhamento de grid e inputs de clientes em `app/app/settings/settings-form.tsx`
- [x] T017 [US7] Unificar o uso de badges de situação dos orçamentos usando o componente centralizado na listagem de cliente em `app/app/customers/[id]/customer-quotes-client.tsx`
- [x] T018 [US7] Ajustar o layout do cabeçalho da aplicação para injetar as tags de PWA em `app/layout.tsx`

**Checkpoint**: Toda a interface visual base e responsiva está com acabamento estilo Linear.

---

## Phase 8: User Story 5 - Painel Administrativo de Métricas do Negócio (Priority: P2)

**Goal**: Exibir estatísticas de vendas com gráficos Recharts de pizza e barras.

**Independent Test**: Acessar o Dashboard inicial e confirmar o carregamento e renderização correta de todos os gráficos analíticos.

- [x] T019 [US5] Implementar o componente de gráfico de pizza de distribuição por status em `app/app/components/status-pie-chart.tsx`
- [x] T020 [US5] Implementar o componente de gráfico de barras de faturamento por mês em `app/app/components/revenue-bar-chart.tsx`
- [x] T021 [US5] Atualizar a página inicial do painel para carregar e enviar os dados aos novos componentes em `app/app/page.tsx`

---

## Phase 9: User Story 6 - Geração de Recibo para Orçamentos Finalizados (Priority: P2)

**Goal**: Emitir, preencher, assinar e imprimir recibos de quitação para orçamentos concluídos.

**Independent Test**: Abrir orçamento completed, clicar em Gerar Recibo, preencher serviços, salvar e imprimir recibo validando linhas de assinatura.

- [x] T022 [US6] Criar o serviço de negócio para persistência e busca de recibos em `lib/services/receipt-service.ts`
- [x] T023 [US6] Criar as Server Actions de manipulação e gravação de recibos em `app/app/quotes/receipt-actions.ts`
- [x] T024 [US6] Criar a página de formulário de emissão/edição do recibo em `app/app/quotes/[id]/receipt/edit/page.tsx`
- [x] T025 [US6] Criar a página de detalhes e impressão de recibo em `app/app/quotes/[id]/receipt/page.tsx`
- [x] T026 [US6] Adicionar o botão "Gerar Recibo" para orçamentos com status `completed` em `app/app/quotes/[id]/page.tsx`

**Checkpoint**: Recibos de quitação e fluxo financeiro analítico concluídos com sucesso.

---

## Phase 10: User Story 8 - Clonar Orçamento (Priority: P2)

**Goal**: Clonar orçamentos existentes (exceto rascunhos) gerando um rascunho pré-preenchido para edição rápida.

**Independent Test**: Clicar em "Clonar" na listagem de orçamentos e verificar se é redirecionado para a criação pré-preenchida.

- [x] T027 [US8] Implementar método de clonagem no serviço `lib/services/quote-service.ts` que duplica o orçamento e itens associados como `draft`
- [x] T028 [US8] Adicionar Server Action `cloneQuoteAction` para expor a clonagem ao frontend em `app/app/quotes/actions.ts`
- [x] T029 [US8] Adicionar a ação "Clonar" no menu Dropdown da listagem em `app/app/quotes/columns.tsx` e ligar ao redirecionamento automático pós-clone

---

## Phase 11: User Story 9 - Melhoria e Consistência nas Telas de Onboarding (Priority: P2)

**Goal**: Simplificar o onboarding tornando o telefone opcional, exigindo ramo de atuação e alinhando com o tema escuro.

**Independent Test**: Criar nova conta, acessar onboarding, preencher ramo obrigatoriamente sem fornecer telefone e conferir visual escuro Linear.

- [x] T030 [US9] Atualizar a validação Zod e tipagem do onboarding em `app/onboarding/schemas.ts` removendo phone e adicionando industry obrigatório
- [x] T031 [US9] Atualizar a Server Action `saveOnboarding` em `app/onboarding/actions.ts` para persistir o campo `industry` e aceitar `phone` nulo
- [x] T032 [US9] Redesenhar o layout do onboarding com o tema escuro/Linear style, incluindo o Select para ramo de atuação em `app/onboarding/page.tsx`

---

## Phase 12: User Story 10 - Sistema de Notificações Aprimorado (Priority: P2)

**Goal**: Filtrar notificações temporais e exibir alertas em abas Lidas e Não lidas no menu.

**Independent Test**: Logar, verificar que notificações pré-cadastro não aparecem, marcar como lida e ver mover-se para a aba de Lidas.

- [x] T033 [US10] Adicionar filtro temporal na query de busca de notificações para ignorar notificações antigas à data de cadastro em `components/notification-bell.tsx`
- [x] T034 [US10] Implementar abas "Não lidas" e "Lidas" (Tabs com controle de estado local) no dropdown de notificações em `components/notification-bell.tsx`
- [x] T035 [US10] Incluir botão de marcar todas como lidas e botão individual de leitura no layout do dropdown em `components/notification-bell.tsx`

---

## Phase 13: User Story 11 - Encerramento Seguro de Conta (Priority: P2)

**Goal**: Permitir ao usuário encerrar sua conta e propagar a remoção lógica/física dos dados associados via confirmação dupla.

**Independent Test**: Acessar configurações, clicar em Encerrar Conta, digitar "ENCERRAR CONTA", confirmar e validar exclusão e logout completo.

- [x] T036 [US11 - REMOVIDO] Criar o serviço de negócio para fechar a conta do usuário em `lib/services/user-service.ts`
- [x] T037 [US11 - REMOVIDO] Criar a Server Action `closeAccountAction` para autenticar e executar a remoção do usuário logado em `app/app/settings/actions.ts`
- [x] T038 [US11 - REMOVIDO] Adicionar a seção de "Zona de Perigo" com botão "Encerrar Conta" em `app/app/settings/settings-form.tsx`

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Polimento final e documentação

- [x] T039 [P] Atualizar a documentação e contratos nas pastas correspondentes do projeto
- [x] T040 Validar integridade da compilação rodando build de produção
- [x] T041 Executar plano de verificação rápida do guia quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências, inicia imediatamente.
- **Foundational (Phase 2)**: Depende do Setup concluído. BLOCKS todas as user stories.
- **User Stories (Phase 3 a 13)**: Todas dependem da conclusão da Phase 2. Podem rodar em sequência ou paralelo.
- **Polish (Phase 14)**: Depende de todas as user stories implementadas e integradas.

### Parallel Opportunities

- As tarefas marcadas com `[P]` (como T002, T005, T013, T014, T039) podem rodar em paralelo de forma isolada sem conflitos de arquivos.
- Cada User Story foi projetada de forma independente, permitindo que desenvolvedores trabalhem em histórias distintas simultaneamente após a conclusão da Phase 2.

---

## Implementation Strategy

### MVP First (User Story 1 e UX P1)
1. Concluir Setup + Foundational (Phases 1 e 2).
2. Concluir User Story 1 (Fluxo do ciclo de vida base).
3. Testar independentemente a transição de status dos orçamentos.
4. Integrar com abas de filtros (US2) e menus contextuais (US3).
5. Validar MVP!

### Incremental Delivery
1. Adicionar visualização e impressão PDF (US4).
2. Aplicar PWA e consistência da sidebar (US7).
3. Desenvolver o painel analítico (US5) e os recibos de quitação (US6).
4. Integrar clonagem de orçamento (US8), onboarding simplificado (US9), notificações com tabs (US10) e encerramento seguro (US11).
5. Polimento e validação final (Phase 14).
