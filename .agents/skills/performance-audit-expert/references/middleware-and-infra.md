# Referência: Middleware/Proxy, Runtime e Infraestrutura Vercel

## Middleware virou Proxy no Next.js 16

O Next.js 16 renomeou o conceito para `proxy.ts` (o arquivo `middleware.ts` ainda funciona mas está descontinuado e será removido em versão futura) para deixar mais claro que esse código roda na fronteira de rede, antes da aplicação. A lógica de performance é a mesma independente do nome do arquivo: **esse código roda em toda requisição que casar com o `matcher`, inclusive requisições que nunca vão precisar do que ele faz.**

Se o projeto ainda usa `middleware.ts`, isso não é em si um achado de performance (funciona normalmente), mas vale uma nota ⚪ Informativo recomendando a migração para `proxy.ts` como parte da atualização geral para as práticas do Next 16.

## O `matcher` é a primeira coisa a checar

```typescript
// 🟠 ALTO: sem matcher, roda em TODA requisição — inclusive arquivos estáticos,
// imagens do /public, e assets do _next que não precisam passar por essa lógica
export function proxy(request: NextRequest) {
  // checagem de autenticação, redirecionamentos, etc.
}

// ✅ CORRETO: escopo explícito, exclui estáticos e assets internos
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
}
```

Sem um `matcher` bem definido, cada asset estático (imagens, fontes, CSS) paga o custo de rodar a lógica do proxy antes de ser servido — normalmente pequeno por requisição individual, mas multiplicado por todo asset de toda página, em alto tráfego isso soma.

## Nada de I/O pesado dentro do proxy/middleware

Esse código roda no Edge Runtime, otimizado para ser leve e rápido (idealmente sub-milissegundos). Chamadas de rede ou banco de dados aqui adicionam latência a **toda** requisição que passa por ele — inclusive as que nem precisavam do resultado.

```typescript
// 🔴 CRÍTICO: consulta ao banco em toda requisição autenticada, antes mesmo
// de saber se a rota realmente precisa desse dado
export async function proxy(request: NextRequest) {
  const session = getSessionFromCookie(request)
  if (session) {
    const fullUser = await db.users.findUnique({ where: { id: session.userId } }) // 🚨
    // usa fullUser só para checar uma role específica
  }
}

// ✅ CORRETO: decodifica o necessário do próprio cookie/JWT (sem I/O),
// deixa a busca completa de usuário para dentro da rota que realmente precisa
export function proxy(request: NextRequest) {
  const session = getSessionFromCookie(request) // só decodifica o token, sem rede
  if (session && !session.roles.includes('admin') && isAdminRoute(request)) {
    return NextResponse.redirect(new URL('/403', request.url))
  }
}
```

Se uma checagem realmente precisa de dado externo, prefira uma fonte de leitura muito rápida (Edge Config, KV) em vez de uma query relacional completa.

## Edge Runtime vs Node Runtime

| | Edge Runtime | Node Runtime |
|---|---|---|
| Cold start | Muito mais rápido | Mais lento (mas geralmente ainda é OK) |
| APIs disponíveis | Subconjunto (sem a maioria dos módulos nativos do Node) | Completo |
| Bom para | Lógica leve, redirecionamentos, checagem de auth simples, geo/personalização | Trabalho pesado: geração de PDF, processamento de imagem, SDKs que dependem de Node, queries complexas |

Verifique se rotas configuradas com `export const runtime = 'edge'` não estão tentando fazer trabalho pesado que seria mais adequado (e mais fácil de escrever) em Node runtime. O ganho de cold start do Edge não compensa se a lógica em si é pesada ou depende de bibliotecas Node-only (nesse caso, frequentemente nem funciona).

## Região da função e proximidade do banco

Funções Vercel rodam na região configurada (`vercel.json` → `regions`, ou configuração do projeto). Se o banco Supabase está numa região (ex: `us-east-1`) e as funções Vercel estão rodando por padrão em outra, cada query paga uma latência de rede extra desnecessária, em toda chamada. Verifique se a região da função está alinhada com a região do banco — isso é um ajuste de configuração de baixo esforço com impacto direto no TTFB de toda rota que acessa o banco.

## Cache Headers e CDN

Para conteúdo verdadeiramente estático ou que pode ser servido do edge da CDN (imagens, arquivos públicos, respostas de API que não mudam por usuário), confirme headers `Cache-Control` adequados. Rotas de API que retornam o mesmo conteúdo para todo mundo e mudam pouco são boas candidatas a cache na CDN (`s-maxage`, `stale-while-revalidate`), reduzindo tanto latência quanto invocações de função:

```typescript
return Response.json(data, {
  headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
})
```

## `next.config.ts` — pontos de configuração que afetam performance

- `compress` — compressão gzip/brotli deveria estar habilitada (padrão do Next, mas confirme se não foi desabilitada)
- `poweredByHeader: false` — não afeta performance, mas é boa prática de hardening relacionada
- `experimental.optimizePackageImports` — ver `references/bundle-and-assets.md`
- `turbopackFileSystemCacheForDev`/`turbopackFileSystemCacheForBuild` — cache em disco do Turbopack; relevante para tempo de dev/build, não para produção servida ao usuário (ver Seção 5 do SKILL.md sobre não confundir tempo de build com tempo de resposta)

## Checklist rápido
- [ ] `proxy.ts`/`middleware.ts` tem `matcher` escopado, não roda em assets estáticos desnecessariamente
- [ ] Nenhuma chamada de rede/banco pesada dentro do proxy/middleware
- [ ] Runtime (`edge`/`nodejs`) escolhido de acordo com a natureza do trabalho da rota
- [ ] Região da função Vercel alinhada com a região do banco de dados
- [ ] Respostas cacheáveis por CDN têm `Cache-Control` explícito
