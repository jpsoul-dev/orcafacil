# Research: Refatoração do Módulo de Clientes (Fase 3)

## Decisão 1: Máscaras Dinâmicas em React Hook Form e Validação Zod

### Contexto
O formulário de Clientes precisa gerenciar de forma consistente máscaras para:
- Telefone: `(XX) XXXXX-XXXX` (celular) ou `(XX) XXXX-XXXX` (fixo)
- Documento: CPF (`XXX.XXX.XXX-XX`) ou CNPJ (`XX.XXX.XXX/XXXX-XX`) alternando dinamicamente
- CEP: `XXXXX-XXX`

### Decisão
Implementar funções de formatação puras (sem bibliotecas externas pesadas) que interceptam e tratam o valor do input no evento `onChange` do React Hook Form. A validação do lado do cliente será executada pelo Zod sobre a string limpa (removendo pontos, traços e parênteses) ou sobre a string formatada se for necessário.

### Justificativa
O uso de bibliotecas de máscara como `react-imask` ou `react-text-mask` pode causar problemas de hidratação/renderização no Next.js 16/React 19. Funções puras de formatação mantêm o bundle leve, são 100% previsíveis e controladas.

---

## Decisão 2: Verificação de Orçamentos e Integridade na Exclusão

### Contexto
O banco de dados possui chaves estrangeiras que podem causar erros de integridade referencial (`violates foreign key constraint`) caso o usuário tente deletar um cliente que possui orçamentos ou recibos associados.

### Decisão
Adicionar um método `hasActiveBudgets(customerId, userId)` na camada `customer-service.ts`. Antes de abrir a confirmação de exclusão (ou diretamente dentro do Server Action), faremos essa verificação. Se houver vínculos:
- O Alert Dialog informará explicitamente que o cliente possui orçamentos associados.
- Para evitar erros no banco de dados, podemos sugerir que o usuário primeiro remova ou cancele os orçamentos do cliente ou, se a política de negócios permitir, o banco de dados lidará com isso via cascade, mas de qualquer forma o usuário deve ser alertado com clareza.

---

## Decisão 3: Transição de Layout Responsiva (Mobile-First)

### Contexto
Em celulares, tabelas lineares causam scrolls horizontais indesejáveis que violam a premissa mobile-first.

### Decisão
Utilizar classes utilitárias do Tailwind CSS v4 para ocultar a tabela desktop em telas menores (`hidden md:block`) e expor uma lista de cartões interativos táteis (`md:hidden`). Cada cartão móvel (`CustomerCard`) terá ações específicas e atalhos rápidos acionando links como `wa.me` para WhatsApp e `mailto:` para E-mail, além do `tel:` para ligações diretas.
