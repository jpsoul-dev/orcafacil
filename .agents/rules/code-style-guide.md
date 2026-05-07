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
