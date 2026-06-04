# Feature Specification: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo, Recibos e UI/UX (Linear Style)

**Feature Branch**: `001-budget-lifecycle-dashboard`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "Fiz algumas mudanças sobre melhorias de UI/UX em .prds/AppFeatures.md. Reavalie o documento para regerar o SPEC.md com as alterações necessárias"

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

### User Story 2 - Filtro por Situação na Lista de Orçamentos com UX Melhorada (Priority: P1)

Como prestador de serviços, eu quero filtrar meus orçamentos na tela de listagem de forma limpa e organizada por meio de uma interface integrada (tabs/abas), para que eu consiga encontrar rapidamente orçamentos em andamento ou históricos específicos sem poluição visual.

**Why this priority**: Substitui os filtros soltos que causam má experiência de uso (UX ruim) por uma barra de controle de tabs elegante, essencial para a usabilidade e produtividade diárias.

**Independent Test**: Acessar a listagem de orçamentos, navegar pelas diferentes abas de situação (Rascunho, Pendente, Aprovado, Rejeitado, Cancelado, Finalizado, Todos) e verificar a filtragem reativa e instantânea dos orçamentos correspondentes.

**Acceptance Scenarios**:

1. **Given** que o usuário possui diversos orçamentos cadastrados, **When** ele acessa a tela de listagem de orçamentos, **Then** ele visualiza um componente de abas estilizado estilo Linear App no topo da lista.
2. **Given** que o usuário clica em uma aba específica de situação, **When** a lista é renderizada, **Then** apenas os orçamentos com a situação correspondente são exibidos na listagem.

---

### User Story 3 - Menu de Ações Contextual na Listagem de Orçamentos (Priority: P1)

Como prestador de serviços, eu quero interagir com meus orçamentos diretamente da listagem através de um menu de ações consolidado e dinâmico, para que eu possa imprimir, alterar status, reabrir, excluir rascunhos ou gerar recibos de forma ágil e centralizada.

**Why this priority**: Melhora a eficiência operacional ao evitar que o usuário precise abrir os detalhes de cada orçamento apenas para executar ações rotineiras.

**Independent Test**: Clicar no menu de ações de um orçamento na lista e validar se as opções exibidas são estritamente adequadas ao seu status atual (ex: excluir habilitado apenas para Rascunho, gerar recibo apenas para Finalizado).

**Acceptance Scenarios**:

1. **Given** um orçamento na situação "Rascunho", **When** o usuário abre o menu de ações na lista, **Then** ele visualiza a opção de "Excluir" habilitada e a opção de "Gerar Recibo" oculta ou desabilitada.
2. **Given** um orçamento na situação "Finalizado", **When** o usuário abre o menu de ações na lista, **Then** ele visualiza as opções de "Gerar Recibo" e "Imprimir Orçamento" ativas.
3. **Given** um orçamento expirado/vencido, **When** o usuário abre o menu de ações, **Then** ele visualiza a opção de "Reabrir" para ajustar a validade e retornar o orçamento ao fluxo.

---

### User Story 4 - Visualização Otimizada para Impressão e PDF (Priority: P1)

Como prestador de serviços, eu quero que o orçamento e o recibo sejam exibidos em um layout limpo na visualização do navegador e perfeitamente formatados ao baixar em PDF ou imprimir, ocultando menus, botões de ação e itens de interface administrativa.

**Why this priority**: Crucial para a imagem profissional da empresa perante o cliente final que receberá a via física ou digitalizada sem resíduos de interface de sistema.

**Independent Test**: Clicar em "Imprimir" ou "Baixar PDF" na visualização do orçamento/recibo, abrir a pré-visualização de impressão do sistema operacional e conferir a ausência completa de botões de ações, menu lateral (sidebar) e topo do sistema.

**Acceptance Scenarios**:

1. **Given** que o usuário está na tela de detalhes do orçamento ou do recibo, **When** ele aciona a função de impressão nativa, **Then** as margens e quebras de página do documento impresso se ajustam automaticamente e todos os elementos de navegação lateral, cabeçalho da aplicação e botões administrativos são completamente ocultados.

---

### User Story 5 - Painel Administrativo de Métricas do Negócio (Priority: P2)

