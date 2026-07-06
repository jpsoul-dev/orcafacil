# Reorganização do Formulário de Novo Orçamento

**Tipo:** Melhoria
**Data da solicitação:** 06/07/2026
**Solicitante:** Não informado
**Prioridade sugerida:** Alta

## Contexto e Motivação
A melhoria surgiu de uma percepção proativa do solicitante ao testar a aplicação, sem relação com reclamações de usuários. O objetivo é deixar a tela de criação de orçamento mais organizada desde já, preparando o terreno para evoluções futuras do produto.

## Funcionalidade Atual
Hoje, na tela de criação de novo orçamento, nenhuma das seções (Dados do orçamento, Itens do orçamento, Formas de pagamento, Termos e condições, Resumo do orçamento) pode ser recolhida pelo usuário. Os itens do orçamento são adicionados sem um layout de lista com cabeçalhos fixos, e cada item permite aplicar um desconto individual, além do desconto geral já existente. O resumo do orçamento acompanha a rolagem da página em vez de ficar sempre visível. A seleção de formas de pagamento e o preenchimento de termos e condições são feitos diretamente na tela principal, sem uma etapa dedicada de seleção e confirmação. O ícone de desconto no resumo não aciona nenhuma ação.

## O que Não Está Funcionando Bem
- A ausência de seções recolhíveis deixa a tela extensa e menos organizada durante o preenchimento.
- A existência de desconto por item individual, somada ao desconto geral, gera duplicidade e risco de confusão no valor final do orçamento.
- O resumo do orçamento não fica sempre visível, exigindo rolagem da página para conferir totais enquanto itens são adicionados.
- A seleção de formas de pagamento e o preenchimento de termos, sem um fluxo dedicado, tornam o preenchimento menos objetivo.
- O ícone de desconto no resumo não permite nenhuma configuração rápida.

## Comportamento Desejado
- Todas as seções da tela, exceto o Resumo do orçamento, passam a ser recolhíveis. "Dados do orçamento" e "Itens do orçamento" abrem expandidas por padrão; cada item individual dentro de "Itens do orçamento" abre recolhido por padrão. O Resumo do orçamento não é recolhível — permanece sempre visível.
- Os campos da seção "Dados do orçamento" passam a seguir a ordem: Cliente, Validade, Título.
- "Itens do orçamento" passa a ter um único botão para adicionar item, que abre um painel lateral onde o usuário pode preencher os dados manualmente ou buscar itens no catálogo, podendo selecionar múltiplos itens de uma vez antes de confirmar.
- Os itens passam a ser exibidos em formato de lista com cabeçalhos fixos: Descrição, Qtd., Valor Unitário, Total. Cada item pode ser expandido para edição, com os campos dispostos em uma única linha.
- O desconto por item individual é completamente removido — campo, comportamento e qualquer resquício da funcionalidade em qualquer camada do sistema. Permanece apenas o desconto geral do orçamento, que já existe hoje.
- O Resumo do orçamento passa a ficar fixo na lateral direita da tela em desktop, e fixo na parte inferior da tela em mobile, sempre visível durante o preenchimento.
- "Formas de pagamento" passa a ter um botão que abre um painel lateral com a lista de formas disponíveis em formato de seleção múltipla (com nome e ícone de cada uma). Após confirmar, as formas selecionadas aparecem como chips na tela principal.
- "Termos e condições" passa a ter um botão que abre um painel lateral com um campo para inserir o texto dos termos, com confirmação.
- O ícone de desconto no Resumo do orçamento passa a abrir um painel lateral para configurar o desconto geral, além de receber uma melhoria visual e uma área de toque adequada para uso em dispositivos móveis.

## Público Afetado
Todos os usuários que criam orçamentos na tela de criação de novo orçamento.

## Critérios de Aceite
- Todas as seções da tela, exceto o Resumo do orçamento, podem ser expandidas e recolhidas pelo usuário.
- As seções "Dados do orçamento" e "Itens do orçamento" abrem expandidas por padrão ao carregar a tela.
- Cada item dentro de "Itens do orçamento" abre recolhido por padrão.
- O Resumo do orçamento não é recolhível — permanece sempre visível, independentemente do estado das demais seções.
- Os campos da seção "Dados do orçamento" aparecem na ordem: Cliente, Validade, Título.
- Existe um único botão para adicionar item em "Itens do orçamento", que abre um painel lateral com opção de preencher os dados manualmente ou buscar itens no catálogo.
- Na busca pelo catálogo, o usuário pode selecionar múltiplos itens de uma vez antes de confirmar a adição.
- A lista de itens do orçamento exibe cabeçalhos fixos: Descrição, Qtd., Valor Unitário, Total.
- Cada item da lista pode ser expandido para edição, exibindo os campos de edição em uma única linha.
- O campo e a funcionalidade de desconto por item individual foram completamente removidos do sistema, sem deixar resíduos funcionais ou visuais; apenas o desconto geral do orçamento permanece disponível.
- O Resumo do orçamento fica fixo na lateral direita da tela em desktop.
- O Resumo do orçamento fica fixo na parte inferior da tela em mobile.
- Em "Formas de pagamento", existe um botão que abre um painel lateral com a lista de formas disponíveis em formato de seleção múltipla (checkbox), cada uma exibindo nome e ícone correspondente.
- Após confirmar a seleção, as formas de pagamento escolhidas aparecem como chips na tela principal.
- Em "Termos e condições", existe um botão que abre um painel lateral com um campo para inserir o texto dos termos, com confirmação.
- O ícone de desconto no Resumo do orçamento abre um painel lateral para configurar o desconto geral.
- O ícone de desconto no Resumo do orçamento recebe uma melhoria visual e possui área de toque adequada para uso em dispositivos móveis.

## Fora de Escopo
Tela de edição de um orçamento já existente — esta entrega cobre apenas a tela de criação de novo orçamento.

## Anexos e Referências
Prints `desktop.png` e `mobile.png`, mantidos na pasta `/screenshots` do projeto como referência visual para o time de desenvolvimento.

## Observações Adicionais
Os prints de referência mostram, em um dos cards de item, um campo de desconto ainda visível. Esse campo é um resquício do estado atual e não deve ser replicado — sua remoção está descrita nesta melhoria e prevalece sobre o que aparece no print.