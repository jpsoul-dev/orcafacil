---
name: diagnose
description: Loop de diagnóstico disciplinado para bugs difíceis e regressões de performance. Reproduzir → minimizar → levantar hipóteses → instrumentar → corrigir → teste de regressão. Use quando o usuário disser "diagnostique isso" / "depure isso", reportar um bug, disser que algo está quebrado/lançando exceção/falhando, ou descrever uma regressão de performance.
---

# Diagnosticar

Uma disciplina para bugs difíceis. Pule fases apenas quando explicitamente justificado.

Ao explorar a codebase, use o glossário de domínio do projeto para ter um modelo mental claro dos módulos relevantes, e verifique os ADRs na área que você está tocando.

## Fase 1 — Construir um feedback loop

**Esta é a habilidade.** Todo o resto é mecânico. Se você tem um sinal de passa/falha rápido, determinístico e executável pelo agente para o bug, você vai encontrar a causa — bissecção, teste de hipóteses e instrumentação simplesmente consomem esse sinal. Se você não tem um, nenhuma quantidade de olhar para o código vai salvá-lo.

Gaste esforço desproporcional aqui. **Seja agressivo. Seja criativo. Recuse-se a desistir.**

### Formas de construir um — tente-as aproximadamente nesta ordem

1. **Teste falhando** no seam que alcança o bug — unitário, integração, e2e.
2. **Script curl / HTTP** contra um servidor de desenvolvimento rodando.
3. **Invocação de CLI** com uma entrada fixture, comparando stdout com um snapshot conhecido-bom.
4. **Script de browser headless** (Playwright / Puppeteer) — controla a UI, verifica DOM/console/rede.
5. **Reproduzir um trace capturado.** Salve uma requisição de rede real / payload / log de eventos em disco; reproduza-o pelo caminho de código em isolamento.
6. **Harness descartável.** Inicialize um subconjunto mínimo do sistema (um serviço, deps mockados) que exercita o caminho de código do bug com uma única chamada de função.
7. **Loop de propriedade / fuzz.** Se o bug é "saída às vezes errada", execute 1000 inputs aleatórios e procure pelo padrão de falha.
8. **Harness de bissecção.** Se o bug apareceu entre dois estados conhecidos (commit, dataset, versão), automatize "inicie no estado X, verifique, repita" para poder executar `git bisect run` com ele.
9. **Loop diferencial.** Execute o mesmo input pela versão-antiga vs versão-nova (ou duas configs) e compare os outputs.
10. **Script bash HITL.** Último recurso. Se um humano precisa clicar, conduza-o com `scripts/hitl-loop.template.sh` para que o loop ainda seja estruturado. O output capturado retorna para você.

Construa o feedback loop certo, e o bug está 90% resolvido.

### Itere no próprio loop

Trate o loop como um produto. Uma vez que você tem _um_ loop, pergunte:

- Posso torná-lo mais rápido? (Cache de setup, pule init não relacionado, estreite o escopo do teste.)
- Posso tornar o sinal mais nítido? (Verifique o sintoma específico, não "não crashou".)
- Posso torná-lo mais determinístico? (Fixe o tempo, semeie o RNG, isole o filesystem, congele a rede.)

Um loop instável de 30 segundos é pouco melhor que nenhum loop. Um loop determinístico de 2 segundos é um superpoder de depuração.

### Bugs não-determinísticos

O objetivo não é uma reprodução limpa mas uma **taxa de reprodução mais alta**. Repita o gatilho 100×, paralelize, adicione estresse, estreite janelas de timing, injete sleeps. Um bug de 50% de flake é depurável; 1% não é — continue aumentando a taxa até ser depurável.

### Quando você genuinamente não consegue construir um loop

Pare e diga explicitamente. Liste o que você tentou. Peça ao usuário: (a) acesso a qualquer ambiente que reproduz o bug, (b) um artefato capturado (arquivo HAR, dump de log, core dump, gravação de tela com timestamps), ou (c) permissão para adicionar instrumentação temporária de produção. **Não** prossiga para levantar hipóteses sem um loop.

Não prossiga para a Fase 2 até ter um loop em que você acredita.

## Fase 2 — Reproduzir

