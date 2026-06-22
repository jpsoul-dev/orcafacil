
**Versão:** 1.0
**Data:** Junho de 2026
**Status:** Aprovado
**Stack de referência:** Next.js + Tailwind CSS v4 + shadcn/ui

> Este design system evolui um produto já em produção. Hoje o OrçaFácil só roda em modo claro — este documento
> introduz o modo escuro do zero, expande a paleta da marca em tokens
> semânticos completos, e formaliza um sistema de cor dedicado aos estados de orçamento 

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

| Princípio                               | O que significa na prática                                                                                                                                                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Confiança visível em 2 segundos**     | O orçamento gerado pelo produto é visto pelo cliente final do usuário — toda tela precisa comunicar profissionalismo imediato, não só o PDF exportado. Isso justifica tipografia limpa, hierarquia clara e zero elemento decorativo sem função.                                    |
| **Status é cidadão de primeira classe** | Com 5 estados de orçamento (pendente, aprovado, rejeitado, cancelado, finalizado), todo lugar que exibe um orçamento — tabela, dashboard, notificação, card — usa o mesmo sistema de cor/badge de status, sem exceção. O usuário reconhece o estado pela cor antes de ler o texto. |
| **Dado denso sem peso de ERP**          | Dashboard com gráficos, tabela de orçamentos e recibos cabem bastante informação sem parecer um sistema financeiro pesado. Espaçamento generoso é aplicado com disciplina — respiro onde ajuda a leitura, nunca luxo que força scroll desnecessário.                               |
| **Mobile-first de verdade**             | O uso real acontece no celular, na rua, entre um cliente e outro — não é "modo de leitura simplificada". Toda tela e todo componente são desenhados primeiro para toque, depois adaptados para mouse/teclado, deve ser um PWA.                                                     |

---

## 2. Cor

### Paleta primitiva

#### Neutro (Grafite) — base de texto, fundo e superfícies em ambos os modos

| Token | Hex | RGB | Uso típico |
|---|---|---|---|
| `neutral-0` | `#FFFFFF` | 255, 255, 255 | Branco puro — superfície de card no modo claro, ícone do logo sobre fundo escuro |
| `neutral-50` | `#F8FAFC` | 248, 250, 252 | Off-white — fundo padrão da aplicação no modo claro (cor de marca) |
| `neutral-100` | `#F1F5F9` | 241, 245, 249 | Fundo de hover sutil, fundo de inputs em repouso |
| `neutral-200` | `#E2E8F0` | 226, 232, 240 | Bordas e divisores no modo claro |
| `neutral-300` | `#CBD5E1` | 203, 213, 225 | Bordas com mais contraste, ícones desabilitados |
| `neutral-400` | `#94A3B8` | 148, 163, 184 | Placeholder de input, texto terciário, texto secundário no modo escuro |
| `neutral-500` | `#6B7280` | 107, 114, 128 | Cinza de Apoio (cor de marca) — texto secundário, metadados, tagline do logo |
| `neutral-600` | `#475569` | 71, 85, 105 | Texto secundário com mais peso, ícones ativos |
| `neutral-700` | `#334155` | 51, 65, 85 | Bordas no modo escuro |
| `neutral-800` | `#1E293B` | 30, 41, 59 | Superfície elevada no modo escuro (modal, dropdown) |
| `neutral-900` | `#111827` | 17, 24, 39 | Grafite (cor de marca) — texto principal no modo claro, superfície base no modo escuro |
| `neutral-950` | `#0A0E16` | 10, 14, 22 | Fundo padrão da aplicação no modo escuro |

#### Azul (Primária)

| Token      | Hex       | RGB           | Uso típico                                                                           |
| ---------- | --------- | ------------- | ------------------------------------------------------------------------------------ |
| `blue-50`  | `#EEF3FF` | 238, 243, 255 | Fundo sutil de destaque, hover de superfície clara relacionada a ação                |
| `blue-100` | `#DCE7FF` | 220, 231, 255 | Fundo de badge informativo, fundo de ícone em estado ativo leve                      |
| `blue-200` | `#B9CFFF` | 185, 207, 255 | Borda de elemento em foco leve                                                       |
| `blue-400` | `#5C87FF` | 92, 135, 255  | Primária no modo escuro (mais clara para manter contraste sobre fundo escuro)        |
| `blue-500` | `#1E5EFF` | 30, 94, 255   | Azul Primário (cor de marca) — ação primária no modo claro                           |
| `blue-600` | `#1648D6` | 22, 72, 214   | Hover/active de botão primário no modo claro                                         |
| `blue-700` | `#1136AD` | 17, 54, 173   | Active/pressed de botão primário, texto de link sobre fundo claro com mais contraste |
| `blue-900` | `#081A5C` | 8, 26, 92     | Uso pontual em texto de alto contraste sobre fundo azul claro                        |

#### Status de orçamento e recibo

Cada status tem três tons: a cor base (ícones, dots, gráficos), um tom escuro para texto (sobre fundo claro tintado) e um tom claro de fundo (badge). Os hex de modo escuro estão na Seção 9.

| Status | Token base | Hex (base) | Token texto | Hex (texto, fundo claro) | Token fundo | Hex (fundo, claro) |
|---|---|---|---|---|---|---|
| **Pendente** | `status-pending` | `#F59E0B` | `status-pending-fg` | `#92400E` | `status-pending-bg` | `#FEF3C7` |
| **Aprovado** | `status-approved` | `#16A34A` | `status-approved-fg` | `#15803D` | `status-approved-bg` | `#DCFCE7` |
| **Rejeitado** | `status-rejected` | `#DC2626` | `status-rejected-fg` | `#B91C1C` | `status-rejected-bg` | `#FEE2E2` |
| **Cancelado** | `status-cancelled` | `#64748B` | `status-cancelled-fg` | `#475569` | `status-cancelled-bg` | `#F1F5F9` |
| **Finalizado** | `status-completed` | `#0D9488` | `status-completed-fg` | `#0F766E` | `status-completed-bg` | `#CCFBF1` |

**Por que essas cores e não outras:** pendente usa âmbar (aguardando ação, atenção sem alarme), aprovado usa verde (positivo, mas reservado só para esse estado — não reutilizado em "finalizado"), rejeitado usa vermelho (negativo, claro), cancelado usa cinza-azulado neutro (estado inativo, fora do fluxo — propositalmente "sem energia visual"), e finalizado usa um teal distinto do verde e do azul primário, para não ser confundido nem com "aprovado" nem com uma ação clicável. Nenhum desses tons coincide com o Azul Primário `#1E5EFF`, que fica reservado exclusivamente para ação.

#### Feedback do sistema

| Token | Hex | Uso |
|---|---|---|
| `success` | `#16A34A` | Toast/alert de confirmação genérica (ex: "Recibo salvo com sucesso") |
| `warning` | `#F59E0B` | Toast/alert de atenção genérica (ex: "Orçamento perto do vencimento") |
| `danger` | `#DC2626` | Toast/alert de erro genérico, validação de formulário |
| `info` | `#0EA5E9` | Toast/alert informativo neutro — usa um ciano, não o Azul Primário, para não ser lido como ação clicável |

