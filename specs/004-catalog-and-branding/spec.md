# Feature Specification: Catálogo de Produtos e Serviços e Identidade Visual

**Feature Branch**: `004-catalog-and-branding`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "atualize com base nas mudanças em `.prds/UIRefact.md`"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identidade Visual de Marca Oficial (Priority: P1)

O prestador de serviços deve visualizar os logotipos oficiais da marca OrçaFácil na barra lateral de navegação e o ícone de marca (favicon) na aba do navegador, garantindo uma identidade profissional unificada e consistente em toda a plataforma.

**Why this priority**: A consistência da marca e o alinhamento com o Brandbook são essenciais para que o produto transmita profissionalismo e autoridade logo no primeiro contato do usuário com a plataforma.

**Independent Test**: Abrir o painel da aplicação no computador e conferir a exibição da logo horizontal oficial no topo da barra de navegação esquerda. Colapsar a barra de navegação e verificar se o ícone do símbolo compacto surge. Alternar os temas (claro e escuro) e validar a adequação das cores da logo. Verificar se o favicon correspondente aparece na aba do navegador.

**Acceptance Scenarios**:

1. **Given** que o usuário está no tema claro e a barra lateral de navegação está expandida, **When** a interface carregar, **Then** exibe a logo horizontal oficial desenhada para fundos claros.
2. **Given** que o usuário está no tema claro e a barra lateral de navegação está colapsada, **When** a interface carregar, **Then** exibe apenas o ícone do símbolo oficial desenhado para fundos claros.
3. **Given** que o usuário está no tema escuro e a barra lateral de navegação está expandida, **When** a interface carregar, **Then** exibe a logo horizontal oficial desenhada para fundos escuros.
4. **Given** que o usuário está no tema escuro e a barra lateral de navegação está colapsada, **When** a interface carregar, **Then** exibe apenas o ícone do símbolo oficial desenhado para fundos escuros.
5. **Given** que a aplicação está aberta no navegador, **When** a página for carregada, **Then** exibe o favicon oficial com fundo escuro na aba do navegador.

---

### User Story 2 - Listagem Dinâmica e Filtros do Catálogo (Priority: P1)

O prestador de serviços deve conseguir visualizar de forma limpa e estruturada todos os itens cadastrados no seu catálogo (produtos e serviços), filtrando por categoria ou realizando buscas rápidas pelo nome para encontrar itens em segundos.

**Why this priority**: Um catálogo eficiente e legível é fundamental para a velocidade operacional do usuário, permitindo localizar rapidamente preços e referências antes de adicioná-los a um orçamento.

**Independent Test**: Acessar a página do catálogo, digitar o nome de um item existente na caixa de busca e confirmar que apenas ele é listado. Clicar no botão do filtro de "Serviços" e confirmar que nenhum item do tipo "Produto" continua visível na tabela/lista. Redimensionar a tela para a largura de um smartphone e verificar se a tabela linear é substituída por cards legíveis individuais.

**Acceptance Scenarios**:

1. **Given** que existem itens cadastrados e o usuário está em um computador ou tablet, **When** acessar a página de catálogo, **Then** visualiza uma tabela contendo Nome, Tipo (identificado por badge visual distintiva de Produto ou Serviço), Preço Unitário formatado e Unidade de Medida.
2. **Given** que existem itens cadastrados e o usuário está em um celular (< 768px), **When** acessar a página de catálogo, **Then** visualiza a listagem no formato de cards de toque fácil contendo Nome, Badge de Tipo, Preço e Unidade de Medida, sem scrolls horizontais na tela.
3. **Given** que a listagem de catálogo está aberta, **When** o usuário digitar um termo no campo de busca, **Then** filtra a listagem dinamicamente em tempo real exibindo apenas itens cujos nomes coincidam com o termo.
4. **Given** que a listagem de catálogo está aberta, **When** o usuário selecionar o filtro "Produtos", **Then** exibe apenas produtos, ocultando serviços.

---

### User Story 3 - Cadastro e Edição de Itens com Unidade de Medida (Priority: P1)

O prestador de serviços deve conseguir cadastrar novos produtos e serviços no catálogo definindo opcionalmente a unidade de medida (ex: un, m², h, kg, m) para que os preços façam sentido no orçamento final, e editar itens existentes quando os custos mudarem.

