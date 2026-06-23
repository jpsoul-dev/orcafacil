# PRD — Refatoração de UI/UX e Implementação de PWA
**OrçaFácil**

*   **Versão:** 1.0
*   **Data:** Junho de 2026
*   **Status:** Aprovado pelos Stakeholders
*   **Referências:** [Brandbook V.2.0](file:///c:/DEV/orcafacil/.DOCS/Brandbook%20OrcaFacil%20V.2.md) e [Design System V.1.0](file:///c:/DEV/orcafacil/.DOCS/Design%20System%20-%20OrcaFacil.md)

---

## 1. Contexto e Objetivos

O OrçaFácil foi concebido para empoderar prestadores de serviço autônomos e pequenas empresas, permitindo que enviem orçamentos altamente profissionais em minutos. No entanto, a interface atual da aplicação apresenta desalinhamentos estéticos e funcionais que comprometem essa promessa.

A interface atual utiliza o tema padrão cinza do `shadcn/ui`, carece de elementos de marca do OrçaFácil, possui sérios problemas de usabilidade em dispositivos móveis e não fornece feedback visual adequado aos usuários durante as interações e carregamentos de dados.

### Objetivos do Projeto de Refatoração:
1.  **Consistência de Marca:** Implementar a identidade visual baseada no [Brandbook](file:///c:/DEV/orcafacil/.DOCS/Brandbook%20OrcaFacil%20V.2.md) e no [Design System](file:///c:/DEV/orcafacil/.DOCS/Design%20System%20-%20OrcaFacil.md), adotando cores semânticas e a tipografia institucional (**Sora**).
2.  **Abordagem Mobile-First & PWA:** Tornar a aplicação adaptativa para o uso em trânsito no smartphone, com experiência nativa de aplicativo móvel (PWA), eliminando scrolls laterais desnecessários e quebras de layout.
3.  **Melhoria na Usabilidade e Feedback (UX):** Prover estados de carregamento estruturados (skeletons) e feedbacks imediatos de ações (toasts, loading nos botões) para garantir que o usuário saiba que suas ações estão em processamento.

---

## 1.1. Estratégia de Rollout Progressivo

Para mitigar riscos de regressão no fluxo de trabalho ativo dos usuários e garantir testes controlados das novas regras estéticas, a aplicação do Design System é realizada de maneira **progressiva** e **incremental**.

### Fase 1: Componentes Globais Estáticos (Concluída)
Foco exclusivo na navegação estrutural e visual da casca do aplicativo.
*   **Header, Sidebar e Mobile Tab Bar**: Ajustes tipográficos (Sora), semântica de cores e navegação inferior responsiva em telas móveis (`< 768px`).

### Fase 2: Identidade Visual Oficial & Catálogo de Produtos e Serviços (Concluída)
Esta etapa visa integrar os logotipos e favicons oficiais à estrutura e realizar a refatoração completa do módulo de **Catálogo** (`app/catalog`), servindo como piloto para a reformulação de telas funcionais internas.

### Fase 3: Refatoração do Módulo de Clientes (Fase Atual)
Esta etapa foca na reformulação do módulo de **Clientes** (`app/customers` e sub-rotas), alinhando a listagem, o formulário de cadastro/edição, a tela de detalhe e histórico do cliente ao Design System.

> [!IMPORTANT]
> **Escopo da Fase 3:** Esta etapa engloba a refatoração completa das telas de Clientes (tabela desktop/cards mobile de clientes, formulário de cadastro/edição com máscaras dinâmicas e validação Zod, tela de perfil e detalhe do cliente contendo histórico de orçamentos e recibos). As telas de orçamentos e recibos gerais permanecem congeladas e inalteradas neste momento.

*   **No Escopo da Fase 3:**
    *   **Clientes - Listagem (`app/customers`):**
        *   Tabela moderna no desktop com suporte a busca em tempo real por nome/e-mail/telefone e paginação.
        *   Conversão automática da listagem em cards táteis responsivos no mobile (`< 768px`) com iniciais em destaque, botões rápidos de contato (WhatsApp/E-mail) e ações.
    *   **Clientes - Cadastro/Edição (Modal/Formulário):**
        *   Formulário de dados integrado com `React Hook Form` e validação Zod para Nome, E-mail, Telefone (com máscara), CPF/CNPJ (com máscara dinâmica) e campos de endereço.
        *   Integração segura com o Supabase respeitando o isolamento multi-tenant via RLS.
    *   **Clientes - Detalhe (`app/customers/[id]`):**
        *   Visualização de perfil com abas (Tabs) para exibir os orçamentos e recibos associados àquele cliente, formatados com as regras de status corretas.
    *   **UX & Feedback:**
        *   Loading states (shimmer skeletons em tabelas/listas e loaders em botões).
        *   Alert Dialog de confirmação segura antes de excluir clientes.
        *   Toasts semânticos de feedback para ações de cadastro, edição ou remoção.
*   **Fora do Escopo da Fase 3 (Modificações Bloqueadas):**
    *   Listagens e formulários de Orçamentos e Recibos globais.
    *   Gráficos e painéis de dados do Dashboard principal.
    *   Configuração do manifesto PWA offline (Service Workers).

---

## 2. Diagnóstico de Problemas e Diretrizes de Solução

| Problema Identificado | Impacto na Experiência do Usuário (UX/UI) | Solução Proposta (Diretriz do Design System) |
| :--- | :--- | :--- |
| **Interface Genérica (Default shadcn)** | Não transmite a essência e confiabilidade da marca OrçaFácil. Baixo contraste e falta de identidade visual. | Aplicar a paleta semântica oficial: **Azul Primário (`#1E5EFF`)**, **Grafite (`#111827`)** e fundos **Off-white (`#F8FAFC`)**. Implementar a fonte **Sora**. |
| **Falta de Responsividade em Tabelas** | Usuário no celular precisa usar scroll lateral em listagens de orçamentos e recibos, dificultando o uso ágil. | Em telas menores que `768px` (mobile), as tabelas devem colapsar automaticamente em uma lista de cards interativos individuais. |
| **Ausência de Feedback e Loading** | Cliques parecem não ter efeito. Usuário fica perdido em telas em branco sem saber se os dados estão carregando. | Implementar **Skeletons** animadas para transições de dados e estados de **Loading** nos botões e submissões de formulário. |
| **Sidebar Quebrada no Mobile/Tablet** | O menu de navegação quebra o layout, ocupa espaço demais no mobile e não responde bem ao ser colapsado. | Sidebar de `260px` fixa no desktop. Em tablets, colapsar para ícone-only. Em celulares (`<768px`), converter em uma **Tab Bar / Navbar inferior fixa** de toque fácil. |
| **Ausência de PWA** | A ferramenta é muito acessada na rua (eletricistas, pintores, técnicos). A falta de atalho na tela inicial prejudica o acesso recorrente. | Configurar Manifesto Web, Service Workers e habilitar caching básico de assets para permitir a instalação do OrçaFácil como **PWA** no celular. |

---

## 3. Escopo Detalhado da Refatoração

### 3.1. Identidade Visual e Tematização (Tailwind CSS v4)
*   **Fontes:** Registrar e priorizar a fonte **Sora** em todas as variações de texto. Fallback para fontes nativas do sistema.
*   **Tokens de Cor:**
    *   **Ação:** Azul Primário (`#1E5EFF`) para elementos clicáveis principais (CTAs, links).
    *   **Neutros:** Fundo Off-white (`#F8FAFC`) e texto principal Grafite (`#111827`).
    *   **Status do Orçamento:** Padronizar os 5 estados (Pendente, Aprovado, Rejeitado, Cancelado, Finalizado) com suas respectivas cores de badge e dot, garantindo contraste adequado (WCAG AA).

### 3.2. Layouts Responsivos (Mobile-First)
*   **Navegação Principal (Sidebar vs. Tab Bar):**
    *   **Desktop/Tablet:** Sidebar lateral esquerda, colapsável, com itens ativos destacados em Azul com borda de acento.
    *   **Mobile (<768px):** Ocultar a sidebar e renderizar uma Tab Bar fixa na base da tela (estilo aplicativo nativo) com acessibilidade rápida de uma mão aos links: *Dashboard, Orçamentos, Recibos, Minha Conta*.
*   **Tabelas Responsivas:**
    *   Substituir a renderização de tabelas lineares em dispositivos móveis. A listagem deve usar o componente `interactive card`, contendo as informações densas de forma organizada (Nome do cliente, valor destacado em `SemiBold 600`, data secundária e Badge de Status do orçamento no canto superior direito).

### 3.3. Experiência de Uso e Feedback (Transitions & Loading States)
*   **Carregamento Assíncrono (Skeletons):**
    *   Toda listagem ou card que dependa de buscas assíncronas no banco de dados (ex: Supabase) deve exibir um layout de Skeleton com animação de shimmer enquanto os dados são recuperados.
*   **Feedback de Submissão:**
    *   Ao clicar em botões que executam mutações (ex: "Salvar orçamento", "Gerar PDF"), o botão deve exibir um spinner e texto de carregamento correspondente ("Gerando...", "Aguarde...").
    *   Utilização de **Toasts** semânticos para feedback imediato das operações (Sucesso, Alerta, Erro e Informativo) utilizando a paleta de cores correspondente.

### 3.4. Requisitos para Progressive Web App (PWA)
*   **Instalabilidade:** Configurar um arquivo `manifest.json` válido contendo as logos do OrçaFácil em múltiplas dimensões (localizadas em `.DOCS/SVG`), cores de tema e fundo alinhadas com a marca.
*   **Offline / Service Worker:** Registrar um Service Worker para gerenciar cache de assets essenciais (HTML, CSS, JS e SVG da aplicação), permitindo que a casca do app carregue instantaneamente mesmo sob conexões móveis lentas.
*   **Comportamento Standalone:** Garantir que, quando instalado, a aplicação oculte a barra do navegador do celular para funcionar em tela cheia como um app nativo.

### 3.5. Catálogo de Produtos e Serviços
*   **Listagem Responsiva e Filtros (`app/catalog`):**
    *   **Desktop:** Exibir tabela contendo Nome, Tipo (identificado com badge específica para *Produto* e *Serviço*), Preço Unitário (formatado como moeda local R$) e Unidade de Medida.
    *   **Mobile (< 768px):** Substituir a tabela por cards de toque ergonômico contendo as informações compactadas do item.
    *   **Busca & Filtros:** Adicionar um campo de busca por nome/descrição e botões de filtro rápido por tipo (Todos, Produtos, Serviços).
*   **Formulário de Cadastro e Edição (`app/catalog/new` ou em Modal):**
    *   Formulário de dados integrado com `React Hook Form` e validação preventiva via schema `Zod`.
    *   **Campos de Entrada:**
        *   *Nome:* texto obrigatório (mínimo de 2 caracteres).
        *   *Tipo:* seleção obrigatória entre "Produto" ou "Serviço".
        *   *Preço Unitário:* valor numérico obrigatório, estritamente maior que zero.
        *   *Unidade de Medida:* string representativa (ex: un, m², h, kg).
    *   **Operações de Banco de Dados:** Vinculado diretamente à tabela `catalog_items` no Supabase com isolamento total pelo ID do usuário autenticado.
*   **Exclusão de Itens:**
    *   Ação de exclusão acionável na listagem, protegida por um modal de confirmação de segurança (Alert Dialog) para evitar cliques acidentais.

### 3.6. Módulo de Clientes (Fase 3)
*   **Listagem de Clientes (`app/customers`):**
    *   **Desktop:** Exibir tabela contendo Nome, E-mail, Telefone, Documento (CPF/CNPJ formatado) e Ações (Editar, Excluir).
    *   **Mobile (< 768px):** Substituir a tabela por cards de toque ergonômico contendo Avatar com iniciais, Nome, links para WhatsApp e E-mail diretos, e botão de ações contextuais.
    *   **Busca & Filtros:** Adicionar campo de busca rápida unificada filtrando por nome, e-mail ou telefone.
*   **Formulário de Cadastro e Edição (Modal ou Rota):**
    *   Formulário integrado com `React Hook Form` e `Zod`.
    *   **Campos de Entrada:**
        *   *Nome:* texto obrigatório (mínimo de 3 caracteres).
        *   *E-mail:* formato válido de e-mail (opcional).
        *   *Telefone:* formato internacional/nacional com máscara (opcional).
        *   *Documento:* máscara dinâmica alternando entre CPF (11 dígitos) e CNPJ (14 dígitos), opcional, com validação de formato.
        *   *Endereço:* bloco opcional incluindo CEP, Logradouro, Número, Complemento, Bairro, Cidade e UF.
    *   **Persistência:** Conectado à tabela `customers` no Supabase, garantindo isolamento pelo `user_id` ativo.
*   **Tela de Detalhes do Cliente (`app/customers/[id]`):**
    *   Perfil do cliente em destaque no topo utilizando tipografia Sora e Avatar correspondente.
    *   Navegação por abas (Tabs):
        *   *Aba 1 (Orçamentos):* Tabela/Lista responsiva contendo os orçamentos emitidos para este cliente, com seus respectivos valores e Badges de Status.
        *   *Aba 2 (Recibos):* Lista de recibos emitidos para este cliente, valores e status de vínculo.
*   **Exclusão de Clientes:**
    *   Disparo de confirmação preventiva via Alert Dialog do shadcn/ui. O diálogo deve alertar caso o cliente possua orçamentos associados ativos no sistema.

---

## 4. Critérios de Aceitação e Validação (DoD)

Para que as melhorias sejam consideradas prontas para implantação em produção, elas devem passar pelos seguintes critérios:

1.  **Acessibilidade e Contraste:** Todas as cores da UI devem obedecer ao nível mínimo WCAG AA (especialmente textos e badges).
2.  **Validação Responsiva:** A interface não deve apresentar quebras de layout ou scrolls horizontais em resoluções comuns (`320px`, `375px`, `414px`, `768px`, `1024px` e `1440px`).
3.  **Instalação do PWA:** O Lighthouse ou auditoria de PWA do Chrome deve indicar que a aplicação atende a todos os critérios de instalabilidade.
4.  **Paridade de Funcionalidades:** Nenhuma funcionalidade de desktop pode ser removida ou limitada na versão mobile. A usabilidade de criação de orçamentos e vinculação de recibos deve ser perfeitamente executável no celular.