Como proprietário do negócio, eu quero visualizar um painel administrativo com gráficos de desempenho e métricas financeiras consolidadas dos meus orçamentos, para que eu possa ter uma visão gerencial e estratégica da saúde financeira da minha empresa.

**Why this priority**: Fornece inteligência de negócios essencial para o crescimento e planejamento da empresa, além de centralizar operações em lote ou de controle.

**Independent Test**: Acessar a rota do Painel Administrativo, validar a renderização correta dos gráficos de barra/rosca/linha com dados agrupados por mês e situação, e utilizar a tabela integrada para exportar o PDF de orçamentos individuais.

**Acceptance Scenarios**:

1. **Given** que o usuário possui orçamentos em diferentes fases e valores no sistema, **When** ele abre o Painel Administrativo, **Then** o sistema exibe cartões com métricas-chave (ex: Total Faturado, Conversão de Orçamentos, Quantidade Emitida) e gráficos interativos que mostram a distribuição, o faturamento e o volume de criação de orçamentos por período.
2. **Given** a listagem de orçamentos dentro do Painel Administrativo, **When** o usuário interage com um orçamento específico, **Then** ele visualiza uma ação direta para baixar ou visualizar o PDF daquele orçamento.

---

### User Story 6 - Geração de Recibo para Orçamentos Finalizados (Priority: P2)

Como prestador de serviços, eu quero gerar um recibo formal para os orçamentos que já foram concluídos e pagos, contendo as informações de quitação e as linhas de assinatura estáticas para impressão e geração de PDF.

**Why this priority**: Importante para formalização de negócios e segurança jurídica do prestador de serviço e do cliente no encerramento da prestação.

**Independent Test**: Abrir um orçamento com a situação "Finalizado", clicar no botão de gerar recibo, preencher ou editar os campos de descrição dos serviços, valor, e testar a geração do PDF/impressão direta do documento contendo as linhas de assinatura para impressão.

**Acceptance Scenarios**:

1. **Given** que um orçamento está na situação "Finalizado", **When** o usuário visualiza seus detalhes no painel logado, **Then** o sistema disponibiliza um botão visível para "Gerar Recibo".
2. **Given** que o usuário clica em "Gerar Recibo", **When** a tela do recibo é renderizada, **Then** o sistema preenche automaticamente o recibo com o valor, a forma de pagamento, a data atual, os dados do cliente e da empresa a partir do orçamento original, e preenche o título do recibo com o título do orçamento (se houver).
3. **Given** a tela de criação/edição do recibo, **When** o usuário revisa as informações, **Then** ele pode editar o título do recibo, alterar o valor final recebido, alterar a forma de pagamento, e digitar a descrição dos serviços prestados, sendo gerado o layout com as linhas estáticas de assinatura para a emissão física/impressão.

---

### User Story 7 - Consistência Visual, Responsividade PWA e Correções de UI/UX (Linear Style) (Priority: P1)

Como usuário do aplicativo (mobile ou desktop), eu quero que toda a interface gráfica tenha um visual consistente e moderno inspirado no Linear App, e que a sidebar não quebre em resoluções menores, para que eu possa usar a ferramenta de qualquer lugar de forma responsiva e agradável.

**Why this priority**: A experiência do usuário e a consistência visual são fundamentais para que a ferramenta passe uma percepção de produto premium. A quebra de layout na sidebar encolhida e a falta de harmonia nos formulários causam atrito severo de uso.

**Independent Test**: Redimensionar a janela do navegador até a largura de mobile e verificar se a sidebar se oculta perfeitamente (tornando-se acessível via menu hambúrguer) e verificar que a sidebar recolhida no desktop mantém alinhamento sem textos ou ícones sobrepostos. Acessar `/app/settings` e conferir se o grid de campos de endereço está idêntico ao do cadastro de clientes.

**Acceptance Scenarios**:

