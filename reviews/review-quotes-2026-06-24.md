# 🔍 Code Review: Listagem de Orçamentos (`/app/quotes`)
**Data**: 2026-06-24 | **Revisor**: Antigravity Code Review Agent

---

## 📋 Resumo Geral
A tela de listagem de orçamentos (`/app/quotes`) está funcional no fluxo básico de dados, utilizando corretamente o padrão de Server Components na rota e transferindo a interatividade necessária para o Client Component `<QuotesList>`. Contudo, a tela apresenta graves problemas de responsividade em viewports intermediárias e móveis, quebras estéticas severas no modo escuro (dark mode) devido a cores hardcoded da paleta padrão do Tailwind, e desalinhamento com os tokens do Design System OrçaFácil (especialmente no calendário e botões). Correções cirúrgicas são necessárias para garantir a qualidade visual exigida pelo produto.

---

## 🔴 Problemas Críticos (Gravidade Máxima)

### 1. Classe de Estilo Inexistente (Quebra do Design System)
- **Onde**: [columns.tsx](file:///c:/DEV/orcafacil/app/app/quotes/columns.tsx#L109)
- **Impacto**: O código tenta estilizar a data vazia com a classe `text-ds-color-text-disabled`. Como essa classe não existe no mapeamento do Tailwind CSS v4, o caractere `-` herda a cor padrão do elemento pai ou renderiza sem a cor desabilitada correta, violando a consistência visual.
- **Como Corrigir**:
  Substituir a classe inexistente pelo token de cor correto do design system usando o padrão inline ou classe mapeada:
  ```tsx
  // Antes
  if (!dateStr) return <span className="text-ds-body-md text-ds-color-text-disabled">-</span>

  // Depois
  if (!dateStr) return <span className="text-ds-body-md text-(--ds-color-text-disabled)">-</span>
  ```

### 2. Uso do Tipo `any` (TypeScript Estrito)
- **Onde**: [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx#L197)
- **Impacto**: A expressão `const quoteTotal = parseFloat(quote.total as any || 0)` desativa a checagem de tipos do TypeScript. Isso viola as regras estritas da stack do projeto ("É estritamente proibido o uso do tipo any").
- **Como Corrigir**:
  Fazer um cast seguro ou garantir que a interface do modelo `Quote` defina `total` como número ou string conversível, realizando o narrowing de tipo:
  ```typescript
  // Antes
  const quoteTotal = parseFloat(quote.total as any || 0)

  // Depois (narrowing de tipo seguro)
  const rawTotal = quote.total;
  const quoteTotal = typeof rawTotal === 'number' 
    ? rawTotal 
    : typeof rawTotal === 'string' 
      ? parseFloat(rawTotal) || 0 
      : 0;
  ```

### 3. Ícones Invisíveis no Dark Mode (Quebra de Visualização)
- **Onde**: [columns.tsx](file:///c:/DEV/orcafacil/app/app/quotes/columns.tsx#L232) e [columns.tsx](file:///c:/DEV/orcafacil/app/app/quotes/columns.tsx#L230)
- **Impacto**: O botão do menu de ações na tabela usa a classe `text-slate-700` de forma estática. No modo escuro, a superfície do card tem a cor `--ds-color-neutral-900` (#111827), fazendo com que o ícone de três pontinhos fique quase invisível por falta de contraste. O mesmo ocorre com o loader que usa `text-slate-500`.
- **Como Corrigir**:
  Substituir as classes de cores fixas de slate por classes adaptativas que usam as variáveis de cor semânticas do shadcn/ui:
  ```tsx
  // Antes
  <MoreHorizontal className="h-4 w-4 text-slate-700" />
  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />

  // Depois
  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  ```

---

## 🟠 Problemas Importantes (Gravidade Alta)

### 1. Tabela Cortada Sem Rolagem Horizontal (Quebra de Responsividade)
- **Onde**: [data-table.tsx](file:///c:/DEV/orcafacil/components/ui/data-table.tsx#L102)
- **Impacto**: A div que envelopa a tabela de dados está estilizada com `overflow-hidden`. Em resoluções intermediárias de tela (como tablets de 768px a laptops de 1024px) onde a tabela é exibida, as 8 colunas excedem a largura disponível. A tabela é simplesmente cortada à direita, ocultando dados vitais como a situação e as ações de menu, sem permitir qualquer rolagem lateral.
- **Como Corrigir**:
  Substituir a propriedade `overflow-hidden` por `overflow-x-auto` para permitir rolagem horizontal segura apenas na tabela:
  ```tsx
  // Antes
  <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

  // Depois
  <div className="rounded-xl border bg-card shadow-sm overflow-x-auto w-full">
  ```

### 2. Estilo Fixo e Quebra de Dark Mode no Calendário
- **Onde**: [date-range-picker.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/date-range-picker.tsx#L34)
- **Impacto**: O botão de abertura do calendário (`PopoverTrigger`) usa classes estáticas de cor do Tailwind: `border-slate-200 bg-white text-slate-600 hover:bg-slate-50`. No modo escuro, esse botão permanece branco puro brilhante no meio da tela escura, quebrando a identidade visual e ferindo as diretrizes de dark mode do Design System.
- **Como Corrigir**:
  Substituir a tag de botão personalizada por uma instância do próprio componente `<Button variant="outline">` da aplicação, que já vem estilizado nativamente com suporte claro/escuro via tokens do shadcn:
  ```tsx
  // Antes
  <PopoverTrigger
    id="date"
    className={cn(
      'w-65 inline-flex items-center justify-start text-left font-normal border border-slate-200 bg-white text-slate-600 h-10 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer',
      !date && 'text-muted-foreground',
    )}
  >
    <CalendarIcon className="mr-2 h-4 w-4" />
    ...
  </PopoverTrigger>

  // Depois
  <PopoverTrigger asChild>
    <Button
      id="date"
      variant="outline"
      className={cn(
        'w-65 justify-start text-left font-normal h-10 px-3 py-2 text-sm transition-colors cursor-pointer',
        !date && 'text-muted-foreground',
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      ...
    </Button>
  </PopoverTrigger>
  ```

### 3. Popover Estourando a Largura no Mobile (Responsividade)
- **Onde**: [date-range-picker.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/date-range-picker.tsx#L53-L61)
- **Impacto**: O calendário está configurado permanentemente para exibir dois meses lado a lado (`numberOfMonths={2}`). Em dispositivos móveis (320px a 480px de largura de tela), o popover expande para cerca de 560px, estourando a tela e impedindo que o usuário veja ou selecione as datas corretamente.
- **Como Corrigir**:
  Adicionar detecção dinâmica de breakpoint no lado do cliente e ajustar a quantidade de meses exibidos no `<Calendar>`:
  ```tsx
  // No componente DatePickerWithRange
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    setIsMobile(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  // Na renderização do Calendar
  <Calendar
    ...
    numberOfMonths={isMobile ? 1 : 2}
  />
  ```

---

## 🟡 Melhorias Recomendadas (Gravidade Média)

### 1. Quebra de Breakpoint da Barra de Filtros
- **Onde**: [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx#L140)
- **Impacto**: O container dos filtros junta o seletor de datas e o Tabs com 8 situações na mesma linha a partir do breakpoint `md` (`md:flex-row`). Como as Tabs possuem muitos itens e somam mais de 700px, em telas de 768px a ~1100px o layout quebra ou empurra o date picker de forma desordenada.
- **Como Corrigir**:
  Elevar o breakpoint de alinhamento em linha do seletor e abas de status para `lg` ou `xl`, ou permitir que as abas quebrem em linha própria mais cedo.

### 2. DotMap com Cores Arbitrárias e Baixo Contraste no Dark Mode
- **Onde**: [quotes-list.tsx](file:///c:/DEV/orcafacil/app/app/quotes/quotes-list.tsx#L58-L66)
- **Impacto**: O mapeamento de cores dos círculos (`dotMap`) usa classes neutras estáticas (`bg-neutral-400`, `bg-neutral-500`, etc.) que não estão conectadas aos tokens semânticos e podem ter contraste ruim ou comportamento inesperado no modo escuro.
- **Como Corrigir**:
  Substituir os valores de classes por variáveis semânticas do Design System e renderizar os círculos utilizando `style={{ backgroundColor: dotMap[tab.value] }}`:
  ```typescript
  const dotMap: Record<string, string> = {
    draft: 'var(--ds-color-text-disabled)',
    pending: 'var(--ds-color-status-pending)',
    approved: 'var(--ds-color-status-approved)',
    rejected: 'var(--ds-color-status-rejected)',
    cancelled: 'var(--ds-color-status-cancelled)',
    completed: 'var(--ds-color-status-completed)',
    expired: 'var(--ds-color-text-secondary)',
  }
  ```

### 3. Componente Legado / Não Utilizado (`QuotesFilter`)
- **Onde**: [quotes-filter.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quotes-filter.tsx)
- **Impacto**: Esse componente não é importado em `quotes-list.tsx`, utiliza botões de uma biblioteca terceira (`@base-ui/react/button`), possui cores claras hardcoded e lógica redundante. Sua presença no diretório polui a arquitetura.
- **Como Corrigir**:
  Remover ou isolar o arquivo para evitar que outros desenvolvedores tentem utilizá-lo erroneamente.

---

## 🟢 Melhorias de Qualidade & Nomenclatura (Gravidade Baixa)

### 1. Nomenclatura de Função Fora do Padrão
- **Onde**: [columns.tsx](file:///c:/DEV/orcafacil/app/app/quotes/columns.tsx#L33)
- **Impacto**: A função `brl` está em minúsculo, não começa com verbo e faz referência a um termo nacional. As regras de nomenclatura exigem código em inglês e verbos no início de funções.
- **Como Corrigir**:
  Renomear para `formatCurrency` ou `formatBRL`:
  ```typescript
  const formatBRL = (value: number) => ...
  ```

### 2. Cores Hardcoded em Ícones de Transição
- **Onde**: [columns.tsx](file:///c:/DEV/orcafacil/app/app/quotes/columns.tsx#L349-L383)
- **Impacto**: Ícones de ação no menu de transição de status utilizam classes de cores estáticas do Tailwind (`text-indigo-500`, `text-emerald-500`, `text-rose-500`, etc.), que não se adaptam de acordo com os tokens de status correspondentes.
- **Como Corrigir**:
  Substituir pelas cores semânticas ou pelos tokens mapeados no design system (ex: `text-success`, `text-destructive`).

---

## ✅ Pontos Positivos
- **Destaque 1**: Excelente uso do padrão de renderização híbrido do Next.js: dados buscados no servidor e repassados de forma limpa para manipulação de estados no cliente.
- **Destaque 2**: Separação correta de visualização mobile vs desktop (Tabela oculta no mobile e exibição de cartões táteis `<Link>` responsivos).
- **Destaque 3**: Uso consistente do componente centralizado `<QuoteStatusBadge>` nas colunas e nos cartões de orçamento.

---

## 📝 Checklist de Validação da Stack do Orca Fácil

### Segurança & Multi-Tenancy
- [x] O código backend/Server Action não confia no ID de cliente e valida rigorosamente o `tenant_id` ou propriedade do registro.
- [x] RLS está ativo na tabela e nenhuma query burla políticas do banco de dados.
- [x] Chaves de API, credenciais ou secrets usam estritamente variáveis de ambiente.

### Arquitetura & SRP
- [x] Lógica de negócio está isolada em serviços (`lib/services/`) e não está misturada em componentes de UI.
- [x] Server Components são usados por padrão para carregar dados; `"use client"` está limitado à interatividade obrigatória.
- [x] Server Actions validam inputs com Zod e autenticam o usuário no lado do servidor.

### Qualidade TypeScript & Higiene
- [ ] Nenhum tipo `any` foi utilizado. Tipos explícitos ou `unknown` com narrowing são usados. (Falhou em `quotes-list.tsx` devido a `quote.total as any`).
- [ ] Padrão de Nomenclatura em Inglês: Funções começam com verbo de ação; booleanos começam com `is`, `has`, `should`, `can`. (Falhou na função `brl`).
- [x] Early Returns aplicados para achatar estruturas condicionais (limite de 3 níveis de aninhamento).
