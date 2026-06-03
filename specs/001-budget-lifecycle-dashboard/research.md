# Research: Ciclo de Vida de Orçamentos, Gráficos Recharts e Emissão de Recibos

Este documento consolida as pesquisas, decisões de engenharia e racionais técnicos para a implementação das melhorias de fluxo comercial no Orça Fácil.

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

### Alternativas Consideradas
*   *Armazenar dados de recibo no próprio orçamento*: Rejeitado porque o recibo possui ciclo de vida próprio e atributos que não cabem na modelagem do orçamento (ex: data de recebimento, descrição customizada de serviços prestados, numeração própria sequencial).

---

## 2. Numeração Sequencial dos Recibos

### Decisão
A numeração do recibo será gerada sequencialmente pelo próprio banco de dados ou via serviço no backend no formato `REC-{sequencial}` por usuário (ex: `REC-001`). O cálculo será:
```sql
SELECT COALESCE(COUNT(*), 0) + 1 FROM public.quote_receipts WHERE user_id = p_user_id;
```
Isso garante uma numeração incremental contínua para cada empresa separadamente.

### Racionais
*   Garante uma numeração comercial profissional sem necessitar de geradores complexos de IDs em cluster. A contagem por `user_id` garante que cada empresa tenha sua própria sequência iniciando do 1.

---

## 3. Visualizações Analíticas no Painel do Prestador (Recharts)

### Decisão
Aprimorar o componente de dashboard em `app/app/page.tsx` para apresentar 3 visões analíticas com Recharts:
1.  **Gráfico de Linha (`QuotesChart`)**: Reutilizar o componente existente em `app/app/components/quotes-chart.tsx`, que já realiza o agrupamento por dia e por mês com base no campo `created_at` de `quotes` (contando o volume de novos orçamentos criados).
2.  **Gráfico de Pizza/Rosca (`StatusPieChart`)**: Criar um componente Shadcn/Recharts que mostra a distribuição percentual e volumétrica de orçamentos agrupados por `status`.
3.  **Gráfico de Barras (`RevenueBarChart`)**: Criar um gráfico de barras que mostra o faturamento mensal faturado, baseado na soma de `total` dos orçamentos com status `completed` agrupados por mês.

### Racionais
*   **Reuso e Performance**: A biblioteca Recharts já está instalada e configurada no projeto. O agrupamento será feito através de queries seguras que consolidam os dados de `quotes` no servidor, enviando apenas a lista otimizada para o client, reduzindo o tráfego de rede e consumo de bundle no frontend.

---

## 4. Geração de PDF e Impressão Direta (Print CSS)

### Decisão
Utilizar o mecanismo nativo de impressão do navegador (`window.print()`) customizado com classes CSS de mídia do Tailwind v4 (`print:hidden`, `print:shadow-none`, `print:p-0`). 

### Racionais
*   **Fidelidade Visual**: O navegador renderiza a página HTML exatamente como o design system foi concebido.
*   **Performance**: Elimina a necessidade de instalar bibliotecas pesadas e problemáticas de renderização de PDF no lado do cliente (como `jspdf` ou `html2canvas`), que aumentam o tamanho do bundle JavaScript e causam distorções de fontes.
*   **Layout Limpo**: Ao acionar a impressão, os menus laterais de navegação, a barra de ações superior, o rodapé do sistema e os botões de ação do recibo/orçamento serão ocultados, mantendo na folha de impressão apenas a área de papel limpa do recibo/orçamento e as assinaturas.
