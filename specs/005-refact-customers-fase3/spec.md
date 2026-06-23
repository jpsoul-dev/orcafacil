# Feature Specification: Refatoração do Módulo de Clientes (Fase 3)

**Feature Branch**: `005-refact-customers-fase3`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "especifique as mudanças solicitadas em .prds/UIRefact.md na fase atual Fase3 e com base no documento de .DOCS/Design System - OrcaFacil.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listagem de Clientes Responsiva e Moderna (Priority: P1)

Como prestador de serviços, eu quero visualizar meus clientes cadastrados em uma lista que se adapta automaticamente a telas grandes e pequenas, contendo campo de busca unificada e paginação, para gerenciar meus contatos de forma ágil em qualquer dispositivo.

**Why this priority**: A listagem de clientes é o ponto de partida crítico para visualizar, buscar e gerenciar os dados dos clientes ativos. Ela serve de base direta para as operações cotidianas do negócio.

**Independent Test**: Acessar a tela de listagem de clientes (`/customers`) em um monitor desktop e redimensionar o navegador para resoluções de tablet e celular, verificando a transição automática da tabela para o formato de cards interativos, assim como o funcionamento do filtro de busca em tempo real e da paginação.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a listagem no desktop (largura de tela igual ou superior a 768px), **When** a página carrega, **Then** ele visualiza uma tabela estruturada contendo as colunas: Nome, E-mail, Telefone, Documento (CPF/CNPJ devidamente formatado) e Ações (Editar, Excluir).
2. **Given** que o usuário acessa a listagem no celular (largura de tela inferior a 768px), **When** a página carrega, **Then** a tabela é ocultada e os clientes são exibidos em formato de cards táteis contendo: iniciais em destaque em um avatar circular, Nome, link com atalhos de contato direto (WhatsApp e E-mail) e botão de ações contextuais.
3. **Given** o campo de busca no topo da página, **When** o usuário digita parte do nome, e-mail ou telefone do cliente, **Then** a listagem atualiza dinamicamente em tempo real para exibir apenas os registros correspondentes.
4. **Given** o componente de paginação, **When** a quantidade de clientes excede o limite definido por página, **Then** o sistema exibe os botões de navegação de páginas e o indicador do intervalo atual em relação ao total de resultados (ex: "1–10 de 25 resultados").

---

### User Story 2 - Cadastro e Edição de Clientes com Validação e Máscaras (Priority: P1)

Como prestador de serviços, eu quero cadastrar novos clientes e editar registros existentes por meio de um formulário interativo estruturado, contendo máscaras de preenchimento dinâmico para telefones, CPF/CNPJ e CEP, e validação preventiva de formato, para assegurar a consistência dos dados inseridos no sistema.

**Why this priority**: Evita a poluição do banco de dados com contatos inválidos ou documentos inconsistentes, melhorando drasticamente a confiabilidade dos orçamentos e recibos emitidos posteriormente.

**Independent Test**: Abrir o formulário de criação/edição de clientes, inserir dados parciais em campos obrigatórios ou formatos incorretos em campos de e-mail/documentos e confirmar que o formulário impede o envio exibindo mensagens de erro descritivas, e que as máscaras de digitação funcionam dinamicamente conforme os caracteres são inseridos.

**Acceptance Scenarios**:

1. **Given** o formulário de cadastro, **When** o usuário insere dados no campo de Documento, **Then** o sistema aplica dinamicamente a máscara correspondente, alternando entre o formato de CPF (11 dígitos: `XXX.XXX.XXX-XX`) e o de CNPJ (14 dígitos: `XX.XXX.XXX/XXXX-XX`) e validando a integridade do formato.
2. **Given** os campos obrigatórios (Nome com no mínimo 3 caracteres), **When** o usuário tenta submeter o formulário sem preenchê-los, **Then** a submissão é bloqueada, as bordas dos campos inválidos mudam para a cor vermelha de erro (`danger`) e mensagens instrutivas são exibidas imediatamente abaixo deles.
3. **Given** o preenchimento opcional do endereço, **When** o usuário digita o CEP, **Then** o campo aplica a máscara `XXXXX-XXX` e, nos campos adicionais de Logradouro, Número, Complemento, Bairro, Cidade e UF, as informações são capturadas de forma consistente.
4. **Given** que o usuário submete um formulário válido de cadastro ou edição, **When** a gravação no banco de dados Supabase é concluída com sucesso, **Then** o formulário fecha e um aviso visual flutuante (Toast) de confirmação de sucesso é exibido.

