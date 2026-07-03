# Quickstart Guide: Redesign Quote List

Este guia orienta o desenvolvimento, execução local e validação das melhorias de redesenho da tela de listagem de orçamentos.

## 1. Ambiente Local

Certifique-se de que o servidor de desenvolvimento está rodando:

```bash
npm run dev
```

Abra a aplicação no navegador em `http://localhost:3000/app/quotes` e faça login se necessário.

---

## 2. Roteiro de Validação Visual & UX

### Desktop (Viewport > 1024px)
1. **Visualização em Lista**:
   - Verifique se os cards grandes foram removidos e substituídos por linhas simples separadas por bordas cinzas discretas (`border-border`).
   - Confirme se a hierarquia textual destaca a descrição/título do orçamento e mostra os metadados (Código do orçamento, data de criação e nome do cliente) em fonte reduzida e cor secundária.
   - O status do orçamento deve ser renderizado utilizando a pill discreta e de baixo contraste do Design System via `<QuoteStatusBadge />` (nunca cores Tailwind arbitrárias).
2. **Cabeçalho Compacto**:
   - O título "Meus Orçamentos", o botão de voltar e o botão de "Novo Orçamento" devem estar na mesma linha.
3. **Barra de Busca e Filtros**:
   - Digite no campo de busca e verifique se o filtro é aplicado em tempo real com debounce (após 300ms de pausa).
   - Clique no botão "Filtros". O painel lateral (Sheet) deve abrir deslizando da direita.
   - Selecione múltiplos status utilizando as caixas de seleção (checkboxes) visíveis, configure uma ordenação e aplique. A URL deve atualizar refletindo as alterações (ex: `?status=draft,pending&sort=highest_value`).
4. **Chips de Filtros**:
   - Cada filtro aplicado deve aparecer abaixo da barra de busca como um chip.
   - Clique no botão "x" de um chip individual. O filtro correspondente deve ser limpo imediatamente na listagem e na URL.
   - Clique em "Limpar filtros" para remover todos os filtros simultaneamente.

### Mobile (Viewport < 768px)
1. **Adaptações de Layout**:
   - O título da página deve sumir do corpo principal e ser exibido no cabeçalho do app.
   - O botão "Novo Orçamento" deve sumir do topo e ser renderizado como um botão de ação flutuante (FAB) na parte inferior direita da tela.
2. **Painel de Filtros e Drawer**:
   - Ao clicar em "Filtros", o painel Sheet deve abrir cobrindo 100% da tela (fullscreen).
   - Ao clicar no seletor de status dentro do painel, deve abrir um Drawer que desliza de baixo para cima na tela contendo as caixas de seleção de status.
3. **Paginação**:
   - Role até a parte inferior e clique em "Carregar mais". Verifique se novos itens são concatenados na lista e o botão continua visível até atingir o fim dos registros.
