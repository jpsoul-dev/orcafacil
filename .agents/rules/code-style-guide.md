---
trigger: always_on
---

# TypeScript & Type Safety Rules

- **STRICTLY FORBIDDEN: `any` type.** Never use `any`.
- If a type is unknown, use `unknown` and implement proper type guards.
- If a type is complex, define an `interface` or `type` alias.
- Prefer `Zod` schemas for runtime validation where applicable.
- Ensure all Next.js Server Components and Actions are strictly typed, especially for `props` and `formAction` states.

# Language

- Sempre devolva as respostas, os passos e todas as informações em Portugues Brasil

#shadcn

- O shadcn está utilizando o Base UI (@base-ui/react) e não mais o radix, considere isso na hora de utilizar os componentes do shadcn.

- **Tailwind:** Use classes utilitárias do Tailwind CSS de forma limpa, utilizando bibliotecas como `clsx` e `tailwind-merge` (`cn()`) para composição condicional de classes.
- **Numeros mágicos:** Não utilize numeros mágicos taxativos nas estilizações como por exemplo `h-[500px]` utilize os padrões do tailwind
- **consitencia visual:** Mantenha a consistencia visual em toda a aplicação.
