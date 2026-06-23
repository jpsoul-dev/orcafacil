# Tasks: Refatoração do Módulo de Clientes (Fase 3)

**Input**: Design documents from `/specs/005-refact-customers-fase3/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Criar o arquivo de serviço base em `lib/services/customer-service.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implementar no `lib/services/customer-service.ts` as lógicas de banco do Supabase para busca, inserção, atualização e deleção de clientes com isolamento multi-tenant
- [x] T003 Refatorar as Server Actions em `app/app/customers/actions.ts` para validar entradas via Zod e encaminhar as requisições para a classe `customer-service.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Listagem de Clientes Responsiva e Moderna (Priority: P1) 🎯 MVP

**Goal**: Permitir a visualização de clientes de forma responsiva e moderna, adaptada para telas grandes e pequenas, com busca e paginação funcionais.

**Independent Test**: Carregar a página `/app/customers` no navegador local, testar a busca rápida de clientes por nome/e-mail/telefone e testar o redimensionamento para celulares para validar a transição automática da tabela para formato de cards.

### Implementation for User Story 1

- [x] T004 [P] [US1] Criar o componente de cartão de toque móvel em `app/app/customers/components/customer-card.tsx` contendo o avatar do cliente, atalhos de contato rápido (WhatsApp/E-mail/telefone) e botão de ações contextuais
- [x] T005 [US1] Atualizar a página principal de listagem `app/app/customers/page.tsx` para consumir o `customer-service.ts` e renderizar condicionalmente a tabela no desktop (DataTable) e os cartões no mobile (CustomerCard)
- [x] T006 [P] [US1] Ajustar a definição das colunas de clientes em `app/app/customers/columns.tsx` para alinhar as ações e a tipografia Sora da tabela desktop

**Checkpoint**: Listagem de clientes com tabela desktop e cards móveis 100% testável e independente.

---

## Phase 4: User Story 2 - Cadastro e Edição de Clientes com Validação e Máscaras (Priority: P1)

**Goal**: Permitir o cadastro seguro de novos clientes e a edição de registros existentes com máscaras de digitação em tempo real (CPF/CNPJ dinâmico, telefone, CEP) e validações com Zod e React Hook Form.

**Independent Test**: Abrir os modais de cadastro e edição de clientes, digitar dados de telefones e CPF/CNPJ conferindo o preenchimento das máscaras e submeter formulários com dados intencionalmente incorretos para testar o travamento e as mensagens de erro descritivas do Zod.

### Implementation for User Story 2

- [x] T007 [US2] Atualizar a estrutura visual de inputs e botões no componente `app/app/customers/customer-form.tsx` para alinhar com os tokens de cores, cantos arredondados (radius-md) e tipografia Sora do Design System
- [x] T008 [US2] Adicionar funções puras de tratamento de máscara de digitação em tempo real para Telefone, CEP e CPF/CNPJ (dinâmico) no input do formulário em `app/app/customers/customer-form.tsx`
- [x] T009 [US2] Implementar os feedbacks visuais de carregamento (spinner/loading) e mensagens amigáveis de erros Zod no componente de formulário `app/app/customers/customer-form.tsx`

**Checkpoint**: Fluxo de cadastro e edição de clientes funcional com validação rígida de dados.

---

## Phase 5: User Story 3 - Perfil e Histórico Detalhado do Cliente (Priority: P2)

**Goal**: Exibir a página interna do perfil do cliente com o cabeçalho Sora destacado e abas funcionais exibindo o histórico de orçamentos e recibos associados com valores e badges de status oficiais da marca.

**Independent Test**: Acessar o detalhe de um cliente (`/app/customers/[id]`), testar o clique entre as abas "Orçamentos" e "Recibos" e conferir as tabelas de orçamentos (valores monetários em Real R$ e badges de status com dots coloridos correspondentes).

### Implementation for User Story 3

- [x] T010 [US3] Atualizar a página e o cabeçalho Sora do perfil do cliente em `app/app/customers/[id]/page.tsx`
- [x] T011 [US3] Ajustar a lógica de abas (Tabs) e tabelas internas no componente `app/app/customers/[id]/customer-quotes-client.tsx` para renderizar os históricos de orçamentos e recibos formatados com o Design System

**Checkpoint**: Perfil detalhado do cliente e relatórios financeiros associados funcionando corretamente.

---

## Phase 6: User Story 4 - Confirmação Preventiva de Exclusão e Feedback UX (Priority: P2)

**Goal**: Proteger o usuário contra cliques acidentais e perda de dados nas deleções de clientes com uma caixa de diálogo Alert Dialog que verifica e alerta caso existam orçamentos ativos associados ao cliente.

**Independent Test**: Clicar em excluir em um cliente com e outro sem orçamentos associados, validando a abertura da caixa de Alert Dialog, as mensagens exibidas e o cancelamento/confirmação do comando.

### Implementation for User Story 4

- [ ] T012 [P] [US4] Criar o componente de diálogo de exclusão baseado no Alert Dialog do shadcn/ui em `app/app/customers/components/delete-customer-dialog.tsx`
- [ ] T013 [US4] Implementar a verificação de orçamentos vinculados ativos em `lib/services/customer-service.ts` e integrá-la ao diálogo de deleção `app/app/customers/components/delete-customer-dialog.tsx` para exibir avisos preventivos
- [ ] T014 [P] [US4] Adicionar os loaders animados (shimmer skeletons) durante a requisição de listagem e históricos em `app/app/customers/page.tsx` e `app/app/customers/[id]/page.tsx`

**Checkpoint**: Deleções protegidas por confirmação e melhoria geral de feedback e loading states.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes visuais, higiene do repositório e validação final da aplicação

- [ ] T015 [P] Executar o build de produção no terminal com `npm run build` para validar que não existam erros de compilação, tipos TS ou imports quebrados
- [ ] T016 Revisar todo o código implementado nas telas e serviços de clientes, aplicando as regras de higiene e eliminando imports mortos, variáveis inutilizadas e comentários de "o que" o código faz

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - inicia imediatamente.
- **Foundational (Phase 2)**: Depende do Setup (T001) estar concluído. BLOQUEIA todos os fluxos de interface.
- **User Stories (Phase 3+)**: Dependem do Foundational (Phase 2) completo.
  - Podem ser desenvolvidas de forma paralela (US1, US2, US3, US4) se necessário, ou sequencialmente (P1 → P2).
- **Polish (Phase 7)**: Depende de todas as User Stories anteriores estarem concluídas.

---

## Parallel Opportunities

- O desenvolvimento do componente de card móvel (`T004`) e das colunas desktop (`T006`) pode ser feito em paralelo na Phase 3.
- Na Phase 4, a estilização visual (`T007`) e a aplicação das máscaras (`T008`) podem ocorrer paralelamente.
- O Alert Dialog de exclusão (`T012`) e os skeletons de carregamento (`T014`) podem ser criados em paralelo na Phase 6.

---

## Implementation Strategy

### MVP First (Listagem & Cadastro - US1 e US2)

1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Concluir a listagem responsiva (US1).
3. Concluir os formulários validados (US2).
4. Testar localmente a inserção e listagem como primeiro incremento de valor da funcionalidade.
5. Avançar para o histórico de perfil (US3) e os alertas e loadings dinâmicos (US4).
