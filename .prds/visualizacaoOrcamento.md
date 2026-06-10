# Product Requirement Document (PRD)

## 1. Visão Geral do Recurso
O objetivo desta tarefa é refatorar completamente a página de visualização e impressão de orçamentos em `/app/quotes/[id]`. A nova interface deve replicar com precisão cirúrgica o layout do mockup fornecido (`.prds/templates/modeloorcamento01.png`), garantindo fidelidade visual na tela e otimização perfeita para impressão física ou salvamento em PDF (padrão folha A4).

---

## 2. Escopo
- **Rota Alvo:** `/app/quotes/[id]`

---

## 3. Requisitos de Design e Layout (Fidelidade Visual)

### 3.1. Paleta de Cores e Tipografia
- **Predominância:** Tons de cinza, grafite e preto, simulando um documento impresso corporativo limpo.
- **Cores de Destaque:** - Fundo do cabeçalho da tabela: Grafite escuro com texto em branco.
  - Alerta de desconto/valores específicos (opcional, conforme imagem): Texto de desconto em verde desaturado/padrão.
- **Tipografia:** Fonte sans-serif limpa (Inter, padrão configurada no projeto), com hierarquia clara de pesos.

### 3.2. Estrutura e Hierarquia de Componentes (Layout Linear)

1. **Cabeçalho Principal (Dados do Emitente):**
   - **Nome da Empresa:** Alinhado à esquerda, em destaque (Sub-pixel antialiased, negrito, fonte maior).
   - **Contatos (Linha única):** `Tel: (XX)XXXXX-XXXX | Whats: (XX)XXXXX-XXXX | Email: xxx@xxx.com`.
   - **Endereço (Linha única):** `Endereço: Rua, Nº, Bairro, Cidade, UF`.
   - **Divisor:** Linha horizontal fina e sutil separando o cabeçalho do corpo.

2. **Identificação do Documento (Seção Orçamento):**
   - Lado Esquerdo: Título "**Orçamento**" em tamanho grande, seguido abaixo pelo título do orçamento (ex: *Troca peças Onix*).
   - Lado Direito: Número do orçamento "**N° X**" (condicional) e a data de validade "**Válido até:** DD de mês de AAAA".
   - **Divisor:** Outra linha horizontal fina de separação.

3. **Dados do Cliente:**
   - Bloco de texto alinhado à esquerda contendo:
     - `Orçamento para: [Nome do Cliente]`
     - `CPF/CNPJ: [Documento]`
     - `Contatos: [Telefone] | [Email]`
     (lables em negrito)

4. **Tabela de Itens:**
   - **Colunas obrigatórias:** `DESCRIÇÃO`, `VALOR`, `QTD.`, `TOTAL`. (alinhadas à esquerda)
   - **Estilo:** Cabeçalho com fundo escuro e texto branco. Bordas finas cinzas ao redor da tabela e entre as células.
   - **Rodapé da Tabela:** Pequeno texto abaixo da tabela à direita indicando o `Total de itens: X`.

5. **Fechamento e Valores (Layout Lado a Lado):**
   - **Lado Esquerdo:**
     - Bloco de **Formas de Pagamento** (Ex: `PIX | dinheiro | cartão débito`).
     - Bloco de **Termos e Condições** (Texto descritivo sobre entrega, frete, prazos e responsabilidades).
   - **Lado Direito (Box de Totais):**
     - Um container com borda fina contendo:
       - `Valor itens:` R$ XX,XX
       - `Desconto:` -R$ XX,XX (Destacado em verde)
       - Linha divisória interna.
       - **`Valor final:` R$ XX,XX** (Texto em negrito e tamanho ligeiramente maior).

6. **Rodapé Institucional:**
   - Centralizado no final da página, exibindo o Razão Social/Nome da Empresa e o CNPJ.

IMPORTANTE: Mantenha consitencia visual de cores para ficar bem casado com a já implementada visualiaçao de recibo da rota `app/receipts/[id]`.
Utilize cores do tailwind.

---

## 4. Regras de Negócio e Lógica de Componentes

### 4.1. Exibição Condicional do Número do Orçamento
- O número do orçamento (`N° X`) só deve ser renderizado na tela e na impressão se a opção de mostrar estiver ativa. Caso contrário, o espaço deve ser omitido de forma elegante sem quebrar o alinhamento do "Válido até".

### 4.2. Cálculos Dinâmicos (Sanidade de Dados)
*Nota: O mockup visual apresenta valores estáticos puramente ilustrativos. A implementação deve utilizar dados reais do orçamento:*

---

## 5. Requisitos de Impressão (CSS Print Profile)

A opção de impressão deve funcionar perfeitamente e adequado para impressão A4, sem quebras e sem paginas extras em branco sem necessidade.

  - **Prevenção de quebras de página órfãs:** Garantir que linhas de tabelas ou o box de totais não quebrem de forma bizarra entre uma página e outra utilizando `page-break-inside: avoid`.

---

## 6. Critérios de Aceite
1. O layout gerado corresponde visualmente à estrutura de blocos e linhas divisórias da imagem `modeloorcamento01.png`.
2. A tipografia e os espaçamentos (paddings/margins) assemelham-se a um documento impresso institucional e não a uma página web comum.