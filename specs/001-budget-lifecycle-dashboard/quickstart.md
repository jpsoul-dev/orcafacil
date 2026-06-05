# Quickstart: Ciclo de Vida de Orçamentos e Recibos

Guia rápido para configurar e testar o fluxo completo de ciclo de vida de orçamentos, dashboard analítico e emissão de recibos.

---

## 1. Aplicar Migrations no Banco de Dados

Antes de iniciar as alterações no código da aplicação, execute o script SQL contido em [data-model.md](./data-model.md#L68) no painel do editor de SQL do Supabase. Ele:
*   Adiciona a coluna de motivo de cancelamento.
*   Atualiza as restrições e enums de status de orçamentos.
*   Cria a nova tabela `quote_receipts` com suas políticas RLS multi-tenant ativas.

---

## 2. Ordem de Implementação das Alterações

Para implementar os requisitos de forma segura e incremental, siga esta sequência recomendada:

### Passo 1: Schemas e Tipagens
1.  Atualize os enums de status em [schemas.ts](../../app/app/quotes/schemas.ts) para acomodar os novos status.
2.  Adicione os novos schemas de validação Zod para recibos e cancelamento de orçamentos.
3.  Atualize o schema de onboarding em [schemas.ts](../../app/onboarding/schemas.ts) para remover o telefone e adicionar a obrigatoriedade da seleção do ramo de atuação (`industry`).

### Passo 2: Server Actions e Serviços do Banco
1.  Crie a camada de persistência para recibos em `lib/services/receipt-service.ts`.
2.  Crie as Server Actions de recibo em `app/app/quotes/receipt-actions.ts`.
3.  Atualize a Server Action de status em [actions.ts](../../app/app/quotes/actions.ts) para validar o motivo ao cancelar um orçamento.
4.  Crie a Server Action de clonagem `cloneQuoteAction` em [actions.ts](../../app/app/quotes/actions.ts).
5.  Crie o serviço `lib/services/user-service.ts` e a Server Action `closeAccountAction` para o encerramento seguro de conta.

### Passo 3: Componentes e Badges de UI
1.  Ajuste o mapeamento visual de badges em `components/quote-status-badge.tsx`.
2.  Atualize as ações na listagem de orçamentos em [columns.tsx](../../app/app/quotes/columns.tsx) para incluir a opção "Clonar".
3.  Ajuste as abas de filtros de status na listagem geral em [quotes-list.tsx](../../app/app/quotes/quotes-list.tsx).
4.  Modifique o componente [notification-bell.tsx](../../components/notification-bell.tsx) adicionando abas de filtragem temporal "Não lidas" e "Lidas".

### Passo 4: Fluxo de Emissão e Impressão de Recibos
1.  Crie a página de criação de recibos em `app/app/quotes/[id]/receipt/edit/page.tsx`.
2.  Crie a visualização de recibo em `app/app/quotes/[id]/receipt/page.tsx` adicionando as classes CSS `print:hidden`.

### Passo 5: Telas de Configurações, Onboarding e Dashboard
1.  Redesenhe o onboarding em [app/onboarding/page.tsx](../../app/onboarding/page.tsx) com o visual dark mode (Linear Style) e as opções de ramo de atuação.
2.  Adicione o botão e modal de confirmação de encerramento de conta nas configurações em [settings-form.tsx](../../app/app/settings/settings-form.tsx).
3.  Aprimore a página [app/app/page.tsx](../../app/app/page.tsx) para carregar e passar os dados consolidados para os novos gráficos de faturamento mensal e distribuição de status por pizza.

---

## 3. Comandos Úteis para Desenvolvimento

### Rodar Servidor Local
```bash
npm run dev
```

### Validar TypeScript e Compilação
```bash
npx tsc --noEmit
```
```bash
npm run build
```
