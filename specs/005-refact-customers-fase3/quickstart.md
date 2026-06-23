# Quickstart: Módulo de Clientes (Fase 3)

Este guia orienta o desenvolvedor ou agente a executar e validar localmente as melhorias do módulo de **Clientes** após a implementação.

## Inicialização do Servidor Local

1. Instale as dependências caso ainda não tenha feito:
   ```bash
   npm install
   ```
2. Inicialize o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse a aplicação no navegador em [http://localhost:3000](http://localhost:3000).

## Roteiro de Testes Manuais

### 1. Teste de Responsividade (Mobile-First)
- Abra o painel do desenvolvedor no Google Chrome (F12) ou Firefox.
- Ative a visualização móvel (Toggle Device Toolbar) e selecione dispositivos como iPhone SE (`375px`) e iPad (`768px`).
- Vá para a tela de Clientes (`/app/customers`).
- **Comportamento esperado**:
  - Em telas `< 768px`, a tabela deve sumir e dar lugar a cards contendo botões redondos de ação rápida (WhatsApp, E-mail, telefone).
  - Em telas `>= 768px`, a tabela estruturada contendo Nome, E-mail, Telefone e Documento deve ser exibida normalmente.

### 2. Validação e Máscaras de Formulário
- Clique no botão para adicionar um cliente ("Adicionar Cliente").
- Digite caracteres inválidos no campo de e-mail e tente salvar. O Zod deve bloquear exibindo o erro na tela.
- Digite números nos campos de CPF/CNPJ, Telefone e CEP e confirme se as máscaras dinâmicas são aplicadas corretamente.
- Envie o formulário com dados válidos e verifique se o Toast de sucesso aparece.

### 3. Exclusão e Alerta
- Tente excluir um cliente sem orçamentos/recibos. O diálogo de exclusão simples deve ser exibido.
- Tente excluir um cliente com orçamentos/recibos associados. O Alert Dialog deve exibir um aviso claro das pendências vinculadas àquele cliente.

### 4. Perfil e Detalhes do Cliente
- Acesse a rota `/app/customers/[id]` clicando em um cliente na lista.
- Alterne entre as abas "Orçamentos" e "Recibos" e valide se a formatação de dinheiro (`R$`), as datas e os badges de status de orçamento carregam respeitando a paleta de cores correta.

## Validação de Código e Build

Antes de enviar as mudanças, certifique-se de que o código compila corretamente e não possui erros de lint:
```bash
npm run build
```