> Mesmo onde o hex coincide com uma cor de status (ex: `danger` e `status-rejected` são ambos `#DC2626`), os tokens
> são nomeados separadamente. Um toast de erro de rede não deve ficar acoplado semanticamente a "orçamento
> rejeitado" — são conceitos diferentes que hoje compartilham um tom de vermelho por coincidência de paleta.

### Paleta semântica (o que o time usa no código)

| Token semântico | Mapeia para (claro) | Uso |
|---|---|---|
| `color-background` | `neutral-50` | Fundo padrão da aplicação |
| `color-surface` | `neutral-0` | Fundo de cards, modais, painéis elevados |
| `color-surface-muted` | `neutral-100` | Fundo de seções secundárias, hover de linha de tabela |
| `color-border` | `neutral-200` | Bordas e divisores |
| `color-text-primary` | `neutral-900` | Texto principal |
| `color-text-secondary` | `neutral-500` | Texto de apoio, labels, metadados |
| `color-text-disabled` | `neutral-400` | Texto e ícones desabilitados |
| `color-primary` | `blue-500` | Ações primárias, links, elementos de destaque — uso exclusivo para "clique aqui" |
| `color-success` / `warning` / `danger` / `info` | ver tabela acima | Feedback de sistema |
| `color-status-*` | ver tabela de status acima | Badge e indicador de status de orçamento/recibo |

**Racional da paleta:** o Azul Primário segue ancorando confiança e ação. A expansão para uma escala de neutros é o que permite construir modo escuro, estados de hover/disabled e hierarquia de superfície sem inventar hex novos a cada componente. A paleta de status é a peça nova mais importante deste documento: ela existe porque um produto de orçamentos com 5 estados de negócio precisa desse estado ser visualmente instantâneo — é a informação mais consultada da tela.

**Contraste e acessibilidade:** ver Seção 12 para a tabela completa com valores calculados. Regra geral: nunca usar o tom "base" (500) de uma cor de status como texto sobre fundo branco — use sempre o tom de texto dedicado (700/800) sobre o tom de fundo claro (50/100) da mesma família.

---

## 3. Tipografia

### Famílias

| Papel                      | Fonte | Pesos disponíveis           | Fallback web-safe                                  |
| -------------------------- | ----- | --------------------------- | -------------------------------------------------- |
| Display / Títulos          | Sora  | Bold (700), SemiBold (600)  | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| Texto / Corpo              | Sora  | Regular (400), Medium (500) | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| Dados e valores monetários | Sora  | SemiBold (600)              | `system-ui, -apple-system, "Segoe UI", sans-serif` |

**Racional tipográfico:** Sora é mantida como única família em todo o produto — geométrica com personalidade própria, comunica tecnologia e acessibilidade ao mesmo tempo sem soar genérica. Não há fonte mono dedicada: IDs e dados técnicos (ex: número de orçamento) usam Sora Medium em `text-caption`, já que o produto não expõe nenhum dado que se beneficie de espaçamento monoespaçado.

### Escala tipográfica

| Token             | Tamanho          | Line-height | Peso | Uso                                                            |
| ----------------- | ---------------- | ----------- | ---- | -------------------------------------------------------------- |
| `text-display`    | 2.25rem / 36px   | 1.2         | 700  | Tela vazia (empty state), tela de boas-vindas                  |
| `text-heading-lg` | 1.875rem / 30px  | 1.25        | 700  | Título de página (ex: "Dashboard", "Orçamentos")               |
| `text-heading-md` | 1.5rem / 24px    | 1.3         | 700  | Título de seção ou card grande (ex: card de stat do dashboard) |
| `text-heading-sm` | 1.25rem / 20px   | 1.4         | 600  | Subtítulo, título de modal                                     |
| `text-heading-xs` | 1.125rem / 18px  | 1.4         | 600  | Cabeçalho de tabela em destaque, título de card pequeno        |
| `text-body-lg`    | 1rem / 16px      | 1.5         | 400  | Texto corrido padrão, campos de formulário                     |
| `text-body-md`    | 0.875rem / 14px  | 1.5         | 400  | Texto padrão de interface compacta (tabelas, listas)           |
| `text-body-sm`    | 0.8125rem / 13px | 1.5         | 400  | Texto secundário, descrições, ajuda de campo                   |
| `text-caption`    | 0.75rem / 12px   | 1.4         | 500  | Labels, metadados, timestamps, número de orçamento             |
| `text-data-value` | varia (ver nota) | 1.3         | 600  | Valores monetários e totais — ver nota abaixo                  |

**Nota sobre `text-data-value`:** este token não tem tamanho fixo — ele é sempre SemiBold (600), mas o tamanho
acompanha o contexto: `text-heading-md` (24px) para o valor de destaque de um stat card do dashboard,
`text-body-lg` (16px) para o total de um orçamento dentro de um formulário, `text-body-md` (14px) para valores em
linha de tabela. O peso 600 é o que sinaliza "isso é um valor monetário", não o tamanho.

---

## 4. Espaçamento e Grid

### Escala de espaçamento

Base de **8px**, com `space-1` como meio-passo de 4px para ajustes finos (ex: gap entre
ícone e label).

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Espaço entre ícone e texto, gap interno de badge |
| `space-2` | 8px | Padding interno compacto (botão sm, badge) |
| `space-3` | 12px | Padding interno padrão de componentes pequenos (input, botão md) |
| `space-4` | 16px | Padding interno padrão de cards, gap entre campos de formulário |
| `space-6` | 24px | Espaço entre blocos relacionados (ex: entre seções de um formulário) |
| `space-8` | 32px | Espaço entre seções de página |
| `space-12` | 48px | Espaço entre grandes blocos de página (header e conteúdo) |
| `space-16` | 64px | Respiro de página em telas grandes, padding de empty state |
| `space-24` | 96px | Espaço de hero/tela vazia em desktop |

### Grid

- **Mobile (`<768px`):** coluna única, padding lateral `space-4` (16px), largura total.
- **Tablet/Desktop (`≥768px`):** layout de aplicação com sidebar fixa de 240–280px + área de conteúdo com
  `max-width` de 1280px e padding lateral `space-8` (32px).
- **Dashboard (grid de stat cards):** 1 coluna no mobile, 2 colunas no tablet, 4 colunas no desktop, gap `space-4`.
- **Formulário (criação de orçamento/recibo):** coluna única centralizada, `max-width` de 720px, mesmo em telas
  grandes — formulário largo demais piora a leitura e a velocidade de preenchimento, que é a dor central do
  produto.

---

## 5. Forma — Radius, Elevação e Bordas

### Radius

O ícone da marca usa cantos bem arredondados — isso se repete nos componentes de interface para manter a mesma
"voz visual" entre logo e produto.

| Token         | Valor  | Uso                                          |
| ------------- | ------ | -------------------------------------------- |
| `radius-sm`   | 8px    | Inputs, badges pequenos, checkbox            |
| `radius-md`   | 12px   | Botões, cards padrão (default do sistema)    |
| `radius-lg`   | 16px   | Cards grandes, painéis, modais pequenos      |
| `radius-xl`   | 24px   | Modais grandes                               |
| `radius-full` | 9999px | Avatares, pills de status, badge arredondado |