**Why this priority**: Permite que o catálogo armazene as informações corretas e precisas de preço e métrica, evitando digitação manual repetitiva no momento de confeccionar orçamentos e recibos.

**Independent Test**: Abrir o formulário de cadastro de novo item, preencher todos os dados (incluindo o campo opcional de unidade de medida) e salvar. Validar o surgimento do item na listagem. Clicar no botão de edição deste item, alterar a unidade e o preço, salvar e verificar a persistência. Tentar salvar um item sem preencher o nome ou com preço menor que zero e verificar se o sistema exibe mensagens de erro claras e bloqueia o envio. Além disso, alternar a aplicação para o tema escuro, abrir o formulário e validar visualmente se todo o modal do formulário (cabeçalho, corpo, seletor de tipos, inputs e rodapé) se adapta corretamente ao fundo escuro com textos legíveis e alto contraste, sem partes forçadas em branco.

**Acceptance Scenarios**:

1. **Given** que o formulário de novo item está aberto, **When** o usuário preencher Nome (obrigatório), Tipo (obrigatório: Produto ou Serviço), Preço Unitário (obrigatório, positivo) e Unidade de Medida (opcional) e salvar, **Then** o item é adicionado ao catálogo com sucesso.
2. **Given** que o usuário preencheu todos os campos obrigatórios mas deixou a Unidade de Medida vazia, **When** submeter o formulário, **Then** o item é adicionado normalmente, registrando a unidade como nula.
3. **Given** que o formulário de edição de um item está aberto, **When** alterar o preço ou a unidade de medida e salvar, **Then** atualiza as informações do item imediatamente na listagem.
4. **Given** que o usuário tenta salvar um item com Preço Unitário igual a zero ou negativo, **When** submeter o formulário, **Then** exibe um alerta de validação do formulário e impede o salvamento no banco de dados.
5. **Given** que o usuário está no tema escuro, **When** abrir o formulário de cadastro ou edição de item, **Then** renderiza o painel do modal com fundo escuro (`neutral-900`/`color-surface` do modo escuro) e inputs legíveis e estilizados de acordo com as especificações do Design System, sem elementos com fundo branco estático.

---

### User Story 4 - Remoção Segura de Itens (Priority: P2)

O prestador de serviços deve conseguir remover itens obsoletos de seu catálogo de forma ágil, mas com uma etapa de confirmação de segurança para evitar que cliques acidentais excluam dados úteis por engano.

**Why this priority**: Garante que o usuário mantenha o catálogo limpo e atualizado de forma confiável e sem o risco de perda acidental de referências de preços cadastradas.

**Independent Test**: Clicar no botão de remoção (lixeira) de um item. Confirmar se o diálogo de segurança pergunta se o usuário tem certeza. Clicar em "Cancelar" e verificar se o item continua listado. Clicar em "Excluir" e conferir que o item some imediatamente sem recarregar a página manualmente. Validar também que o diálogo de confirmação se adapta ao tema escuro de forma nativa e harmoniosa com as fontes e cores do Design System.

**Acceptance Scenarios**:

1. **Given** que o usuário clicou no ícone de exclusão de um item, **When** a janela modal de confirmação abrir, **Then** exibe uma mensagem clara perguntando se o usuário deseja confirmar a exclusão do item citado.
2. **Given** que o diálogo de confirmação está aberto, **When** o usuário clicar em "Cancelar", **Then** fecha o diálogo de confirmação e mantém o item intacto no catálogo.
3. **Given** que o diálogo de confirmação está aberto, **When** o usuário clicar em "Excluir", **Then** deleta o item do catálogo, fecha o modal, exibe um toast de sucesso e atualiza a listagem dinamicamente.
4. **Given** que o usuário está no tema escuro, **When** clicar no botão de exclusão de um item, **Then** o diálogo de confirmação (Alert Dialog) é renderizado com fundo escuro e textos legíveis de alto contraste, conforme os padrões de cores do modo escuro do Design System.

---

### Edge Cases

