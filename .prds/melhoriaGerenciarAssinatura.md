# Melhoria: Centralização das Informações de Assinatura na Tela "Gerenciar Conta"

## Objetivo

Reorganizar a experiência de gerenciamento da conta do usuário, movendo todas as informações relacionadas à assinatura para dentro do dialog **"Conta"**, através de uma nova aba chamada **"Assinatura"**.

O objetivo é centralizar as configurações da conta em um único local, tornando a navegação mais intuitiva e reduzindo a quantidade de opções exibidas no menu do usuário.

---

## Contexto Atual

Atualmente, o menu do usuário possui a opção:

- Gerenciar Assinatura

Ao clicar nesta opção, o usuário é direcionado para o portal de gerenciamento de assinatura do Stripe.

Além disso, o dialog **"Conta"** possui apenas as abas:

- Perfil
- Segurança

---

## Alteração Solicitada

### 1. Remover a opção "Gerenciar Assinatura" do menu do usuário

#### Situação atual

Menu do usuário:

- Gerenciar Assinatura
- Gerenciar Conta
- Sair da Conta

#### Situação desejada

Menu do usuário:

- Gerenciar Conta
- Sair da Conta

A opção **"Gerenciar Assinatura"** deve ser removida completamente do menu dropdown.

---

### 2. Adicionar uma nova aba "Assinatura" no dialog "Conta"

No dialog **Conta**, adicionar uma terceira aba:

- Perfil
- Segurança
- Assinatura

A aba deve seguir o mesmo padrão visual e comportamento das demais abas existentes.

---

## Conteúdo da Aba "Assinatura"

A nova aba deve exibir informações da assinatura atual do usuário.

### Informações obrigatórias

#### Plano contratado

Exibir:

- Nome do plano
- Tipo de cobrança

Exemplos:

Assinatura Pro Mensal

ou

Assinatura Pro Anual

---

#### Status da assinatura

Exibir o status atual da assinatura.

Exemplos:

- Ativa
- Texte X dias restantes
- Pendente
- Cancelada
- Inadimplente

Utilizar os dados já disponíveis no banco.

---

#### Próxima cobrança

Exibir:

- Data da próxima renovação

Exemplo:

```text
Próxima cobrança: 15/07/2026
```
---

### Botão "Gerenciar Assinatura"

Adicionar um botão de destaque:

```text
Gerenciar Assinatura
```

Ao clicar neste botão:

- Executar exatamente a mesma ação que já existe hoje no menu "Gerenciar Assinatura".
- Redirecionar o usuário para o Portal do Cliente Stripe.
- Reaproveitar a implementação atual já existente.

---

## Requisitos Técnicos

### Reaproveitamento

- Reutilizar toda a lógica atual de integração com Stripe.
- Não criar um novo fluxo de gerenciamento de assinatura.
- Apenas mover o ponto de acesso para dentro do dialog "Conta".

### Estrutura

A nova aba deve consumir as mesmas informações utilizadas atualmente para identificar:

- Plano ativo
- Status da assinatura
- Próxima cobrança

---

## Critérios de Aceitação

### Menu do Usuário

- [ ] A opção "Gerenciar Assinatura" foi removida do dropdown do usuário.
- [ ] O menu continua contendo apenas "Gerenciar Conta" e "Sair da Conta".

### dialog Conta

- [ ] Existe uma nova aba chamada "Assinatura".
- [ ] A aba segue o mesmo padrão visual das abas Perfil e Segurança.
- [ ] O usuário consegue visualizar o plano contratado.
- [ ] O usuário consegue visualizar o status da assinatura.
- [ ] O usuário consegue visualizar a data da próxima renovação.

### Integração Stripe

- [ ] Existe um botão "Gerenciar Assinatura".
- [ ] O botão redireciona para o Portal do Cliente Stripe.
- [ ] O comportamento é idêntico ao fluxo já existente atualmente.

---

## Resultado Esperado

Todo o gerenciamento relacionado à conta do usuário ficará centralizado dentro do dialog **Conta**, eliminando a necessidade de uma opção separada no menu do usuário.

Fluxo final:

```text
Menu do Usuário
│
├── Gerenciar Conta
│     ├── Perfil
│     ├── Segurança
│     └── Assinatura
│            ├── Plano Atual
│            ├── Status
│            ├── Próxima Renovação
│            └── Botão Gerenciar Assinatura
│
└── Sair da Conta
```