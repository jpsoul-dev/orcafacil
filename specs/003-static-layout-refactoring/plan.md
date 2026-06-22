# Implementation Plan: Componentes Globais Estáticos e Refatoração de Layout

**Branch**: `003-static-layout-refactoring` | **Date**: 2026-06-22 | **Spec**: [spec.md](file:///c:/DEV/orcafacil/specs/003-static-layout-refactoring/spec.md)

**Input**: Feature specification from `specs/003-static-layout-refactoring/spec.md`

## Summary

Esta feature contempla a primeira fase de refatoração do OrçaFácil, focada única e exclusivamente em componentes estáticos globais de navegação e na estrutura do layout. O objetivo é unificar a identidade visual segundo o Design System e o Brandbook da marca (fonte Sora, cores semânticas oficiais e suporte a light/dark mode) e implementar uma usabilidade Mobile-First de alta qualidade, substituindo a sidebar por uma Tab Bar inferior tátil em resoluções móveis (< 768px).

---

## Technical Context

*   **Language/Version**: TypeScript 5.x, React 19.x, Next.js 16.x (App Router)
*   **Primary Dependencies**: Tailwind CSS v4, shadcn/ui (Radix-based), `next-themes` (gerenciamento de classe `.dark`), `lucide-react` (ícones outline)
*   **Storage**: Supabase Client (somente leitura cadastral na tabela `profiles` via Server Component do layout principal)
*   **Testing**: Validação de build estático Next.js (`npm run build`) e testes manuais responsivos/funcionais via DevTools
*   **Target Platform**: Navegadores Web modernos, PWA standalone (Mobile/Desktop)
*   **Project Type**: Web Application Front-end (Next.js)
*   **Performance Goals**: Tempo de renderização/pintura inicial (FCP) reduzido e alternância de temas abaixo de 200ms
*   **Constraints**:
    *   Design estritamente Mobile-First
    *   Acessibilidade e contraste visual WCAG AA (taxa mínima de 4.5:1)
    *   Nenhuma modificação de lógica de banco de dados, fluxos de emissão ou tabelas de dados
*   **Scale/Scope**: ~3 layout layouts estruturais (Desktop Sidebar, Tablet collapsed, Mobile Tab Bar inferior), ~10 CSS variáveis customizadas de temas

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Princípio I (SRP & Services Pattern)**: Passa. Nenhuma lógica complexa de banco de dados ou negócios é acoplada nos componentes de UI. O layout carrega a empresa e os dados do perfil via server-side e passa-os via prop limpa.
*   **Princípio II (Server Components & Server Actions)**: Passa. O `AppLayout` raiz e as páginas permanecem Server Components. Apenas `AppSidebar` e a nova `MobileTabBar` são Client Components devido a hooks dinâmicos (`usePathname`) e manipulação de estado do DOM.
*   **Princípio III (Isolamento Multi-Tenant)**: Passa. Nenhuma nova tabela ou view é criada. O RLS existente nas tabelas consultadas (`profiles` e `companies`) é mantido e respeitado.
*   **Princípio IV (TypeScript Estrito & Nomenclatura em Inglês)**: Passa. Sem uso de `any`, com tipagem explícita de propriedades (ex: `MobileTabBarProps`) e nomenclatura em inglês para todas as variáveis, funções e componentes criados.
*   **Princípio V (Mobile-First)**: Passa. A Tab Bar mobile inferior fixa e a ocultação da sidebar e do HeaderTrigger para telas menores que 768px garantem uma experiência tátil ergonômica e sem scrolls horizontais.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-static-layout-refactoring/
├── spec.md              # Feature Specification
├── plan.md              # This file (Implementation Plan)
├── research.md          # Research & Technical Decisions (Phase 0)
├── data-model.md        # Data consultation model (Phase 1)
├── quickstart.md        # Verification & local guide (Phase 1)
└── contracts/
    └── layout.md        # Component interfaces & routes metadata (Phase 1)
```

### Source Code

```text
app/
├── app/
│   └── layout.tsx       # Modificação do Grid principal e importação do MobileTabBar
├── globals.css          # Injeção da fonte Sora e variáveis semânticas de cores
└── layout.tsx           # Configuração global da fonte Sora via next/font/google
components/
├── app-sidebar.tsx      # Atualização estética da Sidebar e do Avatar do rodapé
├── mobile-tab-bar.tsx   # Novo componente de navegação inferior mobile (New)
└── ui/
    └── sidebar.tsx      # Configuração responsiva e comportamento nativo do shadcn sidebar
```

**Structure Decision**: A aplicação segue a estrutura padrão de projeto Next.js (Single project / Option 1), agrupando as páginas sob o App Router (`app/`) e os componentes reutilizáveis sob `components/`.

---

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição do OrçaFácil identificada.*

---

## Verification Plan

### Automated Verification
*   Execução do linter do projeto para assegurar qualidade e tipagem estática:
    ```bash
    npm run lint
    ```
*   Compilação da build de produção para certificar ausência de quebras de empacotamento ou erros de carregamento estático do Next.js:
    ```bash
    npm run build
    ```

### Manual Verification
*   **Verificação de Responsividade**: Redimensionar a tela no inspetor do Chrome simulando resoluções de 320px, 375px (iPhone SE/12), 768px (iPad) e 1440px (Desktop), confirmando que a Sidebar oculta-se e a Tab Bar inferior fixa surge apenas em larguras inferiores a 768px, sem ambos coexistirem.
*   **Verificação de Acessibilidade**: Testar a navegação utilizando apenas a tecla Tab, conferindo se os itens de navegação (Sidebar, Tab Bar inferior, botões do Header) possuem contorno de foco visível.
*   **Alternância de Temas**: Testar o clique no Toggle de Tema e conferir se todas as cores estruturais alternam de acordo com as especificações sem piscar ou desalinhar.
*   **Iniciais do Avatar**: Alterar o nome de teste no banco de dados para testar fallback de iniciais quando a foto de perfil não existe.