---

### User Story 3 - Perfil e Histórico Detalhado do Cliente (Priority: P2)

Como prestador de serviços, eu quero consultar a página de detalhes de um cliente específico para visualizar suas informações cadastrais completas e acessar, de forma organizada em abas, todo o histórico de orçamentos e recibos associados, para entender o andamento dos serviços e o histórico financeiro com esse cliente.

**Why this priority**: Centraliza a visão comercial do cliente, evitando que o usuário precise buscar transações isoladas em telas de listagem global de orçamentos ou recibos.

**Independent Test**: Acessar a rota de detalhes de um cliente (`/customers/[id]`), verificar se a página apresenta o perfil de forma destacada e clicar em cada aba (Tabs) verificando a correta exibição das tabelas/listas responsivas dos orçamentos e recibos específicos.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa o detalhe de um cliente (`/customers/[id]`), **When** a página é renderizada, **Then** o topo exibe o perfil do cliente com tipografia Sora, exibindo o avatar correspondente e os dados cadastrais primários (Nome, E-mail, Telefone).
2. **Given** as abas de navegação interna (Tabs), **When** o usuário clica na aba "Orçamentos", **Then** é exibida uma tabela ou lista responsiva de todos os orçamentos vinculados àquele cliente, contendo número, data de emissão, valor monetário formatado em Real (R$) e o respectivo Badge de Status oficial de orçamento.
3. **Given** as abas de navegação interna, **When** o usuário clica na aba "Recibos", **Then** é exibida uma lista de recibos emitidos para este cliente, com valor e status.

---

### User Story 4 - Confirmação Preventiva de Exclusão e Feedback UX (Priority: P2)

Como prestador de serviços, eu quero que as ações de exclusão de clientes exijam confirmação explícita por meio de um diálogo de alerta e que o sistema dê feedback visual imediato em todas as interações de mutação de dados, para prevenir exclusões acidentais e saber se minhas requisições estão em processamento.

**Why this priority**: Protege o usuário contra a exclusão acidental de dados de clientes e garante que a interface responda de forma transparente a processos assíncronos.

**Independent Test**: Clicar no botão "Excluir" em um cliente na listagem ou formulário e testar o fechamento e a recusa no diálogo, bem como visualizar o spinner de carregamento ativo no botão de submissão do formulário durante o tempo de resposta do servidor.

**Acceptance Scenarios**:

1. **Given** que o usuário clica na ação de exclusão de um cliente, **When** o comando é disparado, **Then** um diálogo de alerta (Alert Dialog) é exibido na tela contendo uma mensagem clara de confirmação e um aviso caso o cliente possua orçamentos associados. A exclusão física só é processada caso o usuário confirme no botão primário do modal.
2. **Given** que o usuário envia os dados de salvamento ou exclusão, **When** a chamada assíncrona está em execução, **Then** os botões de ação principal exibem um indicador visual de carregamento (spinner) e mudam o texto descritivo correspondente (ex: "Gravando..."), desabilitando interações simultâneas.
3. **Given** que os dados de listagem de clientes ou históricos em detalhes estão sendo carregados do banco de dados, **When** a requisição assíncrona está em andamento, **Then** placeholders com efeito animado (shimmer skeletons) são exibidos no formato dos elementos reais para evitar pulos visuais bruscos na tela.

### Edge Cases

