Preciso que seja sa feita as seguintes melhorias na tela de listagem de orçamentos em /app/quotes:


# MELHORIAS:

## 1. Cards e agrupamento de informações

- Quando entro no Gmail, Outlook, WhatsApp, Notion... não vejo cards enormes. Vejo uma lista. Porque o objetivo é localizar rapidamente um item.
- Caminhando para um Design System mais parecido com Stripe que quase não usa cards.
Ela usa muito mais: espaço, tipografia e divisores.

Por isso  quero eliminar o uso de cards, que hoje ocupam muito espaço desnecessário e passar a utilizar um alista.

## 2. Cabeçalho

Hoje temos:
Título
↓
Busca
↓
Data
↓
Status
↓
Ordenação

Está muito espalhado. quero: 

[<] Meus Orçamentos                     [+ Criar Orçamento]

────────────────────────────

🔍 Buscar orçamento...

Depois...
Filtros

Botão voltar alinhado ao titulo, assim como tem na pagina de cadatro em /app/quotes/new.
Busca e filtro na mesma linha, com um botão para abrir o sheet de filtros.

### Sobre os status

Essa parte é a que mais me incomoda.

**Hoje parece isso:**

Todos | Rascunho | Pendente | Aprovado | Rejeitado | Cancelado | Finalizado | Vencido

São oito botões. É muito.

**Eu quero assim:**

Botão *Filtros*

Quando clicar...

abre um sheet com os filtros e um dos filtros é um seletor com:
Todos | Rascunho | Pendente | Aprovado | Rejeitado | Cancelado | Finalizado | Vencido
Deve ser possível selecionar mais de um status.

No mobile esse seletor abre como um drawer de baixo para cima. 

**Tipo assim: **

Status

☐ Todos
☑ Pendente
☑ Aprovado
☐ Rejeitado
☐ Cancelado
☐ Finalizado
☐ Vencido

Na tela aparecem apenas chips dos filtros aplicados

[Pendente ×] [Julho ×] Limpar filtros

### Busca

A busca ainda está presa dentro de um card.
Ela não precisa.
Assim direto: 
🔍 Buscar orçamento...

### Data

Também sairia da tela. Iria para dentro do sheet de filtros também

### Ordenação
Ela está perdida. Embaixo. Do lado direito. Sem contexto.

Colocar ela no sheet de filtros também.

## 3. Sobre os cards de itens do orçamento

Hoje o card tem muita informação.
Ele deveria responder apenas quatro perguntas.

Quem?
O quê?
Quanto?
Em que estado?

**Poderia ser assim:**

──────────────────────────────

ORC-001

Teste de orçamento

João Paulo Pereira

Total: R$650

Pendente

>

──────────────────────────────

Só divisores.Muito mais parecido com o Linear.

**Outro ponto:** Hoje o status ocupa muito destaque.

🟡 Pendente

Grande. Chamativo.

Quero algo assim: 
Pequena pill.
Sem tanto contraste, mas nas cores do status do design system em tokens.
O título deve chamar mais atenção que o status.

## Referencias de tela. 
Quero que utilize a pagina /app/catalog como refernecia, ela segue um padrão parecido com o que está proposto acima e está boa nesse sentido, ela já foi reformulada e quero que siga essa padrão visual. Também anexei prints da tela como referencia visual que estão dentro de /drafts/screenshots.

IMPORTANTE: não quero mexer na tela de cadastro de orçamento por emquanto /app/quotes/new. 
Diferente do cadastro de catalogo que abre o form em um sheet, o orçamento necessita de uma tela separada devido ao tamanho do formulário. Por enquanto o escopo dessas mudanças é só a listagem.