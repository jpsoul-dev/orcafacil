# Relatório de Análise e Melhoria PWA: Novo Orçamento (`/app/quotes/new`)

Este relatório apresenta uma análise detalhada da tela de criação/edição de orçamentos (`/app/quotes/new` e seu respectivo componente principal [quote-form.tsx](file:///c:/DEV/orcafacil/app/app/quotes/components/quote-form.tsx)) sob a perspectiva de experiência móvel nativa de alta fidelidade (PWA), baseando-se nas diretrizes da skill `pwa-native`.

---

## 1. Diagnóstico Atual (Gaps de Experiência Nativa)

Embora a tela atual seja responsiva, ela herda comportamentos e layouts típicos de aplicações web desktop, o que quebra a ilusão de um aplicativo nativo quando acessado de um smartphone:

1. **Estrutura de Header e Navegação (App Shell):**
   - O título "Novo Orçamento" e a descrição estão inseridos no fluxo comum da página com espaçamentos largos (`space-y-6`). Em apps nativos, o título fica na barra superior (AppBar) fixa, economizando espaço de tela vertical útil.
   - Não há um botão de voltar nativo e integrado à barra superior.
   
2. **Rolagem e Alturas:**
   - A página rola inteira (incluindo o header principal da aplicação). Isso gera rolagem "elástica" indesejada (overscroll bounce) que revela áreas fora da página web.
   
3. **Seletor de Cliente:**
   - O seletor de cliente atual (`CustomerSelector`) funciona por dropdown ou autocomplete padrão. Em telas móveis nativas, uma lista muito grande de clientes é melhor selecionada em um modal deslizante tipo **Bottom Sheet** com barra de busca dedicada e feedback visual de toque.

4. **Entrada de Itens do Pedido:**
   - Cada item adicionado renderiza um card grande. Em telas móveis, esses cards tomam muito espaço vertical. Um layout em lista compacta com opção de deslizar para excluir (Swipe to Dismiss) seria muito mais natural e eficiente.
   - O modal para adicionar produtos do catálogo (`Dialog` do shadcn) centraliza no meio da tela no desktop, mas no mobile deve se transformar em um **Bottom Sheet** que ocupa a base ou a tela cheia, facilitando o toque com o polegar.

5. **Ações Fixas na Base (Sticky Action Bar):**
   - Os botões "Cancelar", "Salvar Rascunho" e "Gerar Orçamento" estão no final da página. O usuário precisa rolar até o fim para salvar. Apps nativos fixam a barra de ação principal na parte inferior da tela, logo acima da área segura do sistema.

6. **Feedback Tátil (Haptic Feedback):**
   - Ações de adicionar item, excluir ou finalizar não emitem nenhuma micro-vibração no dispositivo móvel.

---

## 2. Recomendações de Melhoria e Plano de Ação

Para elevar a experiência a um nível nativo de excelência, propomos as seguintes implementações divididas por categorias:

### A. Estrutura Visual e App Shell (Mobile-First)

*   **Header Fixo (AppBar Mobile):**
    Substituir o cabeçalho padrão por um cabeçalho fixo no topo no mobile com altura de `56px`, botão de voltar (ícone de seta da esquerda) e o título centralizado.
*   **Safe Areas Integradas:**
    Ajustar o padding superior do header e inferior dos botões usando as variáveis CSS `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.
*   **Sticky Bottom Actions:**
    Fixar o grupo de botões de salvar/concluir na parte inferior da tela para telas menores que `md` com background com blur (`backdrop-blur-md`) e borda superior sutil.

### B. Gestos e Componentes Interativos

*   **Bottom Sheet para Seleção de Clientes e Catálogo:**
    Implementar gavetas deslizantes (`vaul` ou equivalente via Tailwind) que sobem de baixo no mobile em vez de `Dialog` ou `Popover` centralizados. Isso aproxima a usabilidade dos padrões iOS/Android.
*   **Listagem Compacta e Swipe to Delete:**
    No mobile, apresentar os itens do orçamento em uma lista compacta de linhas simples (Nome, Qtde x Preço e Total). Implementar o gesto de arrastar para o lado para revelar o botão "Excluir" (Swipe to Dismiss).
*   **Feedback Tátil (Vibração):**
    Adicionar chamadas para a API `navigator.vibrate` nos seguintes eventos:
    - Adicionar um item ao orçamento: vibração curta (`15ms`).
    - Excluir um item: vibração dupla curta (`15ms`, `30ms` de pausa, `15ms`).
    - Sucesso ao salvar: vibração média de confirmação (`40ms`).
    - Erro de validação: vibração longa ou de alerta (`100ms`).

### C. Offline First e Persistência de Rascunhos

*   **Auto-save Temporário no LocalStorage/IndexedDB:**
    Salvar o progresso do formulário localmente de forma automática. Se o app fechar acidentalmente ou a bateria acabar, o usuário não perde o orçamento que estava digitando.
*   **Tratamento de Estado Offline:**
    Desabilitar de forma elegante a sincronização com o banco se o dispositivo estiver offline e salvar o orçamento localmente na fila de sincronização, alterando o botão de ação para "Salvar no Celular (Offline)".

---

## 3. Próximos Passos (Código)

Para começarmos a aplicar essas melhorias, podemos focar na refatoração de partes específicas:
1. **Criar um componente de gaveta deslizante (`MobileBottomSheet`)** reutilizável para o seletor de clientes e catálogo de itens.
2. **Atualizar o CSS global** para configurar corretamente o reset de overscroll e as safe-areas.
3. **Adicionar suporte a feedback tátil (Vibração)** nas ações do formulário de orçamento.
