# Referência: API Routes, Server Actions e Middleware

## Trate Server Actions como endpoints públicos

Uma função `"use server"` não tem uma URL visível na navegação, mas o Next.js gera um endpoint HTTP real para ela — qualquer pessoa com o DevTools aberto consegue ver a chamada de rede e replicá-la com `fetch`/`curl`, inclusive com payloads diferentes dos que a UI enviaria. **Nunca assuma que uma Server Action só será chamada do jeito que o formulário da UI chama.** Toda a validação e checagem de autorização que você aplicaria numa API Route pública se aplica igualmente aqui.

## Validação de input — o schema é a fronteira de confiança

```typescript
// 🔴 CRÍTICO/ALTO dependendo do dado: sem validação, confia cegamente no shape do body
export async function POST(req: Request) {
  const body = await req.json()
  await supabase.from('orcamentos').insert(body) // body pode ter QUALQUER campo,
  // incluindo user_id, status, valor_total — mass assignment
}

// ✅ CORRETO: valida e extrai só os campos esperados
const schema = z.object({
  cliente: z.string().min(1).max(200),
  itens: z.array(z.object({ descricao: z.string().max(500), valor: z.number().positive() })).max(50),
})

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Dados inválidos' }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autenticado' }, { status: 401 })

  await supabase.from('orcamentos').insert({ ...parsed.data, user_id: user.id }) // user_id vem do server, não do client
}
```

Pontos a verificar em todo endpoint que recebe dados:
- **Mass assignment:** o objeto inteiro do client é passado direto para o insert/update, ou só os campos explicitamente esperados? Campos como `user_id`, `role`, `status`, `is_admin`, `preco_final` nunca devem vir do client quando o server pode derivá-los da sessão ou da lógica de negócio.
- **Limites de tamanho:** arrays, strings e uploads têm limite máximo? Um array de 1 item no formulário da UI não impede um atacante de mandar 100.000 itens no payload bruto.
- **Tipos e formato:** `z.string()` sem `.max()` aceita string de qualquer tamanho; IDs deveriam ser validados como UUID/formato esperado antes de ir para a query.
- **Erro tratado sem vazar detalhes internos:** retornar `error.message` bruto do Supabase/Postgres para o client pode vazar nomes de tabelas/colunas/constraints. Prefira mensagens genéricas ao usuário e log detalhado só no server.

## IDOR (Insecure Direct Object Reference)

O teste mental mais simples e mais valioso desta seção inteira: **pegue qualquer rota que recebe um `id` (na URL, query string ou body) e pergunte "o que impede eu de trocar esse id pelo de outro registro que não é meu?"**

```typescript
// 🔴 CRÍTICO: qualquer usuário logado pode ver/editar orçamento de qualquer outro
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { data } = await supabase.from('orcamentos').select('*').eq('id', params.id).single()
  return Response.json(data)
}

// ✅ CORRETO: escopa a query pelo dono, além de checar autenticação
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id) // escopo explícito, mesmo que RLS também proteja
    .single()

  if (error || !data) return Response.json({ error: 'Não encontrado' }, { status: 404 })
  return Response.json(data)
}
```

Mesmo com RLS habilitado no banco, escopar explicitamente na query é defesa em profundidade — e é obrigatório se a rota usar a service role.

## Rate limiting e brute force

Rotas sensíveis a verificar se têm alguma forma de limitação (Vercel Edge Config, Upstash Redis, ou mesmo um limite simples): login, cadastro, reset de senha, reenvio de e-mail de confirmação, geração de PDF/relatório (custo computacional), envio de e-mail transacional, endpoints de busca/autocomplete. Sem rate limiting, essas rotas são vetores de força bruta, spam, ou abuso de custo (gerar milhares de PDFs esgota cota do serviço de renderização).

## CSRF

Server Actions do Next.js têm proteção CSRF nativa (verificação de Origin header) desde que o app não desabilite isso manualmente e esteja em HTTPS. Para Route Handlers tradicionais (`app/api/**/route.ts`) que mudam estado via `POST`/`PUT`/`DELETE` e são chamadas a partir de formulários HTML tradicionais (não `fetch` com JSON), confirme que existe alguma verificação de origem — isso é menos comum na stack típica Next.js+fetch, mas vale checar se há algum endpoint aceitando `application/x-www-form-urlencoded` de fontes não controladas.

## Checklist rápido
- [ ] Toda Server Action valida input com schema (Zod ou equivalente), não confia no shape do client
- [ ] Nenhum campo sensível (`user_id`, `role`, `preco`, `status`) aceito diretamente do body sem derivar do server
- [ ] Toda rota que recebe um `id` escopa a query pelo usuário autenticado (defesa em profundidade além de RLS)
- [ ] Erros retornados ao client não vazam detalhes internos de banco/stack trace
- [ ] Rotas de auth e rotas custosas (PDF, e-mail, IA) têm alguma forma de rate limiting
- [ ] Limites de tamanho em arrays/strings de input, não só validação de tipo
