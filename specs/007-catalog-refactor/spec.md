# Feature Specification: Catalog Refactoring & Improvements

**Feature Branch**: `007-catalog-refactor`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "preciso especificar as melhorias solicitada no documento dos stackholder em @[.prds/catalog-refact.md]"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read-Only Item details Sheet & Management Actions (Priority: P1)

Como usuário do Orca Fácil, desejo que, ao clicar em um item do catálogo, seja aberto um painel (sheet) em modo leitura com os detalhes do item, permitindo-me selecionar se desejo editar ou excluir o item de forma segura.

**Why this priority**: Evita cliques e edições acidentais diretamente no formulário de cadastro, proporcionando uma visualização limpa e organizada dos dados do produto ou serviço antes de qualquer modificação.

**Independent Test**: Clicar em um produto na lista do catálogo abre o sheet contendo todos os detalhes cadastrados sem nenhum campo de escrita ativo. Clicar no botão ou opção de editar abre o formulário no mesmo local. Clicar em deletar abre uma confirmação e, se confirmada, exclui o item.

**Acceptance Scenarios**:

1. **Given** que o usuário está na rota `/app/catalog`, **When** ele clica em um item da lista, **Then** um painel lateral (sheet) é aberto exibindo os dados do item (nome, descrição, tipo, preço, unidade de medida) em modo somente leitura.
2. **Given** que o painel de visualização está aberto no desktop, **When** o usuário olha para o cabeçalho do painel, **Then** ele vê os botões "Editar" e "Deletar" alinhados à direita do cabeçalho.
3. **Given** que o painel de visualização está aberto no mobile, **When** o usuário visualiza o topo direito do painel, **Then** as ações "Editar" e "Deletar" estão agrupadas em um menu dropdown acionado por um ícone de três pontos verticais (`⋮`).
4. **Given** que o painel de visualização está aberto, **When** o usuário clica em "Editar", **Then** o painel de visualização é substituído diretamente pelo formulário de edição na mesma interface, sem empilhamento de painéis.
5. **Given** que o painel de visualização está aberto, **When** o usuário clica em "Deletar", **Then** um diálogo (dialog) de confirmação é exibido perguntando se ele deseja prosseguir com a exclusão.

---

### User Story 2 - Modernized Clean List Layout & Sticky Header (Priority: P1)

Como usuário do Orca Fácil, desejo visualizar a lista de itens em uma estrutura simples de linhas separadas por divisores sutis (sem wrappers de cards volumosos) e com o cabeçalho da página fixo no topo ao rolar a tela, para facilitar a leitura e navegação rápida.

**Why this priority**: Esta é a principal melhoria de layout solicitada para simplificar a interface de catálogo, eliminando o ruído visual de cartões duplicados e otimizando o scroll infinito de itens.

**Independent Test**: Ao acessar a página, rolar para baixo e certificar-se de que o cabeçalho com o botão de criação permanece fixo no topo. Verificar visualmente se a listagem de itens usa divisores simples no lugar de cartões e se exibe badge neutro para tipo, preço alinhado à direita e o chevron `›`.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa o catálogo com muitos itens cadastrados, **When** ele rola a página para baixo, **Then** o cabeçalho (Título e botão "Novo item" no desktop) permanece fixado no topo da tela (`sticky top-0`).
2. **Given** que o usuário visualiza a lista de itens, **When** ele analisa a estrutura visual, **Then** não existem cartões (cards) contendo a lista ou a barra de busca, e cada item é separado por uma linha divisória simples.
3. **Given** um item na listagem, **When** exibido em tela, **Then** a linha mostra o nome do item destacado à esquerda, um badge de tipo ("Produto" ou "Serviço") neutro e sutil em abaixo do nome, o valor formatado (ex: `R$ 2,20/m`, `R$ valor/unidade de medida abreviada`) alinhado à direita, e um chevron discreto (`›`) à extrema direita.

---

