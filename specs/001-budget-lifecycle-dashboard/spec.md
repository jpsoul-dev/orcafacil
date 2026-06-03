# Feature Specification: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo e Recibos

**Feature Branch**: `001-budget-lifecycle-dashboard`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "analise a aplicação atual e o documento .prds/AppFeatures.md que propoe melhorias na aplicação Orça Fácil."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fluxo do Ciclo de Vida do Orçamento (Priority: P1)

Como prestador de serviços, eu quero gerenciar o ciclo de vida completo dos meus orçamentos desde a edição como rascunho até a conclusão ou cancelamento, para que eu possa acompanhar com precisão a evolução de cada negociação.

**Why this priority**: É a funcionalidade central do fluxo operacional. Sem os status e transições adequados, não é possível rastrear o progresso comercial ou dar suporte às demais melhorias.

**Independent Test**: Pode ser testado criando um orçamento como rascunho, atualizando-o para pendente (ativo), alterando seu status para aprovado, e finalmente concluindo-o (finalizado) ou cancelando-o informando o motivo.

**Acceptance Scenarios**:

1. **Given** que o usuário está criando ou editando um orçamento, **When** ele escolhe salvar como rascunho, **Then** o orçamento é armazenado com a situação "Rascunho", não possui data de validade ativa obrigatória, não pode ser visualizado por links de terceiros e pode ser editado ou excluído a qualquer momento pelo usuário do sistema.
2. **Given** que o usuário finalizou a edição de um orçamento em rascunho, **When** ele clica em "Gerar Orçamento", **Then** a situação do orçamento muda para "Pendente" e ele fica disponível para ser visualizado pelo usuário, impresso ou exportado para PDF.
3. **Given** que um orçamento está na situação "Pendente", **When** o cliente dá o feedback, **Then** o usuário pode marcar a situação do orçamento manualmente como "Aprovado" ou "Rejeitado" no painel.
4. **Given** que um orçamento está na situação "Aprovado", **When** o usuário decide cancelar o orçamento, **Then** o sistema solicita obrigatoriamente a digitação de um motivo para o cancelamento e altera a situação para "Cancelado".
5. **Given** que um orçamento está na situação "Aprovado" (e o serviço foi executado), **When** o usuário decide encerrar o processo, **Then** ele altera a situação para "Finalizado".

---

### User Story 2 - Filtro por Situação na Lista de Orçamentos (Priority: P1)

Como prestador de serviços, eu quero filtrar meus orçamentos na tela de listagem de acordo com sua situação (Rascunho, Pendente, Aprovado, Rejeitado, Cancelado, Finalizado), para que eu consiga encontrar rapidamente orçamentos em andamento ou históricos específicos.

**Why this priority**: Essencial para a usabilidade diária e produtividade, permitindo gerenciar o volume de orçamentos gerados sem poluição visual.

**Independent Test**: Pode ser testado acessando a listagem de orçamentos, selecionando um status específico no filtro e verificando se os registros listados correspondem exatamente ao status filtrado.

**Acceptance Scenarios**:

1. **Given** que o usuário possui diversos orçamentos in diferentes situações cadastrados no sistema, **When** ele acessa a tela de listagem de orçamentos, **Then** ele visualiza um componente de filtro com as opções de situação (Rascunho, Pendente, Aprovado, Rejeitado, Cancelado, Finalizado, ou Todos).
2. **Given** que um filtro de situação específica está selecionado, **When** a lista é exibida, **Then** apenas os orçamentos que possuem essa situação correspondente são renderizados na tabela.

---

### User Story 3 - Painel Administrativo de Métricas do Negócio (Priority: P2)

Como proprietário do negócio, eu quero visualizar um painel administrativo com gráficos de desempenho e métricas financeiras consolidadas dos meus orçamentos, para que eu possa ter uma visão gerencial e estratégica da saúde financeira da minha empresa.

**Why this priority**: Fornece inteligência de negócios essencial para o crescimento e planejamento da empresa, além de centralizar operações em lote ou de controle.

**Independent Test**: Acessar a rota do Painel Administrativo, validar a renderização correta dos gráficos de barra/rosca/linha com dados agrupados por mês e situação, e utilizar a tabela integrada para exportar o PDF de orçamentos individuais.

**Acceptance Scenarios**:

