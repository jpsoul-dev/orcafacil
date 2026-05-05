<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TypeScript & Type Safety Rules

- **STRICTLY FORBIDDEN: `any` type.** Never use `any`. 
- If a type is unknown, use `unknown` and implement proper type guards.
- If a type is complex, define an `interface` or `type` alias.
- Prefer `Zod` schemas for runtime validation where applicable.
- Ensure all Next.js Server Components and Actions are strictly typed, especially for `props` and `formAction` states.