### User Story 3 - Comprehensive Filtering & Sorting (Priority: P2)

Como usuário do Orca Fácil, desejo filtrar itens por tipo (Produto e/ou Serviço) e ordená-los por diferentes critérios através de um painel de filtros dedicado, visualizando chips removíveis para os filtros ativos logo abaixo da busca.

**Why this priority**: Essencial para a usabilidade e busca rápida em catálogos com grande volume de dados.

**Independent Test**: Clicar no botão "Filtros", alterar o tipo para "Serviço" e a ordenação para "Maior preço", clicar em "Aplicar", ver a lista ser reordenada e filtrada, observar os chips correspondentes e removê-los clicando em seus respectivos botões `×`.

**Acceptance Scenarios**:

1. **Given** que o usuário clica em "Filtros", **When** o painel de filtros é aberto, **Then** ele exibe seleção múltipla para Tipo (checkboxes "Produto" e "Serviço") e seleção única para Ordenação (radio buttons: A-Z, Z-A, Maior preço, Menor preço).
2. **Given** que o painel de filtros está aberto, **When** o usuário clica em "Limpar", **Then** todas as opções de filtragem e ordenação retornam ao estado padrão (ambos os tipos marcados e ordenação por A-Z).
3. **Given** que o usuário aplicou filtros não-padrão, **When** ele visualiza a tela principal, **Then** chips com o nome dos filtros ativos (ex: `[ Produto × ]`) e o botão `[ Limpar filtros ]` aparecem logo abaixo da barra de busca.
4. **Given** que existem chips de filtros ativos na tela, **When** o usuário clica no `×` de um chip ou em `[ Limpar filtros ]`, **Then** o filtro correspondente é removido e a lista é atualizada imediatamente sem precisar reabrir o painel.

---

### User Story 4 - Strict Form Validation, Mobile Keyboards & Sanitization (Priority: P2)

Como usuário do Orca Fácil, desejo que o formulário de cadastro/edição me auxilie a preencher os dados corretamente abrindo o teclado adequado no celular, validando a obrigatoriedade da unidade de medida e sanitizando as entradas contra dados inválidos ou HTML malicioso.

**Why this priority**: Garante consistência de dados no banco, proteção contra injeções ou tags indesejadas de HTML no frontend, e melhora a UX móvel no campo financeiro.

**Independent Test**: No mobile, focar no campo de valor unitário e verificar o teclado decimal/numérico. Tentar salvar um item sem unidade de medida e certificar-se de ver o erro de validação. Inserir dados com HTML e espaços extras e verificar se a sanitização remove-os antes de gravar.

**Acceptance Scenarios**:

1. **Given** que o usuário está no mobile acessando o formulário de itens, **When** ele foca no campo "Valor Unitário", **Then** o teclado exibido pelo sistema operacional é o numérico/decimal.
2. **Given** o formulário de criação/edição de item, **When** o usuário tenta salvar sem selecionar uma unidade de medida, **Then** o formulário impede o envio e exibe um alerta indicando a obrigatoriedade do campo.
3. **Given** que o usuário digita um nome ou descrição com espaços extras nas extremidades ou tags HTML (ex: `<script>` ou `<b>`), **When** ele submete o formulário, **Then** os dados são sanitizados (trim e remoção/escape de HTML) antes de serem enviados à API.
4. **Given** que o usuário digita um valor unitário inválido ou negativo, **When** ele tenta submeter, **Then** o validador Zod do formulário rejeita a submissão e exibe feedback de erro.

---

### User Story 5 - Native Mobile UI Alignment (Priority: P2)

Como usuário de dispositivos móveis do Orca Fácil, desejo que o cabeçalho e os principais botões de ação se adaptem ao padrão nativo do aplicativo para melhor manuseio com uma só mão.

**Why this priority**: Melhora a ergonomia móvel e a consistência visual com os demais fluxos da plataforma.