### Elevação / Sombras

Sombras são funcionais (indicam camada), nunca decorativas — consistente com a diretriz do brandbook de evitar ornamento sem propósito.

| Token       | Valor (box-shadow)                   | Uso                                         |
| ----------- | ------------------------------------ | ------------------------------------------- |
| `shadow-sm` | `0 1px 2px rgba(17, 24, 39, 0.06)`   | Cards em repouso, linha de tabela com hover |
| `shadow-md` | `0 4px 12px rgba(17, 24, 39, 0.10)`  | Dropdowns, popovers, menu de ações          |
| `shadow-lg` | `0 12px 32px rgba(17, 24, 39, 0.16)` | Modais, toast                               |

No modo escuro, sombra perde força visual sobre fundo escuro — a elevação é comunicada principalmente por diferença de tom de superfície (`neutral-900` → `neutral-800`) e borda de 1px (`neutral-700`), com a sombra mantida apenas como reforço sutil (ver Seção 9).

### Bordas

Borda padrão: **1px solid `color-border`**. Use borda para separar elementos no mesmo plano (ex: linhas de tabela, divisão entre sidebar e conteúdo); use sombra para indicar que um elemento está **sobre** outro plano (ex: dropdown sobre a tela).

---

## 6. Movimento

| Token           | Duração | Easing                         | Uso                                            |
| --------------- | ------- | ------------------------------ | ---------------------------------------------- |
| `motion-fast`   | 120ms   | `ease-out`                     | Hover, mudança de cor, micro feedback          |
| `motion-normal` | 200ms   | `cubic-bezier(0.4, 0, 0.2, 1)` | Abrir/fechar dropdown, accordion, troca de tab |
| `motion-slow`   | 320ms   | `cubic-bezier(0.4, 0, 0.2, 1)` | Modal, transição de página                     |

**`prefers-reduced-motion`:** quando ativado pelo usuário, todas as transições de transform/scale são removidas (elementos aparecem/desaparecem direto), mantendo apenas fades de opacidade em `motion-fast`. Nenhuma informação deve depender exclusivamente de animação para ser compreendida (ex: um toast não pode "só" deslizar — precisa também ter ícone e cor de status visíveis instantaneamente).

---

## 7. Iconografia e Imagética

**Estilo de ícone:** line/outline, peso de traço uniforme (~1.75px), cantos levemente arredondados — ecoa o traço do símbolo da marca. Nunca misturar ícones outline com ícones solid/preenchidos na mesma tela.

**Biblioteca recomendada:** `lucide-react` — compatível nativamente com shadcn/ui, já no estilo correto sem necessidade de customização pesada.

**Grid de tamanho:** 16px (inline com texto pequeno/caption), 20px (padrão em botões e inputs), 24px (navegação, ícones de destaque em cards).

**Estilo de ilustração:** linha fina, paleta da marca (grafite + azul primário como único acento de cor) — usada em estados vazios (ex: "Nenhum orçamento criado ainda") e onboarding. Evitar 3D, gradiente pesado ou estilo cartoon.

**Fotografia (se usada em marketing dentro do produto):** profissionais reais em contexto de trabalho, nunca stock genérico de escritório.

---

## 8. Breakpoints e Responsividade

| Token | Largura mínima | Contexto típico |
|---|---|---|
| `breakpoint-sm` | 640px | Celular em paisagem, phablet |
| `breakpoint-md` | 768px | Tablet — sidebar pode aparecer colapsada/ícone-only |
| `breakpoint-lg` | 1024px | Desktop — sidebar fixa expandida, grid de dashboard completo |
| `breakpoint-xl` | 1280px | Telas grandes — `max-width` de conteúdo atinge o teto |

**Estratégia:** mobile-first, sem exceção. O fluxo de criação de orçamento precisa ter paridade completa de funcionalidade no celular — não é uma versão "de consulta". O dashboard com gráficos é o único contexto em que o desktop ganha uma vantagem real de uso (mais dados visíveis ao mesmo tempo), mas mesmo ele precisa funcionar em mobile com os gráficos empilhados verticalmente. Deve ser um PWA.

---

## 9. Modo Escuro

Cada token semântico abaixo tem uma variante própria construída para contraste e conforto visual no escuro, não uma simples inversão da paleta clara (por isso o Azul Primário, por exemplo, fica mais claro no modo escuro — `#1E5EFF` perde contraste de texto sobre fundo escuro).

| Token semântico | Valor (claro) | Valor (escuro) |
|---|---|---|
| `color-background` | `neutral-50` `#F8FAFC` | `neutral-950` `#0A0E16` |
| `color-surface` | `neutral-0` `#FFFFFF` | `neutral-900` `#111827` |
| `color-surface-muted` | `neutral-100` `#F1F5F9` | `neutral-800` `#1E293B` |
| `color-border` | `neutral-200` `#E2E8F0` | `neutral-800` `#1E293B` |
| `color-text-primary` | `neutral-900` `#111827` | `neutral-50` `#F8FAFC` |
| `color-text-secondary` | `neutral-500` `#6B7280` | `neutral-400` `#94A3B8` |
| `color-primary` | `blue-500` `#1E5EFF` | `blue-400` `#5C87FF` |
| `color-primary-foreground` | `neutral-0` `#FFFFFF` | `neutral-950` `#0A0E16` |
| `status-pending-bg` / `-fg` | `#FEF3C7` / `#92400E` | `rgba(245,158,11,0.16)` / `#FBBF24` |
| `status-approved-bg` / `-fg` | `#DCFCE7` / `#15803D` | `rgba(22,163,74,0.16)` / `#4ADE80` |
| `status-rejected-bg` / `-fg` | `#FEE2E2` / `#B91C1C` | `rgba(220,38,38,0.16)` / `#F87171` |
| `status-cancelled-bg` / `-fg` | `#F1F5F9` / `#475569` | `rgba(100,116,139,0.20)` / `#94A3B8` |
| `status-completed-bg` / `-fg` | `#CCFBF1` / `#0F766E` | `rgba(13,148,136,0.18)` / `#2DD4BF` |
| `destructive` | `#DC2626` | `#F87171` |

**Por que fundos de status viram `rgba` translúcido no escuro, em vez de um hex sólido:** sobre `neutral-900` (`#111827`), um fundo sólido claro de badge (como `#FEF3C7`) quebraria o contraste tonal da tela inteira. Usar a cor de status em baixa opacidade sobre a superfície escura mantém o badge legível e integrado, sem criar um "retângulo branco" isolado no meio de uma tela escura.

**Lógica de troca:** via classe `.dark` na raiz do documento (compatível com o padrão de tema do shadcn/ui/ `next-themes`), nunca via media query isolada — o usuário deve poder escolher o tema manualmente, não só herdar do sistema operacional.

---

## 10. Componentes

> Os tokens citados em cada componente referenciam as Seções 2–6.

### Ações e Formulários

#### Botão

**Quando usar:** ação principal ou secundária de uma tela, card ou formulário. Não usar para navegação entre páginas — use um link de texto ou item de navegação.

**Anatomia:** ícone opcional (esquerda) + label + indicador de loading opcional (substitui o ícone).

