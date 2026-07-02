# Referência: Runtime no Client — Re-renders, Hidratação e Web Vitals

## Web Vitals — o vocabulário para descrever impacto

Use estas métricas para dar precisão aos achados em vez de dizer só "lento":

- **LCP (Largest Contentful Paint):** tempo até o maior elemento visível (geralmente imagem de hero ou bloco de texto principal) renderizar. Bom ≤2.5s · Precisa melhorar ≤4s · Ruim >4s. Afetado por: TTFB, tamanho/otimização da imagem principal, bloqueio de renderização por CSS/JS.
- **INP (Interaction to Next Paint):** tempo entre uma interação do usuário (clique, toque, tecla) e a tela responder visualmente. Bom ≤200ms · Precisa melhorar ≤500ms · Ruim >500ms. Afetado por: JavaScript pesado rodando na main thread durante a interação, re-renders desnecessários, handlers de evento custosos.
- **CLS (Cumulative Layout Shift):** quanto o layout "pula" durante o carregamento. Bom ≤0.1 · Precisa melhorar ≤0.25 · Ruim >0.25. Afetado por: imagens/iframes sem dimensão reservada, fontes carregando sem `font-display` adequado, conteúdo inserido dinamicamente acima de conteúdo existente (ex: banner de cookie, anúncio).
- **TTFB (Time to First Byte):** tempo até o primeiro byte da resposta chegar. Afetado por: tempo de processamento no servidor (data fetching, cache, região da função) — é a métrica mais diretamente ligada às camadas de rendering/cache/backend deste guia.

Esses valores são os thresholds públicos do Google (web.dev/vitals) — se precisar de precisão absoluta para um relatório formal, confirme lá, pois podem ser revisados.

## Como medir (para incluir na seção de recomendações do relatório)

- **Lighthouse** (Chrome DevTools ou CLI `npx lighthouse <url>`) — boa para staging/produção, simula um carregamento completo.
- **Chrome DevTools → Performance tab** — melhor para investigar INP/travamentos: grava a timeline e mostra exatamente qual função/componente consumiu a main thread.
- **React DevTools → Profiler** — mostra quais componentes re-renderizaram e por quê, essencial para investigar problemas de INP causados por re-renders em cascata.
- **Vercel Speed Insights** — dados de Real User Monitoring (usuários reais em produção), a fonte mais confiável para números de produção porque não é uma simulação.
- **`next build`** (com Turbopack) já mostra o tamanho de cada rota no output do terminal — útil como primeira checagem de bundle sem precisar do analyzer completo.

## Re-renders desnecessários

```tsx
// 🟡 MÉDIO: todo componente dentro do Provider re-renderiza a cada mudança
// de QUALQUER campo do estado, mesmo componentes que só usam um campo
const AppContext = createContext<{ user: User; cart: CartItem[]; theme: string }>(...)

// ✅ CORRETO: contextos separados por domínio, ou memoização do value,
// para que mudar o carrinho não re-renderize quem só lê o tema
const UserContext = createContext<User>(...)
const CartContext = createContext<CartItem[]>(...)
const ThemeContext = createContext<string>(...)
```

Outro padrão comum: passar um objeto ou array literal como prop, recriado a cada render, quebrando `React.memo` do componente filho:

```tsx
// 🟡 MÉDIO: novo array a cada render do pai, mesmo que o conteúdo seja igual —
// invalida a comparação do React.memo no filho
<ProductList filters={{ category: 'all', sort: 'price' }} />

// ✅ CORRETO: valor estável (definido fora do render, ou memoizado)
const defaultFilters = { category: 'all', sort: 'price' }
<ProductList filters={defaultFilters} />
```

Se o projeto tem o **React Compiler habilitado** (`reactCompiler: true` — ver `references/rendering-and-components.md`), boa parte dessa memoização é feita automaticamente pelo compilador. Confirme se está habilitado antes de sinalizar falta de memoização manual como achado.

## Handlers de evento pesados — a causa mais direta de INP ruim

```tsx
// 🟠 ALTO: filtra um array grande de forma síncrona a cada tecla digitada,
// bloqueando a main thread durante a interação
function SearchBox({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const filtered = items.filter((i) => i.name.includes(query)) // roda a cada render
  return <input onChange={(e) => setQuery(e.target.value)} />
}

// ✅ CORRETO: memoiza o cálculo caro e/ou faz debounce da busca
const filtered = useMemo(
  () => items.filter((i) => i.name.includes(deferredQuery)),
  [items, deferredQuery]
)
// useDeferredValue ou debounce evita recalcular a cada tecla individual
```

## Hidratação — quanto mais HTML interativo, mais caro hidratar

Hidratação é o processo de "religar" a interatividade React sobre o HTML já renderizado pelo servidor. Árvores de Client Components muito grandes (listas longas totalmente interativas, tabelas gigantes marcadas inteiras como client) custam tempo de hidratação proporcional ao tamanho — isso se soma ao tempo até a página ficar realmente interativa, mesmo que o HTML já estivesse visível (LCP bom, mas INP inicial ruim). Reforça o ponto da Seção de rendering: reduzir a superfície de `'use client'` também reduz custo de hidratação, não só bundle.

## Layout Shift (CLS) fora de imagens/fontes

Além de imagens sem dimensão (já coberto em `bundle-and-assets.md`), CLS também é causado por:
- Conteúdo inserido dinamicamente acima de conteúdo já visível sem reservar espaço (banners, anúncios, notificações)
- Fontes de peso/estilo muito diferente do fallback, sem `font-display: swap` ajustado — `next/font` já lida com isso na maioria dos casos, mas vale confirmar visualmente se a fonte final e o fallback têm métricas parecidas

## Checklist rápido
- [ ] Contextos React separados por domínio, ou `value` memoizado, evitando re-render em cascata
- [ ] Handlers de evento com trabalho pesado usam memoização/debounce, não recalculam a cada render
- [ ] Nenhuma árvore de Client Components desnecessariamente grande (custo de hidratação)
- [ ] Se não há React Compiler, memoização manual presente onde há recomputação cara
- [ ] Recomendação de medição (Lighthouse/Speed Insights) incluída no relatório quando não há dados reais disponíveis
