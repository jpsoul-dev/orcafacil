# Quickstart & Verification Guide: Identidade Visual e Catálogo

Este guia orienta o desenvolvedor a inicializar, testar e auditar localmente as implementações da Fase 2.

---

## Como Rodar Localmente

1. Certifique-se de ter as dependências instaladas:
   ```bash
   npm install
   ```
2. Inicialize o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra a aplicação em `http://localhost:3000` e acesse o módulo do Catálogo (`http://localhost:3000/app/catalog`).

---

## Roteiro de Verificação da Identidade Visual (Logos & Favicon)

### 1. Logos na Sidebar (Desktop & Tablet)
*   **Tema Claro**: Confirme se a logo horizontal [logo-horizontal-claro.svg](file:///c:/DEV/orcafacil/public/logo-horizontal-claro.svg) é exibida perfeitamente no topo esquerdo.
*   **Tema Escuro**: Clique no alternador de tema no cabeçalho e confirme que a logo alterna instantaneamente para [logo-horizontal-escuro.svg](file:///c:/DEV/orcafacil/public/logo-horizontal-escuro.svg).
*   **Sidebar Colapsada**: Clique no botão de colapsar a sidebar no cabeçalho. Verifique se o texto some e apenas o símbolo [logo-simbolo-claro.svg](file:///c:/DEV/orcafacil/public/logo-simbolo-claro.svg) (tema claro) ou [logo-simbolo-escuro.svg](file:///c:/DEV/orcafacil/public/logo-simbolo-escuro.svg) (tema escuro) é exibido centralizado.

### 2. Favicon do Navegador
*   Confirme se a aba do navegador exibe o favicon oficial com fundo escuro.

---

## Roteiro de Verificação do Catálogo de Produtos e Serviços

### 1. Responsividade da Listagem
*   **Largura Desktop (>= 768px)**: Deve carregar uma tabela linear contendo as colunas Nome, Tipo (badges com cores de marca), Valor Unitário formatado e Unidade de Medida.
*   **Largura Mobile (< 768px)**: Redimensione a tela no inspetor do navegador. A tabela deve sumir e uma lista de cards verticais interativos deve surgir de forma fluida. O card deve apresentar os dados de forma compacta (ex: `R$ 45,00 / m²`).

### 2. Filtros e Busca Dinâmica
*   Digite um termo existente no campo de busca e confirme que o filtro é executado dinamicamente na listagem.
*   Clique nos seletores de abas (Todos, Produtos, Serviços) e confirme se a filtragem no banco de dados Supabase ocorre perfeitamente.

### 3. Cadastro e Edição de Item
*   Clique em "+ Novo item", preencha o formulário e defina uma unidade (ex: `un` ou `h`). Salve e confirme se o toast de sucesso é exibido e a tabela/cards atualiza de forma reativa.
*   Abra a edição do item recém-cadastrado, altere os dados e verifique a persistência.
*   Tente salvar com preço zero ou negativo e certifique-se de que o sistema bloqueia e exibe erros de Zod abaixo do campo correspondente.
*   **Validação de Tema Escuro**: Alterne a aplicação para o tema escuro e abra o modal de "+ Novo item". O modal inteiro deve possuir fundo escuro e os inputs devem ter fundo e bordas perfeitamente integrados com alto contraste, sem partes do modal mantidas com fundo branco estático.

### 4. Remoção de Item
*   Clique no ícone de exclusão de um item.
*   O modal Alert Dialog de confirmação deve aparecer.
*   Clique em cancelar e confirme que nada muda. Clique em confirmar exclusão e certifique-se de que o item some e o toast de sucesso aparece instantaneamente.
*   **Validação de Tema Escuro**: Com a aplicação em modo escuro, acione a exclusão de um item e confirme que o diálogo de confirmação se adapta esteticamente, exibindo fundo escuro e textos em alto contraste.
