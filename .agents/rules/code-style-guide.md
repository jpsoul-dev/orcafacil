---
trigger: always_on
---

# Diretrizes de Desenvolvimento e Qualidade de Código

Este documento serve como a única fonte de verdade para os padrões de código, arquitetura, segurança e estilo deste projeto. Toda geração de código deve seguir rigorosamente as regras abaixo.

---

## 1. Tipagem e TypeScript (Strict Mode)

- **Proibido o uso de `any`:** O uso de `any` é estritamente proibido. Se um tipo for desconhecido temporariamente, utilize `unknown` e faça o Type Guard apropriado.
- **Tipagem Explícita:** Tipar explicitamente retornos de funções complexas, hooks customizados e propriedades de componentes (`props`).
- **Zod para Validação:** Utilize `zod` para validar dados de entrada (payloads de API, searchParams, formulários) e inferir tipos a partir dos schemas sempre que possível.

## 2. Segurança e Autorização (Security-First)

- **Validação de Propriedade (Data Ownership):** Nunca confie apenas no ID enviado pelo cliente. Antes de qualquer operação de mutação (INSERT, UPDATE, DELETE) ou leitura de dados sensíveis, verifique no backend se o usuário autenticado é o real proprietário (owner) daqueles dados.
- **Fail-Safe Defaults:** Se uma checagem de permissão falhar ou estourar um erro, a aplicação deve bloquear o acesso por padrão (bloqueio preventivo).
- **Sanitização:** Garanta que inputs de usuários passem por validação antes de interagir com o banco de dados para evitar vulnerabilidades.

## 3. Arquitetura Next.js 16 & React

- **Server vs. Client Components:** Mantenha os componentes como Server Components (`page.tsx`, `layout.tsx`, etc.) por padrão. Adicione `"use client"` apenas na camada estrita onde a interatividade (estados, efeitos, eventos de clique) é estritamente necessária.
- **Server Actions Seguras:** Ao criar Server Actions para mutações, trate-as como endpoints de API comuns: valide a sessão do usuário e os dados de entrada dentro da própria Action.
- **Componentização Inteligente:** Evite arquivos gigantes. Se um bloco de código lógico ou visual se repetir, ou passar de 150 linhas, extraia-o para um subcomponente local ou um hook customizado.

## 4. Reutilização de Código e DRY

- **Aproveitamento de Recursos:** Antes de criar uma nova função utilitária ou hook, analise os arquivos existentes em `@/hooks`, `@/lib` e `@/utils`. Reutilize a lógica existente.
- **Debounce e Otimizações:** Para inputs de busca ou disparos frequentes, utilize hooks de debounce reutilizáveis em vez de criar lógicas isoladas com `setTimeout`.

## 5. Estilização (Tailwind CSS & shadcn/ui)

- **Sem Números Mágicos (Magic Numbers):** É proibido o uso de valores arbitrários soltos para espaçamentos, cantos arredondados ou cores recorrentes (ex: `w-[321px]` ou `bg-[#f3f3f3]`). Utilize estritamente o sistema de design do Tailwind e as variáveis do tema (ex: `space-x-4`, `rounded-lg`, `bg-muted`).
- **Componentes baseados em shadcn/ui:** Sempre verifique se o componente necessário (ex: Dialog, Button, Sheet, Dropdown) já está instalado em `@/components/ui`. Use a estrutura padrão do shadcn/ui e estenda-a usando a utilidade `cn(...)` para fusão de classes Tailwind de forma limpa.

## 6. Clean Code e Legibilidade

- **Nomes Autoexplicativos:** Variáveis e funções devem ter nomes que descrevem seu propósito (ex: `isUserAuthorized` em vez de `check`).
- **Funções Pequenas:** Cada função ou bloco de código deve fazer focar em apenas uma responsabilidade (Single Responsibility Principle).