**Independent Test**: Acessar o catálogo em um dispositivo mobile, verificar que o título "Catálogo" reside no header superior de navegação da aplicação e o botão "Novo item" está fixo na base (no lugar da barra de navegação inferior).

**Acceptance Scenarios**:

1. **Given** a exibição em viewport mobile, **When** o usuário olha para a tela de catálogo, **Then** o título "Catálogo" não é exibido no corpo da página, mas sim integrado ao header nativo superior de navegação do app.
2. **Given** a exibição em viewport mobile, **When** o painel de filtros é aberto, **Then** ele ocupa 100% da largura da tela (`w-full`).
3. **Given** a visualização da listagem no mobile, **When** o usuário visualiza a base da tela, **Then** o botão "Novo item" é exibido como um botão fixo horizontal estendido localizado no lugar da barra de navegação inferior (tab bar).

---

### User Story 6 - Compact Pill Notifications (Priority: P3)

Como usuário do Orca Fácil, desejo receber feedbacks de ações de salvamento, edição e deleção por meio de notificações compactas no rodapé central da tela para confirmar minhas ações de forma discreta e elegante.

**Why this priority**: Substitui alertas intrusivos ou modais repetitivos de sucesso por uma notificação fluida e consistente em todo o módulo de catálogo.

**Independent Test**: Salvar, editar ou deletar um item e observar o surgimento de um toast em formato de pílula na parte inferior central, que some automaticamente após ~2 segundos.

**Acceptance Scenarios**:

1. **Given** que o usuário realiza uma operação de sucesso (criar, editar ou deletar), **When** a ação é concluída, **Then** uma notificação compacta em formato de pílula (pill toast) surge na parte inferior central da tela.
2. **Given** a exibição da pill notification, **When** se passam 2 segundos de exibição, **Then** ela desaparece suavemente por meio de uma animação de saída.
3. **Given** que ocorre uma falha na operação do banco, **When** o erro é retornado, **Then** uma pill notification vermelha (variante de erro) exibe uma mensagem amigável contendo o erro.

### Edge Cases

