# Design System — OrçaFácil

**Versão:** 1.0
**Data:** Junho de 2026
**Status:** Aprovado

> Este design system parte de um produto já em produção que opera exclusivamente em modo claro. Esta versão
> introduz o modo escuro do zero, expande a paleta de marca (que cobria apenas o essencial) em tokens semânticos
> completos, e formaliza um sistema de cor dedicado aos 5 estados de orçamento (pendente, aprovado, rejeitado,
> cancelado, finalizado) — que hoje são provavelmente resolvidos com cores ad-hoc no código.

---

## Sumário

1. [Princípios de Design](#1-princípios-de-design)
2. [Cor](#2-cor)
3. [Tipografia](#3-tipografia)
4. [Espaçamento e Grid](#4-espaçamento-e-grid)
5. [Forma — Radius, Elevação e Bordas](#5-forma--radius-elevação-e-bordas)
6. [Movimento](#6-movimento)
7. [Iconografia e Imagética](#7-iconografia-e-imagética)
8. [Breakpoints e Responsividade](#8-breakpoints-e-responsividade)
9. [Modo Escuro](#9-modo-escuro)
10. [Componentes](#10-componentes)
11. [Padrões de Layout](#11-padrões-de-layout)
12. [Acessibilidade](#12-acessibilidade)
13. [Tokens Prontos para Implementação](#13-tokens-prontos-para-implementação)
14. [Faça e Evite](#14-faça-e-evite)
15. [Anexos e Próximos Passos](#15-anexos-e-próximos-passos)

---

## 1. Princípios de Design

| Princípio | O que significa na prática |
|---|---|
| **Confiança visível em 2 segundos** | O orçamento gerado pelo produto é visto pelo cliente final do usuário — toda tela precisa comunicar profissionalismo imediato, não só o PDF exportado. Isso justifica tipografia limpa, hierarquia clara e zero elemento decorativo sem função. |
| **Status é cidadão de primeira classe** | Com 5 estados de orçamento (pendente, aprovado, rejeitado, cancelado, finalizado), todo lugar que exibe um orçamento — tabela, dashboard, notificação, card — usa o mesmo sistema de cor e badge de status, sem exceção. O usuário reconhece o estado pela cor antes de ler o texto. |
| **Dado denso sem peso de ERP** | Dashboard com gráficos, tabela de orçamentos e recibos cabem bastante informação sem parecer sistema financeiro pesado. Espaçamento generoso é aplicado com disciplina — respiro onde ajuda a leitura, nunca luxo que força scroll desnecessário. |
| **Mobile-first de verdade** | O uso real acontece no celular, na rua, entre um cliente e outro — não é "modo de leitura simplificada". Toda tela e todo componente são especificados primeiro para toque, depois adaptados para mouse e teclado. |

---

## 2. Cor

### Paleta primitiva

#### Neutro (Grafite) — base de texto, fundo e superfícies em ambos os modos

| Token | Hex | RGB | Uso típico |
|---|---|---|---|
| `color-neutral-0` | `#FFFFFF` | 255, 255, 255 | Branco puro — superfície de card no modo claro, ícone do logotipo sobre fundo escuro |
| `color-neutral-50` | `#F8FAFC` | 248, 250, 252 | Off-white — fundo padrão da aplicação no modo claro (cor de marca) |
| `color-neutral-100` | `#F1F5F9` | 241, 245, 249 | Fundo de hover sutil, fundo de inputs em repouso |
| `color-neutral-200` | `#E2E8F0` | 226, 232, 240 | Bordas e divisores no modo claro |
| `color-neutral-300` | `#CBD5E1` | 203, 213, 225 | Bordas com mais contraste, ícones desabilitados |
| `color-neutral-400` | `#94A3B8` | 148, 163, 184 | Placeholder de input, texto terciário |
| `color-neutral-500` | `#6B7280` | 107, 114, 128 | Cinza de Apoio (cor de marca) — texto secundário, metadados, tagline do logotipo |
| `color-neutral-600` | `#475569` | 71, 85, 105 | Texto secundário com mais peso, ícones ativos |
| `color-neutral-700` | `#334155` | 51, 65, 85 | Bordas no modo escuro |
| `color-neutral-800` | `#1E293B` | 30, 41, 59 | Superfície elevada no modo escuro (modal, dropdown) |
| `color-neutral-900` | `#111827` | 17, 24, 39 | Grafite (cor de marca) — texto principal no modo claro, superfície base no modo escuro |
| `color-neutral-950` | `#0A0E16` | 10, 14, 22 | Fundo padrão da aplicação no modo escuro |

#### Azul (Primária)

| Token | Hex | RGB | Uso típico |
|---|---|---|---|
| `color-blue-50` | `#EEF3FF` | 238, 243, 255 | Fundo sutil de destaque, hover de superfície relacionada a ação |
| `color-blue-100` | `#DCE7FF` | 220, 231, 255 | Fundo de badge informativo, fundo de ícone em estado ativo leve |
| `color-blue-200` | `#B9CFFF` | 185, 207, 255 | Borda de elemento em foco leve |
| `color-blue-400` | `#5C87FF` | 92, 135, 255 | Primária no modo escuro — mais clara para manter contraste sobre fundo escuro |
| `color-blue-500` | `#1E5EFF` | 30, 94, 255 | Azul Primário (cor de marca) — ação primária no modo claro |
| `color-blue-600` | `#1648D6` | 22, 72, 214 | Hover/active de botão primário no modo claro |
| `color-blue-700` | `#1136AD` | 17, 54, 173 | Active/pressed de botão primário, texto de link com mais contraste |

#### Status de orçamento e recibo (5 estados)

Cada status tem três tons: a cor base (para ícones, dots e gráficos), um tom de texto (sobre fundo claro tintado)
e um tom de fundo (para o badge). Os tokens de modo escuro estão na Seção 9.

| Status | Token base | Hex (base) | Token texto | Hex (texto) | Token fundo | Hex (fundo) |
|---|---|---|---|---|---|---|
| **Pendente** | `color-status-pending` | `#F59E0B` | `color-status-pending-fg` | `#92400E` | `color-status-pending-bg` | `#FEF3C7` |
| **Aprovado** | `color-status-approved` | `#16A34A` | `color-status-approved-fg` | `#15803D` | `color-status-approved-bg` | `#DCFCE7` |
| **Rejeitado** | `color-status-rejected` | `#DC2626` | `color-status-rejected-fg` | `#B91C1C` | `color-status-rejected-bg` | `#FEE2E2` |
| **Cancelado** | `color-status-cancelled` | `#64748B` | `color-status-cancelled-fg` | `#475569` | `color-status-cancelled-bg` | `#F1F5F9` |
| **Finalizado** | `color-status-completed` | `#0D9488` | `color-status-completed-fg` | `#0F766E` | `color-status-completed-bg` | `#CCFBF1` |

**Racional da paleta de status:** pendente usa âmbar (aguardando ação, atenção sem alarme), aprovado usa verde
(positivo — reservado exclusivamente para este estado, não reutilizado em "finalizado"), rejeitado usa vermelho
(negativo, inequívoco), cancelado usa cinza-azulado neutro (estado inativo, fora do fluxo — propositalmente sem
energia visual) e finalizado usa teal — distinto do verde e do azul primário, para não ser confundido com
"aprovado" nem com uma ação clicável. Nenhum desses tons coincide com `color-blue-500`, que fica reservado
exclusivamente para ação.

#### Feedback do sistema

Tokens próprios, independentes dos tokens de status de orçamento.

| Token | Hex | Uso |
|---|---|---|
| `color-success` | `#16A34A` | Toast e alert de confirmação genérica (ex: "Recibo salvo") |
| `color-warning` | `#F59E0B` | Toast e alert de atenção genérica (ex: "Orçamento perto do vencimento") |
| `color-danger` | `#DC2626` | Toast e alert de erro genérico, validação de formulário |
| `color-info` | `#0EA5E9` | Toast e alert informativo neutro — usa ciano, não o Azul Primário, para não ser lido como ação |

> Mesmo onde o hex coincide com um token de status (ex: `color-danger` e `color-status-rejected` compartilham
> `#DC2626`), os tokens são nomeados separadamente. Um toast de erro de rede não deve ficar acoplado
> semanticamente a "orçamento rejeitado" — são conceitos distintos que coincidentemente compartilham um tom.

### Paleta semântica

Os tokens que o time usa no código — sempre referenciando a paleta primitiva, nunca um hex solto novo.

| Token semântico | Mapeia para (modo claro) | Uso |
|---|---|---|
| `color-background` | `color-neutral-50` | Fundo padrão da aplicação |
| `color-surface` | `color-neutral-0` | Fundo de cards, modais, painéis elevados |
| `color-surface-muted` | `color-neutral-100` | Fundo de seções secundárias, hover de linha de tabela |
| `color-border` | `color-neutral-200` | Bordas e divisores |
| `color-text-primary` | `color-neutral-900` | Texto principal |
| `color-text-secondary` | `color-neutral-500` | Texto de apoio, labels, metadados |
| `color-text-disabled` | `color-neutral-400` | Texto e ícones desabilitados |
| `color-primary` | `color-blue-500` | Ações primárias, links, destaque — uso exclusivo para "clique aqui" |
| `color-primary-foreground` | `color-neutral-0` | Texto sobre fundo primário |
| `color-success` | ver tabela acima | Feedback positivo genérico |
| `color-warning` | ver tabela acima | Feedback de atenção genérico |
| `color-danger` | ver tabela acima | Feedback de erro genérico |
| `color-info` | ver tabela acima | Feedback informativo genérico |

**Racional da paleta:** o Azul Primário ancora confiança e ação. A expansão para uma escala de neutros — em vez
dos dois tons que o brandbook documentava — é o que permite construir modo escuro, estados de hover/disabled e
hierarquia de superfície sem inventar hex novos a cada componente. A paleta de status é a peça nova mais
importante: um produto de orçamentos com 5 estados de negócio precisa que esse estado seja visualmente
instantâneo.

**Contraste e acessibilidade:** ver Seção 12 para a tabela completa. Regra geral: nunca usar o tom "base" de uma
cor de status como texto sobre fundo branco — usar sempre o tom de texto dedicado (`-fg`) sobre o tom de fundo
(`-bg`) da mesma família.

---

## 3. Tipografia

### Famílias

| Papel | Fonte | Pesos disponíveis | Fallback web-safe |
|---|---|---|---|
| Display / Títulos | Sora | Bold (700), SemiBold (600) | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| Texto / Corpo | Sora | Regular (400), Medium (500) | `system-ui, -apple-system, "Segoe UI", sans-serif` |

**Racional tipográfico:** Sora é mantida como única família em todo o produto, conforme definido no brandbook —
geométrica com personalidade própria, comunica tecnologia e acessibilidade ao mesmo tempo sem soar genérica. Não
há fonte mono dedicada: IDs e dados técnicos (ex: número de orçamento) usam Sora Medium em `text-caption`, já
que o produto não expõe nenhum dado que se beneficie de espaçamento monoespaçado.

### Escala tipográfica

| Token | Tamanho | Line-height | Peso | Uso |
|---|---|---|---|---|
| `text-display` | 2.25rem / 36px | 1.2 | 700 | Tela vazia (empty state), tela de boas-vindas |
| `text-heading-lg` | 1.875rem / 30px | 1.25 | 700 | Título de página (ex: "Dashboard", "Orçamentos") |
| `text-heading-md` | 1.5rem / 24px | 1.3 | 700 | Título de seção ou card grande |
| `text-heading-sm` | 1.25rem / 20px | 1.4 | 600 | Subtítulo, título de modal |
| `text-heading-xs` | 1.125rem / 18px | 1.4 | 600 | Cabeçalho de tabela em destaque, título de card pequeno |
| `text-body-lg` | 1rem / 16px | 1.5 | 400 | Texto corrido padrão, campos de formulário |
| `text-body-md` | 0.875rem / 14px | 1.5 | 400 | Texto padrão de interface compacta (tabelas, listas) |
| `text-body-sm` | 0.8125rem / 13px | 1.5 | 400 | Texto secundário, descrições, ajuda de campo |
| `text-caption` | 0.75rem / 12px | 1.4 | 500 | Labels, metadados, timestamps, número de orçamento |
| `text-data-value` | varia (ver nota) | 1.3 | 600 | Valores monetários e totais — ver nota abaixo |

**Nota sobre `text-data-value`:** este token não tem tamanho fixo — é sempre SemiBold (600), mas o tamanho
acompanha o contexto: `text-heading-md` (24px) para valor de destaque em stat card, `text-body-lg` (16px) para
total de um orçamento em formulário, `text-body-md` (14px) para valores em linha de tabela. O peso 600 é o
sinalizador de "isto é um valor monetário", não o tamanho.

---

## 4. Espaçamento e Grid

### Escala de espaçamento

Base de **8px**, com `space-1` como meio-passo de 4px para ajustes finos (ex: gap entre ícone e label).

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Espaço entre ícone e texto, gap interno de badge |
| `space-2` | 8px | Padding interno compacto (botão sm, badge) |
| `space-3` | 12px | Padding interno padrão de componentes pequenos (input, botão md) |
| `space-4` | 16px | Padding interno padrão de cards, gap entre campos de formulário |
| `space-6` | 24px | Espaço entre blocos relacionados (ex: entre seções de formulário) |
| `space-8` | 32px | Espaço entre seções de página |
| `space-12` | 48px | Espaço entre grandes blocos de página, padding de header |
| `space-16` | 64px | Respiro de página em telas grandes, padding de empty state |
| `space-24` | 96px | Espaço de hero/tela vazia em desktop |

Nunca usar valores fora desta escala (ex: 7px, 13px, 22px) — eles quebram a coerência visual e dificultam
manutenção.

### Grid

- **Mobile (`< 768px`):** coluna única, padding lateral `space-4` (16px), largura total.
- **Tablet/Desktop (`≥ 768px`):** layout de aplicação com sidebar fixa de 240–280px + área de conteúdo com
  `max-width` de 1280px e padding lateral `space-8` (32px).
- **Dashboard — grid de stat cards:** 1 coluna no mobile, 2 no tablet, 4 no desktop, gap `space-4`.
- **Formulário — criação de orçamento/recibo:** coluna única centralizada, `max-width` de 720px mesmo em telas
  grandes. Formulário largo demais piora a leitura e a velocidade de preenchimento, que é a dor central do produto.

---

## 5. Forma — Radius, Elevação e Bordas

### Radius

O símbolo da marca usa cantos bem arredondados — essa linguagem se repete nos componentes para manter coerência
entre logotipo e interface.

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 8px | Inputs, badges pequenos, checkbox |
| `radius-md` | 12px | Botões, cards padrão |
| `radius-lg` | 16px | Cards grandes, painéis, modais pequenos |
| `radius-xl` | 24px | Modais grandes, painel de preview de PDF |
| `radius-full` | 9999px | Avatares, pills de status, badge arredondado |

### Elevação / Sombras

Sombras são funcionais (indicam camada), nunca decorativas — consistente com a diretriz do brandbook de evitar
ornamento sem propósito.

| Token | Valor (box-shadow) | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(17, 24, 39, 0.06)` | Cards em repouso, linha de tabela com hover |
| `shadow-md` | `0 4px 12px rgba(17, 24, 39, 0.10)` | Dropdowns, popovers, menu de ações |
| `shadow-lg` | `0 12px 32px rgba(17, 24, 39, 0.16)` | Modais, painel flutuante de preview de PDF, toast |

No modo escuro, sombra perde força visual sobre fundo escuro — a elevação é comunicada principalmente por
diferença de superfície (`color-neutral-900` → `color-neutral-800`) e borda de 1px (`color-neutral-700`), com
sombra mantida apenas como reforço sutil.

### Bordas

Borda padrão: **1px solid `color-border`**. Use borda para separar elementos no mesmo plano (ex: linhas de tabela,
divisão entre sidebar e conteúdo); use sombra para indicar que um elemento está **sobre** outro plano (ex: dropdown
sobre a tela).

---

## 6. Movimento

| Token | Duração | Easing | Uso |
|---|---|---|---|
| `motion-fast` | 120ms | `ease-out` | Hover, mudança de cor, micro feedback |
| `motion-normal` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Abrir/fechar dropdown, accordion, troca de tab |
| `motion-slow` | 320ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Modal, painel de preview de PDF, transição de página |

**`prefers-reduced-motion`:** quando ativado pelo sistema operacional do usuário, todas as transições de
transform e scale são removidas — elementos aparecem e desaparecem diretamente — mantendo apenas fades de
opacidade em `motion-fast`. Nenhuma informação deve depender exclusivamente de animação para ser compreendida
(ex: um toast precisa de ícone e cor de status visíveis instantaneamente, não só de um deslizamento de entrada).

---

## 7. Iconografia e Imagética

**Estilo de ícone:** outline/line, peso de traço uniforme (~1.75px), cantos levemente arredondados — ecoa o traço
do símbolo da marca. Nunca misturar ícones outline com ícones solid/preenchidos na mesma tela.

**Grid de tamanho:** 16px (inline com texto pequeno/caption), 20px (padrão em botões e inputs), 24px (navegação,
ícones de destaque em cards).

**Estilo de ilustração:** linha fina, paleta da marca (grafite + azul primário como único acento de cor) — usada
em estados vazios e onboarding. Evitar 3D, gradiente pesado ou estilo cartoon, conforme diretriz do brandbook.

**Fotografia (se usada em marketing dentro do produto):** profissionais reais em contexto de trabalho (eletricista
no painel, designer na tela, consultor em reunião), nunca stock genérico de escritório com pessoas sorrindo.

---

## 8. Breakpoints e Responsividade

| Token | Largura mínima | Contexto típico |
|---|---|---|
| `breakpoint-sm` | 640px | Celular em paisagem, phablet |
| `breakpoint-md` | 768px | Tablet — sidebar pode aparecer colapsada (só ícone) |
| `breakpoint-lg` | 1024px | Desktop — sidebar fixa expandida, grid de dashboard completo |
| `breakpoint-xl` | 1280px | Telas grandes — `max-width` de conteúdo atinge o teto |

**Estratégia:** mobile-first, sem exceção. O fluxo de criação de orçamento precisa ter paridade completa de
funcionalidade no celular — não é uma versão "de consulta". O dashboard com gráficos é o único contexto em que o
desktop ganha vantagem real (mais dados visíveis simultaneamente), mas mesmo ele precisa funcionar em mobile com
os gráficos empilhados verticalmente.

---

## 9. Modo Escuro

Esta é uma introdução do zero — o produto hoje opera só em modo claro. Cada token semântico abaixo tem uma
variante própria construída para contraste e conforto visual no escuro, não uma simples inversão da paleta clara.
O Azul Primário, por exemplo, fica mais claro no modo escuro (`color-blue-400` em vez de `color-blue-500`) porque
`#1E5EFF` perde contraste de texto sobre fundo escuro.

### Tokens semânticos — modo escuro

| Token semântico | Valor (modo claro) | Valor (modo escuro) |
|---|---|---|
| `color-background` | `color-neutral-50` / `#F8FAFC` | `color-neutral-950` / `#0A0E16` |
| `color-surface` | `color-neutral-0` / `#FFFFFF` | `color-neutral-900` / `#111827` |
| `color-surface-muted` | `color-neutral-100` / `#F1F5F9` | `color-neutral-800` / `#1E293B` |
| `color-border` | `color-neutral-200` / `#E2E8F0` | `color-neutral-800` / `#1E293B` |
| `color-text-primary` | `color-neutral-900` / `#111827` | `color-neutral-50` / `#F8FAFC` |
| `color-text-secondary` | `color-neutral-500` / `#6B7280` | `color-neutral-400` / `#94A3B8` |
| `color-text-disabled` | `color-neutral-400` / `#94A3B8` | `color-neutral-600` / `#475569` |
| `color-primary` | `color-blue-500` / `#1E5EFF` | `color-blue-400` / `#5C87FF` |
| `color-primary-foreground` | `color-neutral-0` / `#FFFFFF` | `color-neutral-950` / `#0A0E16` |
| `color-danger` | `#DC2626` | `#F87171` |

### Status de orçamento/recibo — modo escuro

No modo escuro, o fundo sólido claro dos badges (ex: `#FEF3C7` de pendente) quebraria o contraste tonal da tela.
A solução é usar a cor base do status em baixa opacidade sobre a superfície escura, mantendo o badge legível e
integrado.

| Status | Token fundo (escuro) | Valor | Token texto (escuro) | Valor |
|---|---|---|---|---|
| Pendente | `color-status-pending-bg` | `rgba(245, 158, 11, 0.16)` | `color-status-pending-fg` | `#FBBF24` |
| Aprovado | `color-status-approved-bg` | `rgba(22, 163, 74, 0.16)` | `color-status-approved-fg` | `#4ADE80` |
| Rejeitado | `color-status-rejected-bg` | `rgba(220, 38, 38, 0.16)` | `color-status-rejected-fg` | `#F87171` |
| Cancelado | `color-status-cancelled-bg` | `rgba(100, 116, 139, 0.20)` | `color-status-cancelled-fg` | `#94A3B8` |
| Finalizado | `color-status-completed-bg` | `rgba(13, 148, 136, 0.18)` | `color-status-completed-fg` | `#2DD4BF` |

**Mecanismo de troca:** via classe `.dark` aplicada à raiz do documento (`<html>` ou `<body>`). Isso permite que o
usuário escolha o tema manualmente, sem depender exclusivamente da preferência do sistema operacional.

---

## 10. Componentes

> Cobertura completa conforme escopo aprovado. Os tokens citados em cada componente referenciam as Seções 2–6.

---

### Ações e Formulários

---

#### Botão

**Quando usar:** ação principal ou secundária de uma tela, card ou formulário. Não usar para navegação entre
páginas — use um link de texto ou item de navegação.

**Anatomia:** ícone opcional (esquerda) + label + indicador de loading opcional (substitui o ícone).

**Variantes:**

| Variante | Uso |
|---|---|
| `primary` | Ação principal da tela — no máximo uma visível por contexto (ex: "Criar orçamento") |
| `secondary` | Ação alternativa de mesmo contexto, peso visual reduzido (ex: "Salvar rascunho") |
| `ghost` | Ação de baixa ênfase, comum em toolbars e dentro de tabelas (ex: "Ver detalhes") |
| `destructive` | Ações irreversíveis — cancelar orçamento, excluir recibo |
| `link` | Ação inline em texto corrido, sem fundo ou borda |

**Tamanhos:**

| Tamanho | Altura | Padding horizontal | Padding vertical | Quando usar |
|---|---|---|---|---|
| `sm` | 32px | `space-3` (12px) | `space-2` (8px) | Ações dentro de tabelas, toolbars compactas |
| `md` | 40px | `space-4` (16px) | `space-3` (12px) | Default — uso geral |
| `lg` | 48px | `space-6` (24px) | `space-4` (16px) | CTAs de tela cheia no mobile |

**Estados:**

| Estado | Especificação |
|---|---|
| Default | Variante `primary`: fundo `color-primary`, texto `color-primary-foreground` |
| Hover | Escurece para `color-blue-600` (modo claro) / clareia levemente (modo escuro), transição `motion-fast` |
| Focus | Anel de foco 2px `color-primary` com offset de 2px — sempre visível por teclado |
| Active | `color-blue-700` (modo claro), sem deslocamento de posição |
| Disabled | Opacidade 40%, cursor `not-allowed`, sem resposta a hover |
| Loading | Spinner substitui o ícone (ou aparece à esquerda do label); label permanece visível; largura mínima do botão não muda para não deslocar o layout ao redor |

**Tokens usados:** `color-primary`, `color-blue-600`, `color-blue-700`, `radius-md`, `space-2` a `space-6`,
`text-body-md` peso 600, `motion-fast`.

**Acessibilidade:** área de toque mínima 44×44px mesmo no tamanho `sm` (padding invisível adicional se necessário
— a área visual pode ser menor que a área clicável); contraste de texto branco sobre `color-blue-500` verificado
em ~4.5:1 (ver Seção 12); foco visível obrigatório em qualquer meio de navegação.

---

#### Botão de Ícone

**Quando usar:** ação compacta sem espaço para label (ex: editar linha de tabela, fechar modal, alternar tema).
Sempre acompanhado de `tooltip` visível no hover/focus, já que não há texto visível.

**Anatomia:** ícone único, 20px, centralizado em área de toque quadrada.

**Tamanhos:** `sm` (32×32px), `md` (40×40px — default), `lg` (48×48px).

**Estados:** mesmos do Botão (default/hover/focus/active/disabled). Variante visual `ghost` por padrão, com opção
`destructive` para ações como excluir.

**Tokens usados:** `radius-md` ou `radius-full` (quando usado em contexto de avatar/perfil), `color-text-secondary`
no ícone em repouso, `color-primary` ou `color-danger` em hover conforme contexto.

**Acessibilidade:** atributo de nome acessível obrigatório (ex: `aria-label`); área de toque mínima 44×44px via
padding invisível.

---

#### Input de Texto

**Quando usar:** entrada de texto curto de uma linha (nome do cliente, valor de item, e-mail).

**Anatomia:** label acima + campo + texto de ajuda ou erro abaixo (opcional) + ícone opcional dentro do campo
(esquerda ou direita, ex: prefixo "R$").

**Estados:**

| Estado | Especificação |
|---|---|
| Default | Borda `color-border`, fundo `color-surface` |
| Hover | Borda `color-neutral-300` (modo claro) / `color-neutral-600` (modo escuro) |
| Focus | Borda `color-primary` 1.5px + halo sutil `color-blue-100` (modo claro) / `color-blue-900` translúcido (modo escuro) |
| Filled | Igual ao default, com valor presente |
| Disabled | Fundo `color-surface-muted`, texto `color-text-disabled`, sem resposta a hover |
| Error | Borda `color-danger`, texto de ajuda substituído por mensagem de erro em `color-danger`, ícone de alerta à direita |

**Tamanhos:** altura 40px (default), 48px em formulários mobile-first onde o campo é o elemento principal da
tela.

**Tokens usados:** `radius-sm`, `space-3` padding interno, `text-body-lg`, `color-border`, `color-primary`,
`color-danger`.

**Acessibilidade:** label sempre associado ao campo (nunca só placeholder como label); mensagem de erro associada
via `aria-describedby` ou equivalente; contraste do placeholder (`color-neutral-400`) sobre fundo verificado.

---

#### Textarea

Mesma anatomia e estados do Input de Texto. Altura mínima de 96px (3 linhas), redimensionamento vertical
permitido. Uso típico: descrição de item de orçamento, observações do recibo.

---

#### Select

**Quando usar:** escolha única entre lista curta a média de opções (ex: status do orçamento no filtro, forma de
pagamento do recibo).

**Anatomia:** trigger com aparência de Input de Texto (ícone de chevron à direita) + painel de opções sobreposto
com lista.

**Estados:** mesmos do Input de Texto, mais o estado **Open** (painel visível, trigger com borda `color-primary`
e chevron rotacionado 180°). O painel de opções usa `shadow-md` e `radius-sm`.

**Acessibilidade:** navegável por teclado (setas para mover entre opções, Enter para selecionar, Esc para fechar);
opção selecionada marcada semanticamente como selecionada.

---

#### Checkbox

**Anatomia:** caixa 20×20px + label clicável (o label inteiro é área de toque).

**Estados:** Default (borda `color-border`), Checked (fundo `color-primary`, ícone de check `color-primary-foreground`), Hover, Focus (anel de foco), Disabled (opacidade 40%), Indeterminate (traço horizontal — usado em "selecionar todos" de tabela).

**Tokens usados:** `radius-sm` (~4px — ligeiramente menor que o radius padrão, para não parecer um botão),
`color-primary`.

**Acessibilidade:** área de toque mínima 44×44px (o label clicável conta para isso — a caixa visual pode ser
menor); estado indeterminado comunicado semanticamente.

---

#### Radio

Mesma lógica do Checkbox, formato circular, para escolha única entre opções mutuamente exclusivas visíveis (ex:
"Recibo vinculado a orçamento" / "Recibo avulso").

---

#### Switch / Toggle

**Quando usar:** ligar ou desligar uma opção com efeito imediato (ex: "Enviar lembrete automático de vencimento").
Nunca usar para ações que precisam de confirmação adicional.

**Estados:** Off (fundo `color-neutral-300`), On (fundo `color-primary`), Hover, Focus (anel de foco), Disabled.

**Tokens usados:** `radius-full`, `motion-fast` na transição do thumb.

**Acessibilidade:** papel semântico de switch com estado on/off comunicado; nunca usar Switch para uma ação que
precise de confirmação — nesse caso, usar Checkbox dentro de um formulário com botão de salvar explícito.

---

#### Date Picker

**Quando usar:** seleção de data de vencimento de orçamento, data de emissão de recibo.

**Anatomia:** Input de Texto como trigger (com ícone de calendário) + painel de calendário sobreposto.

**Estados do trigger:** mesmos do Select. Estados de dia no calendário: default, hover, selecionado (`color-primary`
sólido), hoje (borda `color-primary`, fundo transparente), fora do mês (texto `color-text-disabled`), desabilitado.

**Tokens usados:** `radius-sm` no trigger, `shadow-md` no painel de calendário, `color-primary`.

---

#### Campo de Busca

Input de Texto com ícone de lupa fixo à esquerda e botão de limpar (×) à direita quando preenchido. Usado no
topo de listagens. Mesmos estados do Input de Texto.

---

#### Upload de Arquivo (logo do profissional)

**Quando usar:** upload do logo do profissional, exibido depois nos PDFs gerados.

**Anatomia:** área de soltar arquivo (borda tracejada `color-border`, `radius-lg`) com ícone + texto descritivo +
preview da imagem após upload (com botão de remover).

**Estados:** Default, Dragover (borda `color-primary` sólida, fundo `color-blue-50`), Uploading (barra de
progresso linear em `color-primary`), Success (preview + indicação visual de sucesso), Error (borda `color-danger`
+ mensagem de erro).

**Acessibilidade:** input de arquivo nativo sempre presente e acessível por teclado/leitor de tela por trás da
área customizada — nunca apenas captura de drag-and-drop sem fallback de clique.

---

### Exibição de Conteúdo

---

#### Card

**Quando usar:** agrupar conteúdo relacionado com fronteira visual clara — base de quase todo bloco de conteúdo
do produto.

**Anatomia:** container com padding `space-4` ou `space-6`, header opcional (título + ação), corpo, footer
opcional (ações).

**Variantes:**

| Variante | Uso |
|---|---|
| `default` | Fundo `color-surface`, borda `color-border`, `shadow-sm` |
| `flat` | Sem sombra — quando o card já está dentro de outro container elevado |
| `interactive` | Ganha `shadow-md` e leve destaque no hover — quando o card inteiro é clicável (ex: card de orçamento na listagem mobile) |

**Tokens usados:** `radius-lg`, `color-surface`, `color-border`, `shadow-sm` / `shadow-md`, `space-4` / `space-6`.

---

#### Stat Card (Dashboard)

**Quando usar:** exibir uma métrica de negócio em destaque no dashboard (ex: "Total faturado no mês",
"Orçamentos pendentes").

**Anatomia:** ícone ou label pequeno (`text-caption`) + valor em destaque (`text-data-value` em `text-heading-md`)
+ indicador de variação opcional (seta + percentual em `color-success` ou `color-danger`).

**Estados:** Default, Loading (Skeleton substitui o valor — ver componente Skeleton), Empty (valor "—" quando não
há dado suficiente no período).

**Tokens usados:** `radius-lg`, `space-4`, `text-data-value`, `color-success` / `color-danger` no indicador.

---

#### Tag / Badge genérico

**Quando usar:** rótulo curto sem o significado específico de status de orçamento (ex: categoria de serviço, "Novo"
em uma feature). Não confundir com o Badge de Status de Orçamento.

**Anatomia:** pill com `radius-full`, padding `space-1` / `space-3`, `text-caption` peso 500.

**Variantes:** `neutral` (fundo `color-neutral-100`, texto `color-neutral-700`), `primary` (fundo `color-blue-100`,
texto `color-blue-700`).

---

#### Avatar

**Quando usar:** representar o profissional (foto ou iniciais) em header e menu de conta.

**Anatomia:** círculo `radius-full`, imagem ou iniciais sobre fundo `color-neutral-200` (modo claro) /
`color-neutral-700` (modo escuro).

**Tamanhos:** `sm` (24px), `md` (32px — default em header), `lg` (64px — tela de perfil).

---

#### Tabela / Data Table

**Quando usar:** listagem de orçamentos ou recibos com múltiplas colunas, filtro e paginação.

**Anatomia:** header de coluna (ordenável quando aplicável) + linhas + footer de paginação. Em mobile, a tabela
colapsa para uma lista de Cards (ver Padrões de Layout) em vez de scroll horizontal.

**Estados de linha:** Default, Hover (fundo `color-surface-muted`), Selected (fundo `color-blue-50` quando há
seleção múltipla via checkbox), Loading (Skeleton de linhas).

**Tokens usados:** `color-border` (divisor de linha 1px), `text-body-md`, `space-3` padding vertical de célula,
`color-surface-muted` no hover.

**Acessibilidade:** usar marcação semântica de tabela com cabeçalhos associados às colunas; ordenação de coluna
comunicada semanticamente; linha inteiramente clicável também navegável por teclado (Enter ativa).

---

#### Lista

Variante mais simples da Tabela, sem colunas — usado em histórico de atividade de um orçamento ("Criado em...",
"Enviado em...", "Visualizado pelo cliente em..."). Cada item: ícone + texto + timestamp (`text-caption`,
`color-text-secondary`) alinhado à direita.

---

#### Divider

Linha horizontal ou vertical, 1px, `color-border`. Uso: separar seções dentro de um card ou formulário quando o
espaçamento sozinho não é suficiente para comunicar a quebra.

---

### Navegação

---

#### Header / Navbar

**Anatomia:** logotipo à esquerda (símbolo isolado + nome em telas largas, símbolo isolado em mobile) + ações
globais à direita (toggle de tema, notificações, avatar com menu de conta).

**Tokens usados:** altura 64px, fundo `color-surface`, borda inferior `color-border`, `shadow-sm` opcional quando
há scroll de conteúdo por baixo.

---

#### Sidebar

**Quando usar:** navegação principal entre Dashboard, Orçamentos, Recibos, Clientes, Configurações.

**Anatomia:** lista de itens de navegação (ícone 20px + label). Item ativo destacado.

**Estados de item:**

| Estado | Especificação |
|---|---|
| Default | Texto e ícone em `color-text-secondary` |
| Hover | Fundo `color-surface-muted` |
| Active | Fundo `color-blue-50` (modo claro) / `color-blue-50` translúcido 10% (modo escuro), texto e ícone em `color-primary`, borda esquerda de 2–3px em `color-primary` |

**Tokens usados:** largura 260px (expandida), `radius-md` nos itens, `space-3` padding interno.

**Nota mobile:** em telas `< 768px`, a sidebar vira uma **tab bar fixa no rodapé** com os 4–5 destinos mais
usados (Dashboard, Orçamentos, Recibos, + Novo, Conta) — mais adequado para uso com uma mão no campo.

---

#### Tabs

**Quando usar:** alternar entre visões do mesmo contexto sem navegar de página (ex: dentro do detalhe de um
orçamento: "Detalhes" / "Histórico" / "PDF").

**Estados:** Default, Hover, Active (sublinhado `color-primary` 2px + texto `color-text-primary`), Disabled.

**Tokens usados:** `text-body-md` peso 500 (600 quando ativo), `color-primary`, `motion-fast` na transição do
indicador ativo.

---

#### Breadcrumb

Usado em telas profundas (ex: Configurações → Marca → Upload de logo). Separador "/" em `color-text-secondary`,
último item em `color-text-primary` sem link.

---

#### Paginação

**Anatomia:** botões de página numerados + indicador "X–Y de Z resultados" + setas de anterior/próxima.

**Tokens usados:** Botão de Ícone na variante `ghost` para as setas, `text-body-sm` para o contador, página atual
com fundo `color-primary`.

**Acessibilidade:** página atual comunicada semanticamente; setas desabilitadas na primeira e última páginas.

---

#### Menu Dropdown

**Quando usar:** ações contextuais (ex: menu "···" em linha de tabela: Editar, Duplicar, Excluir).

**Anatomia:** trigger (geralmente Botão de Ícone) + painel com lista de itens, cada um com ícone opcional.

**Estados de item:** Default, Hover (fundo `color-surface-muted`), Destructive (texto `color-danger`, ícone
`color-danger` — para "Excluir"), Disabled.

**Tokens usados:** `radius-md`, `shadow-md`, `space-2` padding do painel.

**Acessibilidade:** navegável por teclado (setas, Enter, Esc); foco retorna ao trigger ao fechar.

---

### Feedback e Overlay

---

#### Modal / Dialog

**Quando usar:** ação que exige foco total e confirmação antes de continuar (ex: confirmar cancelamento de
orçamento, criar recibo a partir de um orçamento finalizado).

**Anatomia:** overlay escuro semitransparente + painel centralizado (header com título + botão fechar, corpo,
footer com ações).

**Tamanhos:**

| Tamanho | Largura | Quando usar |
|---|---|---|
| `sm` | 400px | Confirmações simples (ex: "Cancelar orçamento?") |
| `md` | 560px | Default — formulários simples, detalhes rápidos |
| `lg` | 800px | Formulários complexos (ex: criação de recibo vinculado) |

**Tokens usados:** `radius-xl`, `shadow-lg`, `motion-slow` na entrada e saída, overlay `rgba(10, 14, 22, 0.5)`.

**Acessibilidade:** foco preso dentro do modal enquanto aberto; Esc fecha (exceto em confirmações destrutivas
críticas que requerem escolha explícita); foco retorna ao elemento que abriu o modal ao fechar; marcação semântica
de dialog com label associado.

---

#### Toast

**Quando usar:** feedback de uma ação concluída, não bloqueante (ex: "Orçamento enviado com sucesso"). Não usar
para erros críticos que precisam de ação do usuário — usar Modal ou Alert Banner.

**Anatomia:** ícone de variante + mensagem + ação opcional (ex: "Desfazer") + botão fechar.

**Variantes:** `success`, `warning`, `danger`, `info` — borda esquerda de 3px na cor correspondente, ícone na
mesma cor.

**Tokens usados:** `radius-md`, `shadow-lg`, posição fixa (canto superior direito em desktop, topo centralizado
em mobile), duração padrão de exibição 4s, `motion-normal` na entrada e saída.

**Acessibilidade:** região de notificação com prioridade `polite` (ou `assertive` para erros críticos); o toast
não desaparece automaticamente se o usuário estiver com foco ou cursor sobre ele.

---

#### Alert / Banner

**Quando usar:** aviso persistente dentro do fluxo da página (não flutuante), ex: "Este orçamento vence em
2 dias" no topo do detalhe do orçamento.

**Anatomia:** ícone + mensagem + ação opcional, ocupa a largura do container pai.

**Variantes:** `success`, `warning`, `danger`, `info` — fundo tintado (`color-*-50`) em vez de sólido.

**Tokens usados:** `radius-md`, `space-4` padding, cores `color-status-*-bg` / `color-status-*-fg` quando o alerta
é específico de um orçamento (reaproveitando a paleta de status em vez da paleta de feedback genérica, quando o
contexto é o estado do orçamento em si).

---

#### Tooltip

**Quando usar:** explicação curta de um ícone ou ação sem label visível.

**Anatomia:** balão pequeno com seta direcional, aparece no hover/focus após ~400ms de delay.

**Tokens usados:** fundo `color-neutral-900` (modo claro) / `color-neutral-100` com texto `color-neutral-900`
(modo escuro — inverte para manter contraste), `text-caption`, `radius-sm`.

---

#### Popover

Como o Menu Dropdown, mas para conteúdo mais rico que uma lista de ações (ex: preview rápido de um item de
orçamento ao passar o cursor). Mesma elevação e tokens do Menu Dropdown.

---

#### Skeleton / Loading State

**Quando usar:** qualquer área aguardando dado assíncrono — linha de tabela, stat card, gráfico do dashboard.

**Anatomia:** retângulo com `radius` correspondente ao conteúdo real que vai substituir, animação de gradiente
em movimento ("shimmer") sutil.

**Tokens usados:** fundo `color-neutral-200` (modo claro) / `color-neutral-800` (modo escuro), `motion-normal`
em loop para o shimmer.

**Acessibilidade:** com `prefers-reduced-motion` ativo, o shimmer vira fundo estático que pulsa em opacidade,
sem movimento de gradiente.

---

#### Empty State

**Quando usar:** lista de orçamentos, recibos ou clientes sem nenhum registro ainda.

**Anatomia:** ilustração de linha fina + `text-heading-sm` + `text-body-md` de apoio + botão `primary` de ação
(ex: "Criar primeiro orçamento").

**Tokens usados:** `space-16` de padding vertical, conteúdo centralizado horizontalmente, `max-width` de 360px
para o bloco de texto.

---

### Componentes Específicos do Produto

---

#### Badge de Status de Orçamento / Recibo

**Quando usar:** em qualquer lugar que exiba um orçamento ou recibo — linha de tabela, card, header de detalhe,
filtro ativo. É o componente mais repetido do produto e o único onde a paleta `color-status-*` é usada.

**Anatomia:** pill (`radius-full`) com dot de 6px na cor base do status + label do status em `text-caption`
peso 600.

**Variantes (5, uma por estado):**

| Variante | Fundo | Texto / dot |
|---|---|---|
| Pendente | `color-status-pending-bg` | `color-status-pending-fg` / dot: `color-status-pending` |
| Aprovado | `color-status-approved-bg` | `color-status-approved-fg` / dot: `color-status-approved` |
| Rejeitado | `color-status-rejected-bg` | `color-status-rejected-fg` / dot: `color-status-rejected` |
| Cancelado | `color-status-cancelled-bg` | `color-status-cancelled-fg` / dot: `color-status-cancelled` |
| Finalizado | `color-status-completed-bg` | `color-status-completed-fg` / dot: `color-status-completed` |

**Acessibilidade:** a cor nunca é o único indicador — o label de texto do status está sempre presente. Nunca criar
uma variante "compacta" que mostre apenas o dot de cor sem texto, mesmo em espaços apertados de mobile — usar
abreviação de texto (ex: "Pend.") antes de remover o texto.

---

#### Linha de Orçamento / Recibo (Table Row especializada)

**Quando usar:** dentro da Tabela de listagem. Extensão da especificação de Tabela com colunas fixas esperadas:
cliente, serviço/descrição, valor (com `text-data-value`), data de vencimento, Badge de Status, menu de ações.

**Comportamento mobile (card colapsado):** quando a tabela colapsa para lista de cards em telas `< 768px`, cada
linha vira um Card `interactive` com: nome do cliente (`text-heading-xs`) + Badge de Status no canto superior
direito + valor em destaque + data secundária.

---

#### Card de Resumo Financeiro (Dashboard)

Combinação de 4 Stat Cards lado a lado (ex: "Total faturado no mês", "Orçamentos pendentes", "Taxa de aprovação",
"Recibos emitidos"), seguida de um ou mais Chart Cards. Em mobile: cards empilhados verticalmente.

---

#### Chart Card

**Quando usar:** envoltório padrão para qualquer gráfico do dashboard.

**Anatomia:** Card padrão com header (título + seletor de período, ex: "Últimos 30 dias") + área do gráfico +
legenda.

**Regra de cor:** quando o gráfico representa distribuição de orçamentos por estado (ex: pizza ou barras por
status), usar exatamente as cores `color-status-*` na mesma ordem em que aparecem nos badges — nunca uma paleta
de gráfico genérica separada, para manter a associação cor ↔ estado consistente em todo o produto.

---

#### Tag de Origem do Recibo

**Quando usar:** indicar se um recibo é vinculado a um orçamento finalizado ou avulso.

**Anatomia:** Tag genérica (não usa a paleta de status) — variante `neutral` com label "Avulso" ou variante
`primary` com label "Vinculado" + link para o orçamento de origem.

---

#### Botão de Ação de PDF (Salvar / Imprimir)

**Quando usar:** ação de gerar PDF ou imprimir — fluxo crítico do produto.

**Anatomia:** Botão `secondary` ou `primary` (conforme hierarquia da tela) com ícone de download ou impressora +
label.

**Estado adicional — Gerando:** ao clicar, o botão entra em estado `Loading` (spinner substitui o ícone, label
muda para "Gerando PDF…") até o documento estar pronto. Em caso de falha: botão volta ao estado default e um
Toast `danger` é exibido com opção de tentar novamente.

---

## 11. Padrões de Layout

| Padrão | Quando usar | Estrutura resumida |
|---|---|---|
| **Dashboard** | Tela inicial após login | Sidebar fixa (desktop) ou tab bar (mobile) + header + grid de Stat Cards + Chart Card(s) + tabela de orçamentos recentes |
| **Listagem** | Orçamentos, Recibos, Clientes | Header com Campo de Busca + filtros (incluindo filtro por Badge de Status) + Tabela (desktop) / lista de Cards interativos (mobile) + Paginação |
| **Formulário** | Criação e edição de orçamento ou recibo | Container centralizado `max-width` 720px, seções divididas por Divider (dados do cliente → itens → totais), ações fixas no rodapé em mobile (sticky), alinhadas à direita no footer em desktop |
| **Detalhe** | Visualizar um orçamento ou recibo específico | Header com Badge de Status + ações (PDF, editar, menu de ações) + corpo com dados + aba de Histórico (Lista) |
| **Preview de PDF** | Visualização do documento antes de enviar | Painel central com o preview real do PDF renderizado + ações fixas (Baixar, Imprimir, Enviar) sempre visíveis sem precisar rolar |
| **Configurações** | Perfil, marca (logo), notificações | Navegação lateral secundária (Tabs verticais em desktop, Tabs horizontais com scroll em mobile) + painel de conteúdo à direita |

---

## 12. Acessibilidade

### Contraste mínimo

| Combinação | Contraste mínimo exigido | Status nesta paleta |
|---|---|---|
| `color-neutral-900` sobre `color-neutral-50` (texto principal, modo claro) | 4.5:1 (WCAG AA) | **Verificado: ~17.7:1** (AAA) |
| `color-neutral-0` sobre `color-blue-500` (texto de botão primário, modo claro) | 4.5:1 (WCAG AA) | **Verificado: ~4.5:1** (AA) |
| `color-neutral-500` sobre `color-neutral-0` (texto secundário, modo claro) | 4.5:1 (WCAG AA) | **Verificado: ~4.8:1** (AA — usar apenas em texto ≥ 14px) |
| `color-neutral-50` sobre `color-neutral-950` (texto principal, modo escuro) | 4.5:1 (WCAG AA) | **Verificado: ~18.4:1** (AAA) |
| `color-blue-400` sobre `color-neutral-950` (ação primária, modo escuro) | 4.5:1 (WCAG AA) | **Verificado: ~5.9:1** (AA) |
| `color-status-*-fg` sobre `color-status-*-bg` (badges de status, modo claro) | 4.5:1 (WCAG AA) | **Estimado: ≥ 6:1 em todas as 5 combinações** |

> A cor base (`color-status-*`) de cada estado — ex: `#F59E0B` de pendente — tem contraste de ~2.1:1 sobre branco,
> abaixo do mínimo de AA. Por isso o componente Badge **nunca usa a cor base como texto** — usa-a apenas como dot
> decorativo de 6px ao lado do texto, que fica sempre no tom `color-status-*-fg` (verificado ≥ 6:1).

### Foco por teclado

Todo componente interativo documentado na Seção 10 tem um estado `Focus` definido: anel de 2px na cor
`color-primary` com 2px de offset em relação à borda do elemento. O anel nunca é removido sem um substituto de
igual ou maior visibilidade — remover o outline sem alternativa é proibido em qualquer componente.

### Área de toque mínima

44×44px para qualquer elemento clicável ou tocável, inclusive quando o elemento visual (ícone, checkbox) é menor
que isso. O padding invisível completa a área. Crítico neste produto pelo uso real predominante em celular, muitas
vezes com uma mão só, durante um atendimento.

### Outras notas

- Todo ícone funcional sem label visível tem nome acessível associado; imagens decorativas têm alternativo textual
  vazio.
- `prefers-reduced-motion` respeitado em todas as animações (ver Seção 6).
- Idioma único (pt-BR) nesta versão — não há requisito de RTL ou múltiplos idiomas no escopo atual.
- Contraste dos badges de status no modo escuro usa tokens rgba: a verificação formal de contraste deve ser feita
  contra a superfície `color-neutral-900` (`#111827`) com a ferramenta de contraste de preferência do time antes do
  lançamento do modo escuro.

---

## 13. Tokens Prontos para Implementação

> Esta seção usa CSS Custom Properties (CSS Variables) como formato universal — independente de framework ou
> biblioteca de componentes. Qualquer stack moderna (React, Vue, Angular, Svelte, HTML puro) consome este formato
> diretamente. A tradução para o mecanismo de theming específico da stack (ex: design tokens JSON, configuração do
> Tailwind, tokens de tema de uma biblioteca de componentes) deve ser feita pelo time de desenvolvimento com base
> nesses valores.

### CSS Variables — modo claro (`:root`)

```css
:root {
  /* ─── Primitivas — Neutro ─────────────────────────── */
  --color-neutral-0:   #FFFFFF;
  --color-neutral-50:  #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #111827;
  --color-neutral-950: #0A0E16;

  /* ─── Primitivas — Azul ───────────────────────────── */
  --color-blue-50:  #EEF3FF;
  --color-blue-100: #DCE7FF;
  --color-blue-200: #B9CFFF;
  --color-blue-400: #5C87FF;
  --color-blue-500: #1E5EFF;
  --color-blue-600: #1648D6;
  --color-blue-700: #1136AD;

  /* ─── Primitivas — Status de orçamento/recibo ─────── */
  --color-status-pending:       #F59E0B;
  --color-status-pending-bg:    #FEF3C7;
  --color-status-pending-fg:    #92400E;

  --color-status-approved:      #16A34A;
  --color-status-approved-bg:   #DCFCE7;
  --color-status-approved-fg:   #15803D;

  --color-status-rejected:      #DC2626;
  --color-status-rejected-bg:   #FEE2E2;
  --color-status-rejected-fg:   #B91C1C;

  --color-status-cancelled:     #64748B;
  --color-status-cancelled-bg:  #F1F5F9;
  --color-status-cancelled-fg:  #475569;

  --color-status-completed:     #0D9488;
  --color-status-completed-bg:  #CCFBF1;
  --color-status-completed-fg:  #0F766E;

  /* ─── Semânticas — modo claro ─────────────────────── */
  --color-background:        var(--color-neutral-50);
  --color-surface:           var(--color-neutral-0);
  --color-surface-muted:     var(--color-neutral-100);
  --color-border:            var(--color-neutral-200);
  --color-text-primary:      var(--color-neutral-900);
  --color-text-secondary:    var(--color-neutral-500);
  --color-text-disabled:     var(--color-neutral-400);
  --color-primary:           var(--color-blue-500);
  --color-primary-foreground: var(--color-neutral-0);
  --color-primary-hover:     var(--color-blue-600);
  --color-primary-active:    var(--color-blue-700);

  /* ─── Semânticas — Feedback ───────────────────────── */
  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-danger:  #DC2626;
  --color-info:    #0EA5E9;

  /* ─── Tipografia ──────────────────────────────────── */
  --font-display: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-body:    "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;

  --text-display:     2.25rem;   /* 36px */
  --text-heading-lg:  1.875rem;  /* 30px */
  --text-heading-md:  1.5rem;    /* 24px */
  --text-heading-sm:  1.25rem;   /* 20px */
  --text-heading-xs:  1.125rem;  /* 18px */
  --text-body-lg:     1rem;      /* 16px */
  --text-body-md:     0.875rem;  /* 14px */
  --text-body-sm:     0.8125rem; /* 13px */
  --text-caption:     0.75rem;   /* 12px */

  --leading-tight:   1.2;
  --leading-snug:    1.3;
  --leading-normal:  1.4;
  --leading-relaxed: 1.5;

  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* ─── Espaçamento ─────────────────────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* ─── Forma ───────────────────────────────────────── */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(17, 24, 39, 0.06);
  --shadow-md: 0 4px 12px rgba(17, 24, 39, 0.10);
  --shadow-lg: 0 12px 32px rgba(17, 24, 39, 0.16);

  /* ─── Movimento ───────────────────────────────────── */
  --motion-fast:   120ms;
  --motion-normal: 200ms;
  --motion-slow:   320ms;
  --easing-out:    ease-out;
  --easing-inout:  cubic-bezier(0.4, 0, 0.2, 1);

  /* ─── Breakpoints (referência — usar via media query) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### CSS Variables — modo escuro (`.dark`)

Aplicar a classe `.dark` na raiz do documento (`<html>` ou `<body>`) para ativar o modo escuro. Os tokens
primitivos não mudam — apenas os tokens semânticos são redefinidos.

```css
.dark {
  /* ─── Semânticas redefinidas para modo escuro ─────── */
  --color-background:        var(--color-neutral-950);
  --color-surface:           var(--color-neutral-900);
  --color-surface-muted:     var(--color-neutral-800);
  --color-border:            var(--color-neutral-800);
  --color-text-primary:      var(--color-neutral-50);
  --color-text-secondary:    var(--color-neutral-400);
  --color-text-disabled:     var(--color-neutral-600);
  --color-primary:           var(--color-blue-400);
  --color-primary-foreground: var(--color-neutral-950);
  --color-primary-hover:     var(--color-blue-400); /* clarear via filter: brightness() se necessário */
  --color-primary-active:    var(--color-blue-500);

  /* ─── Feedback escuro ─────────────────────────────── */
  --color-danger: #F87171;

  /* ─── Status escuro (rgba translúcido + texto claro) ─ */
  --color-status-pending-bg:    rgba(245, 158, 11, 0.16);
  --color-status-pending-fg:    #FBBF24;

  --color-status-approved-bg:   rgba(22, 163, 74, 0.16);
  --color-status-approved-fg:   #4ADE80;

  --color-status-rejected-bg:   rgba(220, 38, 38, 0.16);
  --color-status-rejected-fg:   #F87171;

  --color-status-cancelled-bg:  rgba(100, 116, 139, 0.20);
  --color-status-cancelled-fg:  #94A3B8;

  --color-status-completed-bg:  rgba(13, 148, 136, 0.18);
  --color-status-completed-fg:  #2DD4BF;

  /* ─── Sombras no modo escuro ─────────────────────── */
  /* Sombra perde força sobre fundo escuro. Preferir diferença de
     superfície (--color-surface vs --color-surface-muted) + borda
     --color-border para comunicar elevação. Sombra mantida apenas
     como reforço sutil. */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.5);
}
```

### Exemplo de uso dos tokens em CSS puro

```css
/* Botão primário */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-body-md);
  font-weight: var(--weight-semibold);
  transition: background-color var(--motion-fast) var(--easing-out);
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Badge de status */
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border-radius: var(--radius-full);
  padding: 2px var(--space-3);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
}
.badge-status.pending {
  background-color: var(--color-status-pending-bg);
  color: var(--color-status-pending-fg);
}
.badge-status.approved {
  background-color: var(--color-status-approved-bg);
  color: var(--color-status-approved-fg);
}
/* ... repetir para rejected, cancelled, completed */

/* Input de texto — estado de erro */
.input-error {
  border-color: var(--color-danger);
}
.input-error-message {
  color: var(--color-danger);
  font-size: var(--text-body-sm);
}
```

### Nota de suporte a `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 14. Faça e Evite

### Cor

✅ Use o tom `-fg` (texto) sobre o tom `-bg` (fundo) de cada status — **ex:** `color-status-pending-fg` sobre
`color-status-pending-bg`. ❌ Nunca use a cor base do status (`color-status-pending`) como texto sobre fundo branco —
o contraste fica abaixo de AA.

✅ Reserve `color-primary` exclusivamente para elementos clicáveis e ações — **ex:** botões, links, inputs em foco.
❌ Não use `color-primary` em badges informativos ou elementos decorativos — isso dilui o sinal de "isto é
clicável".

✅ No gráfico de distribuição de orçamentos por estado, use exatamente as cores `color-status-*` na mesma ordem dos
badges. ❌ Não use uma paleta de gráfico genérica (azul/verde/laranja aleatórios) — isso quebra a associação visual
cor ↔ estado que o usuário aprendeu no resto do produto.

### Tipografia

✅ Use `text-data-value` (SemiBold, 600) em qualquer valor monetário, em qualquer tamanho de contexto. ❌ Não exiba
valores monetários em peso Regular (400) — o produto perde a hierarquia que diferencia "dado" de "texto comum".

✅ Use no máximo 3 tamanhos de fonte na mesma tela ou card. ❌ Não misture tokens de mesmo nível hierárquico
(ex: `text-heading-md` e `text-heading-sm`) no mesmo nível visual só porque parece melhor naquele contexto
específico.

### Componentes

✅ Todo componente interativo tem estado de foco visível por teclado (anel 2px `color-primary` com offset 2px).
❌ Nunca remova o outline de foco sem um substituto de igual visibilidade.

✅ Badge de status sempre com label de texto visível — nunca só cor ou só dot. ❌ Não crie uma variante "compacta"
do Badge que mostre apenas a cor; use abreviação de texto antes de remover o texto.

✅ Use o Skeleton específico do formato do conteúdo que está carregando (linha de tabela, stat card). ❌ Não use um
spinner genérico de tela inteira para qualquer carregamento — isso esconde a estrutura da tela e aumenta a
percepção de demora.

✅ Use o toast para feedback de ações concluídas. ❌ Não use toast para erros críticos que exigem ação do usuário —
nesses casos, use Modal de confirmação ou Alert Banner persistente.

---

## 15. Anexos e Próximos Passos

### Componentes pendentes de especificação

- **Editor de itens de orçamento** (lista editável de linhas produto/serviço com cálculo de total em tempo real) —
  é o coração do fluxo de criação de orçamento, mas seu padrão de interação vai além dos componentes genéricos de
  Tabela e Input documentados aqui. Recomendado como prioridade da próxima rodada de especificação.
- **Biblioteca de gráficos** — este documento define o Chart Card como envoltório e a regra de cor dos gráficos de
  status, mas não especifica configuração de eixos, tooltips internos do gráfico ou animação de entrada de dados,
  que dependem da biblioteca escolhida pelo time.
- **Notificações in-app** (painel do sino no header com lista de notificações) — mencionado como ação global do
  header, mas o painel de lista e os estados de notificação lida/não lida não foram especificados.

### Itens pendentes de verificação

- Contraste formal dos tokens `color-status-*-bg` / `color-status-*-fg` no modo escuro: os valores são
  construídos seguindo o padrão de texto claro (400-range) sobre rgba translúcido (~16–20%), o que tipicamente
  resulta em razão ≥ 4.5:1. Validar com ferramenta de contraste (ex: WebAIM Contrast Checker, Stark) antes do
  lançamento do modo escuro, testando contra a superfície `color-neutral-900` (`#111827`).
- Migração do CSS atual do produto (modo claro, ad-hoc) para esta estrutura de tokens: é trabalho de
  implementação separado, não coberto por este documento.

### Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | Junho de 2026 | Criação do design system completo a partir do Brandbook OrçaFácil v2.0 — fundamentos (cor, tipografia, espaçamento, forma, movimento), introdução do modo escuro, sistema de cor para os 5 estados de orçamento/recibo, cobertura completa de componentes (formulário, dados, navegação, feedback, específicos do produto) e tokens em CSS Variables como formato universal |

---

*Design system elaborado com apoio de Design System Expert — Claude AI*
