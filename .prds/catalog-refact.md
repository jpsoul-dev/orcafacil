# Especificação de Melhorias — Catálogo de Itens
**Rota base:** `/app/catalog`
**Versão:** 1.0

> Os mockups de tela são apenas para referencia visual, sempre utilize o padrão de tema e design system da aplicacão e respeito do tema dark.

---

## 1. Formulário de Cadastro de Itens

**Arquivo:** `catalog-form.tsx`

### 1.1 Campo "Valor Unitário" — Teclado numérico no mobile

**Problema:** No mobile, o campo de valor unitário abre o teclado padrão (alfanumérico) em vez do teclado numérico.

---

### 1.2 Campo "Unidade de Medida" — Tornar obrigatório

**Problema:** O campo de unidade de medida está configurado como opcional.

**Mudança:** O campo passa a ser **obrigatório**.

---

### 1.3 Sanitização dos campos do formulário

Verificar e garantir que todos os campos do formulário passam pelas seguintes sanitizações antes do envio:

| Campo | Sanitização esperada |
|---|---|
| Nome do item | Trim de espaços nas extremidades; sem HTML |
| Valor unitário | Conversão para número float; rejeitar NaN e negativos |
| Unidade de medida | Apenas valores do enum permitido |
| Descrição (se houver) | Trim; sem tags HTML (escapar ou sanitizar) |

A sanitização deve ocorrer **antes** do envio ao servidor, via transformação no schema Zod ou no `handleSubmit` do React Hook Form.

---

## 2. Visualização de Item

**Comportamento atual:** Clicar em um item da listagem abre diretamente o formulário de edição (sheet).

**Novo comportamento:** Clicar/tocar em um item abre um **sheet de visualização** com as informações do item em modo leitura. A partir desse sheet, o usuário pode escolher entre editar ou deletar.

### 2.1 Sheet de Visualização (Desktop e Mobile)

- Exibe os dados do item em modo leitura (sem campos de input)
- Conteúdo mínimo a exibir: nome, tipo (produto/serviço), valor unitário, unidade de medida, e demais campos cadastrados
- **Não** abre o formulário diretamente

### 2.2 Menu de Ações — Desktop

No sheet de visualização em desktop, exibir dois botões de ação visíveis:

- **Editar** — abre o sheet de edição (comportamento atual ao clicar no item)
- **Deletar** — aciona fluxo de exclusão com confirmação

Os botões devem ficar no cabeçalho do sheet, alinhados à direita.

### 2.3 Menu de Ações — Mobile

No sheet de visualização em mobile, as ações devem ficar agrupadas em um **menu dropdown de três pontos verticais** (`⋮`), posicionado no **canto superior direito** do conteúdo do sheet.

**Opções do dropdown:**
- Editar
- Deletar

### 2.4 Fluxo ao clicar em "Editar"

Ao selecionar "Editar" (tanto no dropdown mobile quanto no botão desktop), o sheet de visualização é **substituído** pelo sheet de edição (formulário). Não deve haver empilhamento de sheets.

### 2.5 Fluxo ao clicar em "Deletar"

Acionar uma confirmação antes de executar a exclusão (dialog de confirmação). Após exclusão bem-sucedida, fechar o sheet e exibir pill de feedback (ver seção 4).

---

## 3. Listagem de Itens

### 3.1 Layout geral da página

**Remover:** Cards utilizados apenas como contêineres de separação visual (wrapper da barra de busca, wrapper da lista de itens). O layout deve usar espaçamento e separadores nativos, divisórias sem elevação ou borda de card desnecessária.

**Header fixo:** O cabeçalho com título da página e botão "Novo item" deve ser **fixo no topo** (`sticky top-0`) e permanecer visível durante o scroll.

**Estrutura da página (de cima para baixo):**

```
[ Header fixo: Título + Botão "Novo item" ]  ← sticky
[ Barra de busca + Botão "Filtros" ]
[ Chips de filtros ativos (quando houver) ]
[ Lista de itens ]
```

---

### 3.2 Barra de Busca e Botão de Filtros

- A barra de busca e o botão "Filtros" ficam alinhados na mesma linha, lado a lado
- Remover qualquer card ou contêiner de separação ao redor deles
- Layout: `[🔍 Buscar...] [Filtros]` — busca ocupa o espaço restante, botão tem largura fixa

---

### 3.3 Sheet de Filtros

Ao clicar no botão "Filtros", abre um **sheet lateral** (no desktop) ou **sheet que ocupa largura total** (no mobile) com as opções de filtragem e ordenação.

**Estrutura do sheet de filtros:**

```
────────────────────────
Filtros
────────────────────────

Tipo

☑ Produto
☑ Serviço

────────────────────────

Ordenação

◉ A–Z
○ Z–A
○ Maior preço
○ Menor preço

────────────────────────

[ Limpar ]   [ Aplicar ]
```

