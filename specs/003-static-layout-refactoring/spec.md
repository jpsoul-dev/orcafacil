# Feature Specification: Componentes Globais Estáticos e Refatoração de Layout

**Feature Branch**: `003-static-layout-refactoring`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Preciso que realize as mudanças solicitadas pelos stackholders em .prds/UIRefact.md , conforme as restrições de escopo inicial. Também os asrquivso .DOCS/Design System - OrcaFacil.md e .DOCS/Brandbook OrcaFacil V.2.md que fazem parte da documentação disponibilizada"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Header Global Estético e Alinhado com a Marca (Priority: P1)

Como prestador de serviços, eu quero um cabeçalho global limpo e estilizado com a tipografia Sora, que exiba o nome do meu negócio em destaque, o indicador de seção (breadcrumb) e os botões de ações utilitárias (configurações, toggle de tema, notificações), para que eu me oriente facilmente e configure o app em qualquer página.

**Why this priority**: O cabeçalho é a interface visual primária de todas as telas em desktop e tablet. Ele orienta o usuário e consolida as ações de contexto geral da aplicação.

**Independent Test**: Carregar a aplicação em qualquer tela de desktop ou tablet e verificar o alinhamento do Breadcrumb, o nome da empresa à direita, a tipografia Sora e os botões de ação utilitária (configurações, toggle de tema, notificações) com espaçamentos adequados.

**Acceptance Scenarios**:

1. **Given** que o usuário está logado e acessa o painel do sistema, **When** o cabeçalho global é renderizado no desktop, **Then** ele exibe a árvore de navegação (breadcrumb) alinhada à esquerda, a tipografia Sora é aplicada a todos os textos do cabeçalho e, à direita, são exibidos o nome do negócio e os botões utilitários de configurações, toggle de tema e notificações.
2. **Given** o acesso via desktop ou tablet, **When** o cabeçalho global é renderizado, **Then** ele não exibe o avatar do usuário nem dados do perfil individual do profissional (estes permanecem restritos à Sidebar).

---

### User Story 2 - Sidebar de Navegação com Perfil e Avatar (Desktop/Tablet) (Priority: P1)

Como usuário de desktop ou tablet, eu quero que a sidebar lateral utilize a tipografia Sora, a paleta de cores da marca e mostre de forma consistente a logo do OrçaFácil, as opções de navegação principal e, no rodapé, o meu avatar e dados de perfil (nome e e-mail) com um menu de ações rápidas, para que eu possa navegar com clareza e gerenciar minha sessão com facilidade.

**Why this priority**: É a navegação principal da versão desktop/tablet. A clareza visual e os estados de hover/ativo guiam o usuário em sua rotina de trabalho.

**Independent Test**: Navegar pelas opções da sidebar em telas com largura igual ou superior a 768px, testando os efeitos visuais de hover em itens inativos e verificando se o item ativo exibe a borda vertical esquerda e as cores de marca de forma correta.

**Acceptance Scenarios**:

1. **Given** que o usuário passa o mouse sobre um item inativo da sidebar, **When** o cursor entra na área de toque, **Then** o item exibe um background de hover sutil com transição rápida de 120ms.
2. **Given** o rodapé da sidebar (SidebarFooter), **When** renderizado, **Then** ele exibe a foto do avatar do usuário (ou as iniciais se não houver foto) ao lado de seu nome e e-mail, e um botão de menu (ex: reticências verticais) que aciona o dropdown para "Gerenciar conta" e "Sair da conta".

---

### User Story 3 - Tab Bar de Navegação Inferior para Dispositivos Móveis (Priority: P1)

Como prestador de serviços em campo acessando o sistema pelo celular, eu quero que a sidebar lateral suma e seja substituída por uma Tab Bar fixa na base da tela com atalhos de toque fáceis de alcançar, incluindo o meu avatar para gerenciar minha conta, para que eu possa navegar pela aplicação com apenas uma mão.

**Why this priority**: Crucial para a filosofia Mobile-First da marca, removendo quebras de layout e garantindo usabilidade ergonômica em trânsito no smartphone.

**Independent Test**: Redimensionar o navegador para resoluções de tela menores que 768px de largura e verificar se a sidebar desktop desaparece por completo e se a Tab Bar inferior fixa surge na base da tela contendo as 4 opções de acesso, incluindo a opção de "Minha Conta" representada pelo avatar do usuário.

