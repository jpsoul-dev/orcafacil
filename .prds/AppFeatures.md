# Funcionalidades do App

Este documento lista melhorias esperadas para o app.

## Melhorias

### Orçamentos
- Quero poder alterar a situação de um orçamento, que pode ser: pendente | aprovado | rejeitado | cancelado | finalizado.
**Motivo**: para controlar o ciclo de vida do orçamento.

- Quero poder criar um rascunho de orçamento para continuar em  outro momento, e após gerar orçamento vai para "pendente".
**Motivo**: Caso não possa finalizar um orçamento no momento e queria continuar em outro momento, preciso deixar salvo como rascunho para não ter que começar do zero.

- Quero poder visualizar um orçamento e ter opçao de baixar em .pdf ou imprimir direto.
**Motivo**: Parar poder baixar e enviar ao meu cliente ou imprimir para ele e a empresa assinar.

- Quero poder *Rejeitar* ou *Aprovar* um orçamento que está como *Pendente*.
**motivo**: O cliente recebeu o orçamento e me respondeu se aprovou ou rejeitou. Para dar seguimento ou encerrar o clico de vida do orçamento.

- Quero poder *Cancelar* ou *Finalizar* um orçamento *Aprovado*.
**motivo**: Seu eu já executei o orçamento quero Finalizar e se o cliente desistiu depois de aprovado eu quero Cancelar. De toda forma encerra o ciclo de vida do orçamento.

- Quero que seja possível informar um motivo ao cancelar um orçamento Aprovado.
**motivo**: Para quando eu precisar consultar o porque de o cliente ter desistido depois de aprovado.

- Queror poder aplicar filtro por situação na minha lista de orçamentos
**motivo**: para eu poder saber o que tem em cadas situação.

- Quero poder excluir um rascunho.
**motivo**: rascunho ainda não é um orçamento, posso excluir a qualquer momento.

### Painel administrativo
- Quero um painel administrativo do negocio para mostrar métricas sobre meus orçamentos em grafico e poder gerar arquivos .pdf dos orçamentos. 
**motivo**: Poder ter uma visão gerencial do meu negocio..

### Gerar recibo de orçamento

- Quero poder gerar um recibo para orçamentos finalizados e também poder baixar em .pdf ou imprimir diretamente.
**motivo** Finalizei o orçamento e o cliente pagou,  então quero gerar um recibo para ele e minha empresa assinar.

### melhorias visuais (UI/UX)

- Quero melhorar o design (ui/ux) em toda a aplicação mantendo consistencia visual. Uma referencia de desing seria o Linear App. 
- O app deve estar preparado para funcionar como um PWA, para que quando o usuário utilizar no mobile tenha uma boa experiencia.

- Prioridades de melhoria: 
1. Filtros de status na pagina de orçamentos (/app/quotes). Está com os filtros soltos e com UX ruim.
2. Em app/settings, melhorar consistencia visual, utiliza basicamente os mesmos campos de endereço do cadatro de clientes porém não tem consistencia visual.
3. Em app/customers/[id] na guia de "orçamentos" não tem consitencia visual, por exemplo na apresentação do badge de status não se parece com o que já é mostrado na pagina de listagem de orçamentos.

- Melhorar o menu de ações na tela de listar orçamentos:
1. incluir opção de imprimir orçamento
2. incluir opção de mudar status
3. incluir opção de reabrir um orçamento "vencido".
4. incluir opção de excluir (apenas para rascunhos)
5. incluir opção de gerar recibo, para orçamento finalizado

- melhorar visualização de orçamento em app/quotes/[id] e principalmente a impressão e baixar em pdf.

- melhorar UI/UX da sidebar, quando recolhida está com quebra de layout e precisa ser responsiva em em mobile, e quando é feito o recolhimento no desktop os icones saem um pouco par fora na sidebar reduzida.

### Nova funcionalidade - Clonar orçamento

- Quero poder clonar um orçamento para quando eu precisar criar um orçamento igual ou parecido com um já criado. Ao clonar um orçamento espero ser redirecionado para a tela de criação de novo orçamento com os dados já preenchidos do orçamento que foi clonado.
- Só não deve ser possível clonar um rascunho.

### Melhoria nas telas de onboarding
- melhorar a consistencia visual da tela de omboarding para se adequar ao tema do projeto.
- Pedir para o usúario selecionar o ramo de atuação - "Qual é o seu ramo de atuação?" (Ex: Prestação de Serviços, Freelancer, Marcenaria, Agência de Marketing, Consultoria).
- Remover solicitação para inserir numero de telefone.

### melhoria no Sitema de notificação global atual
- Quero poder marcar uma notificação como lida par ela  não mostrar mais
- Novos usuários só devem receber notificações dali para frente (data que cadastrou), não faz muito sentido ele receber uma chuva de notificações antigas sendo que nem tinha cadastro ainda.
- Quero poder marcar todas as notificações como lidas, de uma vez só
- Separar as lidas das não lidas por exemplo ter uma guia para as não lidas e outra onde fica as lidas no contexto onde já mostra as notificações atualmente. 

### implementar encerrar conta

- Quero ter a opção de encerrar minha conta de usuário de forma segura. Atualmente tem apenas o botão Encerrar Conta mas ainda não faz nada.