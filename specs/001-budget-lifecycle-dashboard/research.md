# Research: Ciclo de Vida de Orçamentos, Gráficos Recharts, Emissão de Recibos e UI/UX (Linear Style)

Este documento consolida as pesquisas, decisões de engenharia e racionais técnicos para a implementação das melhorias de fluxo comercial e estética visual no Orça Fácil.

---

## 1. Banco de Dados: Extensão do Schema e RLS

### Decisão
Criar um script de migração SQL (`supabase/migrations/20260603000000_budget_lifecycle_improvements.sql`) para:
1.  Adicionar a coluna `cancellation_reason` (text, nullable) na tabela `quotes`.
2.  Normalizar os status legados rodando um UPDATE para remapear definitivamente `open` para `pending` e `accepted` para `approved`.
3.  Ajustar a check constraint da tabela `quotes` para permitir estritamente os novos status (`draft`, `pending`, `approved`, `rejected`, `cancelled`, `completed`).
4.  Recriar a view `vw_quotes` para usar a regra de expiração dinâmica baseada em `pending` no lugar de `open`.
5.  Criar a tabela `quote_receipts` com as colunas de recibo, relacionamento 1:1 com a tabela `quotes` e RLS ativado por `user_id`.

### Racionais
*   **Segurança (RLS)**: Cada recibo de quitação pertence a um orçamento que por sua vez pertence a um prestador (tenancy). O controle de acesso por RLS em `quote_receipts` garante que usuários de diferentes contas nunca tenham acesso a dados alheios.
*   **Integridade**: A relação 1:1 (`quote_id uuid UNIQUE REFERENCES public.quotes(id) ON DELETE CASCADE`) garante que cada orçamento finalizado possua no máximo um único recibo de quitação associado, prevenindo duplicidade de faturamento.
*   **Histórico e Auditoria**: Manter o motivo de cancelamento armazenado no banco de dados resolve o requisito de consulta posterior pelo prestador sobre por que o cliente desistiu do serviço após aprovação.

---

## 2. Numeração Sequencial dos Recibos

### Decisão
A numeração do recibo será gerada sequencialmente pelo próprio banco de dados ou via serviço no backend no formato `REC-{sequencial}` por usuário (ex: `REC-001`). O cálculo será:
```sql
SELECT COALESCE(COUNT(*), 0) + 1 FROM public.quote_receipts WHERE user_id = p_user_id;
```
Isso garante uma numeração incremental contínua para cada empresa separadamente.

---

## 3. Visualizações Analíticas no Painel do Prestador (Recharts)

### Decisão
Aprimorar o componente de dashboard em `app/app/page.tsx` para apresentar 3 visões analíticas com Recharts:
1.  **Gráfico de Linha (`QuotesChart`)**: Reutilizar o componente existente em `app/app/components/quotes-chart.tsx`, que já realiza o agrupamento por dia e por mês com base no campo `created_at` de `quotes` (contando o volume de novos orçamentos criados).
2.  **Gráfico de Pizza/Rosca (`StatusPieChart`)**: Criar um componente Shadcn/Recharts que mostra a distribuição percentual e volumétrica de orçamentos agrupados por `status`.
3.  **Gráfico de Barras (`RevenueBarChart`)**: Criar um gráfico de barras que mostra o faturamento mensal faturado, baseado na soma de `total` dos orçamentos com status `completed` agrupados por mês.

---

## 4. Geração de PDF e Impressão Direta (Print CSS)

### Decisão
Utilizar o mecanismo nativo de impressão do navegador (`window.print()`) customizado com classes CSS de mídia do Tailwind v4 (`print:hidden`, `print:shadow-none`, `print:p-0`). 

---

## 5. UI/UX: Estilo Linear App e Responsividade da Sidebar

### Decisão
*   **Melhoria na Sidebar**: Adicionar o seletor utilitário `group-data-[collapsible=icon]:hidden` em todos os elementos secundários de texto da sidebar desktop (`SidebarGroupLabel`, `span` e `ChevronRight` nos botões ativos) para que no colapso de ícones nenhum texto residual ou chevrons quebrem a proporção do botão. No mobile, a sidebar entra automaticamente em formato drawer através do `SidebarProvider` e do gatilho `SidebarTrigger` que se posiciona no header da aplicação.
*   **Visual Linear**: Utilizar as classes base do tema shadcn e o Tailwind CSS v4 para aplicar bordas suaves (`border-border/60`), fundos escurecidos discretos e cantos arredondados premium nos cartões e inputs.
*   **Filtros por Abas (Tabs)**: Redesenhar a interface de abas na listagem de orçamentos para manter um layout de linha única com rolagem horizontal no mobile (`overflow-x-auto flex-nowrap scrollbar-none`) ao invés de quebrar linhas (wrap), apresentando contadores dinâmicos da quantidade de orçamentos em cada status (ex: `Todos (12)`, `Pendente (3)`).

---

## 6. Configuração PWA no Next.js (App Router)

### Decisão
*   Implementar o manifesto dinâmico através do arquivo `app/app/manifest.ts` estendendo a classe `MetadataRoute.Manifest` do Next.js.
*   Adicionar o ícone oficial da aplicação em formato SVG no diretório `public/icon.svg` composto por um raio com gradiente indigo-cyan de cantos arredondados, que servirá como ícone instalável e favicon do PWA.
*   Declarar as meta-tags do PWA (theme-color, apple-touch-icon, apple-mobile-web-app-capable) no layout principal da aplicação.
*   Essa abordagem garante a conformidade com as regras de PWA do Chrome/Safari sem sobrecarregar o build com service workers redundantes para offline caching complexo em uma aplicação de gestão autenticada de orçamentos.
