# Referência: Renderização, Server/Client Components e Streaming

## O teste mental mais importante desta camada

Para todo arquivo com `'use client'`, pergunte: **"o que aqui realmente precisa rodar no navegador?"** Interatividade (`onClick`, `useState`, `useEffect`, hooks de browser) precisa. Buscar dados, formatar texto, montar listas a partir de dados já resolvidos — não precisa. Um erro comum é marcar um componente inteiro como client só porque um botão lá dentro precisa de `onClick`, quando só o botão deveria ser extraído para um componente client separado, mantendo o resto (a busca de dados, a lista, o layout) como Server Component.

```typescript
// 🟡 MÉDIO: componente inteiro é client só por causa de um botão de favoritar
'use client'
export default async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id) // 🚨 nem faz sentido: Client Component não pode ser async assim
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <FavoriteButton productId={id} />
    </div>
  )
}

// ✅ CORRETO: página fica Server Component, só o botão é client
export default async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id)
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <FavoriteButton productId={id} /> {/* 'use client' só aqui dentro */}
    </div>
  )
}
```

Cada componente marcado `'use client'` desnecessariamente aumenta o JavaScript enviado ao navegador (hidratação) e frequentemente força tudo abaixo dele na árvore a também rodar no client, mesmo que não precisasse.

## Streaming e Suspense — não deixe o dado mais lento travar a página inteira

Sem `<Suspense>`, o Next.js espera **todos** os data fetches de uma página resolverem antes de mandar qualquer HTML. Se um deles é lento (um relatório pesado, uma métrica agregada), a página inteira fica em branco até ele terminar — mesmo que o resto já estivesse pronto.

```typescript
// 🟠 ALTO: um único fetch lento (histórico de 2 anos) bloqueia a página inteira,
// inclusive o cabeçalho e a navegação que já estariam prontos
export default async function DashboardPage() {
  const summary = await getQuickSummary()      // rápido
  const fullHistory = await getFullHistory()   // lento — 2s+
  return (
    <div>
      <Header summary={summary} />
      <HistoryChart data={fullHistory} />
    </div>
  )
}

// ✅ CORRETO: o rápido aparece na hora, o lento faz streaming quando pronto
export default async function DashboardPage() {
  const summary = await getQuickSummary()
  return (
    <div>
      <Header summary={summary} />
      <Suspense fallback={<ChartSkeleton />}>
        <HistorySection />
      </Suspense>
    </div>
  )
}
async function HistorySection() {
  const fullHistory = await getFullHistory()
  return <HistoryChart data={fullHistory} />
}
```

Ao ler qualquer página/layout com múltiplos `await`, pergunte: **"algum desses é visivelmente mais lento que os outros, e está sem Suspense em volta?"** Isso é o achado de streaming mais comum e mais impactante no LCP/TTFB percebido.

## `loading.tsx` — feedback imediato em navegação

Rotas sem `loading.tsx` deixam a navegação parada (sem feedback visual) até o Server Component terminar de buscar dados. Isso não altera o tempo real de carregamento, mas altera drasticamente a percepção de lentidão (a UI parece travada em vez de "carregando"). Verifique se rotas com fetch de dados relevante têm um `loading.tsx` correspondente.

## React Compiler (estável desde o Next.js 16)

O Next.js 16 dá suporte estável ao React Compiler, que memoiza automaticamente componentes e valores sem precisar de `useMemo`/`useCallback`/`React.memo` manuais. Verifique em `next.config.ts` se `reactCompiler: true` está habilitado:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true,
}
```

Se o projeto **não** tem o React Compiler habilitado, memoização manual ausente em componentes com recomputação cara (listas grandes, transformações de dados, gráficos) é um achado válido — ver `references/client-runtime.md`. Se o compiler **está** habilitado, memoização manual redundante não é um problema de performance (o compiler já cobre isso), então não sinalize `useMemo` ausente como achado nesse cenário — foque em outras camadas.

## `<Activity>` e navegação (Next.js 16 + Cache Components)

Com Cache Components habilitado, o Next.js passou a preservar rotas visitadas anteriormente em modo "hidden" (via `<Activity>` do React) em vez de desmontá-las, mantendo estado de formulário e posição de scroll ao navegar de volta. Isso é uma otimização automática do framework — não é algo para o time implementar, mas vale mencionar como ⚪ Informativo se o projeto ainda não usa Cache Components, já que é um ganho de performance de navegação "de graça" ao migrar.

## Trabalho síncrono pesado em Server Component

Servidor não é sinônimo de rápido — um Server Component que faz um cálculo pesado de forma síncrona (ordenação de array grande, transformação de dados custosa, parsing de arquivo grande) bloqueia a geração daquele segmento da resposta. Diferente do client, aqui não trava a tela do usuário, mas aumenta o TTFB. Verifique loops e transformações custosas dentro de Server Components e considere mover para uma função cacheada (`'use cache'`) se o resultado não muda a cada request.

## Checklist rápido
- [ ] `'use client'` está no componente mais específico possível, não em páginas/layouts inteiros
- [ ] Data fetches com tempos de resposta muito diferentes estão separados por `<Suspense>`
- [ ] Rotas com fetch relevante têm `loading.tsx`
- [ ] `reactCompiler: true` habilitado (ou memoização manual presente onde falta o compiler)
- [ ] Nenhum cálculo pesado síncrono acontecendo sem necessidade a cada request em Server Component
