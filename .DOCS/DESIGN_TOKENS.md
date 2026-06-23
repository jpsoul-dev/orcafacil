# Design Tokens — Referência Rápida OrçaFácil

> **Para agentes de IA e desenvolvedores:** Este é o guia de referência para implementar componentes visuais consistentes com o Design System OrçaFácil. Sempre consulte este arquivo antes de criar ou modificar qualquer elemento de UI. O documento-fonte completo é [Design-System-OrcaFacil.md](./Design-System-OrcaFacil.md).

---

## Como usar os tokens

Os tokens do DS estão disponíveis como **CSS Custom Properties** com prefixo `--ds-*` em toda a aplicação. Existem **duas formas** de usá-los:

### 1. Via `style` ou `className` com `var()`

```tsx
// Recomendado para valores que não têm classe Tailwind correspondente
<div style={{ backgroundColor: 'var(--ds-color-status-pending-bg)' }} />
<span className="text-[var(--ds-color-status-pending-fg)]" />
```

### 2. Via classes Tailwind (prefixo `ds-`)

```tsx
// Disponível para cores, radius, sombras e espaçamento
<div className="bg-ds-primary text-ds-primary-foreground rounded-ds-md" />
```

---

## Componentes Base — Como criar corretamente

### ✅ Botão Primário

```tsx
import { Button } from '@/components/ui/button'

// Ação principal da tela — no máximo um por contexto
<Button variant="default" size="default">Criar orçamento</Button>

// Com ícone
<Button variant="default" size="default">
  <PlusIcon />
  Criar cliente
</Button>
```

**Tokens usados:** `--ds-color-primary` (fundo), `--ds-color-primary-hover` (hover), `--ds-radius-md` (12px), `--ds-motion-fast` (120ms)

### ✅ Botão Secundário / Ghost / Destrutivo

```tsx
<Button variant="outline">Cancelar</Button>        // outline — ação alternativa
<Button variant="secondary">Salvar rascunho</Button> // secondary — menor peso
<Button variant="ghost" size="sm">Ver detalhes</Button>  // ghost — tabelas/toolbars
<Button variant="destructive">Excluir recibo</Button>    // vermelho — irreversível
```

### ✅ Tamanhos de Botão (DS Seção 10)

| Size prop | Altura | Padding H | Quando usar |
|---|---|---|---|
| `sm` | 32px | 12px | Ações dentro de tabelas, toolbars compactas |
| `default` | 40px | 16px | **Padrão** — uso geral |
| `lg` | 48px | 24px | CTAs de tela cheia no mobile |
| `icon` | 40×40px | — | Ação compacta sem label (sempre com `aria-label`) |

---

### ✅ Badge de Status de Orçamento/Recibo

**REGRA CRÍTICA:** Use `QuoteStatusBadge` para qualquer status de orçamento ou recibo — nunca invente cores ad-hoc.

```tsx
import { QuoteStatusBadge } from '@/components/quote-status-badge'

<QuoteStatusBadge status="pending" />   // ● Pendente — âmbar
<QuoteStatusBadge status="approved" />  // ● Aprovado — verde
<QuoteStatusBadge status="rejected" />  // ● Rejeitado — vermelho
<QuoteStatusBadge status="cancelled" /> // ● Cancelado — cinza-azulado
<QuoteStatusBadge status="completed" /> // ● Finalizado — teal
<QuoteStatusBadge status="draft" />     // ● Rascunho — neutro
<QuoteStatusBadge status="expired" />   // ● Vencido — cinza
```

**Modo escuro:** automático via CSS variables — não é necessário nenhum código extra.

Se precisar de um badge de status nas variantes do `Badge` base:

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="status-pending">Pendente</Badge>
<Badge variant="status-approved">Aprovado</Badge>
// etc.
```

---

### ✅ Input de Texto

```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Nome do cliente" />
<Input type="email" aria-invalid={hasError} />  // estado de erro
<Input disabled />
```

**Tokens usados:** `--ds-radius-sm` (8px), altura 40px, `--ds-color-primary` no foco

---

### ✅ Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

// Card padrão
<Card>
  <CardHeader><CardTitle>Título</CardTitle></CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

// Card sem sombra (dentro de outro container elevado)
<Card variant="flat">...</Card>

// Card interativo (clicável — lista de orçamentos no mobile)
<Card variant="interactive">...</Card>
```

