---
trigger: model_decision
description: Quando desenvolvimento de User Interface e frontend.
---

- **Shadcn:** O projeto utiliza uma versão do Shadcn UI que utiliza o **Base UI**.
- **Tailwind:** Use classes utilitárias do Tailwind CSS de forma limpa, utilizando bibliotecas como `clsx` e `tailwind-merge` (`cn()`) para composição condicional de classes.
- **Numeros mágicos:** Não utilize numeros mágicos taxativos nas estilizações como por exemplo `h-[500px]` utilize os padrões do tailwind
- **consitencia visual:** Mantenha a consistencia visual em toda a aplicação.
- **Integração:** Sempre utilize `@hookform/resolvers/zod` para conectar o schema Zod ao `useForm`.
- **Componentização:** Mantenha a lógica do formulário no Client Component, mas delegue o envio dos dados (submit) para uma Server Action importada.
- **Feedback:** Sempre trate e exiba os estados de `isSubmitting` (para desabilitar botões) e os erros de validação dos campos. -**zod no backend:** Também utilize zod no backend sempre que possível.

# 🎨 Diretrizes de Design System e UI

Você atuará como um Engenheiro de Frontend Sênior e Especialista em UX/UI. Ao gerar, alterar ou sugerir código de interface gráfica neste workspace (React/Next.js), você DEVE seguir estritamente as regras de estilização, componentização e acessibilidade abaixo.

Nossa stack é: **Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui (Base UI) com um tema predefinido.**

## 1. Arquitetura de Componentes (Next.js 16)

- **Server Components por padrão:** Todo componente criado deve ser um Server Component, a menos que haja necessidade explícita de interatividade.
- **Client Components Estratégicos:** Adicione a diretiva `"use client"` no topo do arquivo APENAS se o componente precisar de hooks de estado (`useState`, `useReducer`), ciclo de vida (`useEffect`), ou interatividade direta com o DOM (ex: `onClick`).
- **Isolamento no Client:** Mantenha os Client Components nas "folhas" da árvore de renderização. Nunca transforme uma página inteira em Client Component apenas por causa de um botão interativo; extraia o botão.

## 2. Uso Estrito do shadcn/ui

- **Proibido Reinventar a Roda:** Antes de criar qualquer componente de interface genérico (Botões, Inputs, Modais, Dropdowns, Cards, etc.), assuma que o shadcn/ui já possui esse componente configurado no workspace (na pasta `components/ui`).
- **Importação Correta:** Importe os componentes do shadcn/ui de seus respectivos arquivos (ex: `import { Button } from "@/components/ui/button"`).
- **Não altere a base:** Nunca modifique o código fonte dos componentes dentro da pasta `components/ui` para atender a um caso isolado. Se precisar de uma variação, crie um wrapper em volta do componente ou utilize a prop `className` e a função `cn()` / `twMerge` para sobrescrever estilos localmente.

## 3. Estilização e Tailwind CSS v4

- **Uso de Variáveis do Tema (Obrigatório):** Nosso tema está predefinido via variáveis CSS. NUNCA utilize cores literais do Tailwind (ex: `bg-blue-500`, `text-gray-900`).
  - Em componentes shadcn não sobreponha a estilização base do tema, o shadcn "captura" a estilização por meio de temas (exemplo: mist, olive, zinc, etc.) das variaveis definidas em globals.css
  - Use estritamente as variáveis semânticas do shadcn: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `text-muted-foreground`, `border-border`, etc.
- **Sem Valores Arbitrários:** O Tailwind v4 é poderoso, mas você deve evitar valores mágicos arbitrários (ex: `w-[342px]`, `mt-[17px]`). Use a escala de espaçamento nativa do Tailwind (ex: `w-full`, `max-w-md`, `mt-4`).
- **Motor v4:** Lembre-se que o Tailwind v4 utiliza uma abordagem _CSS-first_ (sem `tailwind.config.js`). Confie nas variáveis `@theme` importadas no CSS global.

## 4. Responsividade (Mobile-First)

- Todo layout deve ser pensado primeiro para telas pequenas.
- Use os prefixos de breakpoint (`sm:`, `md:`, `lg:`, `xl:`) exclusivamente para escalar o layout para telas maiores. NUNCA construa para desktop primeiro tentando usar breakpoints para corrigir o mobile depois.
- Prefira CSS Grid e Flexbox nativos do Tailwind para estruturação de layouts, evitando larguras e alturas fixas que quebram a responsividade.

## 5. Acessibilidade (a11y) e UX

- **Tags Semânticas:** Não use `<div>` para tudo. Utilize `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, e `<footer>` corretamente.
- **Textos Alternativos:** Elementos interativos (ícones que funcionam como botões) e imagens (`<Image>` do next/image) DEVEM OBRIGATORIAMENTE conter atributos `aria-label` ou `alt` descritivos em português.
- **Foco e Navegação por Teclado:** Nunca remova os anéis de foco padrão (focus rings) via CSS sem providenciar um estilo de foco alternativo visível (`focus-visible:ring-ring`).

## 6. Lógica de UI e Limpeza

- **Separação Lógica vs UI:** Se um componente tiver mais de 3 funções de lógica complexa ou chamadas de API, extraia essa lógica para um Custom Hook (ex: `useUserDashboard()`) e mantenha o componente limpo, apenas consumindo os dados.
- **Merge de Classes Segura:** Sempre utilize a função utilitária `cn()` (fornecida pela instalação padrão do shadcn) ao combinar classes dinâmicas com classes estáticas do Tailwind para evitar conflitos de especificidade.