- **Exclusão de Cliente com Orçamentos Ativos**: Caso um usuário solicite a exclusão de um cliente que possui orçamentos pendentes, aprovados ou finalizados ativos no sistema, o diálogo de confirmação (Alert Dialog) deve alertá-lo detalhadamente sobre a dependência dos dados, prevenindo a quebra de integridade referencial no banco de dados.
- **Formulário com Formatos Incompatíveis**: Durante a edição de documentos (CPF/CNPJ) e CEP, se o usuário colar dados pré-existentes contendo caracteres alfa-numéricos extras ou espaços em branco, o sistema deve sanitizar automaticamente a entrada antes de processar a validação Zod.
- **Erros de Conexão ou Falhas no Supabase**: Caso a gravação no banco de dados falhe (por exemplo, devido a queda na conexão de rede do celular), a interface de carregamento do botão deve ser desfeita, o formulário deve permanecer aberto com os dados digitados intactos e um Toast de erro (`danger`) persistente deve avisar o usuário sobre a falha técnica para que tente novamente.
- **Entradas Nulas no Perfil e Fallback de Avatar**: Se o cliente cadastrado não possuir e-mail ou telefone informados, a listagem e os detalhes devem renderizar traços estruturais limpos ("—") ou textos secundários de apoio em cinza (`neutral-500`). Se o cliente não possuir foto ou informações completas para gerar o avatar, as duas primeiras iniciais de seu nome em caixa alta devem ser geradas como avatar sobre o fundo neutro circular.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST carregar e priorizar a tipografia Sora em todas as variações de texto, títulos, rótulos e valores monetários das telas de clientes.
- **FR-002**: A listagem de clientes MUST ser responsiva: exibir uma tabela de múltiplas colunas no desktop (largura >= 768px) e colapsar automaticamente em uma lista de cards verticais ergonômicos no mobile (largura < 768px).
- **FR-003**: Os cards de clientes no mobile MUST exibir o avatar com as iniciais do cliente, seu nome e botões de atalho rápido de toque direto para chamada ou WhatsApp e envio de e-mail.
- **FR-004**: A listagem de clientes MUST dispor de uma barra de busca rápida unificada no topo da página, filtrando dinamicamente os registros por correspondência de nome, e-mail ou telefone.
- **FR-005**: O formulário de cadastro e edição de clientes MUST ser integrado com validações de dados (Nome obrigatório com no mínimo 3 caracteres; E-mail opcional com formato válido) e apresentar máscaras de preenchimento em tempo real para CPF/CNPJ (alternância dinâmica), telefone e CEP.
- **FR-006**: A persistência e recuperação das informações de clientes MUST ser conectada às tabelas do Supabase (`customers`), garantindo isolamento total por usuário autenticado através do ID ativo (`user_id`).
- **FR-007**: A tela de detalhes do cliente (`app/customers/[id]`) MUST apresentar o perfil em destaque e abas (Tabs) responsivas de navegação interna ("Orçamentos" e "Recibos").
- **FR-008**: Na aba de orçamentos do cliente, a listagem de registros associados MUST renderizar os valores financeiros em moeda local (R$) e exibir Badges de Status oficiais de orçamento conforme a paleta e os estados de negócio (Pendente, Aprovado, Rejeitado, Cancelado e Finalizado).
- **FR-009**: A exclusão de clientes cadastrados MUST ser protegida por um diálogo de confirmação (Alert Dialog), bloqueando cliques acidentais e emitindo um aviso detalhado se houver orçamentos vinculados ao registro.
- **FR-010**: A interface de clientes MUST utilizar animações de carregamento (shimmer skeletons) durante a recuperação assíncrona dos dados e spinners de processamento em botões durante mutações no banco de dados.
- **FR-011**: O design de todas as telas de clientes (listagem, formulário, detalhes) MUST ser integrado ao sistema de temas (claro e escuro) utilizando os tokens semânticos de cores estabelecidos no Design System:
  - Fundo padrão da página: Claro (`#F8FAFC`) | Escuro (`#0A0E16`).
  - Superfícies (Cards e Modais): Claro (`#FFFFFF`) | Escuro (`#111827`).
  - Bordas e divisores: Claro (`#E2E8F0`) | Escuro (`#1E293B`).
  - Texto primário: Claro (`#111827`) | Escuro (`#F8FAFC`).
  - Texto secundário/Apoio: Claro (`#6B7280`) | Escuro (`#94A3B8`).
  - Cor de ação primária: Claro (`#1E5EFF`) | Escuro (`#5C87FF`).
