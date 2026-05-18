# Referência: Supabase + RLS

## Checklist de Segurança — Supabase

### Row Level Security (RLS)

- [ ] RLS **habilitado** em todas as tabelas com dados de usuário
- [ ] Políticas RLS definidas para cada operação: SELECT, INSERT, UPDATE, DELETE
- [ ] Nunca usar `supabase.auth.admin` no client-side
- [ ] Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) usada **somente** em Server Actions / API Routes — jamais exposta ao cliente
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` é realmente segura para ser pública? (sim, se RLS estiver correto)
- [ ] Verificar se as políticas RLS não contêm lógica complexa ou funções lentas na cláusula `USING`, para não causar gargalos de performance.

### Clientes Supabase

- [ ] Client-side: usar `createBrowserClient` do `@supabase/ssr`
- [ ] Server-side (Server Components, Server Actions, Route Handlers): usar `createServerClient` com cookies
- [ ] Middleware: usar `createServerClient` para refresh de sessão
- [ ] **Nunca** usar `createClient` do `@supabase/supabase-js` direto em Server Components sem passar cookies

### Padrão correto para Server Component:

```typescript
// ✅ Correto
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {}
        },
      },
    },
  )
}
```

### Autenticação

- [ ] Verificar sessão com `supabase.auth.getUser()` — não `getSession()` (getSession pode ser falsificada)
- [ ] Redirecionar usuários não autenticados antes de qualquer operação de dados
- [ ] Nunca confiar apenas no middleware para proteger dados — RLS é a última linha de defesa

### Queries

- [ ] Sem `select('*')` desnecessário — selecionar apenas colunas necessárias
- [ ] Tratar erros: `const { data, error } = await supabase...` — sempre checar `error`.
- [ ] O tratametno de erros não deve expor mensagem original do supabase para o cliente em Server Actions ou Route Handlers.
- [ ] Sem queries em loops — usar queries batch ou relacionamentos
- [ ] Tipos gerados com `supabase gen types typescript` para segurança de tipos

### Anti-patterns comuns a detectar:

```typescript
// ❌ CRÍTICO: Service role no cliente
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// ❌ CRÍTICO: getSession() em vez de getUser() para verificação server-side
const {
  data: { session },
} = await supabase.auth.getSession()

// ❌ ALTO: Sem tratamento de erro
const { data } = await supabase.from('profiles').select('*')
// data pode ser null se houver erro!

// ✅ Correto
const { data, error } = await supabase
  .from('profiles')
  .select('id, name, avatar_url')
if (error) throw new Error(`Erro ao buscar perfil: ${error.message}`)
```
