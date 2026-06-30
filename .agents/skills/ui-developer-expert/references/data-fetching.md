# Data Fetching — Next.js 16 + React 19.2

---

## Server Components + fetch direto (padrão)

```tsx
// app/products/page.tsx — Server Component (padrão no Next.js 16)
// Next.js 16: dinâmico por padrão, sem caching implícito

export default async function ProductsPage() {
  const products = await fetchProducts() // executa a cada request
  return <ProductList products={products} />
}

async function fetchProducts() {
  const res = await fetch('https://api.example.com/products')
  if (!res.ok) throw new Error('Falha ao buscar produtos')
  return res.json() as Promise<Product[]>
}
```

---

## Cache Components (Next.js 16 — caching opt-in)

```tsx
// ✅ Next.js 16: 'use cache' torna o componente cacheável
'use cache'
import { cacheLife, cacheTag } from 'next/cache'

export async function ProductList() {
  cacheLife('hours') // ou 'seconds', 'days', custom config
  cacheTag('products') // para revalidação granular

  const products = await fetchProducts()
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}

// Revalidar por tag em Server Action:
'use server'
import { revalidateTag } from 'next/cache'

export async function invalidateProducts() {
  revalidateTag('products')
}
```

---

## Server Actions

```tsx
// app/actions/products.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string(),
})

// Server Action com validação e retorno tipado
export async function createProduct(
  formData: FormData
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const raw = Object.fromEntries(formData)
  const parsed = createProductSchema.safeParse({
    ...raw,
    price: parseFloat(raw.price as string),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const product = await db.products.create({ data: parsed.data })
    revalidateTag('products')
    revalidatePath('/products')
    return { success: true, id: product.id }
  } catch (err) {
    return { success: false, error: 'Erro ao criar produto' }
  }
}
```

```tsx
// Client component consumindo Server Action
'use client'

import { createProduct } from '@/app/actions/products'
import { useTransition } from 'react'

export function CreateProductForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createProduct(formData)
      if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Nome do produto" />
      <Input name="price" type="number" placeholder="Preço" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar produto
      </Button>
    </form>
  )
}
```

---

## TanStack Query (dados client-side ou com cache reativo)

```tsx
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto
        retry: 1,
      },
    },
  })
}

// providers.tsx (Client Component)
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { makeQueryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

```tsx
// hook de query padrão com tipagem
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query keys tipadas
const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters?: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
} as const

// Hook de listagem com filtros
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData, // evita flash vazio ao mudar filtros
  })
}

// Hook de mutation com invalidação
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProductApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
```

---

## Optimistic Updates

```tsx
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => toggleFavoriteApi(productId),

    // Atualiza UI antes da resposta do servidor
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.all })

      const previous = queryClient.getQueryData<Product[]>(queryKeys.products.list())

      queryClient.setQueryData<Product[]>(queryKeys.products.list(), old =>
        old?.map(p =>
          p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
        ) ?? []
      )

      return { previous }
    },

    // Reverte em caso de erro
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.products.list(), context.previous)
      }
      toast.error('Falha ao atualizar favorito')
    },

    // Revalida após sucesso ou erro
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}
```

---

## Infinite Scroll

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

export function useInfiniteProducts(filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: ({ pageParam = 1 }) => fetchProductsPage({ page: pageParam, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  })
}

// Componente com sentinel de scroll
export function InfiniteProductList({ filters }: { filters?: ProductFilters }) {
  const { ref, inView } = useInView()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteProducts(filters)

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) return <ProductListSkeleton />

  const products = data?.pages.flatMap(p => p.items) ?? []

  return (
    <div className="space-y-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}

      {/* Sentinel invisível para detectar scroll */}
      <div ref={ref} className="py-2 text-center text-sm text-muted-foreground">
        {isFetchingNextPage
          ? <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          : hasNextPage
          ? 'Role para carregar mais'
          : products.length > 0 ? 'Fim da lista' : null
        }
      </div>
    </div>
  )
}
```

---

## router.refresh() vs revalidateTag

```tsx
// Next.js 16: router.refresh() refaz a requisição da página atual
// Útil para atualizar dados dinâmicos sem navegação completa

'use client'
import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()
  return (
    <Button variant="ghost" onClick={() => router.refresh()}>
      <RefreshCw className="h-4 w-4" />
    </Button>
  )
}

// revalidateTag: revalida Cache Components específicos (server-side)
// Use em Server Actions após mutações
import { revalidateTag } from 'next/cache'
export async function deleteProduct(id: string) {
  'use server'
  await db.products.delete({ where: { id } })
  revalidateTag('products')          // invalida qualquer 'use cache' com essa tag
  revalidatePath('/products')        // invalida o cache da rota
}
```

---

## Suspense + Streaming

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Componentes com Suspense carregam em paralelo */}
      <Suspense fallback={<MetricCardSkeleton />}>
        <RevenueMetric />
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <ActiveUsersMetric />
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <ConversionMetric />
      </Suspense>

      {/* Lista principal com skeleton maior */}
      <div className="col-span-3">
        <Suspense fallback={<TableSkeleton rows={10} />}>
          <RecentTransactions />
        </Suspense>
      </div>
    </div>
  )
}

// Cada componente faz seu próprio fetch — carregam em paralelo
async function RevenueMetric() {
  const revenue = await fetchRevenue()
  return <MetricCard title="Receita" value={revenue} />
}
```