- **FR-012**: O escopo desta fase MUST ficar restrito ao módulo de Clientes, permanecendo bloqueadas contra modificações as telas globais de orçamentos e recibos gerais, painéis de estatísticas do dashboard principal e a configuração offline do PWA.

### Key Entities *(include if feature involves data)*

- **Customer (Cliente)**: Entidade que representa os dados cadastrais do cliente do prestador de serviços.
  - Atributos: `id` (UUID), `user_id` (UUID - proprietário/tenant), `name` (Texto, obrigatório), `email` (Texto, opcional), `phone` (Texto, opcional), `document` (Texto, opcional - CPF ou CNPJ), `zip_code` (Texto, opcional), `street` (Texto, opcional), `number` (Texto, opcional), `complement` (Texto, opcional), `neighborhood` (Texto, opcional), `city` (Texto, opcional), `state` (Texto, opcional), `created_at` (Timestamp).
- **Budget (Orçamento)**: Entidade de orçamentos vinculados ao cliente (usada para exibir histórico e validação de exclusão).
  - Atributos: `id` (UUID), `customer_id` (UUID - chave estrangeira), `value` (Decimal/Dinheiro), `status` (Enum de status: pendente, aprovado, rejeitado, cancelado, finalizado), `created_at` (Timestamp).
- **Receipt (Recibo)**: Entidade de recibos vinculados ao cliente (usada para exibir histórico).
  - Atributos: `id` (UUID), `customer_id` (UUID - chave estrangeira), `value` (Decimal/Dinheiro), `created_at` (Timestamp).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes de responsividade em resoluções comuns (`320px`, `375px`, `414px`, `768px`, `1024px` e `1440px`), as telas de listagem e detalhe de clientes não apresentam desalinhamentos, scrolls laterais indesejados ou quebras de leiaute.
- **SC-002**: O tempo máximo de alternância temática (claro/escuro) e atualização visual dos componentes do Módulo de Clientes é inferior a 150ms.
- **SC-003**: 100% das áreas de toque nos cards e botões mobile (incluindo links de WhatsApp/Telefone diretos) respeitam a área tátil mínima de 44x44px.
- **SC-004**: O contraste visual de todos os textos informativos, rótulos de formulário e Badges de Status atende ao nível de conformidade WCAG AA (proporção mínima de 4.5:1).
- **SC-005**: 100% das tentativas de exclusão de clientes contendo orçamentos vinculados ativos disparam adequadamente o aviso descritivo no Alert Dialog.
- **SC-006**: A submissão do formulário de cadastro/edição e validação do lado do cliente via regras Zod apresenta um feedback instantâneo (abaixo de 100ms) em caso de erro nos dados.

## Assumptions

- **A-001**: O banco de dados já possui as tabelas `customers`, `budgets` e `receipts` estruturadas e com relacionamentos de chaves estrangeiras configurados, necessitando apenas da integração dos fluxos das novas rotas de Clientes.
- **A-002**: As políticas de Row Level Security (RLS) já estão ativas no Supabase para garantir que cada usuário autenticado consiga consultar e modificar apenas seus respectivos registros de clientes.
- **A-003**: Os atalhos rápidos de contato direto no celular (WhatsApp e ligação) funcionam por meio de links de protocolos nativos (ex: `https://wa.me/...` ou `tel:...`), dependendo da presença de aplicativos compatíveis ou operadoras de telefonia no dispositivo móvel do usuário.
- **A-004**: A fonte Sora está devidamente carregada e acessível em todo o projeto.