**Variantes:**
| Variante | Uso |
|---|---|
| `primary` | Ação principal da tela — no máximo uma visível por contexto (ex: "Criar orçamento") |
| `secondary` | Ação alternativa de mesmo contexto, peso visual reduzido (ex: "Salvar rascunho") |
| `ghost` | Ação de baixa ênfase, comum em toolbars e dentro de tabelas (ex: "Ver detalhes") |
| `destructive` | Ações irreversíveis — cancelar orçamento, excluir recibo |
| `link` | Ação inline em texto corrido, sem fundo |

**Tamanhos:** `sm` (altura 32px, padding `space-2`/`space-3`), `md` (altura 40px, padding `space-3`/`space-4` —
default), `lg` (altura 48px, padding `space-4`/`space-6` — usado em CTAs de tela cheia no mobile)

**Estados:**
| Estado | Especificação |
|---|---|
| Default | `primary`: fundo `color-primary`, texto `color-primary-foreground` |
| Hover | Escurece para `blue-600` (claro) / clareia levemente (escuro), `motion-fast` |
| Focus | Anel de foco 2px `color-primary` com offset de 2px, sempre visível por teclado |
| Active | `blue-700` (claro), sem deslocamento de posição |
| Disabled | Opacidade 40%, cursor `not-allowed`, sem resposta a hover |
| Loading | Spinner substitui o ícone (ou aparece à esquerda do label); label permanece visível; largura mínima do botão não muda, para não "pular" o layout |

**Tokens usados:** `color-primary` (500/600/700), `radius-md`, `space-2`–`space-6`, `text-body-md` peso 600

**Acessibilidade:** área de toque mínima 44×44px mesmo no tamanho `sm` (padding invisível adicional se necessário);
contraste de texto branco sobre `blue-500` verificado em ~4.5:1 (ver Seção 12); foco visível obrigatório.

---

#### Botão de Ícone

**Quando usar:** ação compacta sem espaço para label (ex: editar linha de tabela, fechar modal, alternar tema).
Sempre acompanhado de `aria-label` e `tooltip` no hover/focus, já que não há texto visível.

**Anatomia:** ícone único, 20px, centralizado em área de toque quadrada.

**Tamanhos:** `sm` (32×32px), `md` (40×40px — default), `lg` (48×48px)

**Estados:** mesmos de Botão (default/hover/focus/active/disabled), variante visual `ghost` por padrão, com opção `destructive` para ações como excluir.

**Tokens usados:** `radius-md` ou `radius-full` (quando usado em contexto de avatar/perfil), `color-text-secondary` no ícone em repouso, `color-primary` ou `destructive` em hover conforme contexto.

**Acessibilidade:** `aria-label` obrigatório; área de toque mínima 44×44px mesmo no tamanho `sm` via padding invisível.

---

#### Input de Texto

**Quando usar:** entrada de texto curto de uma linha (nome do cliente, valor de item, e-mail).

**Anatomia:** label acima + campo + texto de ajuda ou erro abaixo (opcional) + ícone opcional dentro do campo (esquerda ou direita, ex: prefixo "R$").

**Estados:**
| Estado | Especificação |
|---|---|
| Default | Borda `color-border`, fundo `color-surface` |
| Hover | Borda `neutral-300` (claro) / `neutral-600` (escuro) |
| Focus | Borda `color-primary` 1.5px + anel de foco sutil `blue-100` (claro) / `blue-900` translúcido (escuro) |
| Filled | Igual ao default, apenas com valor presente |
| Disabled | Fundo `color-surface-muted`, texto `color-text-disabled`, sem hover |
| Error | Borda `danger`, texto de ajuda substituído por mensagem de erro em `danger`, ícone de alerta à direita |

**Tamanhos:** altura 40px (default), 48px em telas de formulário mobile-first onde o campo é o elemento principal da tela (ex: campo de valor em destaque).

**Tokens usados:** `radius-sm`, `space-3` padding interno, `text-body-lg`, `color-border`, `color-primary`

**Acessibilidade:** label sempre associado via `htmlFor`/`id` (nunca só placeholder como label); mensagem de erro associada via `aria-describedby`; contraste do placeholder (`neutral-400`) sobre fundo verificado.

---

#### Textarea

Mesma anatomia e estados do Input de Texto, com altura mínima de 96px (3 linhas) e redimensionamento vertical permitido.

---

#### Select

**Quando usar:** escolha única entre uma lista curta a média de opções (ex: status do orçamento, forma de pagamento do recibo).

**Anatomia:** trigger (igual ao Input, com ícone de chevron à direita) + painel de opções (mesma especificação de elevação do Dropdown Menu).

**Estados:** mesmos do Input de Texto, mais um estado **Open** (painel visível, trigger com borda `color-primary` e chevron rotacionado 180°).

**Tokens usados:** mesmos do Input + `shadow-md` no painel de opções + `radius-sm` no painel.

**Acessibilidade:** navegável por teclado (setas para mover entre opções, Enter para selecionar, Esc para fechar); opção selecionada marcada com `aria-selected`.

---

#### Checkbox

**Anatomia:** caixa 20×20px + label clicável.

**Estados:** Default (borda `color-border`), Checked (fundo `color-primary`, ícone de check branco), Hover, Focus (anel de foco), Disabled (opacidade 40%), Indeterminate (traço horizontal, usado em "selecionar todos" de tabela).

**Tokens usados:** `radius-sm` (4–6px, levemente menor que o radius padrão para não parecer um botão), `color-primary`

**Acessibilidade:** área de toque mínima 44×44px (o label clicável conta para isso, a caixa visual pode ser menor); estado `indeterminate` comunicado via `aria-checked="mixed"`.

---

#### Radio

Mesma lógica do Checkbox, formato circular, usado para escolha única visível (ex: "Recibo vinculado a orçamento" / "Recibo avulso" — ver também Componentes Específicos do Produto).

---

#### Switch / Toggle

**Quando usar:** ligar/desligar uma opção com efeito imediato (ex: "Enviar lembrete automático de vencimento"), nunca para ações que precisam de confirmação.

**Estados:** Off (fundo `neutral-300`), On (fundo `color-primary`), Hover, Focus, Disabled.

**Tokens usados:** `radius-full`, `motion-fast` na transição do thumb.

**Acessibilidade:** `role="switch"` com `aria-checked`; nunca usar Switch para uma ação que precise de confirmação adicional — nesse caso, usar Checkbox dentro de um formulário com botão de salvar.

---

#### Date Picker

**Quando usar:** seleção de data de vencimento de orçamento, data de emissão de recibo.

**Anatomia:** Input de Texto como trigger (com ícone de calendário) + painel de calendário (mesma elevação de Dropdown).

**Estados:** mesmos do Select, mais estados de dia no calendário: default, hover, selecionado (`color-primary` sólido), hoje (borda `color-primary`, fundo transparente), fora do mês (texto `color-text-disabled`), desabilitado (ex: datas passadas, se a regra de negócio exigir).

**Tokens usados:** `radius-sm`, `color-primary`, `shadow-md` no painel.

---

#### Campo de Busca

