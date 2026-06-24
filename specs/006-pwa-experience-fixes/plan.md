# Implementation Plan: PWA Mobile Experience Improvements

**Branch**: `006-pwa-experience-fixes` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-pwa-experience-fixes/spec.md`

---

## Summary

O objetivo deste recurso é solucionar problemas críticos de usabilidade móvel e instalabilidade PWA na aplicação, especialmente no formulário de criação/edição de orçamentos. Faremos isso através de:
1. Ocultação inteligente do cabeçalho global do layout (`AppLayout`) e do rodapé `MobileTabBar` via seletor `:has()` do Tailwind v4 em rotas de formulário no mobile.
2. Reposicionamento dos botões de ação do rodapé fixed do formulário (`quote-form.tsx`) para a AppBar móvel superior e para o fluxo natural da página.
3. Correção de ícones PWA ausentes no `manifest.ts` e inclusão do `apple-touch-icon.png` e tags de standalone no header do `layout.tsx` raiz.
4. Prevenção de zoom automático do Safari no iOS aumentando o font-size dos inputs para `16px` em mobile e ativando `inputMode="decimal"` nos inputs de preço e desconto.
5. Aumento dos touch targets de exclusão/descontos para no mínimo `44px`.
6. Implementação de um seletor de catálogo que se transforma em Drawer (Bottom Sheet) no mobile e permanece como Dialog no desktop.
7. Registro de um Service Worker básico para pre-caching de assets estáticos e fallback offline.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 16 (App Router)

**Primary Dependencies**: React 19, Tailwind CSS v4, Lucide React, Vaul (Drawer), shadcn/ui

**Storage**: Cache do Service Worker (Cache Storage API) e Supabase PostgreSQL

**Testing**: Validação local com Chrome DevTools (Application -> Manifest / Service Workers) e Lighthouse PWA Audit

**Target Platform**: Mobile (iOS Safari / Android Chrome) standalone web app e navegadores desktop

**Project Type**: Next.js 16 Web Application / PWA

**Performance Goals**: Lighthouse PWA Score >= 95% e FCP < 1.5s no mobile

**Constraints**: Usar padrões estritos do Tailwind v4 e garantir isolamento visual sem causar regressions no desktop

**Scale/Scope**: Afeta a experiência global do app shell e, de forma específica, o formulário de orçamento `/app/quotes/new` e `/app/quotes/[id]/edit`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Separação Estrita de Lógicas**: Passa. Toda a lógica de negócio de orçamentos continua nos serviços correspondentes em `lib/services/`. As modificações propostas são puramente visuais e de configuração de PWA.
- **II. Componentes de Servidor por Padrão**: Passa. O registro do Service Worker será feito por um componente cliente leve (`components/pwa-register.tsx`), mantendo o layout raiz do Next.js como Server Component.
- **III. Isolamento Multi-Tenant**: Passa. Não há alteração de consultas no banco de dados Supabase; a segurança multi-tenant baseada em RLS permanece inalterada.
- **IV. Tipagem TypeScript**: Passa. Todo o código TypeScript inserido ou alterado usará tipagem explícita e regras estritas do compilador (sem uso de `any`).
- **V. Design Responsivo Mobile-First**: Passa. As alterações aplicam a lógica Mobile-First usando breakpoints apropriados do Tailwind CSS v4 para ocultar/exibir elementos.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-pwa-experience-fixes/
├── plan.md              # Este arquivo (plano de implementação)
├── research.md          # Fase 0 - Pesquisas e decisões técnicas
├── data-model.md        # Fase 1 - Tabela de dados consumidos e cache do SW
├── quickstart.md        # Fase 1 - Guia rápido para rodar e testar
├── contracts/
│   └── catalog-ui-contract.md # Fase 1 - Contrato de interface do catálogo responsivo
└── tasks.md             # Fase 2 - Checklist de tarefas (criado via /speckit-tasks)
```

### Source Code Modifications

