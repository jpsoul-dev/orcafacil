# Research: Redesign Quote List

## 1. UI Filtering Controls (Desktop)

### Decision
Utilizar checkboxes inline exibidos diretamente no painel lateral (Sheet) para o filtro de status no desktop.

### Rationale
A exibição direta dos status com checkboxes inline oferece alta escaneabilidade. O usuário vê instantaneamente todos os status disponíveis e pode selecionar múltiplos critérios com cliques simples, sem a necessidade de abrir um dropdown secundário dentro do painel lateral.

### Alternatives Considered
- **Dropdown/Combobox Multi-select**: Rejeitado por exigir cliques adicionais (abrir o dropdown) para interagir, embora economizasse espaço vertical no painel.
- **Chips Multi-select**: Rejeitado por poluir o painel lateral visualmente em comparação com uma lista vertical alinhada de checkboxes.

---

## 2. Pagination Strategy

### Decision
Implementar paginação acumulada utilizando o botão "Carregar mais" na parte inferior da lista de orçamentos.

### Rationale
O botão "Carregar mais" evita queries automáticas desnecessárias no banco de dados do Supabase (problema comum com scroll infinito ao rolar a tela rapidamente). Além disso, oferece controle claro ao usuário em conexões móveis limitadas sobre quando baixar novos registros e simplifica a implementação técnica.

### Alternatives Considered
- **Scroll Infinito (Infinite Scroll)**: Rejeitado para evitar consumo não intencional de dados de rede e queries redundantes ao banco.
- **Paginação Clássica (Anterior/Próximo)**: Rejeitada por quebrar a fluidez de escaneabilidade contínua que uma listagem densa necessita, especialmente no mobile.

---

## 3. Offline Support (PWA)

### Decision
Não fornecer suporte offline específico para a listagem nesta etapa. A listagem exigirá conexão de rede ativa e exibirá uma tela de erro/aviso de offline amigável se a rede estiver indisponível.

### Rationale
Simplifica o escopo técnico do projeto nesta fase, evitando a complexidade de gerenciar sincronizações de dados offline-para-online e tratamento de conflitos noIndexedDB/Supabase. Caso o Service Worker perca a rede, o app exibirá um estado vazio informativo informando a necessidade de conexão.

### Alternatives Considered
- **Somente-Leitura Offline**: Cachear a última resposta da API no cache de Service Worker. Rejeitado para evitar exibição de dados potencialmente obsoletos ou dessincronizados de orçamentos.
- **Offline Completo**: Sincronização e criação offline. Rejeitado pelo alto custo de implementação e complexidade de resolução de concorrência.

---

## 4. Overlay & Dialog Components (Base UI vs Radix UI)

### Decision
Utilizar componentes da biblioteca `@base-ui-components/react` para renderizar o Sheet lateral (desktop) e o Drawer de status (mobile).

### Rationale
A conformidade com as diretrizes do projeto exige o uso de Base UI em vez do Radix UI convencional. A sintaxe de posicionamento e renderização do Base UI (onde o `Positioner` é separado do `Popup` e a prop `render` é utilizada no lugar de `asChild`) será aplicada estritamente.

### Alternatives Considered
- **Radix UI**: Proibido pelas regras de design do projeto.
