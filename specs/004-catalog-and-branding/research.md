# Research & Technical Decisions: Identidade Visual e Catálogo de Produtos e Serviços

Este documento apresenta as decisões técnicas adotadas para a implementação da Fase 2 de refatoração da identidade visual e do catálogo, alinhadas aos princípios de performance, usabilidade e conformidade com a marca.

---

## Decisão 1: Estratégia de Carregamento e Alternância de Logotipos e Favicon

*   **Decision**: Copiar os arquivos SVG oficiais da marca (`.DOCS/SVG/`) para a pasta de arquivos estáticos `/public` e renderizá-los diretamente em tags HTML `<img src="..." />` com classes responsivas do Tailwind CSS para a alternância de temas e tamanho.
*   **Rationale**: O uso de imagens estáticas servidas diretamente pelo Next.js reduz a complexidade do empacotamento, evita a necessidade de loaders customizados de SVG e garante tempos de renderização instantâneos. A alternância entre tema claro e escuro é resolvida nativamente em CSS com as classes `dark:hidden` e `hidden dark:block`, eliminando problemas de piscar de layout (FOUC).
*   **Alternatives considered**:
    *   *Importar SVGs como componentes React (via SVGR)*: Rejeitada porque insere processamento adicional no bundler, aumenta o tamanho do pacote JS enviado ao cliente e adiciona complexidade de tipagem desnecessária para recursos puramente visuais.
    *   *Adicionar lógica dinâmica baseada no hook useTheme do next-themes*: Rejeitada porque exige componentes Client, gerando pulos visuais durante a hidratação no servidor. A alternância puramente baseada em classes do Tailwind CSS com tags `<img />` estáticas roda direto no servidor sem piscar a imagem.

---

## Decisão 2: Usabilidade Responsiva do Catálogo (Tabela vs. Cards)

*   **Decision**: Ocultar a tabela de listagem padrão do shadcn/ui (`DataTable`) em telas menores que `768px` utilizando as classes responsivas do Tailwind CSS (`hidden md:block`) e exibir uma listagem de cards individuais interativos (`md:hidden`) no mobile.
*   **Rationale**: Tabelas lineares horizontais são ineficientes e de difícil interação em telas de smartphones. A exibição de cards táteis com espaçamento adequado posiciona as informações essenciais (Nome, preço, unidade e tipo) de forma ergonômica, facilitando o manuseio com uma só mão em campo.
*   **Alternatives considered**:
    *   *Manter a DataTable e adicionar scroll horizontal*: Rejeitada porque viola os princípios de responsividade e usabilidade móvel premium do Design System.
    *   *Implementar uma tabela responsiva baseada em CSS flex*: Rejeitada porque a formatação em formato de cards separados oferece melhor espaçamento tátil e estética superior para o padrão móvel.

---

## Decisão 3: Integração do Campo de Unidade de Medida (`unit_measure`)

*   **Decision**: Mapear o campo `unit_measure` no Zod schema e no formulário de cadastro como um campo de texto opcional, limitado a no máximo 10 caracteres, integrando-o por completo na tabela desktop e nos cards móveis.
*   **Rationale**: A tabela `catalog_items` no banco de dados do Supabase e o tipo de banco de dados gerado já contam com a coluna `unit_measure` (como `string | null`). Expor este campo no formulário e na listagem atende à solicitação dos stakeholders de melhorar a organização dos preços do catálogo, permitindo que orçamentos usem unidades corretas (ex: `R$ 45,00 / m²`, `R$ 150,00 / h`).
*   **Alternatives considered**:
    *   *Definir unidade de medida como um Select fixo de enums*: Rejeitada porque os prestadores de serviços utilizam uma enorme gama de abreviações e termos próprios de suas especialidades, sendo o campo de texto livre com limite curto mais flexível e simples.