1. **Given** que o usuário possui orçamentos em diferentes fases e valores no sistema, **When** ele abre o Painel Administrativo, **Then** o sistema exibe cartões com métricas-chave (ex: Total Faturado, Conversão de Orçamentos, Quantidade Emitida) e gráficos interativos que mostram a distribuição, o faturamento e o volume de criação de orçamentos por período.
2. **Given** a listagem de orçamentos dentro do Painel Administrativo, **When** o usuário interage com um orçamento específico, **Then** ele visualiza uma ação direta para baixar ou visualizar o PDF daquele orçamento.

---

### User Story 4 - Geração de Recibo para Orçamentos Finalizados (Priority: P2)

Como prestador de serviços, eu quero gerar um recibo formal para os orçamentos que já foram concluídos e pagos, contendo as informações de quitação e as linhas de assinatura estáticas para impressão e geração de PDF.

**Why this priority**: Importante para formalização de negócios e segurança jurídica do prestador de serviço e do cliente no encerramento da prestação.

**Independent Test**: Abrir um orçamento com a situação "Finalizado", clicar no botão de gerar recibo, preencher ou editar os campos de descrição dos serviços, valor, e testar a geração do PDF/impressão direta do documento contendo as linhas de assinatura para impressão.

**Acceptance Scenarios**:

1. **Given** que um orçamento está na situação "Finalizado", **When** o usuário visualiza seus detalhes no painel logado, **Then** o sistema disponibiliza um botão visível para "Gerar Recibo".
2. **Given** que o usuário clica em "Gerar Recibo", **When** a tela do recibo é renderizada, **Then** o sistema preenche automaticamente o recibo com o valor, a forma de pagamento, a data atual, os dados do cliente e da empresa a partir do orçamento original, e preenche o título do recibo com o título do orçamento (se houver).
3. **Given** a tela de criação/edição do recibo, **When** o usuário revisa as informações, **Then** ele pode editar o título do recibo, alterar o valor final recebido, alterar a forma de pagamento, e digitar a descrição dos serviços prestados, sendo gerado o layout com as linhas estáticas de assinatura para a emissão física/impressão.

### Edge Cases

- **Validade do Orçamento Pendente**: Se um orçamento está como "Pendente" e passa do prazo limite configurado em `valid_until`, ele deve expirar ou o usuário ainda pode aprová-lo? E se estiver expirado, ele pode ser alterado para aprovado sem antes reabrir ou estender o prazo?
- **Motivo de Cancelamento Vazio**: O sistema deve bloquear a transição para "Cancelado" se o motivo de cancelamento informado for vazio ou contiver apenas espaços em branco.
- **Restauração de Rascunhos**: Um orçamento que já foi publicado e passou para "Pendente" nunca pode voltar a ser um "Rascunho" ou ser excluído diretamente (apenas cancelado). Somente orçamentos na situação "Rascunho" podem ser excluídos fisicamente.
- **Acesso Privado Obrigatório**: O sistema deve impedir que qualquer pessoa sem sessão ativa (não autenticada) ou sem permissões de acesso ao tenant proprietário do orçamento visualize as telas de detalhes, impressão ou recibos de qualquer orçamento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST suportar as seguintes situações para os orçamentos: `draft` (Rascunho), `pending` (Pendente), `approved` (Aprovado), `rejected` (Rejeitado), `cancelled` (Cancelado) e `completed` (Finalizado).
- **FR-002**: O sistema MUST permitir a alteração manual do status do orçamento pelos prestadores de serviço autenticados, respeitando as seguintes transições permitidas:
  - `draft` -> `pending` (ao clicar em "Gerar Orçamento").
  - `pending` -> `approved` ou `rejected`.
  - `approved` -> `completed` ou `cancelled`.
- **FR-003**: O sistema MUST permitir a exclusão física (delete) de orçamentos apenas se eles estiverem na situação `draft`. Orçamentos em qualquer outro status não podem ser deletados, apenas alterados para `cancelled`.
- **FR-004**: O sistema MUST exigir obrigatoriamente a especificação de um motivo textual (comprimento mínimo de 5 caracteres) ao realizar a transição de um orçamento para a situação `cancelled`.
- **FR-005**: O sistema MUST persistir o motivo de cancelamento associado ao orçamento e permitir a sua consulta exclusivamente nos painéis internos de gestão para o usuário autenticado.
- **FR-006**: O sistema MUST disponibilizar um filtro multisseleção ou por tabs na tela de listagem de orçamentos que permita segmentar os registros por sua situação atual.
- **FR-007**: O sistema MUST implementar um Painel Administrativo que consolide os dados do negócio, contendo gráficos de:
  - Distribuição e quantidade de orçamentos por situação (gráfico de pizza ou rosca).
  - Volume financeiro consolidado faturado por mês (gráfico de barras, baseado na soma total dos orçamentos na situação `completed`).
  - Histórico quantitativo de novos orçamentos criados por dia e por mês (gráfico de linha, agrupado pela data de criação do orçamento, para acompanhamento do crescimento de propostas cadastradas).
