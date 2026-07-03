# Entrevista — Checklist de Gaps e Roteiro de Perguntas

Use este arquivo na Etapa 3 (Triagem de Gaps) e Etapa 4 (Entrevista) do fluxo principal. A lógica é sempre a
mesma: **passe o rascunho pelo checklist do tipo correspondente, marque o que já está respondido, e pergunte só
o resto.**

---

## Bloco Comum — todo tipo passa por aqui

| Campo | O que verificar no rascunho | Se faltar, pergunte |
|---|---|---|
| **Título curto** | Existe uma forma curta (5-8 palavras) de nomear a solicitação? | "Como você resumiria isso em uma frase curta, tipo um título?" |
| **Contexto/Motivação** | Está claro *por que* isso importa agora — qual dor, oportunidade ou situação motivou o pedido? | "O que te fez pedir isso agora? Aconteceu algo específico ou é uma dor recorrente?" |
| **Público/área afetada** | Está claro quem é impactado — todos os clientes, um segmento, um perfil de usuário interno? | "Isso afeta todos os usuários do sistema ou um grupo específico (ex: só um plano, só um tipo de negócio)?" |
| **Objetivo** | Está claro o que se espera alcançar com isso, em termos de resultado percebido? | "Quando isso estiver pronto, o que muda na prática pra quem usa?" |
| **Critérios de aceite** | Dá pra saber, objetivamente, quando isso está pronto e correto? | "Como você vai saber que ficou certo? Tem algum cenário específico que precisa funcionar?" |
| **Prioridade/urgência** | Está claro se é urgente, tem prazo, ou é bloqueante de outra coisa? | "Isso é urgente, tem prazo, ou pode entrar na fila normal de prioridades?" |
| **Fora de escopo** | O rascunho deixa claro o que NÃO deve ser incluído, se houver risco de interpretação ampla? | Só pergunte se o pedido for amplo o suficiente para gerar dúvida: "Tem algo que você quer deixar explícito que NÃO faz parte deste pedido, pra não ter interpretação errada?" |
| **Anexos/referências** | O usuário menciona prints, exemplos, links, concorrentes? | Se mencionar mas não anexar: "Você tem algum print, exemplo ou link de referência pra eu registrar?" (não é obrigatório insistir se não houver) |

Nem todo campo do bloco comum precisa virar uma pergunta — "Fora de escopo" e "Anexos", por exemplo, só valem a
pena perguntar quando fazem diferença real para aquele pedido específico.

---

## Bloco Feature Nova

Além do bloco comum:

| Campo | O que verificar | Se faltar, pergunte |
|---|---|---|
| **Fluxo desejado** | Está claro o passo a passo do que o usuário deve conseguir fazer, do início ao fim? | "Descreve o passo a passo: o usuário começa onde, faz o quê, e termina como?" |
| **Caso de uso principal** | Há pelo menos um exemplo concreto de uso real (não hipotético)? | "Me dá um exemplo real de quando alguém precisaria usar isso — uma situação de verdade." |
| **Alternativa atual** | Como isso é resolvido hoje, se é que é resolvido de algum jeito (manualmente, por fora do sistema, não é resolvido)? | "Hoje, sem essa feature, como isso é feito? Manualmente? Não é feito?" |

---

## Bloco Melhoria

Além do bloco comum:

| Campo | O que verificar | Se faltar, pergunte |
|---|---|---|
| **Funcionalidade atual** | Está claro o que já existe hoje e como funciona, na visão do usuário? | "Como funciona isso hoje, do jeito que está?" |
| **O que incomoda hoje** | Está claro especificamente o que está ruim, lento, confuso ou insuficiente? | "O que exatamente incomoda no jeito atual? Me dá um exemplo concreto." |
| **Comportamento desejado** | Está claro como deveria ficar depois da melhoria — não só "melhor", mas o quê muda de fato? | "Depois de melhorado, o que exatamente vai ser diferente do ponto de vista de quem usa?" |

Cuidado especial aqui: melhorias são o tipo mais sujeito a frases vagas ("deixar mais rápido", "mais intuitivo",
"mais moderno"). Sempre que aparecer um adjetivo sem referência concreta, peça um exemplo ou número.

---

## Bloco Problema (Bug)

Além do bloco comum (aqui "Objetivo" vira naturalmente "voltar a funcionar como deveria"):

| Campo | O que verificar | Se faltar, pergunte |
|---|---|---|
| **Comportamento esperado** | Está claro como deveria funcionar? | "Como isso deveria funcionar, na sua visão?" |
| **Comportamento atual** | Está claro o que está acontecendo de errado, de forma específica (não só "não funciona")? | "O que exatamente acontece de errado? Aparece algum erro, trava, mostra informação incorreta?" |
| **Passos para reproduzir** | Dá pra entender a sequência de ações que leva ao problema? | "Consegue descrever o passo a passo até o problema aparecer? Onde você clica, o que preenche, o que acontece." |
| **Frequência/consistência** | Está claro se acontece sempre, às vezes, ou só em certas condições? | "Isso acontece toda vez ou só às vezes? Percebeu algum padrão de quando acontece?" |
| **Ambiente/abrangência** | Está claro se afeta todo mundo, um cliente específico, um dispositivo/navegador específico? | "Isso acontece com todos os clientes ou você percebeu em algum caso específico?" |
| **Impacto** | Está claro o tamanho do problema — trava o trabalho, é visual, é urgente? | "Isso impede o uso do sistema ou é um incômodo que não trava o trabalho?" |

Nunca peça a causa técnica do bug ("por que você acha que isso acontece?") — isso é trabalho do time de dev, não
do stakeholder. Foque só no comportamento observável.

---

## Regras gerais da entrevista

- Máximo 5 perguntas por rodada. Se sobrarem mais, divida em uma segunda rodada depois das primeiras respostas.
- Nunca repita uma pergunta cuja resposta já esteja em outra parte do rascunho.
- Se o usuário responder de forma ainda vaga, insista educadamente uma vez pedindo um exemplo ou número concreto
  antes de aceitar a resposta como definitiva.
- Se o usuário sinalizar que não sabe/não tem essa informação (ex: não sabe a frequência exata do bug), registre
  isso no documento como está — "frequência não determinada pelo solicitante" — em vez de forçar uma resposta que
  ele não tem.