```text
app/
├── layout.tsx           # Modificação: Adicionar apple-touch-icon, metatags standalone e viewport cover
├── manifest.ts          # Modificação: Atualizar ícones PNG do PWA (android-chrome-192x192.png e android-chrome-512x512.png)
└── app/
    ├── layout.tsx       # Modificação: Adicionar classe 'group' no SidebarInset e lógica :has() no header/tabbar
    └── quotes/
        └── components/
            └── quote-form.tsx # Modificação: AppBar superior com ações mobile, remover fixed footer, font-sizes 16px, inputmodes e Drawer/Dialog no catálogo

components/
├── pwa-register.tsx     # Novo: Componente cliente para registrar o sw.js
└── ui/
    └── discount-input.tsx # Modificação: Aumento de touch target e inputmode="decimal"

public/
└── sw.js                # Novo: Arquivo básico do Service Worker para cache e suporte offline
```

---

## Proposed Changes

### Component 1: PWA Assets & Configurations (Core Meta & Manifest)
- Configurar `app/layout.tsx` para incluir referências a `/apple-touch-icon.png` nas propriedades do metadata.
- Modificar `app/manifest.ts` para mapear os ícones PNG existentes em `public/` e remover a referência ao `/icon.svg` inexistente.
- Atualizar a configuração do viewport no layout raiz para evitar zoom acidental (`user-scalable=no`, `viewportFit: 'cover'`).

### Component 2: Layout Shell & Responsive Hiding (Shell Architecture)
- Em `app/app/layout.tsx`, adicionar a classe `group` à tag `<SidebarInset>`.
- Atualizar a classe do `<header>` global para esconder no mobile quando um elemento com a classe `.hide-global-header-mobile` for descendente do container principal (`max-sm:group-has-[.hide-global-header-mobile]:hidden`).
- Aplicar a mesma lógica de ocultação sobre a barra de navegação inferior `MobileTabBar`.

### Component 3: Quote Form Interface Updates (UX & Usability)
- Adicionar a classe `.hide-global-header-mobile` na div raiz de `quote-form.tsx` para sinalizar ao layout shell que oculte o header global.
- Atualizar a AppBar superior do formulário para renderizar as ações principais de salvar no mobile.
- Otimizar o rodapé inferior para fluir normalmente com a página no mobile e só ficar fixado (`fixed`) no desktop.
- Ajustar os inputs de preço unitário e desconto para font size `text-base` no mobile e adicionar o atributo `inputMode="decimal"`.
- Alterar o botão do catálogo para usar componentização condicional baseada em `useMediaQuery`, renderizando um Drawer (Bottom Sheet) em telas menores e Dialog em telas maiores.
- Aumentar o tamanho do touch target da lixeira de item (`Trash2`) para pelo menos 44px (`h-11 w-11`).

### Component 4: Service Worker Setup (Offline Resilience)
- Criar `public/sw.js` com interceptadores de fetch e cache-first para arquivos estáticos essenciais.
- Criar `components/pwa-register.tsx` com o código de inicialização do Service Worker.
- Inserir `<PwaRegister />` no layout raiz do app para ativação.

---

## Verification Plan

### Automated/Lint Checks
- Executar `npm run lint` para garantir que as alterações no TypeScript não geram erros de tipo ou importações duplicadas.
- Validar se a tipagem do Drawer e Dialog está correta no formulário responsivo.

### Manual Verification
1. **Lighthouse Audit**: Gerar um build de produção local (`npm run build` e `npm start`) e executar a aba Lighthouse no Chrome DevTools com perfil Mobile para avaliar a instalabilidade do PWA.
2. **Viewport Simulation**: Simular viewports de 360px e 414px na visualização de dispositivos do navegador. Focar inputs de valor para testar se há zoom no Safari e se o teclado abre como numérico.
3. **Simulação Offline**: Ativar a opção Offline nas ferramentas de rede do Chrome, atualizar a página e verificar se o App Shell carrega através do Service Worker.
