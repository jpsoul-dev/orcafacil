---
name: OrçaFácil Design System
description: Sistema visual de alta densidade e precisão inspirado na simplicidade técnica de Linear, Stripe e Notion.
colors:
  primary: "#1E5EFF"
  primary-hover: "#1648D6"
  neutral-bg: "#F8FAFC"
  neutral-surface: "#FFFFFF"
  neutral-border: "#E2E8F0"
  neutral-text: "#111827"
  status-pending-fg: "#92400E"
  status-pending-bg: "#FEF3C7"
  status-approved-fg: "#15803D"
  status-approved-bg: "#DCFCE7"
  status-rejected-fg: "#B91C1C"
  status-rejected-bg: "#FEE2E2"
  status-cancelled-fg: "#475569"
  status-cancelled-bg: "#F1F5F9"
  status-completed-fg: "#0F766E"
  status-completed-bg: "#CCFBF1"
typography:
  display:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: OrçaFácil

## 1. Overview

**Creative North Star: "The Precision Workbench"**

O design system do OrçaFácil foi concebido para expressar profissionalismo técnico, agilidade e clareza. Inspirado na simplicidade refinada e precisão estética de ferramentas como Linear, Stripe e Notion, o sistema prioriza layouts limpos, tipografia otimizada e foco absoluto no conteúdo de negócio. Cada tela deve comunicar eficiência imediata ao microempreendedor que a utiliza e total confiança ao cliente final que recebe o orçamento.

Rejeitamos ativamente elementos decorativos redundantes ou excessos comuns no SaaS moderno, como degradês chamativos, sombras pesadas do tipo "ghost-card" ou cantos exageradamente arredondados sem motivo funcional.

**Key Characteristics:**
- **Alta Densidade de Informação**: Layouts compactos e organizados para rápida escaneabilidade das listagens e valores de orçamentos.
- **Hierarquia Visual Rigorosa**: Uso preciso de pesos de fonte, tamanhos e cores neutras para diferenciar títulos, metadados e conteúdos de apoio.
- **Ações Primárias Controladas**: No máximo uma ação primária em destaque por contexto visual, concentrando o foco do usuário no fluxo de decisão.
- **Mobilidade em Campo**: Estruturas de layout pensadas mobile-first para operação ágil e toque preciso na rua ou em ambientes de trabalho.

## 2. Colors

A paleta cromática do OrçaFácil é ancorada pelo Azul Primário para ações e links e por uma escala rica de Neutros (Grafite), permitindo excelente contraste e suporte nativo ao modo escuro. Os estados de orçamento possuem cores semânticas dedicadas que comunicam o status imediatamente.

