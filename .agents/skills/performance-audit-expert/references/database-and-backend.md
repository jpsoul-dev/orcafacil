# Referência: Banco de Dados (Supabase/Postgres) e Backend

## O limite desta camada — seja honesto sobre o que dá para confirmar só pelo código

Índices ausentes, planos de execução de query, e comportamento sob carga real **não são visíveis apenas lendo o código-fonte**. Esta seção ajuda a identificar padrões de código que **provavelmente** causam problema de performance no banco — mas para achados que dependem de índice/plano de execução, classifique como ⚪ Informativo ou no máximo 🟡 Médio, e recomende explicitamente rodar `EXPLAIN ANALYZE` na query suspeita, em vez de afirmar com certeza que há um problema de índice.

## `select('*')` — overfetching

```typescript
// 🟡 MÉDIO: busca todas as colunas, incluindo possivelmente colunas grandes
// (JSON, texto longo) que não são usadas na tela
const { data } = await supabase.from('orcamentos').select('*')

// ✅ CORRETO: busca só o que a UI usa
const { data } = await supabase
  .from('orcamentos')
  .select('id, cliente, valor_total, status, criado_em')
```

Overfetching de colunas aumenta o payload transferido do banco para a função serverless e desta para o client (se os dados forem repassados), e é fácil de perder de vista porque "funciona" — só é mais lento e mais caro do que precisaria.

## N+1 — uma query por item em vez de uma query batelada

Este é o padrão de maior impacto real em performance de backend, e o mais comum de encontrar em código gerado rapidamente (loops que parecem inofensivos):

```typescript
// 🔴 CRÍTICO: uma query ao banco por item do array — 50 itens = 50 round-trips
const orcamentos = await getOrcamentos()
for (const orcamento of orcamentos) {
  orcamento.cliente = await supabase
    .from('clientes')
    .select('*')
    .eq('id', orcamento.cliente_id)
    .single()
}

// ✅ CORRETO: uma query só, usando join/embed do Supabase
const { data: orcamentos } = await supabase
  .from('orcamentos')
  .select('*, cliente:clientes(id, nome, email)')
```

Padrão equivalente também aparece com `.map()` + `Promise.all()` — tecnicamente paraleliza (melhor que sequencial), mas ainda dispara N conexões/queries simultâneas ao banco em vez de uma. Para poucos itens (dezenas) pode ser aceitável; para listas que crescem (centenas/milhares), sempre prefira uma query batelada com join/`in()`.

```typescript
// 🟠 ALTO: melhor que sequencial, mas ainda N queries simultâneas —
// não escala quando a lista cresce
const clientes = await Promise.all(
  orcamentos.map((o) => supabase.from('clientes').select('*').eq('id', o.cliente_id).single())
)

// ✅ CORRETO: uma query com `in()` usando os IDs já coletados
const ids = orcamentos.map((o) => o.cliente_id)
const { data: clientes } = await supabase.from('clientes').select('*').in('id', ids)
```

## Paginação — nunca confie que a tabela vai continuar pequena

```typescript
// 🟠 ALTO (vira 🔴 conforme a tabela cresce): busca a tabela inteira sem limite
const { data } = await supabase.from('orcamentos').select('*').eq('user_id', userId)

// ✅ CORRETO: paginação explícita
const { data } = await supabase
  .from('orcamentos')
  .select('*')
  .eq('user_id', userId)
  .order('criado_em', { ascending: false })
  .range(offset, offset + pageSize - 1)
```

Para listas que podem crescer muito (milhares de registros) e onde o usuário rola/pagina bastante, considere paginação por cursor (`.gt('id', lastId)`) em vez de offset — offset fica progressivamente mais lento em páginas distantes porque o banco ainda precisa contar/pular as linhas anteriores.

## Índices — o que dá para sinalizar sem acesso ao banco

Se uma query filtra (`.eq()`, `.gt()`, `.ilike()`) ou ordena (`.order()`) por uma coluna que **não parece ser a chave primária**, e a tabela é referenciada como "grande" ou de alto tráfego pelo contexto do projeto, é razoável sinalizar como ⚪ Informativo: *"Verificar se existe índice na coluna X da tabela Y — não é possível confirmar apenas pelo código, recomenda-se rodar `EXPLAIN ANALYZE` nesta query."* Nunca afirme com certeza que um índice está ausente sem ter visto o schema/migrations confirmando isso.

Se o projeto tiver a pasta `supabase/migrations`, vale checar ali por `CREATE INDEX` nas colunas mais filtradas — isso já responde a dúvida sem precisar acessar o banco ao vivo.

## Connection pooling em ambiente serverless

Funções serverless (Vercel) podem escalar para múltiplas instâncias simultâneas, cada uma abrindo sua própria conexão com o Postgres — sem um pooler, isso esgota o limite de conexões do banco sob tráfego moderado. Verifique se a connection string do Supabase usada em produção aponta para o pooler (Supavisor, porta `6543`, modo transaction) em vez da conexão direta (porta `5432`), especialmente em Server Actions/Route Handlers de alto tráfego. Isso costuma já vir configurado corretamente ao usar o client oficial do Supabase (`@supabase/supabase-js` via REST/PostgREST não sofre disso do mesmo jeito que uma conexão Postgres direta via ORM), mas se o projeto usa um ORM com conexão direta (Prisma, Drizzle com `postgres.js`, etc.), confirme o pooling explicitamente.

## Trabalho pesado em Route Handler/Server Action bloqueando a resposta

Geração de PDF, processamento de imagem, ou qualquer cálculo pesado feito de forma síncrona dentro de uma Server Action antes de retornar a resposta mantém a função serverless (e o usuário) esperando. Para operações longas, considere: retornar uma resposta imediata e processar em background (fila/webhook), ou pelo menos garantir que o timeout da função (`maxDuration` na Vercel) comporta o pior caso.

## Checklist rápido
- [ ] Queries selecionam só as colunas necessárias, não `select('*')` por padrão
- [ ] Nenhum loop fazendo uma query por item — usar join/embed ou `.in()`
- [ ] Listas que podem crescer têm paginação (`.range()` ou cursor)
- [ ] Colunas usadas em filtros/ordenação de tabelas grandes têm índice (confirmar via migrations ou `EXPLAIN ANALYZE`, não afirmar sem evidência)
- [ ] Conexão de produção usa o pooler do Supabase quando aplicável