**Acceptance Scenarios**:

1. **Given** que o usuário está acessando o app em um celular com resolução de tela inferior a 768px, **When** a aplicação carrega, **Then** a sidebar lateral é completamente ocultada do layout e a Tab Bar inferior fixa é exibida na base da tela.
2. **Given** que a Tab Bar inferior está visível, **When** o usuário navega, **Then** ele visualiza exatamente 4 atalhos táteis de navegação rápida: Dashboard, Orçamentos, Recibos e Minha Conta (esta última exibindo o avatar do usuário e abrindo o modal ou menu de gerenciamento de perfil e configurações de logout).

---

### User Story 4 - Adaptação Temática e Modo Escuro no Layout Estrutural (Priority: P2)

Como usuário que utiliza a ferramenta à noite ou em ambientes com pouca luz, eu quero que o cabeçalho, a sidebar e a tab bar mobile inferior se adaptem automaticamente aos modos claro e escuro usando a paleta semântica oficial de marca, para evitar cansaço visual e manter o contraste correto.

**Why this priority**: Garante consistência de marca em qualquer ambiente e assegura a conformidade do layout de navegação estrutural com o design de alta qualidade exigido pelos stakeholders.

**Independent Test**: Alternar o tema do sistema usando a ação rápida correspondente no cabeçalho e verificar visualmente se as cores de fundo, bordas, textos e ícones de todos os elementos globais mudam instantaneamente para os tons correspondentes sem quebras ou desalinhamentos.

**Acceptance Scenarios**:

1. **Given** que o modo escuro está ativo na aplicação, **When** as telas são renderizadas, **Then** o fundo global utiliza a cor Grafite Profundo (`#0A0E16`), as superfícies elevadas (como sidebar e header) utilizam a cor Grafite (`#111827`), e os divisores de borda utilizam o cinza escuro (`#1E293B`).
2. **Given** que o modo escuro está ativo, **When** um item de navegação é marcado como ativo, **Then** a cor do texto e do ícone muda para Azul Claro (`#5C87FF`) e o fundo apresenta um realce azulado translúcido para garantir contraste e legibilidade ideais.

### Edge Cases

- **Redimensionamento Dinâmico de Tela**: Se o usuário alternar a orientação do dispositivo (paisagem/retrato) ou redimensionar a janela do navegador cruzando a fronteira de 768px de largura, o layout deve readequar-se instantaneamente, exibindo apenas a sidebar (se >= 768px) ou apenas a Tab Bar inferior (se < 768px), sem que ambas fiquem visíveis ao mesmo tempo.
- **Navegabilidade de Foco por Teclado**: Ao utilizar navegação por teclado (tecla Tab), o indicador visual de foco (focus outline) deve ser exibido de forma nítida ao redor de cada botão de ação rápida no Header e de cada item da Sidebar/Tab Bar inferior, utilizando um anel de foco azul com offset.
- **Tratamento de Nome de Usuário Curto ou Nulo**: Se o nome do usuário cadastrado na conta for nulo, vazio ou possuir apenas um caractere, o avatar de iniciais do rodapé da sidebar (desktop) e da tab bar inferior (mobile) deve exibir um caractere fallback padrão (ex: "U") centralizado, sem quebras na forma circular do componente.
- **Estado de Carregamento Inicial do Usuário (Hydration/Auth)**: Durante a inicialização da aplicação, enquanto os dados do perfil do usuário estão sendo carregados do banco de dados, a sidebar e a tab bar inferior devem exibir placeholders estáticos (efeito shimmer ou cinza sólido) na área do avatar e nome para mitigar "pulos" de layout repentinos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST carregar e priorizar a tipografia Sora em todos os componentes de navegação global, cabeçalho e sidebar da aplicação.
- **FR-002**: A Sidebar de navegação lateral MUST ser exibida em telas com largura igual ou superior a 768px e possuir largura fixa de 260px.
- **FR-003**: A Sidebar de navegação lateral MUST ser completamente ocultada em telas menores que 768px.
- **FR-004**: O sistema MUST renderizar uma Tab Bar de navegação inferior fixa na base da tela em resoluções menores que 768px, contendo exatamente 4 botões de destino: Dashboard, Orçamentos, Recibos e Minha Conta.
- **FR-005**: A opção "Minha Conta" na Tab Bar mobile inferior MUST renderizar o avatar do usuário (ou ícone correspondente) e abrir o modal de gerenciamento de perfil.
- **FR-006**: Os botões da Tab Bar inferior mobile e as opções da Sidebar MUST possuir uma área de clique/toque de pelo menos 44x44px.
- **FR-007**: O Header global da aplicação MUST conter o controle lateral (SidebarTrigger) e o indicador de navegação (AppBreadcrumb) à esquerda, o nome da empresa e os botões utilitários de configurações, toggle de tema e notificações à direita.
- **FR-008**: O rodapé da Sidebar (SidebarFooter) MUST conter o avatar do usuário (exibindo a foto de perfil do usuário logado e, caso não esteja disponível, as iniciais de seu nome em caixa alta sobre fundo cinza neutro circular), o nome e o e-mail do profissional, e um menu de ações rápidas ("Gerenciar conta" e "Sair da conta").
- **FR-009**: Os itens de navegação (Sidebar e Tab Bar mobile) MUST exibir os seguintes estados visuais:
  - **Hover**: Background com tom de cinza suave (`#F1F5F9` no claro / `#1E293B` no escuro) com tempo de transição de 120ms.
  - **Ativo**: Texto e ícone em Azul Primário (`#1E5EFF` no claro / `#5C87FF` no escuro). Na sidebar desktop, deve exibir adicionalmente uma borda vertical de destaque esquerda de 2px a 3px em Azul Primário.
