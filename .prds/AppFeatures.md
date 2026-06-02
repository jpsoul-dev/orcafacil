# Funcionalidades do App

Este documento lista as funcionalidades do app que precisam ser melhoradas. Traz regras de negocio do produto.

## Melhorias

### Orçamentos
- Quero que o orçamento possa ter os seguintes status: rascunho | pendente | aprovado | rejeitado | cancelado | finalizado.
**Motivo**: para controlar o ciclo de vida do orçamento.

- Quero poder criar um rascunho de orçamento que é um orçamento que ainda não foi concluído, e após gerar orçamento vai para "pendente".
**Motivo**: pode ser que no momento eu não consiga concluir um orçamento mas quero deixar salvo até onde eu fiz para continuar depois.

#### Mudança de status de orçamento
- Como **rascunho** deve permitir:
    - Editar
    - Gerar orçamento
- Status **pendente** deve permitir:
  - Visualizar
  - Editar
  - Baixar em pdf
  - Imprimir
  - Rejeitar | Aprovar

- Status **aprovado** deve permitir:
  - Visualizar
  - Cancelar
  - Finalizar
  - Baixar em pdf
  - Imprimir
- Status **rejeitado** deve permitir:
  - Visualizar
  - Baixar em pdf
  - Imprimir
- Status **cancelado** deve permitir:
  - Visualizar
  - Baixar em pdf
  - Imprimir
- Status **finalizado** deve permitir:
  - Visualizar
  - Baixar em pdf
  - Imprimir

#### Cancelar orçamento
- Informar o motivo do cancelamento

#### Listar orçamentos
- poder filtrar por status
- Rascunhos ficar separados de orçamentos

### Painel administrativo
- Quero um painel administrativo do negocio para mostrar métricas sobre meus orçamentos

### Gerar recibo de orçamento

- Quero poder gerar um recibo para orçamentos finalizados. 
**motivo** o cliente pagou e quero gerar um recibo para enviar a ele.