Execute o loop. Observe o bug aparecer.

Confirme:

- [ ] O loop produz o modo de falha que **o usuário** descreveu — não uma falha diferente que acontece por perto. Bug errado = correção errada.
- [ ] A falha é reproduzível em múltiplas execuções (ou, para bugs não-determinísticos, reproduzível a uma taxa alta o suficiente para depurar).
- [ ] Você capturou o sintoma exato (mensagem de erro, output errado, timing lento) para que fases posteriores possam verificar se a correção realmente o aborda.

Não prossiga até reproduzir o bug.

## Fase 3 — Levantar hipóteses

Gere **3–5 hipóteses ranqueadas** antes de testar qualquer uma delas. A geração de hipótese única ancora na primeira ideia plausível.

Cada hipótese deve ser **falsificável**: declare a previsão que ela faz.

> Formato: "Se <X> é a causa, então <mudar Y> fará o bug desaparecer / <mudar Z> o fará piorar."

Se você não consegue declarar a previsão, a hipótese é um feeling — descarte ou afine.

**Mostre a lista ranqueada ao usuário antes de testar.** Eles frequentemente têm conhecimento de domínio que re-ranqueia instantaneamente ("acabamos de fazer um deploy de uma mudança no #3"), ou conhecem hipóteses que já descartaram. Checkpoint barato, grande economia de tempo. Não bloqueie nisso — prossiga com seu ranqueamento se o usuário estiver AFK.

## Fase 4 — Instrumentar

Cada sonda deve mapear para uma previsão específica da Fase 3. **Mude uma variável de cada vez.**

Preferência de ferramenta:

1. **Debugger / inspeção REPL** se o ambiente suportar. Um breakpoint vale mais que dez logs.
2. **Logs direcionados** nas fronteiras que distinguem hipóteses.
3. Nunca "logue tudo e faça grep".

**Etiquete todo log de debug** com um prefixo único, ex. `[DEBUG-a4f2]`. A limpeza no final torna-se um único grep. Logs sem etiqueta sobrevivem; logs etiquetados morrem.

**Branch de performance.** Para regressões de performance, logs geralmente são errados. Em vez disso: estabeleça uma medição base (harness de timing, `performance.now()`, profiler, plano de query), depois bisseccione. Meça primeiro, corrija depois.

## Fase 5 — Corrigir + teste de regressão

Escreva o teste de regressão **antes da correção** — mas apenas se houver um **seam correto** para ele.

Um seam correto é aquele onde o teste exercita o **padrão real do bug** conforme ocorre no call site. Se o único seam disponível é muito raso (teste de chamador único quando o bug precisa de múltiplos chamadores, teste unitário que não consegue replicar a cadeia que desencadeou o bug), um teste de regressão lá dá falsa confiança.

**Se nenhum seam correto existe, isso por si só é o achado.** Anote. A arquitetura da codebase está impedindo o bug de ser bloqueado. Sinalize isso para a próxima fase.

Se um seam correto existe:

1. Transforme a reprodução minimizada em um teste falhando naquele seam.
2. Observe-o falhar.
3. Aplique a correção.
4. Observe-o passar.
5. Re-execute o feedback loop da Fase 1 contra o cenário original (não-minimizado).

## Fase 6 — Limpeza + post-mortem

Obrigatório antes de declarar concluído:

- [ ] A reprodução original não reproduz mais (re-execute o loop da Fase 1)
- [ ] O teste de regressão passa (ou a ausência de seam está documentada)
- [ ] Toda instrumentação `[DEBUG-...]` removida (faça `grep` pelo prefixo)
- [ ] Protótipos descartáveis deletados (ou movidos para um local claramente marcado como debug)
- [ ] A hipótese que se provou correta está declarada na mensagem do commit / PR — para que o próximo debugger aprenda

**Depois pergunte: o que teria prevenido este bug?** Se a resposta envolve mudança arquitetural (nenhum seam de teste bom, chamadores emaranhados, acoplamento oculto), passe para a skill `/improve-codebase-architecture` com os detalhes específicos. Faça a recomendação **depois** que a correção estiver implementada, não antes — você tem mais informação agora do que quando começou.