- **Exclusão de item usado em orçamentos históricos**: Se um item do catálogo for excluído pelo usuário, os orçamentos emitidos no passado que utilizaram este item não devem ser afetados nem quebrados. As informações do item adicionadas ao orçamento devem ser salvas como cópia histórica estática no orçamento.
- **Quedas temporárias de conectividade de rede**: Se a persistência falhar por problemas de internet ao submeter o formulário de cadastro ou deleção, o sistema deve desabilitar os controles para evitar envios repetidos, exibir uma mensagem amigável de erro informando a falha de conexão e manter o formulário preenchido para que o usuário possa tentar novamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir o logotipo horizontal oficial no cabeçalho da barra de navegação esquerda, variando entre [horizontal-fundo-claro.svg](file:///.DOCS/SVG/horizontal-fundo-claro.svg) (tema claro) e [horizontal-fundo-escuro.svg](file:///.DOCS/SVG/horizontal-fundo-escuro.svg) (tema escuro).
- **FR-002**: O sistema MUST exibir o ícone compacto do logotipo [logo-fundo-claro.svg](file:///.DOCS/SVG/logo-fundo-claro.svg) / [logo-fundo-escuro.svg](file:///.DOCS/SVG/logo-fundo-escuro.svg) no topo da barra de navegação quando a mesma estiver no modo colapsado.
- **FR-003**: O sistema MUST carregar e exibir o favicon oficial [favicon-fundo-escuro.svg](file:///.DOCS/SVG/favicon-fundo-escuro.svg) como o ícone principal da aba do navegador em todas as páginas da aplicação.
- **FR-004**: O sistema MUST disponibilizar uma tela unificada de catálogo em `/app/catalog` contendo busca dinâmica e filtros por tipo de item (Todos, Produtos, Serviços).
- **FR-005**: O sistema MUST renderizar a listagem do catálogo de forma adaptativa: tabela linear em telas desktop/tablet e lista de cards interativos em telas móveis (< 768px).
- **FR-006**: O sistema MUST disponibilizar formulário de cadastro e edição de itens de catálogo contendo os campos: Nome (obrigatório), Tipo (obrigatório: Produto ou Serviço), Preço Unitário (obrigatório, positivo) e Unidade de Medida (opcional).
- **FR-007**: O sistema MUST validar os campos do formulário antes de enviar as mutações para o banco de dados.
- **FR-008**: O sistema MUST apresentar um diálogo modal de confirmação de exclusão (Alert Dialog) antes de deletar de forma definitiva qualquer item do catálogo.
- **FR-009**: O sistema MUST exibir estados de carregamento visual (spinners e skeletons) durante a busca ou salvamento de dados e toasts de feedback imediatos após as ações.

### Key Entities *(include if feature involves data)*

- **Catalog Item**: Representa um produto ou serviço cadastrado e mantido pelo prestador de serviços.
  - *Atributos*: ID (identificador único UUID), Nome (título do produto ou serviço), Tipo (identifica se é um produto ou serviço), Preço Unitário (valor monetário cobrado) e Unidade de Medida (métrica de venda, ex: un, h, m², opcional). Possui relacionamento de posse obrigatório com um Usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário deve conseguir preencher e cadastrar um novo item do catálogo em menos de 20 segundos.
- **SC-002**: Os feedbacks em tela (toasts de sucesso ou alertas de validação) devem aparecer em menos de 200ms após a confirmação das ações.
- **SC-003**: A listagem responsiva móvel (cards) deve carregar de forma fluida sem requerer scroll horizontal em nenhuma tela móvel de no mínimo 320px de largura.
- **SC-004**: Todas as cores aplicadas nos textos, inputs e badges do catálogo e logos devem atender aos contrastes mínimos de legibilidade WCAG AA (taxa de contraste mínima de 4.5:1).

## Assumptions

- O banco de dados Supabase já possui a tabela `catalog_items` criada e protegida por regras de Row Level Security (RLS) por usuário autenticado.
- A exclusão de um item de catálogo remove apenas o seu registro de consulta no catálogo de itens, mantendo preservados e inalterados todos os dados históricos de orçamentos e recibos que já contêm referências físicas (nome/preço) salvas deste item.
- Os SVGs oficiais da marca fornecidos em `.DOCS/SVG/` são compatíveis e corretos.