- **FR-010**: O layout estrutural (Header, Sidebar e Tab Bar) MUST ser integrado ao sistema de temas, alternando dinamicamente suas cores conforme os tokens semânticos:
  - **Fundo**: Claro (`#F8FAFC`) | Escuro (`#0A0E16`).
  - **Superfície**: Claro (`#FFFFFF`) | Escuro (`#111827`).
  - **Borda**: Claro (`#E2E8F0`) | Escuro (`#1E293B`).
  - **Texto Principal**: Claro (`#111827`) | Escuro (`#F8FAFC`).
  - **Texto Secundário**: Claro (`#6B7280`) | Escuro (`#94A3B8`).
- **FR-011**: O escopo desta refatoração MUST ser exclusivamente visual e estático, permanecendo bloqueadas contra quaisquer alterações as tabelas de listagem de dados (Data Tables), painéis de gráficos de dashboard, formulários de criação/edição, manifesto PWA offline e implementação de toasts ou skeletons dinâmicos.

### Key Entities *(include if feature involves data)*

- **Profile (Perfil do Usuário)**: Entidade existente contendo dados cadastrais do profissional logado.
  - Atributos lidos nesta fase: `full_name` (usado para gerar as iniciais do avatar fallback) e `avatar_url` (caminho da imagem de foto de perfil).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes de redimensionamento e rotação de tela entre 320px e 1440px de largura, o layout estrutural e a navegação se adaptam dinamicamente sem gerar transbordamento (overflow) de elementos ou barras de rolagem horizontais.
- **SC-002**: A alternância entre temas claro e escuro atualiza visualmente todos os elementos estáticos globais (Header, Sidebar, Tab Bar inferior) em menos de 200ms.
- **SC-003**: 100% das áreas táteis dos botões de navegação na Tab Bar inferior mobile possuem dimensões iguais ou superiores a 44x44px.
- **SC-004**: O contraste visual de todos os links, textos e ícones da navegação em ambos os temas (claro e escuro) atende à taxa mínima de 4.5:1 exigida pelo nível WCAG AA.
- **SC-005**: A transição visual dos itens de menu (hover e clique) ocorre em até 120ms, eliminando sensação de atraso na interação.

## Assumptions

- **A-001**: A fonte Sora é carregada globalmente na aplicação via importação de fontes da web no layout raiz.
- **A-002**: O alternador de tema utiliza a injeção da classe `.dark` no elemento HTML de raiz e está integrado com o estado geral de controle de temas.
- **A-003**: As rotas dos links de navegação global (Dashboard, Orçamentos, Recibos, Minha Conta) já existem na estrutura do projeto e apenas apontam para seus respectivos caminhos estáticos.
- **A-004**: As ações rápidas de notificações e configurações utilizam ícones estáticos com placeholders ou tooltips informativos, tendo sua lógica de dados adiada para fases futuras de integração de recursos.
