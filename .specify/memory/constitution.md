<!--
=== SYNC IMPACT REPORT ===
Version change: [ALL PLACEHOLDERS] -> v1.0.0
List of modified principles:
  - [PRINCIPLE_1_NAME] -> I. Separação Estrita de Lógicas (SRP & Services Pattern)
  - [PRINCIPLE_2_NAME] -> II. Componentes de Servidor por Padrão e Server Actions Seguras
  - [PRINCIPLE_3_NAME] -> III. Isolamento Multi-Tenant Rigoroso via RLS (Row Level Security) (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] -> IV. Tipagem TypeScript Estrita, Imutabilidade e Nomenclatura em Inglês
  - [PRINCIPLE_5_NAME] -> V. Tratamento Centralizado de Erros e Design Responsivo Mobile-First
Added sections:
  - Padrões de Qualidade e Higiene de Código
  - Diretrizes de Infraestrutura e Integrações
Removed sections: None
Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (No changes needed, generic markers align)
  - ✅ .specify/templates/spec-template.md (No changes needed, structure aligned)
  - ✅ .specify/templates/tasks-template.md (No changes needed, task categories aligned)
Follow-up TODOs: None
-->

# Orca Fácil Constitution

## Core Principles

### I. Separação Estrita de Lógicas (SRP & Services Pattern)
Toda e qualquer regra de negócio, cálculo complexo ou interação direta com o banco de dados (Supabase/PostgreSQL) **DEVE** residir na camada de serviços em `lib/services/`. Componentes de UI (sejam Client ou Server Components) e rotas de API não podem executar lógicas de negócio diretamente, devendo atuar estritamente como orquestradores e consumidores dessa camada de serviços.
*Razão:* Garante alta testabilidade, reuso de código e conformidade com o princípio de responsabilidade única (SRP), reduzindo o acoplamento no frontend.

### II. Componentes de Servidor por Padrão e Server Actions Seguras
Para otimizar performance e SEO, todas as páginas (`page.tsx`) e layouts (`layout.tsx`) **DEVEM** ser Server Components por padrão. A diretiva `"use client"` está restrita unicamente aos nós interativos finais da árvore de renderização. Adicionalmente, toda Server Action **DEVE** validar a autenticação do usuário, autorização de acesso e os dados de entrada usando esquemas de validação do Zod antes de qualquer execução.
*Razão:* Reduz drasticamente o tamanho do bundle enviado ao cliente, otimiza o First Contentful Paint e blinda o servidor contra requisições maliciosas.

### III. Isolamento Multi-Tenant Rigoroso via RLS (Row Level Security) (NON-NEGOTIABLE)
A segurança do banco de dados é inegociável. Todas as tabelas físicas no Supabase **DEVEM** ter Row Level Security (RLS) habilitado com políticas estritas baseadas no JWT de autenticação do usuário. Qualquer View exposta na API REST **DEVE** ser definida como `Security Invoker` (usando `WITH (security_invoker = true)`). Os serviços do backend **DEVEM** validar a propriedade dos dados confrontando o `tenant_id` nas queries, nunca confiando cegamente em IDs fornecidos pelo cliente.
*Razão:* Previne vazamentos acidentais de dados entre diferentes empresas (tenants) e impede ataques de escalação de privilégio ou IDOR.

### IV. Tipagem TypeScript Estrita, Imutabilidade e Nomenclatura em Inglês
É terminantemente proibido o uso do tipo `any`. Para tipos desconhecidos, use `unknown` acompanhado de validação dinâmica (*type narrowing*). Os dados **DEVEM** ser tratados como imutáveis, priorizando operadores de espalhamento (`...`) e funções puras (como `.map` e `.filter`) em vez de mutações diretas. Todo o código fonte (variáveis, funções, classes, etc.) **DEVE** ser nomeado em inglês com verbos de ação claros e booleanos semanticamente prefixados.
*Razão:* Elimina erros silenciosos em runtime, facilita a legibilidade e mantém a padronização do código fonte do projeto.

### V. Tratamento Centralizado de Erros e Design Responsivo Mobile-First
Todas as funções **DEVEM** validar suas entradas imediatamente no início de sua execução usando *Early Returns*, lançando exceções estruturadas que são interceptadas por um Middleware (Proxy) de erro centralizado. No frontend, todos os layouts **DEVEM** ser concebidos seguindo a metodologia *Mobile-First*, utilizando Flexbox ou Grid nativos do Tailwind, e aplicando breakpoints exclusivamente para expandir a interface para telas maiores.
*Razão:* Evita o aninhamento profundo de condicionais, simplifica o fluxo de tratamento de erros e garante uma experiência visual impecável em qualquer dispositivo.

## Padrões de Qualidade e Higiene de Código

- **Eliminação de Magic Values**: Qualquer número ou string literal solta no código (ex: `status === 3` ou `roles.includes('admin')`) **DEVE** ser extraída para constantes em `UPPER_SNAKE_CASE` ou Enums declarativos.
- **Higiene do Repositório**: Arquivos não devem conter importações não utilizadas, variáveis mortas ou trechos de código comentados. Comentários devem explicar apenas o "PORQUÊ" de decisões técnicas não óbvias, nunca o "O QUÊ" o código faz.
- **Estruturas Achatadas**: Evite aninhamentos maiores que 3 níveis (`if`/`for` aninhados). Use estruturas de early returns e refatore em funções menores para manter a legibilidade.

## Diretrizes de Infraestrutura e Integrações

- **Next.js 16 Proxies**: A partir do Next.js 16, a lógica de middleware de rede deve ser nomeada como `proxy.ts` no diretório raiz do projeto para refletir corretamente o seu papel de proxying.
- **Segurança de Integrações (Stripe e Supabase)**: Webhooks do Stripe **DEVEM** validar a assinatura criptográfica (`STRIPE_WEBHOOK_SECRET`) no backend. Credenciais sensíveis e chaves de API secretas sob nenhuma circunstância podem ser expostas ou conter o prefixo `NEXT_PUBLIC_`.
- **CORS e Rate Limiting**: Nenhuma política de CORS pode conter o caractere curinga `*` em produção. APIs críticas de autenticação ou mutação devem possuir limites de requisição por IP.
- **Chamadas de IA**: Toda chamada a APIs de Inteligência Artificial **DEVE** ser intermediada por um proxy seguro no backend, garantindo que chaves privadas de modelos não sejam expostas.

## Governance

Este documento define os padrões fundamentais de desenvolvimento do **Orca Fácil**. A aderência a estas regras é obrigatória para todos os desenvolvedores e agentes autônomos.

- **Supremacia da Constituição**: Este documento sobrepõe-se a quaisquer decisões de design locais ou preferências estéticas ad-hoc.
- **Verificação Contínua**: Cada Pull Request e revisão de código realizada deve verificar ativamente a conformidade com estes princípios. Desvios não justificados bloquearão o merge.
- **Processo de Emenda**: Alterações nas regras ou inclusão de novos princípios requerem a alteração deste arquivo, com o respectivo incremento de versão semântica e atualização de templates dependentes.
- **Referência Técnica**: Em caso de dúvidas sobre implementação de regras específicas, os desenvolvedores devem consultar os arquivos `README.md` e `AGENTS.md` na raiz do projeto.

**Version**: 1.0.0 | **Ratified**: 2026-05-31 | **Last Amended**: 2026-05-31
