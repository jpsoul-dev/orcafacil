# Templates dos Documentos Finais

Use exatamente a estrutura do tipo correspondente. Não adicione seções técnicas, não remova seções do template
sem que o campo seja genuinamente inaplicável (nesse caso, escreva "Não aplicável" em vez de omitir a seção —
isso deixa claro que foi uma decisão consciente, não um esquecimento).

Todo documento começa com este cabeçalho, igual para os três tipos:

```markdown
# [Título curto da solicitação]

**Tipo:** Feature Nova | Melhoria | Problema (Bug)
**Data da solicitação:** [DD/MM/AAAA]
**Solicitante:** [nome do stakeholder, se informado — senão "Não informado"]
**Prioridade sugerida:** [Alta / Média / Baixa / Não definida — conforme informado na entrevista]
```

---

## O que NUNCA vai no documento

Independente do tipo, remova ou traduza qualquer menção a:

- Nomes de tabelas, colunas ou schemas de banco de dados
- Nomes de arquivos, componentes, funções ou rotas de código
- Bibliotecas, frameworks, linguagens de programação, versões de tecnologia
- Endpoints de API, integrações técnicas, nomes de serviços internos
- Decisões de arquitetura ("deveria ser um webhook", "usar cache", "criar uma nova tabela")
- Estimativas de esforço/tempo de desenvolvimento (isso é decisão do time, não do stakeholder)

**Exemplo de tradução correta:**

> ❌ Rascunho do stakeholder: "Precisa criar uma coluna `status_pagamento` na tabela de orçamentos e um webhook
> do Stripe pra atualizar automaticamente."
>
> ✅ Documento final: "O sistema deve refletir automaticamente, no orçamento, quando o pagamento correspondente
> for confirmado — sem que o usuário precise atualizar isso manualmente."

Se o rascunho original contiver esse tipo de detalhe, não ignore a intenção por trás dele — extraia o resultado
de negócio esperado e descreva isso. Se não conseguir inferir a intenção com segurança, pergunte na entrevista.

---

## Template — Feature Nova

```markdown
# [Título]

**Tipo:** Feature Nova
**Data da solicitação:** [data]
**Solicitante:** [nome ou "Não informado"]
**Prioridade sugerida:** [Alta/Média/Baixa/Não definida]

## Contexto e Motivação
[2-4 frases: por que essa necessidade surgiu, que situação de negócio ou de usuário ela resolve]

## Objetivo
[1-3 frases: o que se espera alcançar com essa feature, em termos de resultado percebido]

## Público Afetado
[Quem vai usar isso — todos os usuários, um segmento, um perfil específico]

## Descrição da Funcionalidade Desejada
[Descrição em linguagem de negócio do que o usuário deve conseguir fazer, incluindo o fluxo principal
passo a passo quando aplicável. Sem instruções técnicas — descreva o que o usuário vê e faz, não como o
sistema deve ser construído.]

## Caso de Uso de Referência
[Um exemplo concreto e real de quando/como isso seria usado]

## Como é Feito Hoje
[Como essa necessidade é resolvida atualmente, se é que é — manualmente, por fora do sistema, ou não é
resolvida]

## Critérios de Aceite
- [Critério objetivo e verificável 1]
- [Critério objetivo e verificável 2]
- [...]

## Fora de Escopo
[O que explicitamente não faz parte desta solicitação, se relevante — senão "Não aplicável"]

## Anexos e Referências
[Links, prints, exemplos mencionados — senão "Nenhum"]

## Observações Adicionais
[Qualquer informação relevante que não se encaixe nas seções acima — senão omitir a seção inteira]
```

---

## Template — Melhoria

```markdown
# [Título]

**Tipo:** Melhoria
**Data da solicitação:** [data]
**Solicitante:** [nome ou "Não informado"]
**Prioridade sugerida:** [Alta/Média/Baixa/Não definida]

## Contexto e Motivação
[2-4 frases: por que essa melhoria é necessária agora]

## Funcionalidade Atual
[Como funciona hoje, na visão de quem usa]

## O que Não Está Funcionando Bem
[Descrição específica e concreta do que incomoda, limita ou é insuficiente no estado atual — sem
adjetivos vagos sem referência ("mais rápido" precisa de um número ou exemplo de comparação)]

## Comportamento Desejado
[Como deve ficar depois da melhoria, descrito de forma que dê pra comparar objetivamente com o estado
atual]

## Público Afetado
[Quem sente esse problema hoje — todos os usuários, um segmento, um perfil específico]

## Critérios de Aceite
- [Critério objetivo e verificável 1]
- [Critério objetivo e verificável 2]
- [...]

## Fora de Escopo
[O que explicitamente não faz parte desta melhoria, se relevante — senão "Não aplicável"]

## Anexos e Referências
[Links, prints, exemplos mencionados — senão "Nenhum"]

## Observações Adicionais
[Se houver — senão omitir a seção inteira]
```

---

## Template — Problema (Bug)

```markdown
# [Título]

**Tipo:** Problema (Bug)
**Data da solicitação:** [data]
**Solicitante:** [nome ou "Não informado"]
**Prioridade sugerida:** [Alta/Média/Baixa/Não definida]
**Impacto:** [Bloqueia o uso / Atrapalha mas não bloqueia / Incômodo pontual]

## Contexto
[Onde/quando o problema foi percebido, e desde quando]

## Comportamento Esperado
[Como deveria funcionar]

## Comportamento Atual
[O que está acontecendo de errado, de forma específica]

## Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [...]

## Frequência
[Sempre / Às vezes / Só em determinada condição — descrever o padrão percebido, se houver, ou registrar
"não determinado pelo solicitante"]

## Abrangência
[Todos os usuários / cliente(s) específico(s) / dispositivo ou navegador específico — conforme informado]

## Público Afetado
[Quem é impactado por esse problema]

## Anexos e Referências
[Prints, links, mensagens de erro relatadas pelo usuário — senão "Nenhum"]

## Observações Adicionais
[Se houver — senão omitir a seção inteira]
```

Note que o template de Bug não tem "Critérios de Aceite" separado — o critério de aceite de um bug é, por
definição, o "Comportamento Esperado" já descrito. Não duplique a seção.
