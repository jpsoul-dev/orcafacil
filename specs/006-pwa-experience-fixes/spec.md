# Feature Specification: PWA Mobile Experience Improvements

**Feature Branch**: `006-pwa-experience-fixes`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "analise a aplicação e melhorias solicitadas em pwa-audit-report.md para criar a especificação. Os arquivos .png dos icones necessários para as melhorias são android-chrome-192x192.png android-chrome-512x512.png e apple-touch-icon.png"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Header and Footer Screen Area Optimization on Mobile (Priority: P1)

Como um prestador de serviços gerando orçamentos no smartphone, eu quero preencher o formulário de orçamento sem que cabeçalhos e rodapés fixos ocupem a tela inteira quando o teclado virtual abrir, para que eu possa visualizar o que estou digitando e ter uma digitação fluida.

**Why this priority**: É o principal ponto de fricção na usabilidade mobile diagnosticado no relatório. Sem esta otimização, o formulário de orçamento fica praticamente inutilizável em telas pequenas.

**Independent Test**: Pode ser totalmente testado ao abrir a rota `/app/quotes/new` no celular com o teclado virtual ativo, verificando que cabeçalhos globais e rodapés fixos gigantes não competem com a área de digitação.

**Acceptance Scenarios**:

1. **Given** o usuário está acessando `/app/quotes/new` ou `/app/quotes/[id]/edit` no mobile (`max-sm`), **When** a página é renderizada, **Then** o cabeçalho global do layout (`AppLayout`) é ocultado e apenas a AppBar mobile interna do formulário fica visível no topo.
2. **Given** o usuário está no mobile, **When** o formulário é renderizado, **Then** o botão principal "Gerar/Salvar" é movido para o canto superior direito da AppBar e o botão de voltar/cancelar fica no canto superior esquerdo, e não há barra de botões fixa empilhada no rodapé inferior (as ações normais de rodapé fluem com a página ou ficam ocultas para mobile).

---

### User Story 2 - PWA Installation Configuration & Assets Setup (Priority: P2)

Como um usuário frequente do Orça Fácil, eu quero adicionar o aplicativo à tela inicial do meu celular com o ícone oficial opaco do PWA, para que eu possa abri-lo instantaneamente como se fosse um aplicativo nativo (sem a barra de endereços do navegador).

**Why this priority**: Crucial para a "instalabilidade" e identidade de marca em smartphones Android e iOS. Garante que a aplicação satisfaça os critérios dos navegadores para sugerir instalação.

**Independent Test**: Pode ser testado abrindo o app no Chrome em um dispositivo Android ou no Safari no iOS, selecionando "Adicionar à Tela de Início" e verificando que o ícone oficial opaco do app é instalado sem erros de manifesto.

**Acceptance Scenarios**:

1. **Given** o arquivo `manifest.ts` e o cabeçalho global, **When** o navegador audita o app para PWA, **Then** os ícones PNG de `192x192` e `512x512` na pasta public são carregados com sucesso e não ocorrem erros de asset ausente (como o antigo `/icon.svg`).
2. **Given** o app é visualizado em um dispositivo iOS, **When** o usuário opta por adicionar o site à tela de início, **Then** a meta-tag `apple-touch-icon` carrega a imagem oficial PNG opaca e o app abre em modo standalone sem barra do Safari.

---

### User Story 3 - Preventing Zoom and Optimizing Input Usability (Priority: P2)

Como um prestador de serviços digitando valores monetários, eu quero focar nos campos de preço e desconto e digitar rapidamente sem que o Safari do iOS realize zoom automático e desalinhe a tela, e que o teclado numérico adequado seja aberto de primeira.

**Why this priority**: Melhora significativamente a experiência diária de preenchimento de propostas, evitando interações irritantes com zooms automáticos do navegador que quebram o alinhamento visual.