1. **Given** a tela de configurações em `/app/settings`, **When** o usuário visualiza a seção de endereço da empresa, **Then** os inputs e labels seguem exatamente o mesmo alinhamento, grid de colunas e estilo visual dos campos de endereço do formulário de cadastro de clientes.
2. **Given** a página do cliente em `/app/customers/[id]` na aba "orçamentos", **When** a lista de orçamentos do cliente é exibida, **Then** os badges de indicação da situação dos orçamentos utilizam exatamente a mesma cor, tipografia e bordas que os badges da listagem geral `/app/quotes`.
3. **Given** o acesso via dispositivo móvel, **When** o app é carregado, **Then** ele se adapta perfeitamente e oferece suporte para instalação na tela inicial como PWA (Progressive Web App).

### Edge Cases

- **Validade do Orçamento Pendente**: Se um orçamento está como "Pendente" e passa do prazo limite configurado em `valid_until`, ele expira automaticamente. Ele não pode ser alterado para aprovado sem que a ação de "Reabrir" seja acionada para redefinir o prazo.
- **Motivo de Cancelamento Vazio**: O sistema deve bloquear a transição para "Cancelado" se o motivo de cancelamento informado for vazio ou contiver apenas espaços em branco ou menos de 5 caracteres.
- **Restauração de Rascunhos**: Um orçamento que já foi publicado e passou para "Pendente" nunca pode voltar a ser um "Rascunho". Apenas orçamentos que nunca saíram do estado de "Rascunho" podem ser excluídos fisicamente.
- **Acesso Privado Obrigatório**: O sistema deve impedir que qualquer pessoa sem sessão ativa (não autenticada) ou sem permissões de acesso ao tenant proprietário do orçamento visualize as telas de detalhes, impressão ou recibos de qualquer orçamento.
- **Sidebar Recolhida em Desktop**: Quando a sidebar desktop for minimizada/recolhida, o texto descritivo dos itens de menu deve sumir por completo através de transições suaves, mantendo visíveis apenas os ícones centralizados de forma simétrica.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST suportar as seguintes situações para os orçamentos: `draft` (Rascunho), `pending` (Pendente), `approved` (Aprovado), `rejected` (Rejeitado), `cancelled` (Cancelado) e `completed` (Finalizado).
- **FR-002**: O sistema MUST permitir a alteração manual do status do orçamento pelos prestadores de serviço autenticados, respeitando as seguintes transições permitidas:
  - `draft` -> `pending` (ao clicar em "Gerar Orçamento").
  - `pending` -> `approved` ou `rejected`.
  - `approved` -> `completed` ou `cancelled`.
  - Orçamentos expirados (data de validade ultrapassada) -> `draft` ou `pending` (somente via ação "Reabrir", redefinindo a data de validade).
- **FR-003**: O sistema MUST permitir a exclusão física (delete) de orçamentos apenas se eles estiverem na situação `draft`. Orçamentos em qualquer outro status não podem ser deletados, apenas alterados para `cancelled`.
- **FR-004**: O sistema MUST exigir obrigatoriamente a especificação de um motivo textual (comprimento mínimo de 5 caracteres) ao realizar a transição de um orçamento para a situação `cancelled`.
- **FR-005**: O sistema MUST persistir o motivo de cancelamento associado ao orçamento e permitir a sua consulta exclusivamente nos painéis internos de gestão para o usuário autenticado.
- **FR-006**: O sistema MUST disponibilizar um filtro baseado em abas (tabs) no topo da listagem de orçamentos que permita segmentar os registros por sua situação atual de forma rápida e elegante.
- **FR-007**: O sistema MUST implementar um Painel Administrativo que consolide os dados do negócio, contendo gráficos de:
  - Distribuição e quantidade de orçamentos por situação (gráfico de pizza ou rosca).
  - Volume financeiro consolidado faturado por mês (gráfico de barras, baseado na soma total dos orçamentos na situação `completed`).
  - Histórico quantitativo de novos orçamentos criados por dia e por mês (gráfico de linha, agrupado pela data de criação do orçamento, para acompanhamento do crescimento de propostas cadastradas).
