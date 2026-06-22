# Research & Technical Decisions: Refatoração de Layout Estático

**Feature**: [spec.md](file:///c:/DEV/orcafacil/specs/003-static-layout-refactoring/spec.md)
**Date**: 2026-06-22

---

## Decisão 1: Integração Tipográfica da Fonte Sora

*   **Decision**: Registrar e aplicar a fonte **Sora** globalmente utilizando a integração nativa `next/font/google` no arquivo `app/layout.tsx`.
*   **Rationale**: O Next.js otimiza o carregamento de fontes do Google automaticamente, baixando-as no momento do build e servindo-as a partir do mesmo domínio da aplicação, o que zera o tempo de bloqueio de renderização (FOIT) e evita pulos de layout durante o carregamento de páginas.
*   **Alternatives considered**:
    *   *Importação via CDN tradicional (Google Fonts `<link>`)*: Rejeitada porque insere dependências de rede externas em runtime, aumentando o tempo de renderização inicial (First Contentful Paint) e violando as diretrizes de performance.
    *   *Arquivos locais de fonte*: Rejeitada porque o projeto Next.js já está configurado para usar fontes do Google via pacotes nativos, sendo a solução com `next/font/google` mais simples e manutenível.

---

## Decisão 2: Mapeamento de Cores de Marca no Design System

*   **Decision**: Mapear os tokens de cores de marca (Azul Primário `#1E5EFF`, Grafite `#111827`, Off-white `#F8FAFC`) diretamente nas variáveis CSS semânticas do `:root` e `.dark` no arquivo `app/globals.css`.
*   **Rationale**: Isso permite que todos os componentes shadcn/ui existentes e futuros herdem as cores da marca OrçaFácil automaticamente, sem a necessidade de reescrever classes utilitárias ou criar múltiplos componentes customizados. Garante também a conformidade automática com o contraste WCAG AA.
*   **Alternatives considered**:
    *   *Adição de classes de cores utilitárias estáticas (ex: bg-brand-primary)*: Rejeitada porque exigiria refatoração manual em dezenas de arquivos de componentes, aumentando a complexidade e gerando riscos de inconsistência visual.

---

## Decisão 3: Responsividade Ergonômica Mobile-First na Navegação

*   **Decision**: Ocultar a Sidebar e o SidebarTrigger do Header em telas menores que 768px usando classes responsivas do Tailwind (`hidden md:flex`/`md:block`) e renderizar um componente `<MobileTabBar />` fixo no rodapé apenas em resoluções mobile (`md:hidden`).
*   **Rationale**: A barra de abas inferior tátil é o padrão de ergonomia para aplicativos móveis (PWA), pois posiciona os controles mais acessados diretamente na área de alcance natural do polegar, facilitando o uso rápido em campo (como eletricistas ou pintores na rua).
*   **Alternatives considered**:
    *   *Manter menu Hambúrguer com Sheet deslizante no mobile*: Rejeitada porque exige múltiplos cliques e o uso de duas mãos para realizar navegações rotineiras, ferindo o princípio de simplicidade e rapidez em campo.
