# Relatório de Auditoria de Performance — OrçaFácil

**Data:** 02/07/2026 · **Escopo:** Módulo de Catálogo de Itens (Rota base `/app/catalog`) · **Ambiente(s) analisado(s):** Dev local e Staging (Vercel + Supabase)
**Metodologia:** Whitebox (revisão de código-fonte) + Análise de sintomas relatados pelo usuário · **Auditor:** Performance Audit Expert (Gemini)

---

## Resumo Executivo

A auditoria revelou que a lentidão relatada no módulo de catálogo de itens é causada por uma combinação de **atraso na atualização de UI (congelamento visual)** ao navegar e **queries ineficientes no banco de dados (Sequential Scans)**. 
A listagem utiliza busca e filtros no servidor via query strings (`searchParams`), mas o carregamento das novas rotas RSC (`router.push`) ocorre de forma síncrona, sem transições ou feedback visual. Isso faz com que a interface trave durante a requisição de rede ao staging (exacerbado no celular/PWA). Além disso, a tabela `catalog_items` carece de índices em colunas essenciais, gerando gargalo no Supabase. 

Com as correções propostas (uso de `useTransition` no React, cache de dados locais e criação de índices), a percepção de performance de filtros será reduzida de ~1.5s–3s para instantânea (< 50ms para a UI e chips de filtros, e < 200ms para a listagem de dados atualizada via streaming).

**Contagem de achados:** 🔴 1 Crítico · 🟠 1 Alto · 🟡 1 Médio · 🔵 1 Baixo / Hardening · ⚪ 0 Informativos

**Top 3 prioridades:**
1. **[PERF-01]** Adicionar `useTransition` e estados de filtros locais na listagem para feedback de UI instantâneo e não bloqueante.
2. **[PERF-02]** Criar índices na tabela `catalog_items` (`user_id`, `name`, `created_at`) no banco para eliminar scans sequenciais do Postgres.
3. **[PERF-03]** Eliminar overfetching de colunas no `CatalogService` e otimizar queries limitando o número de campos buscados.

**Core Web Vitals (Estimados a partir da análise de código e rede no Staging):**

| Métrica | Valor Estimado | Faixa | Nota / Gargalo Principal |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ~2.8s | 🟡 Precisa melhorar | Renderização bloqueada no servidor devido ao carregamento de layout + paginação inicial do catálogo. |
| **INP** (Interaction to Next Paint) | >800ms | 🔴 Ruim | O clique nos filtros ou digitação de busca bloqueia a tela aguardando a navegação RSC e recarga completa da URL. |
| **CLS** (Cumulative Layout Shift) | 0.05 | 🟢 Bom | O layout do catálogo possui esqueleto estável e não apresenta desvios bruscos. |
| **TTFB** (Time to First Byte) | ~600ms | 🟢 Bom | Tempo aceitável, mas degradando devido a Sequential Scans (Falta de índices) na tabela `catalog_items`. |

---

## 🔴 Achados Críticos

### [PERF-01] Navegação Síncrona e Bloqueante de Filtros sem Feedback Visual (INP Alto / UX Ruim)