- **FR-008**: O sistema MUST permitir a geração, edição e gravação de recibos para orçamentos que estejam na situação `completed` sem travar ou impedir a sua criação por outros critérios.
- **FR-009**: Ao iniciar a criação de um novo recibo, o sistema MUST preencher automaticamente e permitir a edição posterior dos seguintes campos:
  - Título do recibo: Inicializado com o título do orçamento original (se houver).
  - Valor do recibo: Inicializado com o valor total final do orçamento.
  - Forma de pagamento: Inicializada com a forma de pagamento do orçamento.
  - Dados do cliente: Nome/Razão Social, CPF/CNPJ e Telefone do cliente do orçamento.
  - Dados da empresa: Nome, telefone, endereço e logotipo cadastrados no perfil da empresa.
  - Data do recibo: Inicializada com a data corrente do sistema.
- **FR-010**: O sistema MUST disponibilizar no formulário do recibo um campo de texto livre editável para a descrição dos serviços prestados.
- **FR-011**: O layout visual do recibo gerado MUST seguir a seguinte estrutura de apresentação e assinatura:
  - Data de emissão e Valor final em destaque centralizado no topo.
  - Painel com os dados do cliente (Nome/Razão Social, CPF/CNPJ, Telefone).
  - Seção do Serviço Prestado.
  - Seção de Assinaturas contendo exclusivamente campos/linhas estáticas de assinatura física para a empresa (emitente) e para o cliente (destinatário) saírem na visualização do PDF e na impressão.
- **FR-012**: O sistema MUST fornecer recurso de visualização de impressão nativa e download em PDF otimizado tanto para a folha de orçamento quanto para o recibo gerado, ocultando menus, botões de ação e componentes de navegação durante a renderização para impressão.
- **FR-013**: O sistema MUST exigir estrita autenticação e autorização por tenant para a visualização, edição, impressão ou geração de recibos de orçamentos. A funcionalidade anterior de links públicos de acesso sem autenticação (para o cliente visualizar diretamente na web) MUST ser descontinuada e desabilitada.

### Key Entities *(include if feature involves data)*

- **Quote (Orçamento)**: Representa a proposta comercial.
  - Atributos a adicionar/modificar: `status` (enum das novas situações), `cancellation_reason` (motivo de cancelamento, textual, opcional), `draft_saved_at` (timestamp, opcional).
- **QuoteReceipt (Recibo do Orçamento)**: Representa a declaração de quitação e o recibo de pagamento emitido.
  - Atributos:
    - `receipt_number` (código gerado ou sequencial por empresa).
    - `title` (título do recibo, editável).
    - `amount` (valor do recibo, editável).
    - `payment_method` (forma de pagamento, editável).
    - `services_description` (descrição livre dos serviços prestados).
    - `issued_at` (data do recibo).
    - `quote_id` (associação 1:1 com o orçamento original).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O prestador de serviço consegue alternar a situação de um orçamento ou informar um motivo de cancelamento em menos de 5 segundos a partir da tela de detalhes.
- **SC-002**: A lista de orçamentos atualiza instantaneamente ao aplicar filtros de situação, exibindo apenas dados correspondentes.
- **SC-003**: 100% dos orçamentos na situação `completed` geram um recibo válido e imprimível sem erros de formatação.
- **SC-004**: O painel administrativo carrega e renderiza todos os gráficos agregando os dados históricos em menos de 2 segundos.
- **SC-005**: 100% dos PDFs ou impressões geradas de orçamentos e recibos não exibem menus, botões de ação ou elementos administrativos da página.

## Assumptions

- **A-001**: A exclusão de rascunhos remove fisicamente os registros de itens do orçamento correspondentes do banco de dados (cascade delete).
- **A-002**: A moeda padrão para todas as métricas financeiras exibidas no painel administrativo é o Real Brasileiro (BRL).
- **A-003**: O recibo gerado utiliza as mesmas informações de cabeçalho da empresa (logo, nome, contato) já cadastradas nas configurações de perfil do usuário.
- **A-004**: O cálculo do valor por extenso pode ser feito via biblioteca auxiliar do lado do cliente ou formatado de forma simplificada em texto dinâmico.