Input de Texto com ícone de lupa fixo à esquerda e botão de limpar (×) à direita quando preenchido. Usado no topo de listagens de orçamentos e recibos. Mesmos estados do Input de Texto.

---

#### Upload de Arquivo

**Quando usar:** upload do logos, arquivos

**Anatomia:** área de drop (borda tracejada `color-border`, `radius-lg`) com ícone + texto "Arraste ou clique para enviar" + preview da imagem após upload, com botão de remover.

**Estados:** Default, Dragover (borda `color-primary` sólida, fundo `blue-50`), Uploading (barra de progresso linear, `color-primary`), Success (preview + check em `success`), Error (borda `danger` + mensagem, ex: "Arquivo muito grande").

**Tokens usados:** `radius-lg`, `color-primary`, `success`, `danger`.

**Acessibilidade:** input de arquivo nativo sempre presente e acessível por teclado/leitor de tela por trás da área customizada (nunca só `onDrop` sem fallback de clique).

---

### Exibição de Conteúdo

#### Card

**Quando usar:** agrupar conteúdo relacionado com fronteira visual clara — base de quase todo bloco de conteúdo do produto.

**Anatomia:** container com padding `space-4` ou `space-6`, header opcional (título + ação), corpo, footer opcional (ações).

**Variantes:** `default` (fundo `color-surface`, borda `color-border`, `shadow-sm`), `flat` (sem sombra, usado quando o card já está dentro de outro container), `interactive` (ganha `shadow-md` e leve elevação no hover — usado quando o card inteiro é clicável, ex: card de orçamento na listagem mobile).

**Tokens usados:** `radius-lg`, `color-surface`, `color-border`, `shadow-sm`/`shadow-md`.

---

#### Stat Card (Dashboard)

**Quando usar:** exibir uma métrica de negócio em destaque no dashboard (ex: "Total faturado no mês", "Orçamentos pendentes").

**Anatomia:** ícone ou label pequeno (`text-caption`) + valor em destaque (`text-data-value` em `text-heading-md`)+ indicador de variação opcional (seta + percentual, em `success` ou `danger` conforme o sinal).

**Estados:** Default, Loading (skeleton substitui o valor, ver Skeleton), Empty (valor "—" quando não há dado suficiente no período).

**Tokens usados:** `radius-lg`, `space-4`, `text-data-value`, `color-success`/`color-danger` no indicador de variação.

---

#### Badge de Status (orçamento/recibo)

Ver especificação completa em **Componentes Específicos do Produto**, abaixo.

---

#### Tag / Badge genérico

**Quando usar:** rótulo curto sem o significado específico de status de orçamento (ex: categoria de serviço, "Novo" em uma feature).

**Anatomia:** pill com `radius-full`, padding `space-1`/`space-3`, `text-caption` peso 500.

**Variantes:** `neutral` (fundo `neutral-100`, texto `neutral-700`), `primary` (fundo `blue-100`, texto `blue-700`).

---

#### Avatar

**Quando usar:** representar o profissional (foto ou iniciais) em header e menu de conta.

**Anatomia:** círculo `radius-full`, imagem ou iniciais sobre fundo `neutral-200` (claro) / `neutral-700` (escuro).

**Tamanhos:** `sm` (24px), `md` (32px — default em header), `lg` (64px — tela de perfil).

---

#### Tabela / Data Table

**Quando usar:** listagem de orçamentos ou recibos com múltiplas colunas, filtro e paginação — o componente de dado mais usado do produto.

**Anatomia:** header de coluna (ordenável quando aplicável) + linhas + footer de paginação. Em mobile, a tabela colapsa para uma lista de cards (ver Padrões de Layout) em vez de scroll horizontal.

**Estados de linha:** Default, Hover (`color-surface-muted`), Selected (fundo `blue-50` quando há seleção múltipla via checkbox), Loading (skeleton de linhas, ver Skeleton).

**Tokens usados:** `color-border` (divisor de linha 1px), `text-body-md`, `space-3` padding vertical de célula, `color-surface-muted` no hover.

**Acessibilidade:** `<table>` semântica com `<th scope="col">`; ordenação de coluna comunicada via `aria-sort`; linha clicável (que navega para detalhe) também navegável por teclado (Enter ativa).

---

#### Lista

Variante mais simples da Tabela, sem colunas — usado em contextos como histórico de atividade de um orçamento ("Criado em...", "Enviado em...", "Visualizado pelo cliente em..."). Cada item: ícone + texto + timestamp (`text-caption`, `color-text-secondary`) alinhado à direita.

---

#### Divider

Linha horizontal ou vertical, 1px, `color-border`. Uso: separar seções dentro de um card ou formulário quando o espaçamento sozinho (`space-6`+) não é suficiente para comunicar a quebra.

---

### Navegação

#### Navbar / Header

**Anatomia:** logo (símbolo isolado + nome em telas largas, símbolo isolado sozinho em mobile) à esquerda, ações globais à direita (toggle de tema, notificações, avatar com menu de conta).

**Tokens usados:** altura 64px, fundo `color-surface`, borda inferior `color-border`, `shadow-sm` opcional quando há scroll por baixo.

---

#### Sidebar

**Quando usar:** navegação principal — visível em desktop/tablet, colapsa drawer em mobile.

**Anatomia:** lista de itens de navegação (ícone 20px + label), item ativo destacado.

**Estados de item:** Default (`color-text-secondary`), Hover (`color-surface-muted`), Active (fundo `blue-50` claro / `blue-950`-equivalente translúcido no escuro, texto e ícone em `color-primary`, borda esquerda de 2–3px em `color-primary`).

**Tokens usados:** largura 260px (expandida), `radius-md` nos itens, `space-3` padding interno do item.

**Nota mobile:** em telas `<768px`, a sidebar vira uma **tab bar fixa no rodapé** com os 4–5 destinos mais usados (Dashboard, Orçamentos, Recibos, Novo +, Conta) — mais compatível com uso de uma mão no campo.

---

#### Tabs

**Quando usar:** alternar entre visões do mesmo contexto sem navegar de página (ex: dentro do detalhe de um orçamento: "Detalhes" / "Histórico" / "PDF").

**Estados:** Default, Hover, Active (sublinhado `color-primary` 2px + texto `color-text-primary`), Disabled.

**Tokens usados:** `text-body-md` peso 500 (600 quando ativo), `motion-fast` na transição do indicador.

---

#### Breadcrumb

Usado em telas profundas (ex: Configurações → Marca → Upload de logo). Separador "/" em `color-text-secondary`, último item em `color-text-primary` sem link.

---

#### Paginação

**Anatomia:** botões de página + indicador "X–Y de Z resultados" + setas anterior/próxima.

**Tokens usados:** Botão de Ícone (`ghost`) para as setas, `text-body-sm` para o contador.

**Acessibilidade:** página atual comunicada via `aria-current="page"`.

---

#### Menu Dropdown

**Quando usar:** ações contextuais (ex: menu "···" em uma linha de tabela: Editar, Duplicar, Excluir).

**Anatomia:** trigger (geralmente Botão de Ícone) + painel com lista de itens, cada um com ícone opcional.

**Estados de item:** Default, Hover (`color-surface-muted`), Destructive (texto `danger`, usado para "Excluir"), Disabled.