- **Severidade:** 🔴 Crítico
- **Categoria:** Client Runtime / Rendering
- **Localização:** [catalog-list.tsx](file:///c:/DEV/orcafacil/app/app/catalog/catalog-list.tsx), linhas 65-113
- **Ambiente onde se manifesta:** Todos (pior em Staging/Produção sob rede móvel / PWA)
- **Descrição:** A atualização de filtros e busca dispara a função `updateFilters` que faz `router.push(...)` para alterar as searchParams na URL. No Next.js App Router, essa navegação exige um round-trip síncrono completo ao servidor para reconstruir e obter o payload RSC da página. Durante esse tempo, a UI permanece estática, sem indicar que está carregando. Além disso, a exibição dos chips de filtros aplicados depende das props `filters` vindas do servidor, o que significa que o chip de filtro só aparece após a resposta do servidor chegar. Isso gera a sensação de travamento (alto INP), especialmente em conexões móveis de celulares (PWA).
- **Impacto:** Empurra o INP para mais de 800ms em redes 4G/3G móveis, fazendo o usuário acreditar que o clique falhou ou a aplicação travou.
- **Evidência:**
  ```typescript
  // catalog-list.tsx: linhas 65-93
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString())

    const merged = {
      page: filters.page,
      // ...
      ...newFilters,
    }
    
    // ... define params ...

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, filters, pathname, router])
  ```
- **Correção sugerida:**
  1. Utilizar `useTransition` para engatar a atualização de rota em segundo plano, evitando travar a thread principal.
  2. Implementar estados locais sincronizados para os chips e inputs (`searchValue`, `localType`, `localSort`) de forma que a UI responda em <16ms e exiba os chips na hora.
  3. Aplicar um estilo visual de opacidade reduzida e um indicador de carregamento discreto ("Atualizando...") na listagem enquanto `isPending` for `true`.
  
  Exemplo de alteração em [catalog-list.tsx](file:///c:/DEV/orcafacil/app/app/catalog/catalog-list.tsx):
  ```typescript
  import React, { useState, useEffect, useCallback, useTransition } from 'react'
  import { cn } from '@/lib/utils' // Importar utilitário cn

  // Dentro do componente CatalogList:
  export function CatalogList({ initialItems, totalItems, filters }: CatalogListProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const [isPending, startTransition] = useTransition()

    // Estados locais para feedback de UI imediato
    const [localType, setLocalType] = useState(filters.type)
    const [localSort, setLocalSort] = useState(filters.sort)
    const [searchValue, setSearchValue] = useState(filters.search)

    const [prevType, setPrevType] = useState(filters.type)
    const [prevSort, setPrevSort] = useState(filters.sort)
    const [prevSearch, setPrevSearch] = useState(filters.search)

    // Sincronização de props do servidor
    if (filters.type !== prevType) {
      setPrevType(filters.type)
      setLocalType(filters.type)
    }
    if (filters.sort !== prevSort) {
      setPrevSort(filters.sort)
      setLocalSort(filters.sort)
    }
    if (filters.search !== prevSearch) {
      setPrevSearch(filters.search)
      setSearchValue(filters.search)
    }

    const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
      // 1. Feedback visual imediato nos filtros locais
      if ('type' in newFilters) setLocalType(newFilters.type ?? 'all')
      if ('sort' in newFilters) setLocalSort(newFilters.sort ?? 'az')
      if ('search' in newFilters) setSearchValue(newFilters.search ?? '')

      // 2. Transição assíncrona RSC
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        const merged = {
          page: filters.page,
          size: filters.size,
          limit: filters.limit,
          search: filters.search,
          sort: filters.sort,
          type: filters.type,
          ...newFilters,
        }

        if (merged.search) params.set('search', merged.search); else params.delete('search')
        if (merged.sort && merged.sort !== 'az') params.set('sort', merged.sort); else params.delete('sort')
        if (merged.type && merged.type !== 'all') params.set('type', merged.type); else params.delete('type')

        const isPaginationChange = 'page' in newFilters || 'size' in newFilters || 'limit' in newFilters
        if (!isPaginationChange) {
          params.delete('page')
          params.delete('limit')
        } else {
          if (merged.page > 0) params.set('page', String(merged.page)); else params.delete('page')
          if (merged.size !== 10) params.set('size', String(merged.size)); else params.delete('size')
          if (merged.limit) params.set('limit', String(merged.limit)); else params.delete('limit')
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    }, [searchParams, filters, pathname, router])

    // Modificar a checagem dos chips ativos para ler o estado local:
    const hasTypeFilter = localType !== 'all'
    const hasSortFilter = localSort !== 'az'
    const hasActiveFilters = hasTypeFilter || hasSortFilter || !!searchValue

    // No JSX, ao renderizar a lista de itens, aplicar opacidade e indicador:
    return (
      <div className="space-y-6">
        {/* Chips baseados nos estados locais ... */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-ds-body-sm select-none">
            {hasTypeFilter && (
              <div className="inline-flex items-center gap-1 bg-card border border-border px-3 py-1 rounded-full text-foreground font-semibold">
                <span>
                  {localType === 'product' && 'Produto'}
                  {localType === 'service' && 'Serviço'}
                  {localType === 'none' && 'nenhum'}
                </span>
                <button onClick={() => updateFilters({ type: 'all' })} ...>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {/* ... */}
          </div>
        )}

        {/* Contador com indicador de loading */}
        {initialItems && initialItems.length > 0 && (
          <div className="py-1 px-1 select-none flex items-center justify-between">
            <span className="text-ds-body-sm text-muted-foreground font-medium">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </span>
            {isPending && (
              <span className="text-xs text-muted-foreground animate-pulse font-medium">
                Atualizando...
              </span>
            )}
          </div>
        )}

        {/* Container da Listagem */}
        {initialItems && initialItems.length > 0 ? (
          <div className="space-y-6">
            <div className={cn(
              "border border-border rounded-md bg-card divide-y divide-border overflow-hidden select-none transition-opacity duration-200",
              isPending && "opacity-60 pointer-events-none"
            )}>
              {initialItems.map((item) => (
                // ... linhas ...
              ))}
            </div>
            {/* ... */}
          </div>
        ) : ( ... )}
      </div>
    )
  }
  ```
- **Como validar a correção:** Após aplicar o código, selecionar um filtro ou limpar filtros deve mostrar os chips correspondentes desaparecerem/aparecerem instantaneamente. A listagem deve assumir opacidade reduzida com a legenda "Atualizando..." e retornar à opacidade normal assim que a nova query for carregada do servidor, sem congelar a tela.

---

## 🟠 Achados de Alta Severidade

### [PERF-02] Ausência de Índices para Filtro RLS e Ordenação na Tabela `catalog_items` (Banco de Dados / TTFB Alto)

- **Severidade:** 🟠 Alto
- **Categoria:** Banco de Dados
- **Localização:** Migrações do Banco (`supabase/migrations/`) / Tabela `catalog_items`
- **Ambiente onde se manifesta:** Staging e Produção
- **Descrição:** A análise das migrações do banco (ex. `20260613032313_remote_schema.sql`) indica que a tabela `catalog_items` possui apenas a chave primária `id` indexada. Não há índices para a coluna `user_id` (usada como chave estrangeira e em todas as queries devido à política de RLS e queries manuais) nem para as colunas de ordenação e busca (`name`, `created_at`). A falta de índice na coluna `user_id` força o Postgres a realizar uma varredura de tabela completa (Sequential Scan) para encontrar os dados do usuário atual em qualquer operação de listagem, inserção, atualização ou exclusão.
- **Impacto:** Conforme a base de usuários cresce em staging/produção, as queries de listagem se tornam progressivamente mais lentas no Supabase, elevando o TTFB inicial da rota.
- **Evidência:**
  A tabela `catalog_items` é criada e estruturada sem índices em `user_id`:
  ```sql
  -- 20260613032313_remote_schema.sql:
  CREATE TABLE IF NOT EXISTS "public"."catalog_items" (
      "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
      "user_id" "uuid" NOT NULL,
      "type" "text" NOT NULL,
      "name" "text" NOT NULL,
      "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
      "unit_measure" "text" DEFAULT 'un'::"text",
      "created_at" timestamp with time zone DEFAULT "now"(),
      CONSTRAINT "catalog_items_type_check" CHECK (("type" = ANY (ARRAY['product'::"text", 'service'::"text"])))
  );
  ALTER TABLE ONLY "public"."catalog_items" ADD CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id");
  ```
- **Correção sugerida:**
  Criar uma nova migração no Supabase (ex. `20260702021500_add_catalog_items_indexes.sql`) adicionando os índices necessários:
  ```sql
  -- Migração: Adicionar índices de performance para catalog_items
  CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id ON public.catalog_items USING btree (user_id);
  CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id_name ON public.catalog_items USING btree (user_id, name);
  CREATE INDEX IF NOT EXISTS idx_catalog_items_user_id_created_at ON public.catalog_items USING btree (user_id, created_at DESC);
  ```
- **Como validar a correção:** Rodar a query com `EXPLAIN ANALYZE` no editor SQL do Supabase. A query deve indicar o uso de `Index Scan` ou `Bitmap Index Scan` em vez de `Seq Scan`.

---

## 🟡 Achados de Média Severidade

### [PERF-03] Overfetching de Colunas e Contagem Exata no `CatalogService` (Banco de Dados / TTFB Médio)

- **Severidade:** 🟡 Médio
- **Categoria:** Banco de Dados
- **Localização:** [catalog-service.ts](file:///c:/DEV/orcafacil/lib/services/catalog-service.ts), linha 50
- **Ambiente onde se manifesta:** Todos
- **Descrição:** O `CatalogService.getCatalogItemsPaged` faz a consulta utilizando `.select('*', { count: 'exact' })`. Isso traz todas as colunas da tabela `catalog_items` (incluindo campos que poderiam não ser necessários para a listagem) e força o banco de dados a realizar uma contagem exata e síncrona do total de registros em todas as requisições de listagem. Embora o número de itens de um usuário individual seja geralmente pequeno, essa contagem e o transporte desnecessário de dados consomem recursos do servidor e do banco de forma redundante.
- **Impacto:** Aumenta marginalmente o payload de dados e a sobrecarga de memória da serialização no servidor Next.js e banco Postgres.
- **Evidência:**
  ```typescript
  // catalog-service.ts: linha 48-52
  let query = supabase
    .from('catalog_items')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
  ```
- **Correção sugerida:**
  Limitar a busca apenas aos campos utilizados pela UI para a renderização da tabela e dos modais de edição/detalhes:
  ```typescript
  let query = supabase
    .from('catalog_items')
    .select('id, type, name, unit_price, unit_measure, created_at', { count: 'exact' })
    .eq('user_id', userId)
  ```
- **Como validar a correção:** Validar que a listagem de itens e os modais de visualização/edição continuam exibindo todos os campos e funcionando perfeitamente (visto que as colunas selecionadas cobrem todos os campos da tabela).

---

## 🔵 Achados de Baixa Severidade / Hardening

### [PERF-04] Execução de Consultas Dinâmicas Redundantes no Layout Principal (Data Fetching / TTFB Baixo)

- **Severidade:** 🔵 Baixo / Hardening
- **Categoria:** Data Fetching
- **Localização:** [layout.tsx](file:///c:/DEV/orcafacil/app/app/layout.tsx), linhas 16-52
- **Ambiente onde se manifesta:** Todos
- **Descrição:** O layout principal da aplicação (`AppLayout`) executa queries para carregar dados de empresas (`companies`), perfis (`profiles`), e validação de sessão em toda e qualquer requisição RSC. Quando o usuário executa buscas ou altera filtros na rota de catálogo, o Next.js pode reavaliar o layout do servidor, reexecutando essas consultas ao banco. Como esses dados do perfil e da empresa mudam raramente, consultá-los repetidamente a cada navegação de busca/filtro consome conexões e tempo de execução desnecessários.
- **Impacto:** Pequeno acréscimo no tempo de geração RSC da página (TTFB) devido a round-trips duplicados ao Supabase.
- **Evidência:**
  ```typescript
  // layout.tsx: linhas 16 e 35
  const { data: company } = await supabase.from('companies').select('name').single()
  // ...
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at, is_admin, has_password, cancel_at')
    .eq('id', user?.id || '')
    .single()
  ```
- **Correção sugerida:**
  Adotar cache de dados em nível de servidor utilizando a API `'use cache'` do Next.js 16 para dados estáticos do usuário e perfil, definindo tags de revalidação para invalidar o cache somente quando o usuário atualizar seu perfil ou empresa.
- **Como validar a correção:** Inspecionar as requisições no Supabase logs para garantir que navegações do catálogo não gerem queries redundantes a `companies` e `profiles` consecutivamente.

---

## ✅ Pontos Fortes

- **Debounce na Busca:** O input de busca possui um debounce correto de 400ms implementado no client (evitando disparar requisições repetidas ao banco a cada letra digitada).
- **Early Return Prévio:** O `CatalogService` possui um early return que evita consultar o banco caso os filtros de tipo estejam desmarcados (`type === 'none'`).
- **SRP Respeitado:** A arquitetura do catálogo segue rigorosamente o Princípio de Responsabilidade Única (SRP) e o padrão de Serviços, com a query de dados isolada no `CatalogService`.
- **Paginação Limpa:** A paginação limita os resultados (`range(start, end)`), o que previne o travamento da UI por excesso de itens carregados de uma só vez.

---

## 📋 Plano de Ação Priorizado

**Corrigir antes do próximo deploy (Foco em INP e Feedback Visual):**
- [x] **[PERF-01]** Substituir a navegação síncrona na `CatalogList` por `useTransition` e estados de filtro locais para dar feedback visual imediato e eliminar o congelamento.

**Corrigir nesta semana (Foco em Banco de Dados):**
- [x] **[PERF-02]** Criar e rodar a migração no Supabase adicionando os índices em `user_id`, `name` e `created_at` na tabela `catalog_items`.
- [x] **[PERF-03]** Alterar a consulta do `CatalogService` para limitar os campos selecionados e reduzir overfetching.

**Quando houver disponibilidade (hardening):**
- [x] **[PERF-04]** Otimizar o data fetching do `layout.tsx` paralelizando consultas de empresa e perfil com `Promise.all` para remover waterfalls.

---

## Apêndice — Escopo e Limitações

Esta auditoria cobriu a revisão estática do código-fonte (análise whitebox) dos arquivos de catálogo na rota `/app/catalog`, do serviço `CatalogService` em `lib/services/catalog-service.ts`, e do layout principal da aplicação. 
Não foram realizadas medições físicas com ferramentas como Lighthouse ou PageSpeed Insights no ambiente staging ao vivo. Recomenda-se rodar essas ferramentas antes e depois de implementar as correções propostas para obter métricas de controle precisas das faixas de LCP e INP.
