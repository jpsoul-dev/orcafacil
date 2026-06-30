# Animações — Framer Motion + React 19.2 View Transitions

---

## Princípios de animação em UI

```
✅ Animação que comunica: feedback de ação, estado de loading, transição de rota
✅ Micro-interações: hover, foco, check, toggle — curtas (100–200ms)
✅ Transições de layout: itens que entram/saem de listas, reordenação
❌ Animação decorativa sem propósito
❌ Animações longas (>400ms) em interações frequentes
❌ Motion em elementos que o usuário não interagiu

// Sempre respeitar preferência do usuário:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

---

## Setup básico — Framer Motion

```tsx
// ✅ Padrão: motion.div, AnimatePresence, useAnimate
import { motion, AnimatePresence, useAnimate, useSpring } from 'framer-motion'

// Variantes reutilizáveis
const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

const slideFromRight = {
  initial: { opacity: 0, x: '100%' },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '100%' },
}
```

---

## AnimatePresence (entrada/saída condicional)

```tsx
// Modal com animação de entrada e saída
export function AnimatedModal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl bg-background p-6 shadow-xl"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Toast/Notificação com saída para cima
export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="fixed bottom-4 right-4 rounded-lg bg-foreground px-4 py-3 text-sm text-background shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Layout animations (reordenação de listas)

```tsx
// Lista com itens que entram/saem/reordenam suavemente
export function AnimatedList<T extends { id: string }>({
  items,
  renderItem,
}: {
  items: T[]
  renderItem: (item: T) => ReactNode
}) {
  return (
    <motion.ul className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map(item => (
          <motion.li
            key={item.id}
            layout                              // ✅ anima reposicionamento
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            {renderItem(item)}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}

// Drag-to-reorder
import { Reorder } from 'framer-motion'

export function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T) => ReactNode
}) {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="space-y-2">
      {items.map(item => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="cursor-grab rounded-lg border bg-card active:cursor-grabbing"
          whileDrag={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
        >
          {renderItem(item)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

---

## Micro-interações com useAnimate

```tsx
'use client'
import { useAnimate } from 'framer-motion'

// Botão com feedback de click
export function PressableButton({ children, onClick, ...props }: ButtonProps) {
  const [scope, animate] = useAnimate()

  async function handleClick() {
    await animate(scope.current, { scale: 0.96 }, { duration: 0.1 })
    await animate(scope.current, { scale: 1 }, { type: 'spring', stiffness: 500 })
    onClick?.()
  }

  return (
    <button ref={scope} onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

// Shake de erro em formulário
export function ShakeOnError({ hasError, children }: { hasError: boolean; children: ReactNode }) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (hasError) {
      animate(scope.current,
        { x: [0, -8, 8, -8, 8, 0] },
        { duration: 0.4, ease: 'easeInOut' }
      )
    }
  }, [hasError])

  return <div ref={scope}>{children}</div>
}
```

---

## Stagger (animação em cascata)

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,  // delay entre cada filho
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function StaggeredCards({ cards }: { cards: Card[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-4"
    >
      {cards.map(card => (
        <motion.div key={card.id} variants={item} className="rounded-lg border bg-card p-4">
          <CardContent card={card} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

---

## View Transitions — React 19.2 + Next.js 16

```tsx
// ✅ Next.js 16: View Transitions nativos do browser via React 19.2
// Anima elementos que atualizam durante uma Transition ou navegação

import { startTransition } from 'react'

// Navegação com View Transition
import { useRouter } from 'next/navigation'

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    // startTransition ativa a View Transition API do browser
    startTransition(() => {
      router.push(href)
    })
  }

  return <a href={href} onClick={handleClick}>{children}</a>
}

// CSS para View Transitions
// app/globals.css
/*
::view-transition-old(root) {
  animation: 200ms ease-in both fade-out;
}
::view-transition-new(root) {
  animation: 200ms ease-out both fade-in;
}

@keyframes fade-out {
  to { opacity: 0; }
}
@keyframes fade-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
*/

// Elemento com view-transition-name para hero animation
<div style={{ viewTransitionName: `product-${id}` }} className="...">
  <img src={thumbnail} alt={name} />
</div>
```

---

## Skeleton Loader padronizado

```tsx
// Componente de skeleton reutilizável
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

// Skeletons compostos por contexto
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="border-b p-4 flex gap-4">
        {[40, 25, 20, 15].map((w, i) => (
          <Skeleton key={i} className={`h-4`} style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b last:border-0 p-4 flex gap-4 items-center">
          <Skeleton className="h-4" style={{ width: '40%' }} />
          <Skeleton className="h-4" style={{ width: '25%' }} />
          <Skeleton className="h-4" style={{ width: '20%' }} />
          <Skeleton className="h-6 w-16 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}
```