**Tokens usados:** `radius-md`, `shadow-md`, `space-2` padding do painel.

**Acessibilidade:** navegável por teclado (setas, Enter, Esc), foco retorna ao trigger ao fechar.

---

### Feedback e Overlay

#### Modal / Dialog

**Quando usar:** ação que exige foco total e confirmação antes de continuar.

**Anatomia:** overlay escuro semitransparente + painel centralizado (header com título + botão fechar, corpo, footer com ações).

**Tamanhos:** `sm` (400px — confirmações simples), `md` (560px — default), `lg` (800px — formulários complexos como criação de recibo vinculado).

**Tokens usados:** `radius-xl`, `shadow-lg`, `motion-slow` na entrada/saída, overlay `rgba(10,14,22,0.5)`.

**Acessibilidade:** foco preso dentro do modal (`focus trap`), Esc fecha (exceto em confirmações destrutivas críticas), foco retorna ao elemento que abriu o modal ao fechar, `role="dialog"` + `aria-modal="true"`.

---

#### Toast

**Quando usar:** feedback de uma ação concluída, não bloqueante (ex: "Orçamento enviado com sucesso").

**Anatomia:** ícone de status + mensagem + ação opcional (ex: "Desfazer") + botão fechar.

**Variantes:** `success`, `warning`, `danger`, `info` (cores da Seção 2) — borda esquerda de 3px na cor correspondente, ícone preenchido com a mesma cor.

**Tokens usados:** `radius-md`, `shadow-lg`, posição fixa (canto superior direito em desktop, topo em mobile), duração padrão de exibição 4s, `motion-normal` na entrada/saída.

**Acessibilidade:** `aria-live="polite"` (ou `assertive` para erros críticos), não desaparece automaticamente se o usuário estiver com o foco/hover sobre ele.

---

#### Alert / Banner

**Quando usar:** aviso persistente dentro do fluxo da página (não flutuante como o Toast), ex: "Este orçamento vence em 2 dias" no topo do detalhe do orçamento.

**Anatomia:** ícone + mensagem + ação opcional, ocupa a largura do container pai.

**Variantes:** mesmas do Toast (`success`/`warning`/`danger`/`info`), fundo tintado (`*-bg`) em vez de sólido.

**Tokens usados:** `radius-md`, `space-4` padding, cores `status-*-bg`/`-fg` quando o alerta é sobre um orçamento específico (reaproveitando a paleta de status em vez da paleta de feedback genérica, quando fizer sentido).

---

#### Tooltip

**Quando usar:** explicação curta de um ícone ou ação sem label visível (ex: Botão de Ícone).

**Anatomia:** balão pequeno com seta, aparece no hover/focus após ~400ms.

**Tokens usados:** fundo `neutral-900` (claro) / `neutral-100` com texto `neutral-900` (escuro — inverte para
manter contraste), `text-caption`, `radius-sm`.

---

#### Popover

Como o Dropdown Menu, mas para conteúdo mais rico que uma lista de ações (ex: preview rápido de um item de orçamento ao passar o mouse). Mesma elevação e tokens do Dropdown.

---

#### Skeleton / Loading State

**Quando usar:** qualquer área aguardando dado assíncrono (linha de tabela, stat card, gráfico do dashboard).

**Anatomia:** retângulo com `radius` correspondente ao conteúdo real que vai substituir, animação de "shimmer" sutil (`motion-normal`, looping).

**Tokens usados:** fundo `neutral-200` (claro) / `neutral-800` (escuro).

**Acessibilidade:** respeita `prefers-reduced-motion` (shimmer vira um fundo estático pulsando em opacidade, sem movimento de gradiente).

---

#### Empty State

**Quando usar:** lista de orçamentos, recibos ou clientes sem nenhum registro ainda.

**Anatomia:** ilustração de linha fina (ver Seção 7) + `text-heading-sm` + `text-body-md` de apoio + botão `primary` de ação (ex: "Criar primeiro orçamento").

**Tokens usados:** `space-16` de padding vertical, conteúdo centralizado, `max-width` de 360px para o texto.

---

### Componentes Específicos do Produto

#### Badge de Status de Orçamento/Recibo

**Quando usar:** em qualquer lugar que exiba um orçamento ou recibo — linha de tabela, card, header de detalhe, filtro. É o componente mais repetido do produto e o único lugar onde a paleta de status (Seção 2) é usada.

**Anatomia:** pill (`radius-full`) com dot de 6px na cor base do status + label do status, `text-caption` peso 600.

**Variantes (5, uma por status):**
| Variante | Fundo | Texto/dot |
|---|---|---|
| Pendente | `status-pending-bg` | `status-pending-fg` |
| Aprovado | `status-approved-bg` | `status-approved-fg` |
| Rejeitado | `status-rejected-bg` | `status-rejected-fg` |
| Cancelado | `status-cancelled-bg` | `status-cancelled-fg` |
| Finalizado | `status-completed-bg` | `status-completed-fg` |

**Tokens usados:** ver Seção 2 (claro) e Seção 9 (escuro).

**Acessibilidade:** a cor nunca é o único indicador — o label de texto do status está sempre presente (nunca um badge "só cor" ou "só dot"), para usuários com daltonismo ou leitor de tela.

---

#### Linha de Orçamento/Recibo (Table Row especializada)

**Quando usar:** dentro da Tabela de listagem. Extensão da especificação de Tabela com colunas fixas: cliente,
valor (`text-data-value`), data, Badge de Status, menu de ações (Dropdown).

**Anatomia mobile (card colapsado):** quando a tabela vira lista de cards em telas `<768px`, cada linha vira um
Card `interactive` com: nome do cliente (`text-heading-xs`) + Badge de Status no canto superior direito + valor em
destaque + data secundária.

---

#### Card de Resumo Financeiro (Dashboard)

Combinação de até 4 Stat Cards lado a lado (ex: "Faturado no mês", "Orçamentos pendentes", "Taxa de aprovação", "Recibos emitidos"), seguida de um Chart Card.

---

#### Chart Card

**Quando usar:** envoltório padrão para qualquer gráfico do dashboard (a biblioteca de gráficos em si fica fora do escopo deste documento — ver Seção 15).

**Anatomia:** Card padrão com header (título + seletor de período, ex: "Últimos 30 dias") + área do gráfico + legenda.

**Nota de cor:** quando o gráfico representa distribuição de orçamentos por status (ex: gráfico de pizza/barras), use exatamente as 5 cores `status-*` na mesma ordem em que aparecem nos badges — nunca uma paleta de gráfico genérica à parte, para manter a associação cor↔status consistente em todo o produto.

---

#### Tag de Origem do Recibo

**Quando usar:** indicar se um recibo está vinculado a um orçamento finalizado ou é avulso.

**Anatomia:** Tag genérica (não usa a paleta de status, que é exclusiva de orçamento) — variante `neutral` com label "Avulso" ou variante `primary` com label "Vinculado" + link para o orçamento de origem.

---

#### Botão de Ação de PDF (Salvar / Imprimir)

**Quando usar:** ação de gerar PDF ou imprimir um orçamento/recibo — fluxo crítico do produto.

