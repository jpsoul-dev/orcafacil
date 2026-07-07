# Quickstart: Reorganização do Formulário de Novo Orçamento

Este guia ajuda a configurar o ambiente e testar as melhorias no formulário de criação de orçamentos localmente.

## 1. Executar o Servidor de Desenvolvimento

Certifique-se de que as dependências do projeto estejam instaladas e execute o servidor local:

```bash
npm install
npm run dev
```

O servidor do Next.js estará disponível em `http://localhost:3000`.

---

## 2. Acessar o Formulário

1. Faça login na aplicação ou utilize a sessão ativa de teste.
2. Navegue até a seção de Orçamentos no menu lateral (`/app/quotes`).
3. Clique em **Novo Orçamento** ou navegue diretamente para `/app/quotes/new`.

---

## 3. Roteiro de Testes Manuais

### Teste 1: Seções Recolhíveis
- Verifique se as seções "Dados do orçamento" e "Itens do orçamento" iniciam expandidas.
- Verifique se as seções "Formas de pagamento" e "Termos e condições" iniciam recolhidas.
- Interaja com os cabeçalhos de cada seção e confirme se elas expandem e recolhem corretamente.

### Teste 2: Layout Fixo do Resumo
- No desktop, role a página e verifique se o card "Resumo do orçamento" fica fixo na lateral direita acompanhando a rolagem.
- No celular (simule no DevTools com largura < 768px), verifique se o resumo fica fixado no rodapé da página de forma sticky e se há padding no final do formulário para evitar que os campos fiquem escondidos.

### Teste 3: Painéis Laterais (Sheets)
- Clique no botão único de adicionar item, verifique se o Sheet abre. Adicione um item manualmente e, em seguida, busque itens do catálogo, marque múltiplos e adicione-os de uma vez.
- Clique em "Formas de pagamento", selecione múltiplos checkboxes, confirme e verifique se aparecem como chips na tela principal.
- Clique em "Termos e condições", insira um texto rico, confirme e verifique se a tela principal exibe o texto atualizado.
- Clique no ícone de desconto no resumo, insira um valor, confirme e verifique se o desconto é aplicado globalmente.

### Teste 4: Remoção de Desconto por Item
- Adicione um item e verifique que não existe mais nenhuma caixa de texto ou seleção para desconto individual.
- Salve o orçamento como "Rascunho" ou "Gerar Orçamento" e valide no painel do Supabase ou na visualização que o total recalculado não possui descontos individuais, apenas o desconto global.
