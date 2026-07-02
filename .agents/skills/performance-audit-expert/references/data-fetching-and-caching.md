# Referência: Cache Components, `use cache` e Waterfalls de Dados

## O modelo de cache mudou no Next.js 16 — leia isto antes de julgar qualquer achado de cache

Até o Next.js 15, o framework cacheava agressivamente por padrão (às vezes de forma surpreendente). No Next.js 16, com a flag `cacheComponents` habilitada em `next.config.ts`, o modelo se inverteu: **tudo é dinâmico por padrão**, e cache é uma escolha explícita via diretiva `'use cache'`. Isso significa que "esta página não está cacheada" deixou de ser automaticamente um bug — pode ser simplesmente um projeto que ainda não adicionou `'use cache'` onde faria sentido, ou pode ser intencional (dado que precisa ser sempre fresco).

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true, // habilita o modelo Cache Components (use cache, cacheLife, cacheTag)
}
```

**Antes de reportar "falta de cache" como achado, confirme se `cacheComponents` está habilitado no projeto.** Se não estiver, o projeto está no modelo antigo (cache implícito via `fetch`/`revalidate`/route segment configs) — analise por esse modelo em vez de cobrar `'use cache'`.

## `'use cache'` — em que nível aplicar

A diretiva funciona em três escopos: arquivo inteiro, componente, ou função. Use o mais granular que fizer sentido — cachear a página inteira só funciona se ela não tiver nenhum dado específico do usuário (sessão, cookies).

```typescript
// ✅ Nível de arquivo — página inteira sem dado por usuário (ex: blog, marketing)
'use cache'
export default async function BlogPage() {
  const posts = await fetchAllPosts()
  return <PostList posts={posts} />
}

// ✅ Nível de componente — cacheia só a parte que pode ser cacheada,
// mantendo o resto da página dinâmico (ex: checa sessão)
export default async function SettingsPage() {
  const user = await getUser() // lê cookies — não pode ser cacheado
  return (
    <div>
      <h1>Configurações</h1>
      <Suspense fallback={<Loading />}>
        <CachedPreferences userId={user.id} />
      </Suspense>
    </div>
  )
}
async function CachedPreferences({ userId }: { userId: string }) {
  'use cache'
  const prefs = await db.preferences.findUnique({ where: { userId } })
  return <PreferencesForm prefs={prefs} />
}
```

```typescript
// 🟠 ALTO: cachear a página inteira quando ela lê cookies/sessão — vai quebrar
// (erro em build/dev) ou, pior, vazar dado de um usuário para outro se forçado
'use cache'
export default async function SettingsPage() {
  const user = await getUser() // 🚨 leitura de sessão dentro de escopo cacheado
  ...
}
```

## `cacheLife` — defina o tempo de vida, não deixe no padrão sem pensar

Sem chamar `cacheLife()`, o cache usa o perfil `default` (na prática, poucos minutos de frescor). Para a maioria dos casos reais vale a pena escolher um perfil explícito baseado na frequência de mudança do dado:

```typescript
import { cacheLife, cacheTag } from 'next/cache'

async function getCategoryList() {
  'use cache'
  cacheLife('days') // categorias mudam raramente
  cacheTag('categories')
  return db.categories.findMany()
}

async function getProductPrice(id: string) {
  'use cache'
  cacheLife('minutes') // preço pode mudar com frequência
  cacheTag(`price-${id}`)
  return db.products.findUnique({ where: { id } })
}
```

Achado comum: `cacheLife('seconds')` ou ausência de `cacheLife` em dado que raramente muda — desperdiça o benefício do cache ao revalidar com frequência desnecessária.

## `cacheTag` + `revalidateTag`/`updateTag` — invalidação cirúrgica

Sem tags, a única forma de invalidar é esperar o tempo expirar ou usar `revalidatePath`, que limpa tudo daquela rota — inclusive dado que não mudou. Verifique se mutações (Server Actions que alteram dado) invalidam só o que realmente mudou:

```typescript
// 🟡 MÉDIO: invalidação ampla demais — limpa cache de toda a rota /products
// mesmo tendo mudado só um produto
'use server'
export async function updateProduct(id: string, data: ProductInput) {
  await db.products.update({ where: { id }, data })
  revalidatePath('/products')
}

// ✅ CORRETO: invalida só o cache daquele produto específico
'use server'
import { updateTag } from 'next/cache'
export async function updateProduct(id: string, data: ProductInput) {
  await db.products.update({ where: { id }, data })
  updateTag(`product-${id}`)
}
```

## Waterfalls — a causa mais comum de "página lenta" que não aparece em nenhum lint

Um waterfall acontece quando chamadas de dados independentes entre si são feitas em sequência (uma espera a outra terminar) só porque foram escritas em `await` linha após linha, sem depender de fato uma da outra.

```typescript
// 🔴 CRÍTICO (se cada chamada leva ~300ms): 900ms total em série,
// mesmo as três sendo independentes entre si
export default async function DashboardPage() {
  const user = await getUser()
  const orders = await getOrders()       // não depende de `user`
  const notifications = await getNotifications() // não depende de nenhum dos dois
  return <Dashboard user={user} orders={orders} notifications={notifications} />
}

// ✅ CORRETO: as três rodam em paralelo — ~300ms total
export default async function DashboardPage() {
  const [user, orders, notifications] = await Promise.all([
    getUser(),
    getOrders(),
    getNotifications(),
  ])
  return <Dashboard user={user} orders={orders} notifications={notifications} />
}
```

O teste para diferenciar de um encadeamento legítimo: **a segunda chamada usa algum valor retornado pela primeira?** Se sim, é uma dependência real e o sequenciamento é necessário (ex: buscar usuário, depois buscar pedidos *daquele* usuário usando o ID retornado). Se não, é um waterfall evitável.

Waterfalls também acontecem entre componentes na árvore: um Server Component pai busca dado, passa como prop para um filho que busca outro dado que não dependia do primeiro. Prefira iniciar as duas buscas no mesmo nível (ou usar `Promise.all` acima na árvore) quando não há dependência real.

## `fetch` sem estratégia de cache explícita

Fora do escopo de `'use cache'`, todo `fetch()` deveria declarar intenção explícita de cache (`cache: 'force-cache'`, `next: { revalidate: N }`, ou `cache: 'no-store'` para deixar claro que é intencionalmente dinâmico). `fetch` sem nenhuma dessas opções é ambíguo — não fica claro se a ausência de cache foi decisão consciente.

## Checklist rápido
- [ ] `cacheComponents` habilitado (ou o projeto está conscientemente no modelo anterior)
- [ ] Dados que raramente mudam usam `'use cache'` com `cacheLife` apropriado
- [ ] Mutações usam `cacheTag`/`updateTag` para invalidação cirúrgica, não `revalidatePath` amplo por padrão
- [ ] Nenhum `await` sequencial para chamadas de dados independentes entre si (checar `Promise.all`)
- [ ] `fetch()` fora de `'use cache'` declara intenção de cache explicitamente