**Anatomia:** Botão `secondary` ou `primary` (conforme hierarquia da tela) com ícone (download ou impressora) + label.

**Estado adicional — Generating:** ao clicar, o botão entra em estado `Loading` (spinner substitui o ícone, label muda para "Gerando PDF…") até o documento estar pronto; em caso de falha, o botão volta ao estado default e um Toast `danger` é exibido com opção de tentar novamente.

---

## 11. Padrões de Layout

| Padrão                      | Quando usar                               | Estrutura resumida                                                                                                                                                                   |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Layout de Dashboard**     | Tela inicial após login                   | Sidebar fixa (desktop) ou tab bar (mobile) + header + grid de Stat Cards + Chart Card(s) + tabela de "orçamentos recentes"                                                           |
| **Layout de Listagem**      | Orçamentos, Recibos, Clientes             | Header com Campo de Busca + filtros (incluindo filtro por Badge de Status) + Tabela (desktop) / lista de Cards (mobile) + Paginação                                                  |
| **Layout de Formulário**    | Criação/edição de orçamento ou recibo     | Container centralizado `max-width` 720px, seções divididas por Divider (dados do cliente → itens → totais), ações fixas no rodapé em mobile (sticky), alinhadas à direita em desktop |
| **Layout de Detalhe**       | Visualizar um orçamento/recibo específico | Header com Badge de Status + ações (PDF, editar, menu) + corpo com dados + aba de Histórico (Lista)                                                                                  |
| **Layout de Preview/PDF**   | Visualização do documento antes de enviar | Painel central com o preview real do PDF renderizado + ações fixas (Baixar, Imprimir, Enviar) sempre visíveis, sem precisar rolar                                                    |
| **Layout de Configurações** | Perfil, marca (logo), notificações        | Navegação lateral secundária (Tabs verticais em desktop, Tabs horizontais com scroll em mobile) + painel de conteúdo à direita                                                       |

---

## 12. Acessibilidade

### Contraste mínimo

| Combinação | Contraste mínimo exigido | Status nesta paleta |
|---|---|---|
| `neutral-900` sobre `neutral-50` (texto principal, claro) | 4.5:1 (AA) | **Verificado: ~17.7:1** (AAA) |
| `neutral-0` sobre `blue-500` (texto de botão primário, claro) | 4.5:1 (AA) | **Verificado: ~4.5–5:1** (AA) |
| `neutral-500` sobre `neutral-0` (texto secundário, claro) | 4.5:1 (AA) | **Verificado: ~4.8:1** (AA, no limite — usar apenas em texto ≥14px) |
| `neutral-50` sobre `neutral-950` (texto principal, escuro) | 4.5:1 (AA) | **Verificado: ~18.4:1** (AAA) |
| `blue-400` sobre `neutral-950` (link/texto de ação, escuro) | 4.5:1 (AA) | **Verificado: ~5.9:1** (AA) |
| Texto de status (`*-fg` 700/800) sobre fundo de status (`*-bg` 50/100) | 4.5:1 (AA) | **Estimado: ≥6:1 em todas as 5 combinações** — o tom base (500) de cada status sozinho sobre branco **não** passa AA (ex: `#F59E0B` puro sobre branco ≈ 2.1:1) — por isso o componente Badge nunca usa a cor base como texto, apenas como dot decorativo de 6px ao lado do texto |

### Foco por teclado

Todo componente interativo documentado na Seção 10 tem um estado `Focus` definido: anel de 2px na cor `color-primary` (`blue-500` no claro, `blue-400` no escuro) com 2px de offset. O anel nunca é removido sem um substituto de igual ou maior visibilidade — `outline: none` sem alternativa é proibido em qualquer componente.

### Área de toque mínima

44×44px para qualquer elemento clicável/tocável, inclusive quando o elemento visual (ícone, checkbox) é menor — o padding invisível completa a área. Crítico neste produto pelo uso real predominante em celular, muitas vezes com uma mão só, no meio de um atendimento.

### Outras notas

- `prefers-reduced-motion`: respeitado em todas as animações (ver Seção 6).
- Idioma único (pt-BR) nesta versão — não há requisito de RTL ou múltiplos idiomas no escopo discutido.

---

## 13. Tokens Prontos para Implementação

### CSS Variables (núcleo, formato universal)

```css
:root {
  /* Cor essencial */
  --color-primary: #1E5EFF;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-border: #E2E8F0;

  /* Tipografia */
  --font-display: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-body: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Espaçamento (base 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Forma */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-md: 0 4px 12px rgba(17, 24, 39, 0.10);
}
```

### Tailwind CSS v4 + shadcn/ui (`app/globals.css`)

Formato CSS-first do Tailwind v4, com nomenclatura compatível com os componentes shadcn (`--background`,
`--primary`, `--card`, etc.), incluindo as extensões próprias do OrçaFácil (`status-*`, `chart-*`).

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.75rem;

  /* Primitivas — Neutro */
  --neutral-0: #FFFFFF;
  --neutral-50: #F8FAFC;
  --neutral-100: #F1F5F9;
  --neutral-200: #E2E8F0;
  --neutral-300: #CBD5E1;
  --neutral-400: #94A3B8;
  --neutral-500: #6B7280;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1E293B;
  --neutral-900: #111827;
  --neutral-950: #0A0E16;

  /* Primitivas — Azul */
  --blue-50: #EEF3FF;
  --blue-100: #DCE7FF;
  --blue-400: #5C87FF;
  --blue-500: #1E5EFF;
  --blue-600: #1648D6;
  --blue-700: #1136AD;

  /* Status de orçamento/recibo */
  --status-pending: #F59E0B;     --status-pending-bg: #FEF3C7;     --status-pending-fg: #92400E;
  --status-approved: #16A34A;    --status-approved-bg: #DCFCE7;    --status-approved-fg: #15803D;
  --status-rejected: #DC2626;    --status-rejected-bg: #FEE2E2;    --status-rejected-fg: #B91C1C;
  --status-cancelled: #64748B;   --status-cancelled-bg: #F1F5F9;   --status-cancelled-fg: #475569;
  --status-completed: #0D9488;   --status-completed-bg: #CCFBF1;   --status-completed-fg: #0F766E;

  /* Feedback do sistema */
  --success: #16A34A;
  --warning: #F59E0B;
  --danger: #DC2626;
  --info: #0EA5E9;

  /* Tokens semânticos shadcn — modo claro */
  --background: var(--neutral-50);
  --foreground: var(--neutral-900);
  --card: var(--neutral-0);
  --card-foreground: var(--neutral-900);
  --popover: var(--neutral-0);
  --popover-foreground: var(--neutral-900);
  --primary: var(--blue-500);
  --primary-foreground: var(--neutral-0);
  --secondary: var(--neutral-100);
  --secondary-foreground: var(--neutral-900);
  --muted: var(--neutral-100);
  --muted-foreground: var(--neutral-500);
  --accent: var(--neutral-100);
  --accent-foreground: var(--neutral-900);
  --destructive: #DC2626;
  --destructive-foreground: var(--neutral-0);
  --border: var(--neutral-200);
  --input: var(--neutral-200);
  --ring: var(--blue-500);

  --chart-1: var(--status-pending);
  --chart-2: var(--status-approved);
  --chart-3: var(--status-rejected);
  --chart-4: var(--status-cancelled);
  --chart-5: var(--status-completed);

  --sidebar: var(--neutral-0);
  --sidebar-foreground: var(--neutral-900);
  --sidebar-primary: var(--blue-500);
  --sidebar-primary-foreground: var(--neutral-0);
  --sidebar-accent: var(--neutral-100);
  --sidebar-accent-foreground: var(--neutral-900);
  --sidebar-border: var(--neutral-200);
  --sidebar-ring: var(--blue-500);
}