### Primary
- **Primary Blue** (#1E5EFF): Usado para botões de ação primária, links ativos e elementos de foco no modo claro.
- **Primary Blue Hover** (#1648D6): Usado para estados de hover e active de botões e links primários.

### Neutral
- **White** (#FFFFFF): Superfície de cards, modais e fundos elevados no modo claro.
- **Off-White (App Background)** (#F8FAFC): Fundo base da aplicação no modo claro.
- **Muted Surface** (#F1F5F9): Fundo de linhas de tabela no hover, inputs em repouso e áreas secundárias.
- **Border** (#E2E8F0): Divisores de seção e bordas de inputs no modo claro.
- **Ink Text (Primary)** (#111827): Grafite escuro para textos principais e títulos, garantindo legibilidade absoluta.
- **Muted Text (Secondary)** (#6B7280): Texto de apoio, placeholders e metadados secundários.

### Status (Budget & Receipts)
- **Pendente (Pending)** (fg: #92400E, bg: #FEF3C7): Tom âmbar, indicando aguardo de ação do cliente sem alarmismo.
- **Aprovado (Approved)** (fg: #15803D, bg: #DCFCE7): Tom verde positivo, reservado exclusivamente para orçamentos validados pelo cliente.
- **Rejeitado (Rejected)** (fg: #B91C1C, bg: #FEE2E2): Tom vermelho nítido e inequívoco de recusa.
- **Cancelado (Cancelled)** (fg: #475569, bg: #F1F5F9): Tom cinza-azulado discreto, representando orçamentos arquivados ou fora do fluxo de negócios.
- **Finalizado (Completed)** (fg: #0F766E, bg: #CCFBF1): Tom teal, distinguindo-se claramente das ações e do verde de aprovação.

**The Status Contrast Rule.** Nunca utilize a cor base do status (ex: #F59E0B) para renderizar texto sobre fundos claros. Sempre utilize o respectivo token de texto `-fg` em combinação com a respectiva cor de fundo `-bg`.

## 3. Typography

**Display Font:** System Sans-Serif (`var(--font-sans)`, system-ui)
**Body Font:** System Sans-Serif (`var(--font-sans)`, system-ui)

A tipografia do OrçaFácil é altamente funcional e limpa, utilizando variações de peso e escala para organizar dados densos sem sobrecarregar a tela.

### Hierarchy
- **Display** (Bold, clamp(2.5rem, 6vw, 4rem), line-height 1.2, letter-spacing -0.03em): Usado exclusivamente para títulos principais e grandes destaques numéricos.
- **Headline** (Bold, 20px / 1.3): Cabeçalhos de seção e títulos de modais grandes.
- **Title** (SemiBold, 16px / 1.4): Títulos de cards, linhas de cabeçalho de tabelas e grupos de inputs.
- **Body** (Regular, 14px / 1.5): Texto padrão da aplicação, listagens e descrições de itens. O comprimento máximo recomendado de linhas para leitura é 65–75ch.
- **Label** (Medium, 12px / 1.4): Identificação de inputs, metadados de orçamentos e subtítulos de apoio.

**The Letter-Spacing Floor Rule.** Cabeçalhos em display ou headlines nunca devem possuir um letter-spacing menor do que -0.04em. Letras que se tocam criam um aspecto comprimido e de difícil leitura.

## 4. Elevation

O OrçaFácil utiliza profundidade funcional por meio de sombras intencionais para representar a hierarquia de camadas na aplicação, evitando decorações desnecessárias.

### Shadow Vocabulary
- **Card Shadow (Small)** (`box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)`): Usado em cartões na tela principal no modo claro.
- **Overlay Shadow (Medium)** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`): Dropdowns, popovers, e menus de contexto.
- **Modal Shadow (Large)** (`box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`): Modais, painéis laterais (Sheets) e toasts de notificação.

**The Flat-By-Default Rule.** Superfícies da aplicação são chapadas por padrão no plano de fundo. Sombras só são introduzidas para indicar interatividade e componentes temporários que flutuam sobre a interface.

## 5. Components

### Buttons
- **Shape:** Cantos levemente arredondados com 12px de raio (`--radius-md`).
- **Primary:** Fundo Azul Primário (#1E5EFF), texto branco, com padding de 10px vertical e 16px horizontal.
- **Hover / Focus:** Transição de cores suave de 120ms (`--ds-motion-fast`). No hover, escurece para Azul Primário Hover (#1648D6).
- **Secondary / Outline:** Borda de 1px na cor do divisor (#E2E8F0), texto escuro (#111827), hover com fundo cinza sutil (#F1F5F9).

### Badges / Status Pills
- **Style:** Fundo tintado claro e texto contrastante (seguindo as regras de Status).
- **Shape:** Formato pílula (raio de 9999px), com padding de 4px vertical e 10px horizontal.

### Cards / Containers
- **Corner Style:** Raio de 12px (`--radius-md`) para cards padrão; 16px (`--radius-lg`) para painéis principais ou visualizações de PDF.
- **Style:** Fundo branco sólido (#FFFFFF) com borda fina de 1px (#E2E8F0) e sombra sutil `shadow-sm`.

### Inputs / Fields
- **Style:** Borda de 1px (#E2E8F0), fundo cinza muito sutil em repouso (#F1F5F9), cantos arredondados com 8px (`--radius-sm`).
- **Focus:** No foco, a borda muda para o Azul Primário (#1E5EFF) com um anel de destaque sutil.

## 6. Do's and Don'ts

### Do:
- **Do** utilizar a escala padrão de espaçamento do design system (4, 8, 12, 16, 24, 32, 48, 64, 96px) para paddings e margins.
- **Do** restringir a presença de botões de ação primária a no máximo um por contexto visual de tela.
- **Do** aplicar o componente `QuoteStatusBadge` para qualquer exibição de estado de orçamento ou recibo de forma unificada.
- **Do** truncar nomes de clientes e títulos longos usando reticências (`...`) para preservar o alinhamento em tabelas densas.

### Don't:
- **Don't** aplicar bordas coloridas com espessura maior que 1px nas laterais esquerda ou direita de cards ou badges ("side-stripe borders").
- **Don't** usar degradês em textos ou elementos interativos para fins puramente decorativos.
- **Don't** misturar uma borda de 1px com uma sombra suave maior que 16px no mesmo elemento (evitar o padrão "ghost-card" amador).
- **Don't** utilizar kicker/eyebrows (pequenos rótulos em caixa alta com espaçamento largo) acima do título de todas as seções por mero preenchimento estético.
- **Don't** aplicar cantos arredondados gigantescos (24px ou mais) em cards médios ou inputs de texto.