**Independent Test**: Testado no Safari mobile ao tocar nos inputs de preço unitário e desconto; a tela mantém o zoom original e abre o teclado de entrada numérica decimal.

**Acceptance Scenarios**:

1. **Given** o usuário está no celular e foca em qualquer input de texto do formulário, **When** o teclado abre, **Then** a viewport não sofre zoom automático (todos os inputs têm pelo menos 16px de font-size em mobile).
2. **Given** o usuário foca no input de preço unitário ou de desconto, **When** o teclado é ativado, **Then** o sistema operacional exibe o teclado numérico/decimal (`inputmode="decimal"`).

---

### User Story 4 - Touch Targets Optimization (Priority: P3)

Como um usuário com dedos grandes operando o celular em movimento, eu quero tocar nos botões de exclusão de item, edição de desconto e ajuda sem errar a área de toque ou acionar outros elementos por engano.

**Why this priority**: Melhora a ergonomia tátil móvel, evitando erros comuns que irritam o usuário durante o preenchimento de orçamentos.

**Independent Test**: Testado ao clicar no ícone de lixeira do item e botões de desconto/ajuda na tela de toque, validando se são responsivos e se a área ativa segue a diretriz mínima de 44px.

**Acceptance Scenarios**:

1. **Given** o usuário está no mobile, **When** ele tenta clicar no botão de exclusão de item (`Trash2`), **Then** o botão tem um diâmetro de área de toque de pelo menos 44px.
2. **Given** o usuário quer editar o desconto ou ver a ajuda, **When** os botões correspondentes são apresentados, **Then** suas áreas internas de toque invisíveis (padding) ou visuais somam pelo menos 44px para evitar toques incorretos.

---

### User Story 5 - Dialog Catalog to Drawer (Bottom Sheet) Transition (Priority: P3)

Como um usuário selecionando produtos do catálogo no mobile, eu quero que a busca abra como um painel inferior deslizante de baixo para cima (Drawer), para que seja fácil interagir com uma mão.

**Why this priority**: Fornece uma experiência de uso do polegar muito mais ergonômica no mobile, alinhada com as melhores práticas de apps nativos (App Shell / Bottom Sheets).

**Independent Test**: Ao tocar em catálogo no mobile, abre-se uma gaveta inferior deslizável em vez de um modal centralizado.

**Acceptance Scenarios**:

1. **Given** o usuário está no mobile, **When** ele clica para abrir o catálogo de itens, **Then** o modal de busca desliza de baixo para cima da tela em formato Bottom Sheet.
2. **Given** o usuário está em um dispositivo desktop, **When** ele clica no catálogo, **Then** o modal clássico centralizado de busca continua a ser exibido normalmente.

---

### User Story 6 - Basic Service Worker Offline Support (Priority: P3)

Como um profissional em trânsito com conectividade instável, eu quero poder carregar a casca do app (App Shell) mesmo estando offline, para que eu saiba que o sistema está disponível em vez de ver uma tela de erro de rede do navegador.

**Why this priority**: A resiliência offline é essencial para consolidar a usabilidade nativa do PWA em locais com pouca internet (obras, garagens, subsolos).

**Independent Test**: Colocar o navegador em modo offline e atualizar a página principal `/app`; a interface carrega os elementos essenciais (cabeçalhos, menu) localmente a partir do cache do service worker.

**Acceptance Scenarios**:

1. **Given** o navegador está offline, **When** o usuário abre a aplicação, **Then** o Service Worker intercepta e serve a casca da página a partir do cache local, evitando a tela de erro de conexão.

### Edge Cases

