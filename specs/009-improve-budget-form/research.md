# Research & Decisions: Reorganização do Formulário de Novo Orçamento

Este documento consolida as decisões técnicas, a análise de arquitetura e as abordagens de design adotadas para a reorganização do formulário de criação de orçamentos.

## 1. Abordagem de Seções Recolhíveis (Collapsibles)

### Decisão
Utilizar o componente `Collapsible` do **Base UI** (`@base-ui-components/react`) ou do **Shadcn** para criar as seções colapsáveis no formulário.

### Racional
O Base UI fornece controle de acessibilidade nativo (`aria-expanded`, controle de foco, etc.) e renderização robusta de elementos sanfona. As seções "Dados do orçamento" e "Itens do orçamento" iniciam expandidas por padrão utilizando o estado de controle de estado interno do formulário (React Hook Form ou states de UI).

### Alternativas Consideradas
- **Sanfona Customizada com Framer Motion**: Rejeitada por adicionar complexidade desnecessária e potenciais quebras de acessibilidade se não for implementada com todas as tags `aria-*` adequadas.
- **Cards sem colapso (Atual)**: Rejeitado porque a tela fica excessivamente extensa, prejudicando o foco e a experiência móvel.

---

## 2. Layout do Resumo Fixo (Sticky Sidebar & Bottom Bar)

### Decisão
- **Desktop (>= 768px/md)**: Implementar uma estrutura de duas colunas usando CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`). As seções colapsáveis do formulário ocupam `md:col-span-2`, e o "Resumo do orçamento" ocupa `md:col-span-1` com classe `sticky top-24 self-start`.
- **Mobile (< 768px)**: Fixar o resumo na parte inferior do viewport usando `fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg px-4 py-3`. O formulário principal receberá um padding inferior extra (`pb-32`) para evitar que a barra inferior sobreponha campos de entrada.

### Racional
Essa abordagem garante que o usuário tenha visibilidade em tempo real sobre os totais e possa confirmar a ação principal instantaneamente, independentemente da rolagem da tela.

### Alternativas Consideradas
- **Apenas Lateral (Desktop)**: Deixar o mobile rolável sem fixação inferior. Rejeitada porque viola o critério de aceitação de que o resumo deve estar sempre visível durante o preenchimento.

---

## 3. Painel Lateral (Drawer/Sheet) para Fluxos Dedicados

### Decisão
Utilizar o componente `Sheet` do Shadcn / Base UI para todos os fluxos dedicados que requerem painel lateral:
1. Adição de itens (busca no catálogo ou manual).
2. Seleção de formas de pagamento.
3. Edição de termos e condições.
4. Ajuste do desconto geral.

### Racional
Manter fluxos secundários complexos (como a busca e seleção em lote no catálogo) isolados em painéis laterais (sheets) evita sobrecarregar a tela principal do formulário, mantendo o fluxo principal simples e limpo.

### Alternativas Consideradas
- **Modais Centralizados (Dialog)**: Rejeitados porque o formato lateral (Sheet em full screen) se comporta melhor em telas móveis e dá uma sensação de fluxo contínuo.

---

## 4. Remoção do Desconto por Item e Compatibilidade com o Banco de Dados

### Decisão
Remover a funcionalidade do formulário de criação de orçamentos e do schema Zod de validação do cliente. Para fins de compatibilidade com a RPC no banco de dados (`upsert_quote_with_items`) que espera o JSON dos itens, os campos `discount_type` e `discount_value` serão omitidos ou definidos como `'none'` e `0` implicitamente na chamada da Action, sem modificar a estrutura física das colunas da tabela de itens (que é necessária para visualizar orçamentos antigos com descontos individuais).

### Racional
Garante que nenhum dado antigo seja corrompido, mas limpa 100% o frontend de criação para a nova regra de negócio de forma limpa e segura.
