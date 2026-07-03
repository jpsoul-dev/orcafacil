# Redesenho da Tela de Listagem de Orçamentos

**Tipo:** Melhoria
**Data da solicitação:** 02/07/2026
**Solicitante:** Product Owner (P.O.)
**Prioridade sugerida:** Alta (bloqueante para próximas etapas do projeto)

## Contexto e Motivação
A tela de listagem de orçamentos é o ponto de partida principal para o gerenciamento de propostas comerciais na plataforma. Atualmente, a interface utiliza cards grandes para cada orçamento e possui elementos de cabeçalho e filtros dispersos. Essa organização compromete a usabilidade e a produtividade, pois exige rolagem excessiva e dificulta a localização rápida de informações. Com a recente evolução do Design System em direção a um visual mais limpo, compacto e minimalista (adotado com sucesso na Tela de Catálogo), faz-se necessário alinhar a listagem de orçamentos a essa nova diretriz de design, melhorando a densidade de informações e agrupando os controles de busca e filtro.

## Funcionalidade Atual
Atualmente, cada orçamento é exibido na lista como um card individual de grandes dimensões. A tela contém um cabeçalho verticalmente espalhado onde o título da página, o campo de busca, os filtros de status (representados por oito botões individuais posicionados horizontalmente), os filtros de data e as opções de ordenação ocupam linhas separadas. O status de cada orçamento é apresentado com alto contraste visual e destaque desproporcional em relação ao título do orçamento. A busca e a ordenação estão inseridas em containers fechados que consomem espaço de tela útil.

## O que Não Está Funcionando Bem
- **Poluição visual e baixa densidade:** Cards grandes que limitam a quantidade de orçamentos visíveis simultaneamente na tela sem a necessidade de rolagem.
- **Cabeçalho disperso:** A distribuição vertical das ferramentas de busca, filtro de status, filtro de data e ordenação ocupa espaço excessivo e torna a navegação confusa.
- **Excesso de botões de status:** Exibir os oito status possíveis de forma fixa consome muita largura de tela, especialmente em dispositivos móveis, e limita a flexibilidade de filtrar por múltiplos status ao mesmo tempo.
- **Desarmonia visual no status:** O destaque exagerado nos status (ícones e cores chamativas) concorre com o título do orçamento, que deveria ser o elemento principal de identificação.
- **Falta de contexto na ordenação:** A opção de ordenação fica isolada na lateral direita superior da lista, fora da área principal de cabeçalho ou de filtros.

## Comportamento Desejado
- **Visualização em Lista:** Substituir a visualização em cards por uma lista com linhas separadas por divisores sutis. O título do orçamento deve ter o maior peso visual e legibilidade.
- **Cabeçalho Compactado:**
  - O título da página ("Meus Orçamentos"), o botão de voltar à tela anterior e a ação primária de criação de orçamento devem ficar alinhados na mesma linha no topo.
  - Logo abaixo, o campo de busca e o botão de acesso aos filtros devem compartilhar a mesma linha horizontal. No mobile o botão de criação de orçamento deve ir para uma action button na parte inferior da tela. e o titulo da pagina no header do app, para consistencia com tela de Catalogo
- **Busca Otimizada:** O campo de busca deve estar livre de cards que o enclausurem, e deve filtrar a lista dinamicamente em tempo real com um atraso de digitação (debounce) à medida que o usuário escreve.
- **Painel Unificado de Filtros e Ordenação:**
  - O botão de filtros abrirá um painel lateral (sheet) no desktop. No mobile, este painel abrirá ocupando toda a largura da tela (estilo tela cheia).
  - Dentro deste painel, o usuário poderá configurar o filtro de data, a ordenação e a filtragem por múltiplos status simultâneos.
  - No mobile, ao clicar no seletor de status dentro do painel de filtros, as opções de status abrirão em um painel que desliza de baixo para cima (drawer), permitindo a marcação através de caixas de seleção (checkboxes).
- **Etiquetas de Filtros Aplicados (Chips):** Os filtros ativos devem aparecer como chips logo abaixo da barra de busca e do botão de filtros, exibindo o valor filtrado e um botão individual para remoção. Um botão adicional para limpar todos os filtros ativos deve ser exibido quando houver filtros aplicados.
- **Exibição Simplificada do Item da Lista:** Cada linha de orçamento deve responder de forma clara a cinco informações principais:
  1. Identificador (Código do orçamento, ex: ORC-001).
  2. Data de criação (exibida abaixo do código do orçamento, em menor destaque visual e tamanho reduzido).
  3. O quê (Título/Descrição do orçamento).
  4. Quem (Nome do Cliente).
  5. Quanto (Valor Total).
  6. Estado (Status do orçamento em formato de pill discreta e de baixo contraste, baseada na paleta de cores do Design System).

## Público Afetado
Todos os usuários do sistema que acessam e gerenciam a listagem de orçamentos.

## Critérios de Aceite
- A listagem de orçamentos não deve exibir contornos de cards individuais, devendo ser apresentada em formato de linhas simples separadas por linhas divisórias sutis.
- O botão de voltar e o botão de criar orçamento devem estar alinhados na mesma linha do título da página.
- O campo de busca deve filtrar os registros automaticamente à medida que o usuário digita (debounce), sem a necessidade de clicar em um botão de busca ou apertar enter.
- Todos os filtros (Status, Data) e a Ordenação devem ser removidos da tela principal e acessados exclusivamente através do painel de filtros.
- Deve ser possível selecionar mais de um status simultaneamente para filtragem.
- No mobile, o painel de filtros deve cobrir toda a largura da tela (fullscreen), e o seletor de status deve abrir como um painel de baixo para cima (drawer).
- Chips de filtros ativos devem permitir a remoção de cada critério de filtro individualmente por meio de um ícone de fechar (x), atualizando a lista de imediato.
- A exibição do status no item da lista deve utilizar uma pill compacta e discreta, e o título do orçamento deve ter tamanho e peso de fonte maiores que o status para garantir a hierarquia de informação.
- O item da lista deve conter a data de criação logo abaixo do identificador do orçamento, em tamanho de fonte reduzido e cor secundária.
- Deve manter a consistencia visual com a tela e componentes da tela de catalogo, tanto no desktop quanto no mobile.

## Fora de Escopo
- Qualquer alteração na tela de criação ou edição de orçamentos.
- Alterações no fluxo de geração de arquivos ou envio de orçamentos para o cliente.

## Anexos e Referências
- Rascunho inicial do solicitante: [melhorias_listagem_orcamentos.md](file:///c:/DEV/orcafacil/artifacts/drafts/melhorias_listagem_orcamentos.md)
- Imagens de referência (Design da Tela de Catálogo):
  - [catalogo1.png](file:///c:/DEV/orcafacil/artifacts/drafts/screenshots/catalogo1.png)
  - [catalogo2.png](file:///c:/DEV/orcafacil/artifacts/drafts/screenshots/catalogo2.png)
  - [catalogo3.png](file:///c:/DEV/orcafacil/artifacts/drafts/screenshots/catalogo3.png)
  - [catalogo_mobile1.png](file:///c:/DEV/orcafacil/artifacts/drafts/screenshots/catalogo_mobile1.png)
  - [catalogo_mobile2.png](file:///c:/DEV/orcafacil/artifacts/drafts/screenshots/catalogo_mobile2.png)