**Tokens usados:** `--ds-radius-lg` (16px), `--ds-color-surface`, `--ds-color-border`, `--ds-shadow-sm`

---

## Paleta de Cores — Referência

### Tokens Semânticos (use estes no código)

| Token CSS | Valor (claro) | Uso |
|---|---|---|
| `--ds-color-background` | `#F8FAFC` | Fundo da aplicação |
| `--ds-color-surface` | `#FFFFFF` | Fundo de cards, modais |
| `--ds-color-surface-muted` | `#F1F5F9` | Hover de linha, seções secundárias |
| `--ds-color-border` | `#E2E8F0` | Bordas e divisores |
| `--ds-color-text-primary` | `#111827` | Texto principal |
| `--ds-color-text-secondary` | `#6B7280` | Labels, metadados |
| `--ds-color-text-disabled` | `#94A3B8` | Placeholders, desabilitado |
| `--ds-color-primary` | `#1E5EFF` | **Ações primárias apenas** |
| `--ds-color-primary-hover` | `#1648D6` | Hover de botão primário |
| `--ds-color-primary-active` | `#1136AD` | Active/pressed de botão |
| `--ds-color-primary-foreground` | `#FFFFFF` | Texto sobre fundo primário |
| `--ds-color-danger` | `#DC2626` | Feedback de erro, botão destrutivo |
| `--ds-color-success` | `#16A34A` | Feedback positivo genérico |
| `--ds-color-warning` | `#F59E0B` | Feedback de atenção |
| `--ds-color-info` | `#0EA5E9` | Feedback informativo |

### Tokens de Status (use SOMENTE em orçamentos e recibos)

| Token | Uso |
|---|---|
| `--ds-color-status-pending` | Dot (ícone decorativo) |
| `--ds-color-status-pending-bg` | Fundo do badge |
| `--ds-color-status-pending-fg` | Texto do badge |
| *(repetir padrão para approved, rejected, cancelled, completed)* | |

> ⚠️ **Nunca use a cor base** (`--ds-color-status-pending`) como texto — contraste insuficiente. Use sempre `-fg` sobre `-bg`.

---

## Tipografia

| Token CSS | Tailwind class | Tamanho | Peso | Uso |
|---|---|---|---|---|
| `--ds-text-display` | `text-ds-display` | 36px | 700 | Empty state, boas-vindas |
| `--ds-text-heading-lg` | `text-ds-heading-lg` | 30px | 700 | Título de página |
| `--ds-text-heading-md` | `text-ds-heading-md` | 24px | 700 | Título de seção/card grande |
| `--ds-text-heading-sm` | `text-ds-heading-sm` | 20px | 600 | Subtítulo, título de modal |
| `--ds-text-heading-xs` | `text-ds-heading-xs` | 18px | 600 | Cabeçalho de tabela |
| `--ds-text-body-lg` | `text-ds-body-lg` | 16px | 400 | Texto corrido padrão |
| `--ds-text-body-md` | `text-ds-body-md` | 14px | 400 | Interface compacta (tabelas) |
| `--ds-text-body-sm` | `text-ds-body-sm` | 13px | 400 | Texto secundário, descrições |
| `--ds-text-caption` | `text-ds-caption` | 12px | 500 | Labels, metadados, timestamps |

### Line-height (prefixo `ds-` para não sobrescrever Tailwind padrão)

| Tailwind class | Valor | Uso |
|---|---|---|
| `leading-ds-tight` | 1.2 | Display, heading-lg |
| `leading-ds-snug` | 1.3 | Heading-md, data-value |
| `leading-ds-normal` | 1.4 | Heading-sm/xs, caption |
| `leading-ds-relaxed` | 1.5 | Body — texto corrido |

Valores monetários: sempre `font-semibold` (600), tamanho contextual.

```tsx
// Valor em tabela
<span className="text-[length:var(--ds-text-body-md)] font-semibold">
  R$ 1.250,00
</span>

// Valor em stat card
<span className="text-[length:var(--ds-text-heading-md)] font-semibold">
  R$ 12.500,00
</span>
```