**Detalhes:**
- Tipo: seleção múltipla via **checkboxes** (ambos marcados por padrão = sem filtro)
- Ordenação: seleção única via **radio buttons**
- Botão "Limpar": redefine todos os filtros para o estado padrão
- Botão "Aplicar": fecha o sheet e aplica os filtros selecionados

---

### 3.4 Chips de Filtros Ativos

Após aplicar filtros, exibir chips (tags removíveis) **abaixo da barra de busca** indicando os filtros ativos. Cada chip tem um botão `×` para remover individualmente.

**Exemplos de chips:**

```
[ Produto × ]  [ A–Z × ]  [ Limpar filtros ]
```

**Regras:**
- Os chips só aparecem quando há pelo menos um filtro ativo diferente do padrão
- "Limpar filtros" remove todos os chips e redefine todos os filtros
- Remover um chip atualiza a listagem imediatamente
- Se nenhum filtro estiver ativo, a área de chips não ocupa espaço

---

### 3.5 Lista de Itens — Substituição de Cards por Lista

**Remover:** Os cards atuais com ícones de produto/serviço, botões de ação inline (editar/deletar) e separação visual excessiva.

**Novo formato:** Lista simples com separadores divisores. Cada item é uma linha da lista, não um card.

**Anatomia de cada item da lista:**

```
──────────────────────────────────────
Cabo elétrico 2 mm          [Produto]    R$ 2,20/m    ›
──────────────────────────────────────
Higienização interna         [Serviço]   R$ 520,00    ›
──────────────────────────────────────
```

**Hierarquia visual de cada item (da esquerda para a direita):**

| Elemento | Peso visual | Notas |
|---|---|---|
| Nome do item | Principal (maior, mais escuro) | Linha 1 |
| Badge de tipo | Secundário | Inline com o nome ou abaixo, conforme mockup |
| Preço + unidade | Secundário | Alinhado à direita |
| Chevron `›` | Terciário | Indica que o item é clicável |

**Regras dos badges:**
- Usar tons neutros e sutis.
- Sem cores fortes ou saturadas
- Tamanho pequeno, sem ícone dentro do badge
- seguir o design system e tokens da aplicação

**Interação:**
- Clicar/tocar em qualquer ponto do item abre o **sheet de visualização** (seção 2)
- Não há botões de ação inline na listagem

---

## 4. Notificações de Feedback (Pills)

Adotar o padrão de **pill notifications** (toast em formato de pílula) para todas as ações de feedback ao usuário no catálogo. Este padrão deve ser consistente entre desktop e mobile.

**Ações que disparam pill:**
- Item salvo com sucesso
- Item editado com sucesso
- Item deletado com sucesso
- Erro ao salvar / editar / deletar

**Características visuais:**
- Formato compacto, arredondado (pill)
- Aparece no canto inferior central
- Duração: ~2 segundos com saída animada
- Variantes: sucesso, erro, e demais cores semanticas

> Este padrão substitui qualquer outro mecanismo de feedback existente (alert, modal de confirmação pós-ação, etc.) e deve ser aplicado de forma uniforme em toda a rota `/app/catalog`.

---

## 5. Comportamento Mobile

### 5.1 Título da Página no Header Mobile

No mobile, o título "Catálogo" deve aparecer no **header nativo da navegação mobile** da aplicação, e não como elemento de texto na área de conteúdo da página.

> Alinhar com o padrão já adotado em outras rotas do app para consistência.

### 5.2 Sheet de Filtros — Largura Total no Mobile

No mobile, o sheet de filtros deve ocupar **100% da largura da tela** (`w-full`). No desktop, manter como sheet lateral com largura fixa.

### 5.3 Botão "Novo Item" — Fixo no Rodapé Mobile

No mobile, o botão "Novo item" deve ser fixo na parte inferior da tela, **no lugar da barra de navegação inferior** do app (tab bar / bottom nav).

**Especificações:**
- Largura: ocupa a maior parte da largura da tela
- No desktop, o botão permanece no header fixo (seção 3.1)

---

## Dependências e Ordem de Implementação Sugerida

| Prioridade | Item | Dependências |
|---|---|---|
| 1 | Sheet de visualização de item (seção 2) | Nenhuma |
| 2 | Refatoração da lista (seção 3.5) | Sheet de visualização |
| 3 | Sheet de filtros + chips (seção 3.3 e 3.4) | Nova lista |
| 4 | Pills de feedback (seção 4) | Pode ser paralelo |
| 5 | Correções do formulário (seção 1) | Pode ser paralelo |
| 6 | Ajustes mobile (seção 5) | Depende de 1, 2 e 3 |

---

## Pontos que Precisam de Confirmação Antes da Implementação

- [ ] **Seção 1.2:** Quais são os valores válidos do enum de unidade de medida?
  resposta: os valores já estão no select.
- [ ] **Seção 3.5:** Validar hierarquia visual final do item de lista com o mockup

---

Mockups: `/templates/mockup-catalogo.png`