# Referência: Shadcn UI + Tailwind CSS v4

## Checklist de UI e Estilização

### Shadcn UI (baseado em Base UI)

- [ ] Componentes importados de `@/components/ui/` — não do pacote npm diretamente
- [ ] Props de variantes usando o padrão `cva` (class-variance-authority) quando há múltiplas variantes
- [ ] Acessibilidade: `aria-label`, `aria-describedby`, `role` em elementos interativos sem texto visível
- [ ] Modais/Dialogs fecham ao pressionar Escape e ao clicar fora
- [ ] Formulários com `<Label htmlFor>` associado ao campo correto
- [ ] Estados de loading/disabled visíveis e funcionais
- [ ] `asChild` prop usado corretamente quando necessário (não envolver `<Button>` em `<a>` diretamente)
- [ ] Utilizar tema do shadcn definido em `src/app/globals.css`. Estilizar com Tailwind apenas o que não estiver definido no tema.
- [ ] Manter APIs mais modernas do Base UI e evitar hacks de CSS ou "workarounds" antigos presentes em versões antigas do Radix Primitives.

### Tailwind CSS v4

- [ ] Sem classes de Tailwind v3 que mudaram em v4 (ex: `shadow` → `shadow-sm`, remoção de `divide-*` em alguns casos)
- [ ] CSS Variables do tema (`--color-primary`, `--radius`) usadas em vez de valores hardcoded
- [ ] Sem valores mágicos em `style={{ }}` que deveriam ser classes Tailwind
- [ ] `cn()` (de `clsx` + `tailwind-merge`) usado para combinar classes condicionalmente — nunca template strings
- [ ] Responsividade implementada com prefixos (`sm:`, `md:`, `lg:`) — não com JS
- [ ] Dark mode via classe `dark:` — não com lógica JS manual
- [ ] Sem classes Tailwind duplicadas ou conflitantes (tailwind-merge resolve isso, mas indicar onde `cn()` está faltando)
- [ ] Priorizar o uso de Container Queries (`@container`, `@md`, etc.) em relação a Media Queries globais (`sm:`, `md:`) na construção de componentes modulares cujo layout depende do espaço do seu próprio container.

### Padrão correto:

```typescript
// ✅ cn() para classes condicionais
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-primary bg-primary/10',
  hasError && 'border-destructive',
  className // sempre aceitar className como prop em componentes reutilizáveis
)} />

// ✅ Variantes com cva
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

### Acessibilidade (a11y)

- [ ] Contraste de cores adequado (mínimo 4.5:1 para texto normal)
- [ ] Navegação por teclado funcional (foco visível, ordem lógica)
- [ ] Imagens com `alt` descritivo (ou `alt=""` para imagens decorativas)
- [ ] Sem uso de `onClick` em `<div>` sem `role="button"` e `onKeyDown`
- [ ] Sem depender apenas de cor para transmitir informação

### Anti-patterns comuns a detectar:

```typescript
// ❌ Template string para classes condicionais (tailwind-merge não funciona)
className={`flex ${isActive ? 'bg-blue-500' : 'bg-gray-200'} p-4`}
// ✅ usar cn()

// ❌ Hardcoded color sem usar CSS variable do tema
<div style={{ color: '#3b82f6' }} />
// ✅ <div className="text-primary" />

// ❌ onClick em div sem acessibilidade
<div onClick={handleClick}>Clique aqui</div>
// ✅ <button onClick={handleClick}>Clique aqui</button>

// ❌ Import direto do pacote (impede customização)
import { Button } from '@radix-ui/react-button'
// ✅ import { Button } from '@/components/ui/button'
```
