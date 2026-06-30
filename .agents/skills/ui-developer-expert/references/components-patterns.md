# Padrões Avançados de Componentes React

## 1. Compound Components

Use quando um componente tem múltiplas partes relacionadas que precisam compartilhar estado implicitamente.

```tsx
// ✅ Compound component com Context
interface AccordionContextValue {
  activeItem: string | null
  setActiveItem: (id: string | null) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordion() {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('useAccordion deve ser usado dentro de <Accordion>')
  return ctx
}

function Accordion({ children, defaultOpen }: { children: ReactNode; defaultOpen?: string }) {
  const [activeItem, setActiveItem] = useState<string | null>(defaultOpen ?? null)
  return (
    <AccordionContext.Provider value={{ activeItem, setActiveItem }}>
      <div className="divide-y divide-border">{children}</div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { activeItem, setActiveItem } = useAccordion()
  const isOpen = activeItem === id
  return (
    <div>
      <button
        className="flex w-full items-center justify-between py-4 text-sm font-medium"
        onClick={() => setActiveItem(isOpen ? null : id)}
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className="pb-4 text-sm text-muted-foreground">{children}</div>}
    </div>
  )
}

Accordion.Item = AccordionItem

// Uso:
<Accordion defaultOpen="item-1">
  <Accordion.Item id="item-1" title="Pergunta 1">Resposta 1</Accordion.Item>
  <Accordion.Item id="item-2" title="Pergunta 2">Resposta 2</Accordion.Item>
</Accordion>
```

---

## 2. Render Props / Children como Função

Use quando o pai precisa expor estado/comportamento para o filho decidir o que renderizar.

```tsx
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: Error | null) => ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return <>{children(data, loading, error)}</>
}

// Uso:
<DataFetcher<User[]> url="/api/users">
  {(users, loading, error) => {
    if (loading) return <Skeleton />
    if (error) return <ErrorState message={error.message} />
    if (!users?.length) return <EmptyState />
    return <UserList users={users} />
  }}
</DataFetcher>
```

---

## 3. Custom Hooks para Lógica de UI

Extraia lógica para hooks quando:
- O componente tem >2 useState relacionados
- A lógica é reutilizável em outros componentes
- Os side effects são complexos

```tsx
// ✅ Hook de disclosure (abrir/fechar modais, drawers, dropdowns)
function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  }
}

// ✅ Hook de lista com seleção múltipla
function useSelection<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  return {
    selected,
    isSelected: (id: string) => selected.has(id),
    isAllSelected: selected.size === items.length,
    toggle: (id: string) => setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    }),
    toggleAll: () => setSelected(prev =>
      prev.size === items.length ? new Set() : new Set(items.map(i => i.id))
    ),
    clear: () => setSelected(new Set()),
    count: selected.size,
  }
}

// ✅ Hook de debounce para search
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

---

## 4. Polymorphic Components

Use quando o componente pode renderizar como diferentes elementos HTML mantendo tipagem.

```tsx
type AsProp<C extends ElementType> = { as?: C }
type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P)
type PolymorphicProps<C extends ElementType, Props = {}> = Props &
  AsProp<C> &
  Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

interface TextOwnProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

type TextProps<C extends ElementType = 'p'> = PolymorphicProps<C, TextOwnProps>

function Text<C extends ElementType = 'p'>({
  as,
  size = 'md',
  weight = 'normal',
  className,
  ...props
}: TextProps<C>) {
  const Component = as ?? 'p'
  return (
    <Component
      className={cn(
        sizeMap[size],
        weightMap[weight],
        className
      )}
      {...props}
    />
  )
}

// Uso:
<Text as="h1" size="xl" weight="bold">Título</Text>
<Text as="span" size="sm">Legenda</Text>
<Text as="label" htmlFor="email" size="sm" weight="medium">Email</Text>
```

---

## 5. Controlled vs Uncontrolled

```tsx
// Padrão "optionally controlled" (como Radix faz)
interface InputProps {
  value?: string        // controlled quando fornecido
  defaultValue?: string // uncontrolled quando controlled não é fornecido
  onChange?: (value: string) => void
}

function SmartInput({ value, defaultValue, onChange, ...props }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e.target.value)
  }

  return <input value={currentValue} onChange={handleChange} {...props} />
}
```

---

## 6. Padrões de Error Boundary

```tsx
'use client'

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
    // Aqui: reportar para Sentry/LogRocket
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// Wrapper funcional para uso moderno
function withErrorBoundary<T extends object>(
  Component: ComponentType<T>,
  fallback: ReactNode
) {
  return function WithBoundary(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
```

---

## 7. Virtual List para Performance

Use quando listas têm >100 itens:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList<T>({ items, renderItem, estimateSize = 64 }: {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  estimateSize?: number
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="overflow-auto h-full">
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
```