---

## Radius

| Token CSS | Valor | Onde usar |
|---|---|---|
| `--ds-radius-sm` | 8px | Inputs, badges pequenos, checkbox |
| `--ds-radius-md` | 12px | **Botões**, cards padrão |
| `--ds-radius-lg` | 16px | Cards grandes, painéis, modais pequenos |
| `--ds-radius-xl` | 24px | Modais grandes, painel PDF |
| `--ds-radius-full` | 9999px | Avatares, pills de status |

```tsx
// Nos componentes:
className="rounded-[var(--ds-radius-md)]"   // botão
className="rounded-[var(--ds-radius-full)]" // badge pill
className="rounded-[var(--ds-radius-lg)]"   // card
className="rounded-[var(--ds-radius-xl)]"   // modal
```

---

## Sombras

| Tailwind class | Token DS | Uso |
|---|---|---|
| `shadow-sm` | `--ds-shadow-sm` | Cards em repouso (padrão) |
| `shadow-md` | `--ds-shadow-md` | Dropdowns, popovers, menu de ações |
| `shadow-lg` | `--ds-shadow-lg` | Modais, painel PDF, toasts |

> As classes Tailwind `shadow-sm/md/lg` agora usam os valores do DS diretamente (override via `@theme inline`). Não precisam de classes arbitrárias.

---

## Espaçamento

Base de **8px**. Use **somente** valores da escala abaixo:

| Token CSS | Valor | Uso típico |
|---|---|---|
| `--ds-space-1` | 4px | Gap entre ícone e texto |
| `--ds-space-2` | 8px | Padding compacto (botão sm) |
| `--ds-space-3` | 12px | Padding de inputs, botão md |
| `--ds-space-4` | 16px | Padding de cards, gap entre campos |
| `--ds-space-6` | 24px | Espaço entre blocos relacionados |
| `--ds-space-8` | 32px | Espaço entre seções de página |
| `--ds-space-12` | 48px | Grandes blocos, padding de header |
| `--ds-space-16` | 64px | Respiro de página em telas grandes |

> ❌ Nunca use valores fora desta escala (ex: 7px, 13px, 22px).

---

## Movimento

| Tailwind class | Token DS | Duração | Easing | Uso |
|---|---|---|---|---|
| `duration-ds-fast` | `--ds-motion-fast` | 120ms | `ease-out` | Hover, mudança de cor |
| `duration-ds-normal` | `--ds-motion-normal` | 200ms | `cubic-bezier(0.4,0,0.2,1)` | Dropdown, accordion |
| `duration-ds-slow` | `--ds-motion-slow` | 320ms | `cubic-bezier(0.4,0,0.2,1)` | Modal, painel PDF |

```tsx
className="transition-colors duration-ds-fast"
className="transition-all duration-ds-normal"
```

---

## Faça e Evite

### ✅ Faça

- Use `<Button variant="default">` para ação principal — no máximo UM por contexto de tela
- Use `<QuoteStatusBadge status="..." />` sempre que exibir status de orçamento ou recibo
- Use `-fg` sobre `-bg` nos tokens de status para garantir contraste
- Mantenha ícones em tamanho 20px dentro de botões e inputs (padrão shadcn/lucide)
- Adicione `aria-label` em todos os botões de ícone sem texto visível

### ❌ Evite

- **Nunca** use cores Tailwind arbitrárias para status (`bg-emerald-700`, `bg-indigo-700`, etc.)
- **Nunca** crie hex soltos no CSS ou no `style={{ }}` — use um token `--ds-*`
- **Nunca** remova o outline de foco sem substituto de igual visibilidade
- **Nunca** use `color-primary` em badges informativos ou decorativos — é sinal de "clicável"
- **Nunca** use valores de espaçamento fora da escala (7px, 13px, 22px, etc.)
- **Nunca** use `text-white` sobre a cor base de status (`#F59E0B`, `#16A34A`, etc.) — contraste insuficiente

---

*Referência gerada automaticamente com base no Design System OrçaFácil v1.0 — Junho de 2026*