- **Sem internet ao salvar**: Caso a conexão caia no exato momento de clicar em salvar, o sistema não deve limpar o formulário. Ele avisa o usuário da falta de rede amigavelmente e retém os dados do orçamento no formulário.
- **Transição dinâmica de cabeçalhos**: Se a rota do formulário for acessada diretamente por URL ou por navegação de link interna, as regras de CSS que ocultam o cabeçalho global do `AppLayout` no mobile devem ser aplicadas imediatamente e sem causar flash de visualização ou desconfiguração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST ocultar o cabeçalho de navegação do layout global (`AppLayout`) nas rotas de criação (`/app/quotes/new`) e edição (`/app/quotes/[id]/edit`) quando visualizado em dispositivos móveis (`max-sm`).
- **FR-002**: A AppBar del formulário de orçamento no mobile MUST conter botões táteis no topo para Salvar (lado direito) e Voltar (lado esquerdo), eliminando a necessidade da barra fixa gigante de ações no rodapé.
- **FR-003**: O arquivo `manifest.ts` MUST expor ícones PNG nos tamanhos `192x192` (com `purpose: "maskable"`) e `512x512` (com `purpose: "any"`), vinculados aos arquivos existentes `/android-chrome-192x192.png` e `/android-chrome-512x512.png`.
- **FR-004**: O layout global da aplicação (`layout.tsx`) MUST incluir no `<head>` a tag `apple-touch-icon` apontando para o arquivo existente `/apple-touch-icon.png` (`sizes: "180x180"`), habilitar o modo standalone do iOS e configurar o viewport com `viewport-fit=cover` e `user-scalable=no`.
- **FR-005**: Todos os inputs de formulário nas rotas móveis MUST possuir um tamanho de fonte de pelo menos 16px (`text-base`) para evitar o zoom automático do iOS Safari, podendo reduzir para `sm:text-sm` (14px) em telas maiores.
- **FR-006**: Os campos de preço unitário e desconto monetário MUST possuir o atributo `inputmode="decimal"` para acionar o teclado numérico correspondente em dispositivos móveis.
- **FR-007**: Os elementos clicáveis no mobile (lixeira de exclusão, botão de editar desconto global e ícone de popover de ajuda) MUST possuir uma área de toque ativa de no mínimo 44px × 44px.
- **FR-008**: O seletor de catálogo no mobile MUST ser renderizado usando um componente `Drawer` (Bottom Sheet) deslizante que sobe a partir da base da tela, enquanto em desktop mantém o `Dialog` centralizado.
- **FR-009**: O aplicativo MUST registrar um Service Worker básico na inicialização, configurando estratégias simples de pre-caching dos assets do App Shell e suporte a fallback offline.

### Key Entities

Não se aplica. Este recurso foca puramente em melhorias de experiência de usuário (UX) e instalabilidade do PWA sobre a base existente do formulário de orçamentos, sem adicionar novas entidades de banco de dados ou tabelas físicas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O prompt de instalabilidade do PWA atinge 100% de conformidade técnica nas ferramentas de auditoria padrão (Chrome DevTools Lighthouse PWA Audit).
- **SC-002**: Redução de no mínimo 30% no tempo médio gasto por usuários mobile para adicionar múltiplos itens e salvar um orçamento (estimado via simulação de teclado numérico nativo e ausência de zoom Safari).
- **SC-003**: 100% da área do formulário em edição permanece visível/acessível acima do teclado móvel virtual aberto em uma simulação de tela mobile padrão (360x640px).
- **SC-004**: Zero toques incorretos acidentais ao operar botões secundários (como a lixeira de itens e a edição de descontos) em telas de toque menores.

## Assumptions

- Os arquivos `/android-chrome-192x192.png`, `/android-chrome-512x512.png` e `/apple-touch-icon.png` já estão localizados no diretório `public/` e têm fundos opacos e resoluções corretas.
- O componente `Drawer` da biblioteca `vaul` está disponível no projeto (ou configurado no shadcn).
- O feedback tátil (`navigator.vibrate`) existente será preservado e integrado com os novos botões superiores móveis.
- As estilizações móveis adicionais seguirão rigidamente o Design System do Orca Fácil (`Design-System-OrcaFacil.md` e `DESIGN_TOKENS.md`).
