# Feature Specification: Reorganização do Formulário de Novo Orçamento

**Feature Branch**: `009-improve-budget-form`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "preciso realizar as melhorias apontadas em artifacts/drafts/melhroias_orcamento/melhoria_form_orcamento.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preenchimento Focado com Seções Recolhíveis (Priority: P1)

Como um usuário que cria orçamentos, eu quero recolher seções secundárias e focar apenas nas seções ativas, para que a tela não fique excessivamente longa e confusa durante o preenchimento no celular ou desktop.

**Why this priority**: Crítico para a usabilidade e organização visual da tela, reduzindo a carga cognitiva ao ocultar informações irrelevantes no momento.

**Independent Test**: Pode ser testado de forma independente carregando o formulário, verificando se "Dados do orçamento" e "Itens do orçamento" estão expandidos por padrão, se os itens estão recolhidos por padrão, e interagindo com os botões de expandir/recolher de cada seção.

**Acceptance Scenarios**:

1. **Given** que o usuário está na tela de criação de novo orçamento, **When** a página é carregada, **Then** as seções "Dados do orçamento" e "Itens do orçamento" devem estar expandidas por padrão, enquanto as seções "Formas de pagamento" e "Termos e condições" devem estar recolhidas por padrão.
2. **Given** que a seção "Itens do orçamento" está visível, **When** existem itens adicionados, **Then** cada item da lista deve abrir recolhido por padrão, exibindo apenas o cabeçalho e informações básicas, com a opção de clicar para expandir e editar.
3. **Given** que o usuário visualiza as seções, **When** ele clica no cabeçalho de qualquer seção recolhível, **Then** o estado da seção deve alternar entre expandido e recolhido de forma suave.

---

### User Story 2 - Adição e Visualização Estruturada de Itens sem Desconto Individual (Priority: P1)

Como um usuário que cria orçamentos, eu quero adicionar itens a partir de um painel lateral unificado (podendo selecionar múltiplos itens do catálogo ou digitar manualmente) e visualizá-los em uma tabela clara com cabeçalho fixo e sem a opção de desconto individual, para evitar erros de cálculo e duplicidade com o desconto geral.

**Why this priority**: Evita quebras de fluxo, melhora a inserção em lote de itens e elimina a duplicidade de regras de desconto por item individual, prevenindo divergências financeiras.

**Independent Test**: Pode ser testado abrindo o painel lateral de adição de itens, realizando a busca e a seleção de múltiplos itens do catálogo, confirmando a inserção, visualizando os itens em formato de lista com cabeçalhos fixos (Descrição, Qtd., Valor Unitário, Total) e validando que não há nenhum campo ou menção a desconto individual em nenhuma parte do item. No mobile a lista é diferente, conforme imagem `mobile.png`

**Acceptance Scenarios**:

1. **Given** que o usuário deseja adicionar itens, **When** ele clica no botão único de adicionar item, **Then** um painel lateral deve se abrir oferecendo a busca no catálogo de itens e o preenchimento manual de um novo item.
2. **Given** que o usuário está buscando itens no painel lateral, **When** ele seleciona múltiplos itens do catálogo e clica em confirmar, **Then** todos os itens selecionados devem ser adicionados de uma vez à lista de itens do orçamento.
3. **Given** que existem itens adicionados ao orçamento, **When** a lista de itens é exibida, **Then** ela deve mostrar cabeçalhos fixos para "Descrição", "Qtd.", "Valor Unitário" e "Total", sem exibir campo de desconto por item individual.
4. **Given** que um item está na lista, **When** o usuário clica em expandir o item para edição, **Then** todos os campos de edição deste item devem ser exibidos dispostos em uma única linha horizontal no desktop.

---

### User Story 3 - Fluxo Dedicado para Formas de Pagamento e Termos (Priority: P2)

Como um usuário que cria orçamentos, eu quero configurar as formas de pagamento e os termos e condições através de painéis laterais dedicados, visualizando um resumo limpo na tela principal, para manter o formulário objetivo e focado no conteúdo principal.

**Why this priority**: Melhora a organização visual da tela principal, delegando preenchimentos complexos para modais/drawers laterais focados.

**Independent Test**: Pode ser testado clicando nos botões de "Formas de pagamento" e "Termos e condições", selecionando múltiplas formas (ou inserindo termos), confirmando e verificando se os chips correspondentes e resumos aparecem na tela principal.

**Acceptance Scenarios**:

1. **Given** que o usuário clica no botão para definir formas de pagamento, **When** o painel lateral abre, **Then** ele deve exibir uma lista de checkbox de formas de pagamento com nome e ícone correspondente de cada uma.
2. **Given** que o usuário seleciona e confirma as formas de pagamento no painel lateral, **When** ele retorna à tela principal, **Then** as formas selecionadas devem ser exibidas como chips visuais.
3. **Given** que o usuário clica no botão para definir os termos e condições, **When** o painel lateral abre, **Then** ele deve exibir um campo de texto rico ou área de texto para inserção das condições contratuais com botão de confirmação.

---

### User Story 4 - Visualização Persistente do Resumo do Orçamento e Ajuste de Desconto (Priority: P2)

Como um usuário preenchendo um orçamento longo, eu quero que o Resumo do orçamento permaneça sempre visível na tela e que eu possa ajustar o desconto geral rapidamente a partir dele, para acompanhar o impacto financeiro das alterações em tempo real.

**Why this priority**: Melhora significativamente a experiência do usuário, eliminando a rolagem constante para conferir o valor total e facilitando a aplicação de descontos de alto nível.

**Independent Test**: Pode ser testado redimensionando a janela para testar comportamento desktop (lateral direita fixa) e mobile (parte inferior fixa), e clicando no ícone de desconto para ajustar o desconto geral e ver o total atualizado no resumo.

