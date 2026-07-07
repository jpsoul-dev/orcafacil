# Implementation Plan: Reorganização do Formulário de Novo Orçamento

**Branch**: `009-improve-budget-form` | **Date**: 2026-07-06 | **Spec**: [spec.md](file:///c:/DEV/orcafacil/specs/009-improve-budget-form/spec.md)

**Input**: Feature specification from `/specs/009-improve-budget-form/spec.md`

## Summary

O objetivo é reorganizar a tela de criação de novo orçamento, deixando-a mais compacta, intuitiva e focada na experiência mobile-first e desktop. As melhorias envolvem a colapsabilidade de todas as seções, ordenação dos metadados (Cliente, Validade, Título), agrupamento de fluxos secundários (Adicionar Itens, Formas de Pagamento, Termos, Desconto Geral) em painéis laterais (Drawers), posicionamento fixo do Resumo do orçamento (lateral no desktop, rodapé no mobile) e a remoção completa da funcionalidade de desconto individual por item.

## Technical Context

**Language/Version**: TypeScript, React 19.2, Next.js 16 (App Router)

**Primary Dependencies**: Tailwind CSS v4, `@base-ui-components/react` (Base UI), `lucide-react`, `react-hook-form`, `zod`

**Storage**: Supabase PostgreSQL (chamada à RPC `upsert_quote_with_items` na camada de persistência)

**Testing**: Testes manuais locais de responsividade e fluxos do usuário

**Target Platform**: Web Browsers (Desktop & Mobile Responsive)

**Project Type**: Web application (Next.js client-side form)

**Performance Goals**: Tempo de carregamento inferior a 1.5s em redes 3G; transições fluidas e ausência de travamentos ao adicionar ou recolher itens.

**Constraints**: Layout semântico estrito do Design System, área de toque mínima de 44x44px em botões móveis (WCAG AA), e nenhuma quebra no processamento de orçamentos legados no banco de dados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Separação de Lógicas (SRP)**: Toda persistência e validação no backend é mantida nas Actions (`saveQuote`) e na RPC do Supabase. A lógica de UI fica isolada no componente do formulário. (PASSED)
- **II. Componentes de Servidor por Padrão**: A rota `app/app/quotes/new/page.tsx` continua como Server Component, renderizando o `QuotePageContent` e o `QuoteForm` como Client Component nas folhas interativas do DOM. (PASSED)
- **III. Isolamento Multi-Tenant (RLS)**: O salvamento e busca utilizam o tenant autenticado do usuário via context do Supabase. (PASSED)
- **IV. Tipagem Estrita & Nomenclatura em Inglês**: Todas as novas variáveis, hooks e tipos serão em inglês e estritamente tipados sem o uso de `any`. (PASSED)
- **V. Mobile-First**: O formulário é reestruturado priorizando o mobile (resumo fixo inferior, targets de toque de 44px, formulário recolhível para reduzir rolagem). (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/009-improve-budget-form/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec Checklist
```

### Source Code

```text
app/
└── app/
    └── quotes/
        ├── actions.ts                  # [MODIFY] Adaptações de envio dos itens para a RPC
        ├── schemas.ts                  # [MODIFY] Remoção de descontos individuais do item
        └── components/
            ├── quote-form.tsx          # [MODIFY] Refatoração completa do layout e painéis
            └── quote-item-row.tsx      # [NEW] Item da lista otimizado e colapsável
lib/
└── services/
    └── quote-service.ts                # [NO CHANGES]

types/
└── quote.ts                            # [MODIFY] Ajuste nos tipos QuoteItem
```

**Structure Decision**: Refatoração centrada no módulo `app/app/quotes/components/` mantendo compatibilidade com as rotas Next.js existentes.

## Proposed Changes

### Quotes Module

#### [MODIFY] [schemas.ts](file:///c:/DEV/orcafacil/app/app/quotes/schemas.ts)
- Remover os campos `discount_type` e `discount_value` do schema `quoteItemSchema`.

#### [MODIFY] [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx)
- **Ordenação dos campos principais**: Reordenar para exibir Cliente, Validade e Título.
- **Seções Colapsáveis**: Usar componentes `Collapsible` do Base UI ou Shadcn para "Dados do orçamento" (aberto por padrão), "Itens do orçamento" (aberto por padrão), "Formas de pagamento" (fechado por padrão) e "Termos e condições" (fechado por padrão).
- **Lista de Itens (Tabela/Cards)**:
  - No desktop: Renderizar itens em formato de tabela/lista compacta com cabeçalho fixo (Descrição, Qtd., Valor Unitário, Total).
  - No mobile: Renderizar em formato compacto conforme especificações da interface móvel.
  - Cada item deve abrir recolhido por padrão e expandir para edição em linha única no desktop ao ser clicado.
  - Remover completamente qualquer campo ou lógica de desconto individual dos itens.
- **Resumo Fixo**:
  - No desktop: Fixar o resumo na lateral direita (`sticky top-24 self-start`).
  - No mobile: Fixar o resumo no rodapé da página (`fixed bottom-0 left-0 right-0 z-50 bg-card border-t p-4 pb-safe`).
- **Painéis Laterais (Drawers)**:
  - **Adicionar Item**: Botão único que abre Drawer lateral com opções de preenchimento manual ou busca de múltiplos itens no catálogo com checkboxes e adição em lote.
  - **Formas de Pagamento**: Botão que abre Drawer com a listagem de checkboxes com nome e ícone das formas de pagamento. Retorna chips na tela principal com botão rápida de exclusão (x).
  - **Termos e Condições**: Botão que abre Drawer com a caixa de texto RichTextEditor e confirmação.
  - **Desconto Geral**: Ícone de desconto no resumo que abre Drawer para configurar o desconto geral (valor ou %). Área de toque mínima de 44x44px.

#### [NEW] [quote-item-row.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-item-row.tsx)
- Componente que representa a linha/card do item colapsável, cuidando do modo de visualização reduzido (apenas cabeçalhos) e do modo expandido para edição rápida em uma única linha no desktop.

#### [MODIFY] [types/quote.ts](file:///c:/DEV/orcafacil/types/quote.ts)
- Atualizar a interface `QuoteItem` para remover a obrigatoriedade de `discount_type` e `discount_value` (mantendo-os no máximo como opcionais legados).

#### [MODIFY] [actions.ts](file:///c:/DEV/orcafacil/app/app/quotes/actions.ts)
- Garantir que a Action `saveQuote` envie `discount_type = 'none'` e `discount_value = 0` para cada item ao chamar a RPC `upsert_quote_with_items`, adaptando os dados recebidos do formulário de criação (que agora não conterá mais os descontos por item).

## Verification Plan

### Manual Verification
- Testar a responsividade do layout em Desktop (Resumo fixo à direita) e Mobile (Resumo fixo no rodapé).
- Validar seções colapsáveis clicando nos cabeçalhos e confirmando a transição suave de abertura/fechamento.
- Testar a inserção múltipla do catálogo no painel lateral do "Adicionar item".
- Testar a exclusão e seleção de formas de pagamento via chips e painel lateral.
- Testar aplicação do desconto geral pelo painel do resumo.
- Verificar a ausência total de descontos individuais e validar a integridade dos cálculos de total do orçamento.
