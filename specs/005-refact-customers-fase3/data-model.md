# Data Model: Refatoração do Módulo de Clientes (Fase 3)

## Entidades e Atributos

### 1. Customer (Cliente)
Representa os clientes cadastrados pelos prestadores de serviço autônomos (multi-tenant).

| Campo | Tipo no Banco | Validação (Zod / Frontend) | Descrição |
|---|---|---|---|
| `id` | `UUID` (PK) | Auto-gerado | Identificador único do cliente |
| `user_id` | `UUID` (FK) | `z.string().uuid()` | ID do usuário autenticado no Supabase |
| `name` | `TEXT` | `z.string().min(3, "Nome deve ter pelo menos 3 caracteres")` | Nome completo ou razão social |
| `email` | `TEXT` | `z.string().email("E-mail inválido").optional().nullable()` | Endereço de e-mail do cliente |
| `phone` | `TEXT` | `z.string().optional().nullable()` | Telefone de contato (com máscara) |
| `document_type` | `TEXT` | `z.enum(['cpf', 'cnpj']).optional()` | Tipo de documento ('cpf' ou 'cnpj') |
| `document` | `TEXT` | `z.string().optional().nullable()` | CPF ou CNPJ formatado/limpo |
| `address_zip` | `TEXT` | `z.string().optional().nullable()` | CEP do endereço |
| `address_street` | `TEXT` | `z.string().optional().nullable()` | Logradouro (rua, avenida) |
| `address_number` | `TEXT` | `z.string().optional().nullable()` | Número |
| `address_complement`| `TEXT` | `z.string().optional().nullable()` | Complemento |
| `address_neighborhood`| `TEXT` | `z.string().optional().nullable()`| Bairro |
| `address_city` | `TEXT` | `z.string().optional().nullable()` | Cidade |
| `address_state` | `TEXT` | `z.string().optional().nullable()` | Estado (UF) |
| `created_at` | `TIMESTAMP` | Auto-gerado | Data de criação do registro |

---

### 2. Budget (Orçamento)
Entidade existente de orçamentos vinculados aos clientes para exibição de histórico.

| Campo | Tipo no Banco | Descrição |
|---|---|---|
| `id` | `UUID` (PK) | Identificador do orçamento |
| `customer_id` | `UUID` (FK) | Chave estrangeira ligando ao cliente |
| `value` | `NUMERIC` | Valor financeiro do orçamento |
| `status` | `TEXT` | Estado do orçamento (pendente, aprovado, rejeitado, cancelado, finalizado) |
| `created_at` | `TIMESTAMP` | Data de criação |

---

### 3. Receipt (Recibo)
Entidade existente de recibos vinculados para exibição de histórico.

| Campo | Tipo no Banco | Descrição |
|---|---|---|
| `id` | `UUID` (PK) | Identificador do recibo |
| `customer_id` | `UUID` (FK) | Chave estrangeira ligando ao cliente |
| `value` | `NUMERIC` | Valor financeiro do recibo |
| `created_at` | `TIMESTAMP` | Data de criação |

## Relacionamentos

- Um **Customer** pode estar associado a zero ou muitos **Budgets** (Relação 1:N).
- Um **Customer** pode estar associado a zero ou muitos **Receipts** (Relação 1:N).
- As chaves estrangeiras `customer_id` nas tabelas `budgets` e `receipts` possuem restrição de integridade referencial com a tabela `customers`.
