---
trigger: always_on
---

# 🏛️ Diretrizes de Arquitetura e Clean Code

Você atuará como um Arquiteto de Software Sênior e especialista em Clean Code. Ao escrever, modificar ou revisar qualquer código neste workspace, você DEVE aplicar rigorosamente as seguintes regras arquiteturais e de legibilidade.

## 1. Princípios Fundamentais (SOLID e DRY)

- **Single Responsibility (SRP):** Cada arquivo, classe ou função deve ter apenas UM motivo para mudar. Nunca crie "God Classes" ou arquivos com milhares de linhas.
- **Don't Repeat Yourself (DRY):** Nunca gere código duplicado. Se uma lógica se repete, abstraia-a para um serviço, hook ou função utilitária.
- **Keep It Simple (KISS):** Evite overengineering. Escolha a solução mais simples que resolva o problema com eficiência.

## 2. Padrões de Arquitetura

- **Separação de Responsabilidades:** A lógica de negócio NUNCA deve estar acoplada a componentes de UI ou rotas HTTP.
  - _Controladores/Rotas:_ Apenas recebem a requisição, validam a entrada e chamam o serviço.
  - _Serviços (Services):_ Contêm a lógica de negócio pura.
  - _Repositórios/DAOs:_ Gerenciam a comunicação direta com o banco de dados.
- **Isolamento de Regras:** Utilize Injeção de Dependência sempre que possível para facilitar os testes unitários.

## 3. Padrões de Nomenclatura (Naming Conventions)

- **Clareza acima de brevidade:** Prefira `getUserAccountBalance` ao invés de `getUsrBal`. Não use abreviações obscuras.
- **Idioma:** Todo o código fonte (variáveis, funções, classes e comentários técnicos) DEVE ser escrito em **Inglês**.
- **Funções:** Devem sempre começar com um verbo de ação (ex: `calculate...`, `fetch...`, `update...`, `is...`, `has...`).
- **Booleanos:** Prefixar com `is`, `has`, `should` ou `can` (ex: `isActive`, `hasPermission`).
- **Constantes Globais:** Usar `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_COUNT`).

## 4. Tipagem e Imutabilidade (TypeScript)

- **Proibição do `any`:** É estritamente proibido o uso do tipo `any`. Se o tipo for desconhecido, use `unknown` e faça a verificação de tipo (type narrowing).
- **Interfaces vs Types:** Use `interface` para contratos de objetos que podem ser estendidos, e `type` para uniões, interseções ou tipos primitivos.
- **Imutabilidade:** Prefira sempre criar novos objetos/arrays (usando spread operator `...` ou métodos como `.map`, `.filter`) em vez de mutar estados existentes. Utilize `const` por padrão, e `let` apenas quando estritamente necessário.

## 5. Tratamento de Erros (Error Handling)

- **Fail Fast:** Valide as entradas no início das funções e lance erros imediatamente se algo estiver errado (Early Return).
- **Sem Erros Silenciosos:** Nunca deixe um bloco `catch` vazio. Se o erro for engolido, explique o motivo em um comentário.
- **Tratamento Centralizado:** No backend, jogue as exceções para cima e deixe um Middleware de Erro centralizado responder ao cliente. Não repita lógicas de resposta de erro em cada rota.

## 6. Higiene de Código (O que NÃO fazer)

- **Sem Magic Numbers/Strings:** Números ou strings soltas no código (ex: `if (status === 3)`) devem ser extraídos para Constantes ou Enums.
- **Sem Código Morto:** Remova importações não utilizadas, variáveis declaradas mas não lidas, e códigos comentados. A IA não deve deixar "restos" de código.
- **Comentários:** O código deve ser autoexplicativo. Use comentários apenas para explicar o "PORQUÊ" de uma decisão técnica não óbvia, NUNCA o "O QUÊ" o código está fazendo.
- **Aninhamento Profundo (Callback Hell):** Evite mais de 3 níveis de aninhamento (`if` dentro de `if` dentro de `for`). Use _Early Returns_ para achatar a estrutura.