- **FR-008**: O sistema MUST permitir a geração, edição e gravação de recibos para orçamentos que estejam na situação `completed`.
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
- **FR-012**: O sistema MUST fornecer recurso de visualização de impressão nativa e download em PDF otimizado tanto para a folha de orçamento quanto para o recibo gerado, ocultando menus, botões de ação e componentes de navegação durante a renderização para impressão usando regras CSS `@media print`.
- **FR-013**: O sistema MUST exigir estrita autenticação e autorização por tenant para a visualização, edição, impressão ou geração de recibos de orçamentos. A funcionalidade anterior de links públicos de acesso sem autenticação (para o cliente visualizar diretamente na web) MUST ser descontinuada e desabilitada.
- **FR-014**: A interface do usuário de toda a aplicação MUST adotar um tema visual elegante e minimalista inspirado no Linear App (tons escuros de background, cinza sutil para bordas, cantos arredondados, fontes limpas e alto contraste tipográfico).
- **FR-015**: O sistema MUST configurar os recursos necessários para o funcionamento como PWA (Progressive Web App), incluindo o manifesto (`manifest.json` / `manifest.webmanifest`), ícones de aplicativos e registro de service worker, permitindo que os usuários instalem o app e tenham uma experiência fluida no mobile.
- **FR-016**: A sidebar principal do painel administrativo MUST ser totalmente responsiva: em dispositivos móveis ela deve ser colapsada por padrão e acionável por menu hambúrguer; no desktop, ao ser recolhida, ela deve reduzir sua largura e ocultar rótulos textuais de forma limpa, mostrando apenas ícones centralizados sem quebrar o layout.
- **FR-017**: Os campos de formulário que representam endereço em `/app/settings` MUST ser redesenhados para compartilhar exatamente a mesma estrutura de layout visual, alinhamento, grid CSS e inputs do formulário de endereço de clientes em `/app/customers`.
- **FR-018**: Os badges indicadores do status do orçamento em `/app/customers/[id]` MUST utilizar os mesmos estilos, cores (baseadas no status) e espaçamento adotados na listagem em `/app/quotes`.
- **FR-019**: A listagem de orçamentos MUST conter um menu de ações contextual em cada linha (usando Dropdown Menu) com opções baseadas na situação do registro para: Imprimir Orçamento, Mudar Status, Reabrir (se vencido), Excluir (somente rascunhos) e Gerar Recibo (somente concluídos).

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

- **SC-001**: O prestador de serviço consegue alternar a situação de um orçamento ou informar um motivo de cancelamento em menos de 5 segundos a partir do menu de ações na lista ou tela de detalhes.
- **SC-002**: A lista de orçamentos atualiza instantaneamente ao alternar as tabs de filtros de situação, exibindo apenas dados correspondentes.
- **SC-003**: 100% dos orçamentos na situação `completed` geram um recibo válido e imprimível sem erros de formatação.
- **SC-004**: O painel administrativo carrega e renderiza todos os gráficos agregando os dados históricos em menos de 2 segundos.
- **SC-005**: 100% dos PDFs ou impressões geradas de orçamentos e recibos não exibem menus, botões de ação ou elementos administrativos da página.
- **SC-006**: A sidebar recolhida no desktop ou visualizada no mobile não apresenta nenhum overflow horizontal ou ícones sobrepostos em 100% dos testes de responsividade.
- **SC-007**: Os campos de endereço na tela de configurações (`app/settings`) e no cadastro de clientes possuem exatamente as mesmas margens, paddings, larguras de coluna e estilos de input.
- **SC-008**: O aplicativo atende aos critérios de PWA (detecção de manifesto e instalabilidade básica do navegador) em dispositivos móveis e desktop.

## Assumptions

- **A-001**: A exclusão de rascunhos remove fisicamente os registros de itens do orçamento correspondentes do banco de dados (cascade delete).
- **A-002**: A moeda padrão para todas as métricas financeiras exibidas no painel administrativo é o Real Brasileiro (BRL).
- **A-003**: O recibo gerado utiliza as mesmas informações de cabeçalho da empresa (logo, nome, contato) já cadastradas nas configurações de perfil do usuário.
- **A-004**: O cálculo do valor por extenso pode ser feito via biblioteca auxiliar do lado do cliente ou formatado de forma simplificada em texto dinâmico.
- **A-005**: A melhoria visual no estilo Linear utilizará as primitivas CSS/Tailwind configuradas na aplicação (Tailwind CSS v4 + shadcn/ui).
