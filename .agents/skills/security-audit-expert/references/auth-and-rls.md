# Referência: Autenticação, Sessão e RLS (Supabase)

## Por que RLS é o coração da segurança em apps Supabase

Em uma stack Supabase, o banco de dados é parcialmente exposto ao client via API REST/Realtime autogerada. **Row Level Security é a última linha de defesa real** — middleware e checagens no frontend são conveniência de UX, não segurança. Se um atacante consegue chamar a API do Supabase diretamente (e sempre consegue, é só pegar a URL e a anon key do bundle), a única coisa entre ele e os dados de outros usuários são as policies de RLS.

Trate qualquer tabela com dados de usuário e **sem RLS habilitado** como Crítico por padrão, mesmo que hoje "pareça que ninguém vai explorar isso" — a exploração é trivial: uma chamada HTTP direta à REST API do Supabase com a anon key pública.

## `getUser()` vs `getSession()`

Esta é a armadilha mais comum e mais séria em código Supabase + Next.js:

```typescript
// 🔴 CRÍTICO em contexto server (Server Component, Route Handler, Middleware):
// getSession() lê o cookie/JWT SEM validar a assinatura contra o servidor Supabase.
// Um cookie pode ser forjado/manipulado no lado do client antes de chegar ao server.
const { data: { session } } = await supabase.auth.getSession()
if (session) { /* trata como autenticado — pode estar confiando em dado forjável */ }

// ✅ CORRETO: getUser() faz uma chamada de revalidação ao servidor de auth do
// Supabase, garantindo que o JWT é genuíno e ainda válido.
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) { /* não autenticado, redirecionar */ }
```

`getSession()` é aceitável **apenas** no client-side, para ler dados de sessão que já foram validados anteriormente (ex: mostrar nome do usuário na UI), nunca como gate de autorização para dados sensíveis ou operações privilegiadas.

## Onde a autorização quebra mesmo com RLS

RLS protege o banco, mas não protege automaticamente contra:
- **IDOR em rotas de API que usam a service role** — se uma API Route usa `SUPABASE_SERVICE_ROLE_KEY` (que ignora RLS) para simplificar a query, a responsabilidade de checar "este recurso pertence a este usuário?" volta 100% para o código da rota. Procure por esse padrão e verifique se o `user_id`/`owner_id` do recurso é comparado contra o usuário autenticado antes de retornar/alterar dados.
- **Policies "permissivas demais"** — ex: uma policy de `UPDATE` que checa `auth.uid() IS NOT NULL` em vez de `auth.uid() = owner_id`. Isso permite qualquer usuário logado editar registros de qualquer outro usuário.
- **Falta de policy para uma operação específica** — RLS habilitado com policy de `SELECT` mas sem policy de `UPDATE`/`DELETE` normalmente bloqueia por padrão (seguro), mas confirme; o oposto (esquecer de restringir `INSERT` permitindo `user_id` arbitrário no payload) é comum e perigoso.

```sql
-- 🔴 CRÍTICO: qualquer usuário autenticado pode atualizar orçamentos de qualquer cliente
create policy "update_orcamentos"
on orcamentos for update
using ( auth.uid() is not null );

-- ✅ CORRETO: só o dono pode atualizar
create policy "update_orcamentos"
on orcamentos for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );
```

Note o uso de `with check` além de `using` — `using` controla quais linhas são visíveis/afetáveis, `with check` valida os **novos valores** em INSERT/UPDATE. Sem `with check`, um usuário pode conseguir alterar o `user_id` de um registro seu para "doar" ou sequestrar dados, dependendo do fluxo.

## Middleware e proteção de rotas

```typescript
// middleware.ts — verifique:
// 1. As rotas protegidas realmente cobrem tudo que precisa (glob patterns corretos no matcher)
// 2. O middleware usa getUser(), não apenas checa a existência do cookie de sessão
// 3. Rotas de API sensíveis também estão no matcher, não só páginas
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'], // fácil esquecer /api aqui
}
```

Middleware sozinho **nunca** é suficiente como controle de autorização — é só a primeira camada de UX (redirecionar deslogado para /login). A autorização de verdade tem que existir também na Server Action / Route Handler / RLS, porque Server Actions podem ser chamadas diretamente sem passar pelo fluxo de página que o middleware protege.

## Fluxos de auth a revisar

- **Reset de senha / magic link:** o token expira? É de uso único? A página que recebe o token valida ele no server antes de permitir a troca de senha?
- **OAuth (Google, etc.):** `redirect_uri` está fixo na configuração do provedor (não aceita qualquer origem via `window.location.origin` sem allowlist)?
- **Confirmação de e-mail:** contas não confirmadas conseguem acessar funcionalidades que deveriam exigir e-mail verificado?
- **Troca de e-mail/senha:** exige reautenticação (senha atual) antes de permitir a troca?

## Checklist rápido
- [ ] RLS habilitado em toda tabela com dado de usuário
- [ ] Policies cobrem SELECT, INSERT, UPDATE, DELETE explicitamente (nada assumido por omissão)
- [ ] `with check` presente em policies de INSERT/UPDATE, não só `using`
- [ ] Nenhuma rota server usa `getSession()` como gate de autorização
- [ ] Rotas que usam service role fazem checagem manual de ownership
- [ ] Middleware cobre `/api/:path*` além das páginas, mas não é o único controle
- [ ] Fluxos de reset de senha/magic link usam tokens de uso único com expiração
