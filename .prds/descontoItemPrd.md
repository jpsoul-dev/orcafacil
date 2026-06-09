# Especificação de Requisito: Desconto por Item no Orçamento

## 1. Descrição Geral
Permitir que o usuário aplique descontos específicos (em valor nominal `R$` ou percentual `%`) em itens individuais do orçamento. O desconto geral do orçamento continuará existindo e será aplicado sobre o **subtotal resultante** (a soma dos itens já com seus respectivos descontos aplicados).

---

## 2. Interface e Comportamento do Item
Para cada item do orçamento, deverão ser adicionados os seguintes campos e comportamentos na interface:

* **Tipo de Desconto:** Um seletor para escolher entre **Percentual (%)** ou **Valor (R$)**.
* **Valor do Desconto:** Campo de entrada numérico.
* **Cálculo Automático:** O sistema deve recalcular o total do item e o total do orçamento em tempo real.
* **Formatação da Label "Total" do Item:** A exibição do valor final do item deve seguir rigorosamente o padrão:
    $$\text{R\$} \; [Valor\_Final] \; (-\text{R\$} \; [Valor\_do\_Desconto\_em\_Dinheiro])$$
    * *Exemplo prático:* `R$ 18,00 (- R$ 2,00)`

---

## 3. Regra de Cálculo (Fluxo em Cascata)
O cálculo das propriedades do orçamento deve seguir a ordem exata descrita abaixo para evitar divergências de arredondamento e garantir consistência fiscal:

1.  **Total Bruto do Item:**
    $$Total\_Bruto\_Item = Quantidade \times Preco\_Unitario$$
2.  **Desconto do Item (em Dinheiro):**
    * Se o tipo for *Valor (R$)*:
        $$Desconto\_Item = Valor\_Digitado$$
    * Se o tipo for *Percentual (%)*:
        $$Desconto\_Item = Total\_Bruto\_Item \times \left(\frac{Percentual\_Digitado}{100}\right)$$
3.  **Total Líquido do Item:**
    $$Total\_Liquido\_Item = Total\_Bruto\_Item - Desconto\_Item$$
4.  **Subtotal do Orçamento:**
    $$Subtotal\_Orcamento = \sum (Total\_Liquido\_Item)$$
5.  **Desconto Geral (em Dinheiro):**
    * Se o desconto geral for em *Valor (R$)*:
        $$Desconto\_Geral\_Item = Valor\_Geral\_Digitado$$
    * Se o desconto geral for em *Percentual (%)*:
        $$Desconto\_Geral\_Item = Subtotal\_Orcamento \times \left(\frac{Percentual\_Geral\_Digitado}{100}\right)$$
6.  **Total Geral do Orçamento:**
    $$Total\_Geral = Subtotal\_Orcamento - Desconto\_Geral\_Item$$

---

## 4. Casos de Borda (Edge Cases) e Validações

### A. Desconto Maior que o Total do Item
* **Cenário:** O usuário tenta aplicar um desconto de R$ 25,00 em um item cujo total bruto é R$ 20,00, ou digita um percentual maior que 100% (ex: 110%).
* **Comportamento Esperado:** O sistema deve impedir a inserção de valores que reduzam o preço do item para menos de zero. O desconto máximo permitido deve ser limitado a 100% ou ao valor total bruto do item. Valores negativos no campo de desconto devem ser bloqueados por validação de formulário.

### B. Arredondamento de Centavos (Dízimas)
* **Cenário:** Um item custa R$ 10,00 e o usuário aplica 33,33% de desconto. O cálculo matemático resulta em um desconto de R$ 3,333 e total de R$ 6,667.
* **Comportamento Esperado:** O sistema deve adotar um padrão de arredondamento financeiro de duas casas decimais (Truncamento ou *Banker's Rounding* / METNBR9657). O valor exibido na label e armazenado no banco deve ser idêntico para evitar que a soma visual dos itens divirja do total geral por centavos.

### C. Alteração de Quantidade Pós-Desconto
* **Cenário:** O usuário adiciona 1 unidade de um item de R$ 10,00, define um desconto fixo em valor de R$ 5,00 (Total Líquido: R$ 5,00). Posteriormente, altera a quantidade desse item para 5 unidades.
* **Comportamento Esperado:**
    * **Se o desconto for Percentual (%):** O sistema aplica os mesmos % sobre o novo total bruto (Ex: 10% de R$ 50,00 = R$ 5,00 de desconto).
    * **Se o desconto for em Valor (R$):** O desconto fixo deve ser aplicado sobre o **total do lote do item** e não por unidade. No cenário acima, o total bruto vira R$ 50,00, subtrai-se o desconto fixo de R$ 5,00, resultando em R$ 45,00 líquidos. *Nota: Se a quantidade for reduzida a ponto de o total bruto ficar menor que o desconto fixo, acionar a regra do item A.*

### D. Combinação de Desconto por Item + Desconto Geral
* **Cenário:** O orçamento possui o Item 1 (com 10% de desconto) e o Item 2 (sem desconto). O usuário decide aplicar mais 10% de desconto geral sobre o carrinho.
* **Comportamento Esperado:** O desconto geral nunca deve incidir sobre o valor cheio (bruto) do Item 1, mas sim sobre o Subtotal já impactado pelos descontos individuais.
    * *Exemplo Numérico:*
        * Item 1: Qtd 2 | Preço R$ 10,00 -> Total Bruto: R$ 20,00 | Desconto Item (10%): R$ 2,00 -> Total Líquido: **R$ 18,00**.
        * Item 2: Qtd 1 | Preço R$ 10,00 -> Total Bruto: R$ 10,00 | Desconto Item: R$ 0,00 -> Total Líquido: **R$ 10,00**.
        * **Subtotal:** R$ 18,00 + R$ 10,00 = **R$ 28,00**.
        * **Desconto Geral (10%):** 10% de R$ 28,00 = **R$ 2,80**.
        * **Total Final do Orçamento:** R$ 28,00 - R$ 2,80 = **R$ 25,20**.

### E. Item com Preço Zero ou Desconto de 100% (Brinde)
* **Cenário:** Um item é adicionado diretamente com valor R$ 0,00 ou recebe um desconto de 100%.
* **Comportamento Esperado:** A interface deve renderizar a label normalmente. Se o item custava R$ 20,00 e recebeu 100% de desconto, a label exibirá: `R$ 0,00 (- R$ 20,00)`. O sistema deve processar o item com valor zerado e o desconto geral posterior não alterará o valor deste item.