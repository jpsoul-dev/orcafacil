<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Padrão de resposta
1. Responda sempre em português do Brasil.


## Princípios Fundamentais (SOLID e DRY)

- Single Responsibility (SRP): Cada arquivo, classe ou função deve ter apenas UM motivo para mudar. Nunca crie "God Classes" ou arquivos com milhares de linhas.
- Don't Repeat Yourself (DRY): Nunca gere código duplicado. Se uma lógica se repete, abstraia-a para um serviço, hook ou função utilitária.
- Keep It Simple (KISS): Evite overengineering. Escolha a solução mais simples que resolva o problema com eficiência.

## Padrões de Arquitetura

- A lógica de negócio NUNCA deve estar acoplada a componentes de UI.

## Padrões de Nomenclatura (Naming Conventions)

- Clareza acima de brevidade: Prefira `getUserAccountBalance` ao invés de `getUsrBal`. Não use abreviações obscuras.
- Todo o código fonte (variáveis, funções, componentes, etc) DEVE ser escrito em **Inglês**.
- Funções fevem sempre começar com um verbo de ação (ex: `calculate...`, `fetch...`, `update...`, `is...`, `has...`).
- Booleanos: Prefixar com `is`, `has`, `should` ou `can` (ex: `isActive`, `hasPermission`).
- Constantes Globais: Usar `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_COUNT`).
- A partir de Next.js 16, o Middleware agora é chamado de Proxy para refletir melhor seu propósito. A funcionalidade permanece a mesma. Lembres-se que agora é proxy.ts e não mais middleware.ts

## Tipagem e Imutabilidade (TypeScript)

- É estritamente proibido o uso do tipo `any`. Se o tipo for desconhecido, use `unknown` e faça a verificação de tipo (type narrowing).
- Use `interface` para contratos de objetos que podem ser estendidos, e `type` para uniões, interseções ou tipos primitivos.
- Prefira sempre criar novos objetos/arrays (usando spread operator `...` ou métodos como `.map`, `.filter`) em vez de mutar estados existentes. Utilize `const` por padrão, e `let` apenas quando estritamente necessário.

## Tratamento de Erros (Error Handling)

- Valide as entradas no início das funções e lance erros imediatamente se algo estiver errado (Early Return).
- Nunca deixe um bloco `catch` vazio. Se o erro for engolido, explique o motivo em um comentário.
- No backend, jogue as exceções para cima e deixe um Middleware de Erro centralizado responder ao cliente. Não repita lógicas de resposta de erro em cada rota.

## Higiene de Código (O que NÃO fazer)

- Não crie Magic Numbers/Strings: Números ou strings soltas no código (ex: `if (status === 3)`) devem ser extraídos para Constantes ou Enums.
- Remova importações não utilizadas, variáveis declaradas mas não lidas, e códigos comentados. Não deixar "restos" de código.
- O código deve ser autoexplicativo. Use comentários apenas para explicar o "PORQUÊ" de uma decisão técnica não óbvia, NUNCA o "O QUÊ" o código está fazendo.
- Evite mais de 3 níveis de aninhamento (`if` dentro de `if` dentro de `for`). Use _Early Returns_ para achatar a estrutura.

## Segurança
- NUNCA escreva chaves de API, senhas, tokens ou URLs de banco de dados em hardcode. Sempre utilize variáveis de ambiente.
- Nenhuma chave privada tem prefixo `NEXT_PUBLIC_` ou `VITE_` em produção.
- `.env` e `.env.local` devem está no `.gitignore`
- Deve ter um `.env.example` com a estrutura (sem valores reais)
- RLS deve estar habilitado em TODAS as tabelas do Supabase
- TODAS as Views do Supabase expostas na API REST devem ser definidas como 'Security Invoker' (usando 'WITH (security_invoker = true)') para garantir que obedeçam às políticas de RLS das tabelas físicas subjacentes e evitar vazamento público de dados.
- Toda API route deve verificar **autenticação**
- Toda API route deve verificar **autorização** (quem pode fazer o quê)
- IDs públicos devem ser UUIDs, não integers sequenciais
- Roles de admin devem estar no banco, não hardcoded no código
- Input do usuário deve ser validado com Zod
- Não pode existir concatenação de strings em queries SQL
- CORS deve ser configurado com origens específicas, não `*`
- Endpoints críticos devem ter rate limiting
- Uploads verificam tipo, tamanho e geram nomes aleatórios
- JWTs devem ser verificados no backend com assinatura
- Webhooks devem verificar assinatura do serviço
- Erros em produção nunca podem expõem detalhes internos
- `docker-compose.yml` não pode tem senhas hardcoded
- Chamadas de AI devem passar por proxy no backend

## Autenticação e Autorização (CORS/Escalação)

- Nenhuma rota de API deve ser criada sem middleware (proxy) de autenticação, a menos que explicitamente solicitado como pública.
- Rotas administrativas devem sempre verificar permissões (Role-Based Access Control).
- A configuração de CORS não pode conter o wildcard `*`. Defina origens estritas.

## Qualidade e Resiliência (XSS/CSRF/Race Conditions)

- Qualquer dado de entrada do usuário exibido no frontend deve ser sanitizado para prevenir XSS.
- Rotas que realizam mutação de dados (POST, PUT, DELETE) devem ter proteção contra CSRF.
- Envolva operações múltiplas de banco de dados em _Transactions_ para evitar Race Conditions.
- Todo código assíncrono deve ter tratamento de erro (ex: blocos `try/catch`). Não deixe Promises não tratadas.

## Responsividade (Mobile-First)

- Todo layout deve ser pensado primeiro para telas pequenas.
- Use os prefixos de breakpoint (`sm:`, `md:`, `lg:`, `xl:`) exclusivamente para escalar o layout para telas maiores. NUNCA construa para desktop primeiro tentando usar breakpoints para corrigir o mobile depois.
- Prefira CSS Grid e Flexbox nativos do Tailwind para estruturação de layouts, evitando larguras e alturas fixas que quebram a responsividade.

## Stack Tecnológica

### Fullstack & Core
*   React 19
*   Next.js 16 (App Router)
*   TypeScript

### Estilização & Design System
*   Tailwind CSS v4
*   shadcn/ui
*   Lucide React
*   Recharts

### Formulários & Validação
*   React Hook Form
*   Zod
*   @hookform/resolvers

### Banco de Dados (BaaS)
*   Supabase
    *   Supabase Auth & SSR
    *   Row Level Security (RLS)
    *   Supabase Client/Server Clients

### Pagamentos
*   Stripe