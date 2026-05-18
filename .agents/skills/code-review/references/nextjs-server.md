# Referência: Next.js — API Routes, Server Actions, Middleware

## Checklist — Next.js App Router (v15+)

### Server Components vs Client Components

- [ ] `"use client"` adicionado **somente** quando necessário: hooks, eventos de browser, state local
- [ ] Busca de dados em Server Components (sem `useEffect` + `fetch` no cliente quando evitável)
- [ ] Componentes pesados (charts, editores) lazy-loaded com `dynamic(() => import(...), { ssr: false })`
- [ ] Context providers são Client Components, mas seus filhos podem ser Server Components
- [ ] Sem `useState`/`useEffect` em Server Components (erro de build, mas bom flagear na review)

### Server Actions

- [ ] `'use server'` no topo do arquivo ou da função
- [ ] Autenticação verificada **dentro** da Server Action — não confiar em proteção só no middleware
- [ ] Inputs validados com Zod antes de qualquer operação
- [ ] Sem dados sensíveis retornados ao cliente além do necessário
- [ ] `revalidatePath()` ou `revalidateTag()` chamados após mutações quando necessário
- [ ] Não retorne erros brutos, capturados com `catch` para o cliente — retorne apenas mensagens genéricas e seguras.

### Padrão correto para Server Action:

```typescript
'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
})

export async function updateProfile(formData: unknown) {
  // 1. Autenticação
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autorizado' }

  // 2. Validação
  const result = updateProfileSchema.safeParse(formData)
  if (!result.success) return { error: result.error.flatten().fieldErrors }

  // 3. Operação
  const { error } = await supabase
    .from('profiles')
    .update(result.data)
    .eq('id', user.id)

  if (error) return { error: 'Erro ao atualizar perfil' }

  // 4. Revalidação
  revalidatePath('/profile')
  return { success: true }
}
```

### Route Handlers (API Routes)

- [ ] Método HTTP verificado quando necessário (`if (request.method !== 'POST')`)
- [ ] Headers de resposta corretos (`Content-Type: application/json`)
- [ ] Rate limiting em rotas públicas sensíveis
- [ ] CORS configurado corretamente se a rota é consumida por outros domínios
- [ ] Sem lógica de negócio duplicada entre Route Handlers e Server Actions

### Middleware

- [ ] `matcher` configurado corretamente — não rodar middleware em assets estáticos
- [ ] Middleware leve — sem operações pesadas (sem queries ao banco direto no middleware)
- [ ] Refresh de sessão do Supabase no middleware para manter cookies atualizados
- [ ] Redirecionamentos de autenticação no middleware são complementares ao RLS — não substitutos

### Cache e Revalidação

- [ ] `fetch()` com opções de cache explícitas quando relevante (`{ cache: 'no-store' }` para dados dinâmicos)
- [ ] Manter o padrão do `fetch` no Next.js 16+ que é `no-store` (não cacheia) - Utilizar `{ cache: 'force-cache' }` apenas quando os dados forem puramente estáticos.
- [ ] `unstable_cache` usado com `tags` para revalidação granular
- [ ] Sem dados de usuário cacheados sem escopar por `userId`

### Anti-patterns comuns a detectar:

```typescript
// ❌ CRÍTICO: Server Action sem autenticação
'use server'
export async function deletePost(id: string) {
  await supabase.from('posts').delete().eq('id', id) // ❌ Quem pode deletar?
}

// ❌ ALTO: Busca de dados no cliente com useEffect (quando Server Component resolveria)
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData) // ❌ waterfall + sem cache
  }, [])
}

// ❌ MÉDIO: "use client" desnecessário em componentes sem interatividade
'use client' // ❌ se não usa hooks/eventos, não precisa disso
export default function StaticCard({ title }: { title: string }) {
  return <div>{title}</div>
}
```