- **Sem filtros selecionados no Tipo**: Se o usuário desmarcar os checkboxes de "Produto" e "Serviço" no painel de filtros e aplicar, a listagem deve exibir uma tela de estado vazio (Empty State) correspondente e adequado, ou reverter para a exibição de ambos (aqui assumiremos a exibição de uma lista vazia com mensagem informativa "Nenhum tipo selecionado"). E no chips de filtro, motre [nenhum x] ou algo do genero.
- **Exclusão de item em uso**: Caso um usuário tente deletar um item do catálogo que esteja associado a um orçamento ou recibo existente, a deleção falhará no banco devido a restrições de chave estrangeira. A interface deve interceptar este erro e mostrar uma pill toast vermelha informando que o item está vinculado a orçamentos e não pode ser removido.
- **Transição de Visualização para Edição**: No mobile, quando o usuário abre o dropdown de três pontos no sheet de leitura e clica em "Editar", o sheet de visualização deve fechar imediatamente antes do sheet de formulário de edição abrir para evitar cintilações na UI ou empilhamento.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE abrir um sheet de visualização em modo leitura ao clicar em qualquer item da listagem.
- **FR-002**: O sheet de visualização DEVE exibir os seguintes dados do item: nome,descrição, tipo (produto/serviço), valor unitário e unidade de medida.
- **FR-003**: No desktop, as ações "Editar" e "Deletar" DEVEM ser exibidas como botões individuais alinhados à direita do cabeçalho do sheet de visualização.
- **FR-004**: No mobile, as ações "Editar" e "Deletar" DEVEM ser agrupadas em um menu dropdown de três pontos verticais (`⋮`) no canto superior direito do sheet de visualização.
- **FR-005**: Ao acionar "Editar" no sheet de visualização, o formulário de edição correspondente DEVE substituir o sheet ativo sem empilhar múltiplos sheets.
- **FR-006**: Ao acionar "Deletar" no sheet de visualização, o sistema DEVE abrir um diálogo de confirmação solicitando a confirmação do usuário antes de realizar a chamada à API.
- **FR-007**: O campo "Unidade de Medida" no formulário de cadastro/edição DEVE ser obrigatório.
- **FR-008**: O campo "Valor Unitário" no formulário DEVE possuir atributos de input que forcem o teclado numérico/decimal em dispositivos móveis (`inputMode="decimal"` ou similar).
- **FR-009**: O sistema DEVE sanitizar e validar os dados de formulário antes do envio: remover espaços excedentes (trim) no nome e descrição, validar que o valor unitário é um número positivo válido (não NaN), e limpar/escapar caracteres especiais de HTML no nome e na descrição.
- **FR-010**: A listagem de itens do catálogo DEVE ser reestruturada para remover wrappers de cartões (cards) e ser renderizada como uma lista simples com divisores horizontais.
- **FR-011**: O cabeçalho com título e botão de adição (no desktop) DEVE ser fixado no topo da página (`sticky top-0`) com scroll independente do conteúdo.
- **FR-012**: O botão de filtros DEVE abrir um painel de filtros lateral (no desktop) ou w-full (no mobile), contendo checkboxes para os tipos (Produto, Serviço) e radio buttons para ordenação (A-Z, Z-A, Maior preço, Menor preço).
- **FR-013**: Chips indicativos dos filtros ativos DEVEM aparecer abaixo da barra de busca apenas quando houver filtros aplicados diferentes dos valores padrão (todos os tipos ativos e ordenação A-Z).
- **FR-014**: Cada chip de filtro ativo DEVE possuir um botão `×` que, ao ser clicado, remove aquele filtro individualmente e recarrega a listagem.
- **FR-015**: Um chip com a legenda "Limpar filtros" DEVE ser exibido ao final da lista de chips ativos para redefinir todos os filtros ao padrão de uma só vez.
- **FR-016**: O sistema DEVE exibir as mensagens de retorno da API de catálogo utilizando notificações em formato de pílula (pill toasts) fixadas na parte inferior central da viewport.
- **FR-017**: No mobile, o título principal da página de catálogo DEVE ser removido da área de conteúdo e acoplado ao header superior de navegação da aplicação.
- **FR-018**: No mobile, o botão "Novo item" DEVE ser fixado no rodapé da viewport, no lugar da barra de navegação inferior (tab bar).

### Key Entities

- **CatalogItem**: Representa um item cadastrado no catálogo do usuário.
  - *Attributes*: ID (UUID), Tenant ID (UUID), Name (Text), Type (Enum: Produto/Serviço), Unit Price (Numeric/Float), Unit of Measure (Text/Enum), Description (Text, optional), Created At (Timestamp).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo necessário para realizar uma filtragem combinada e ordenação no catálogo deve ser menor que 4 segundos.
- **SC-002**: Reduzir a zero o número de solicitações de suporte devido a exclusões ou alterações acidentais de produtos no catálogo através da introdução do sheet de leitura intermediário e do diálogo de confirmação.
- **SC-003**: 100% dos dados enviados pelo formulário do catálogo devem ser sanitizados e validados com Zod no frontend antes de atingirem as tabelas do banco de dados, prevenindo dados poluídos com tags HTML ou strings vazias.
- **SC-004**: A listagem e os painéis de filtros devem ser responsivos, adaptando-se a larguras de tela de 320px (mobile) até 1440px+ (desktop) sem quebra de elementos ou overflow horizontal.

## Assumptions

- Os valores do select de Unidades de Medida já estão definidos no componente original da aplicação e serão reutilizados para fins de validação e exibição.
- O aplicativo já conta com uma barra de navegação inferior (tab bar) integrada para dispositivos móveis, e o botão "Novo item" irá substituí-la/ocultá-la nesta rota específica do catálogo.
- O banco de dados do Supabase possui políticas de RLS ativas para a tabela de itens, vinculando cada operação ao tenant do usuário autenticado.