.dark {
  --background: var(--neutral-950);
  --foreground: var(--neutral-50);
  --card: var(--neutral-900);
  --card-foreground: var(--neutral-50);
  --popover: var(--neutral-800);
  --popover-foreground: var(--neutral-50);
  --primary: var(--blue-400);
  --primary-foreground: var(--neutral-950);
  --secondary: var(--neutral-800);
  --secondary-foreground: var(--neutral-50);
  --muted: var(--neutral-800);
  --muted-foreground: var(--neutral-400);
  --accent: var(--neutral-800);
  --accent-foreground: var(--neutral-50);
  --destructive: #F87171;
  --destructive-foreground: var(--neutral-950);
  --border: var(--neutral-800);
  --input: var(--neutral-700);
  --ring: var(--blue-400);

  --status-pending-bg: rgba(245, 158, 11, 0.16);   --status-pending-fg: #FBBF24;
  --status-approved-bg: rgba(22, 163, 74, 0.16);   --status-approved-fg: #4ADE80;
  --status-rejected-bg: rgba(220, 38, 38, 0.16);   --status-rejected-fg: #F87171;
  --status-cancelled-bg: rgba(100, 116, 139, 0.20); --status-cancelled-fg: #94A3B8;
  --status-completed-bg: rgba(13, 148, 136, 0.18);  --status-completed-fg: #2DD4BF;

  --sidebar: var(--neutral-900);
  --sidebar-foreground: var(--neutral-50);
  --sidebar-primary: var(--blue-400);
  --sidebar-primary-foreground: var(--neutral-950);
  --sidebar-accent: var(--neutral-800);
  --sidebar-accent-foreground: var(--neutral-50);
  --sidebar-border: var(--neutral-800);
  --sidebar-ring: var(--blue-400);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-status-pending: var(--status-pending);
  --color-status-pending-bg: var(--status-pending-bg);
  --color-status-pending-fg: var(--status-pending-fg);
  --color-status-approved: var(--status-approved);
  --color-status-approved-bg: var(--status-approved-bg);
  --color-status-approved-fg: var(--status-approved-fg);
  --color-status-rejected: var(--status-rejected);
  --color-status-rejected-bg: var(--status-rejected-bg);
  --color-status-rejected-fg: var(--status-rejected-fg);
  --color-status-cancelled: var(--status-cancelled);
  --color-status-cancelled-bg: var(--status-cancelled-bg);
  --color-status-cancelled-fg: var(--status-cancelled-fg);
  --color-status-completed: var(--status-completed);
  --color-status-completed-bg: var(--status-completed-bg);
  --color-status-completed-fg: var(--status-completed-fg);

  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-info: var(--info);

  --font-display: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-body: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}

body {
  font-family: var(--font-body);
}
```

> **Uso no componente Badge de Status (exemplo prático):**
> ```tsx
> <span className="bg-status-pending-bg text-status-pending-fg rounded-full px-3 py-1 text-xs font-semibold">
>   Pendente
> </span>
> ```

---

## 14. Faça e Evite

### Cor
✅ Use o tom 700/800 da cor de status como texto sobre o tom 50/100 como fundo — ❌ Nunca use a cor base (500) de
um status como texto sobre fundo branco; o contraste fica abaixo de AA.

✅ Reserve o Azul Primário exclusivamente para ação clicável — ❌ Não use `color-primary` em badges informativos ou
elementos decorativos; isso dilui o sinal de "isso é clicável".

✅ No gráfico de distribuição por status, use sempre as 5 cores `status-*` na mesma ordem dos badges — ❌ Não use
uma paleta de gráfico genérica (azul/verde/laranja aleatórios) que quebre a associação cor↔status do resto do
produto.

### Tipografia
✅ Use `text-data-value` (SemiBold) em qualquer valor monetário, em qualquer tamanho de contexto — ❌ Não exiba
valores monetários em peso Regular (400); o produto perde a hierarquia que diferencia "dado" de "texto comum".

✅ Use no máximo 3 tamanhos de fonte na mesma tela ou card — ❌ Não misture `text-heading-md` e `text-heading-sm`
no mesmo nível hierárquico só porque "parece melhor" visualmente naquele card específico.

### Componentes
✅ Todo componente interativo tem estado de foco visível por teclado — ❌ Nunca remova `outline`/anel de foco sem
um substituto de igual visibilidade.

✅ Badge de status sempre com label de texto visível, nunca só cor/dot — ❌ Não crie uma variante "compacta" do
Badge que mostre só a cor, mesmo em espaços apertados de mobile; use abreviação de texto antes de remover o texto.

✅ Use o Skeleton específico do formato do conteúdo (linha de tabela, stat card) — ❌ Não use um spinner genérico
central de tela inteira para qualquer carregamento; isso esconde a estrutura da tela e aumenta a percepção de
demora.

---

## 15. Anexos e Próximos Passos

### Componentes pendentes de especificação

- **Biblioteca de gráficos específica** (ex: Recharts, Chart.js) — este documento define apenas o Chart Card como
  envoltório e a regra de cor (`chart-1` a `chart-5` mapeados aos status), mas não a configuração detalhada de
  eixos, tooltips de gráfico ou animação de entrada de dado, que depende da biblioteca escolhida pelo time.
- **Editor de itens de orçamento** (adicionar/remover linhas de produto/serviço com cálculo de total em tempo
  real) — provavelmente um padrão de "lista editável" específico, não coberto pelos componentes genéricos de
  Tabela/Input documentados aqui. Recomendo especificar como prioridade da próxima rodada, já que é o coração do
  fluxo de criação de orçamento.
- **Notificações push/in-app** (sino no header com contador) — mencionado meio caminho no Toast/Alert, mas o
  painel de lista de notificações em si não foi desenhado.

### Itens pendentes de verificação

- Contraste exato das 5 combinações `status-*-bg`/`-fg` no modo escuro foi estimado por padrão de construção (texto claro 400 sobre fundo translúcido 16–20%), não calculado individualmente cor a cor — recomendo validar com uma ferramenta de contraste (ex: Stark, ou o WebAIM Contrast Checker) antes do lançamento do modo escuro.

### Histórico de versões

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | Junho de 2026 | Criação do design system completo a partir do Brandbook OrçaFácil v2.0 — fundamentos (cor, tipografia, espaçamento, forma, movimento), introdução do modo escuro, sistema de cor para os 5 estados de orçamento/recibo, cobertura completa de componentes (formulário, dados, navegação, feedback) e tokens prontos para Next.js + Tailwind v4 + shadcn/ui |