**Acceptance Scenarios**:

1. **Given** que o usuário está no desktop, **When** ele rola a página do formulário, **Then** a seção "Resumo do orçamento" deve ficar fixa na lateral direita, acompanhando a tela.
2. **Given** que o usuário está no mobile, **When** ele visualiza o formulário, **Then** a seção "Resumo do orçamento" deve ficar fixa no rodapé da tela, sempre visível.
3. **Given** que o usuário clica no ícone de desconto localizado no Resumo do orçamento, **When** o painel lateral abre, **Then** ele deve permitir configurar e aplicar o desconto geral no orçamento, recalculando os totais imediatamente.
4. **Given** que o usuário está no mobile, **When** ele interage com o ícone de desconto no resumo, **Then** o elemento deve possuir uma área de toque de no mínimo 44x44px.

### Edge Cases

- **Sem Conexão ao Buscar Catálogo**: Se o usuário abrir a busca do catálogo no painel lateral sem conexão, o painel deve exibir um estado de erro amigável, permitindo preencher os dados manualmente e salvar o item localmente no formulário.
- **Valores Limite no Desconto Geral**: O desconto geral configurado no painel lateral não deve aceitar valores negativos ou superiores ao subtotal bruto do orçamento.
- **Campos Vazios nos Itens Expandidos**: Caso o usuário expanda um item para editar e remova a quantidade ou valor unitário, o sistema deve exibir validação visual indicando que são campos obrigatórios e impedir a confirmação/atualização do item.
- **Exclusão de Chips na Tela Principal**: O usuário deve ser capaz de remover uma forma de pagamento diretamente clicando no ícone de remoção (x) do chip na tela principal, sem necessariamente ter de reabrir o painel lateral.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de criação de orçamento deve estruturar todas as seções (exceto o Resumo) em componentes colapsáveis/recolhíveis individuais.
- **FR-002**: As seções "Dados do orçamento" e "Itens do orçamento" devem carregar expandidas por padrão, enquanto "Formas de pagamento" e "Termos e condições" devem carregar recolhidas por padrão.
- **FR-003**: Cada item adicionado na seção "Itens do orçamento" deve carregar recolhido por padrão.
- **FR-004**: Os campos da seção "Dados do orçamento" devem ser exibidos estritamente na ordem: Cliente (Client), Validade (Validity) e Título (Title).
- **FR-005**: O sistema deve possuir um botão único de adicionar item que abre um painel lateral (Drawer).
- **FR-006**: O painel lateral de adicionar item deve permitir a seleção múltipla de itens cadastrados no catálogo ou a digitação manual de novos itens.
- **FR-007**: A lista de itens na tela principal deve ser exibida em formato de tabela com cabeçalhos fixos: Descrição, Qtd., Valor Unitário, Total.
- **FR-008**: Cada item da lista deve possuir um botão de expansão que revela os campos de edição dispostos em uma única linha no desktop.
- **FR-009**: O campo de desconto individual por item deve ser completamente removido em todas as camadas da tela de criação de orçamento.
- **FR-010**: A seção "Resumo do orçamento" deve permanecer fixa na lateral direita em dispositivos desktop e fixa no rodapé em dispositivos mobile, garantindo visibilidade contínua.
- **FR-011**: O botão de formas de pagamento deve abrir um painel lateral contendo a listagem de formas disponíveis como checkboxes, incluindo seus ícones correspondentes.
- **FR-012**: As formas de pagamento selecionadas no painel lateral devem ser exibidas como chips removíveis na tela principal.
- **FR-013**: O botão de termos e condições deve abrir um painel lateral com uma área de texto para edição e confirmação dos termos.
- **FR-014**: O ícone de desconto no "Resumo do orçamento" deve abrir um painel lateral para a configuração do desconto geral (valor ou porcentagem) aplicável ao orçamento inteiro.
- **FR-015**: O ícone de desconto no "Resumo do orçamento" deve possuir área de toque mínima de 44x44 pixels em dispositivos móveis.

### Key Entities

- **Budget**: Entidade que representa o orçamento sendo criado, contendo cliente, título, validade, desconto geral, termos, formas de pagamento selecionadas e a lista de itens.
- **BudgetItem**: Item individual adicionado ao orçamento, possuindo descrição, quantidade, valor unitário e total calculado (Qtd * Valor Unitário). Não possui atributo de desconto individual.
- **CatalogItem**: Item registrado no catálogo do sistema, disponível para seleção múltipla no painel lateral.
- **PaymentMethod**: Forma de pagamento disponível para seleção, associada a um nome e a um ícone visual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário deve conseguir preencher e salvar um novo orçamento com múltiplos itens e formas de pagamento em menos de 2 minutos.
- **SC-002**: 100% dos testes de responsividade em mobile devem validar que a barra de resumo inferior permanece fixa, sem bloquear a visualização dos campos de input quando o teclado virtual está oculto.
- **SC-003**: 100% das menções a desconto por item individual devem ser eliminadas da tela de criação, garantindo que o valor total do orçamento seja unicamente composto pelo subtotal menos o desconto geral.
- **SC-004**: O tempo de carregamento inicial da página de criação de orçamento deve ser de no máximo 1.5 segundos em rede móvel padrão (3G).

## Assumptions

- **A-001**: A tela de edição de orçamentos existentes está fora de escopo para esta alteração.
- **A-002**: O catálogo de itens já possui uma API ou serviço de busca que será integrado ao painel lateral.
- **A-003**: O layout segue o sistema de design semântico e as regras do Impeccable (sem ghost cards, sem cores ad-hoc, etc.).
- **A-004**: O usuário possui acesso à internet para carregar os dados de clientes e catálogo de itens, com um fallback local para digitação manual no painel lateral.
