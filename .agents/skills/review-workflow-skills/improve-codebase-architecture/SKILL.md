---
name: improve-codebase-architecture
description: Encontra oportunidades de aprofundamento em uma codebase, informado pela linguagem de domínio no CONTEXT.md e pelas decisões em docs/adr/. Use quando o usuário quiser melhorar a arquitetura, encontrar oportunidades de refatoração, consolidar módulos fortemente acoplados ou tornar a codebase mais testável e navegável por IA.
---

# Melhorar a Arquitetura da Codebase

Identifique fricções arquiteturais e proponha **oportunidades de aprofundamento** — refatorações que transformam módulos shallow em módulos deep. O objetivo é testabilidade e navegabilidade por IA.

## Glossário

Use estes termos exatamente em cada sugestão. Linguagem consistente é o ponto central — não derive para "componente," "serviço," "API," ou "boundary." Definições completas em [LANGUAGE.md](LANGUAGE.md).

- **Module** — qualquer coisa com uma interface e uma implementação (função, classe, pacote, slice).
- **Interface** — tudo que um chamador precisa saber para usar o module: tipos, invariantes, modos de erro, ordenação, configuração. Não apenas a assinatura de tipos.
- **Implementation** — o código interno.
- **Depth** — leverage na interface: muito comportamento por trás de uma interface pequena. **Deep** = alta leverage. **Shallow** = interface quase tão complexa quanto a implementação.
- **Seam** — onde uma interface existe; um lugar onde o comportamento pode ser alterado sem editar no local. (Use este termo, não "boundary.")
- **Adapter** — algo concreto que satisfaz uma interface em um seam.
- **Leverage** — o que os chamadores ganham com depth.
- **Locality** — o que os mantenedores ganham com depth: mudanças, bugs e conhecimento concentrados em um único lugar.

Princípios chave (veja [LANGUAGE.md](LANGUAGE.md) para a lista completa):

- **Deletion test**: imagine deletar o module. Se a complexidade desaparece, era um pass-through. Se a complexidade reaparece em N chamadores, o module estava cumprindo seu papel.
- **A interface é a superfície de teste.**
- **Um adapter = seam hipotético. Dois adapters = seam real.**

Esta skill é _informada_ pelo modelo de domínio do projeto. A linguagem de domínio dá nomes a bons seams; ADRs registram decisões que a skill não deve reabrir.

## Processo

### 1. Explorar

Leia o glossário de domínio do projeto e quaisquer ADRs na área que você está tocando primeiro.

Em seguida, use a ferramenta Agent com `subagent_type=Explore` para percorrer a codebase. Não siga heurísticas rígidas — explore organicamente e anote onde você experimenta fricção:

- Onde entender um conceito requer saltar entre muitos módulos pequenos?
- Onde os módulos são **shallow** — interface quase tão complexa quanto a implementação?
- Onde funções puras foram extraídas apenas para testabilidade, mas os bugs reais se escondem em como elas são chamadas (sem **locality**)?
- Onde módulos fortemente acoplados vazam pelos seus seams?
- Quais partes da codebase não têm testes ou são difíceis de testar pela interface atual?

Aplique o **deletion test** a qualquer coisa que você suspeite ser shallow: deletá-la concentraria a complexidade ou apenas a moveria? Um "sim, concentra" é o sinal que você quer.

### 2. Apresentar candidatos

Apresente uma lista numerada de oportunidades de aprofundamento. Para cada candidato:

- **Files** — quais arquivos/módulos estão envolvidos
- **Problema** — por que a arquitetura atual está causando fricção
- **Solução** — descrição em linguagem simples do que mudaria
- **Benefícios** — explicados em termos de locality e leverage, e também em como os testes melhorariam

**Use o vocabulário do CONTEXT.md para o domínio, e o vocabulário do [LANGUAGE.md](LANGUAGE.md) para a arquitetura.** Se o `CONTEXT.md` define "Order," fale sobre "o module de entrada de Order" — não "o FooBarHandler," e não "o serviço de Order."

**Conflitos com ADR**: se um candidato contradiz um ADR existente, só o exponha quando a fricção for real o suficiente para justificar reabrir o ADR. Marque claramente (ex. _"contradiz ADR-0007 — mas vale reabrir porque…"_). Não liste todas as refatorações teóricas que um ADR proíbe.

NÃO proponha interfaces ainda. Pergunte ao usuário: "Qual destes você gostaria de explorar?"

### 3. Loop de grilling

Depois que o usuário escolher um candidato, entre em uma conversa de grilling. Percorra a árvore de design com ele — restrições, dependências, a forma do module aprofundado, o que fica por trás do seam, quais testes sobrevivem.

Efeitos colaterais acontecem inline à medida que as decisões se cristalizam:

- **Nomeando um module aprofundado com um conceito que não está no `CONTEXT.md`?** Adicione o termo ao `CONTEXT.md` na hora. Crie o arquivo de forma lazy se não existir.
- **Afinando um termo vago durante a conversa?** Atualize o `CONTEXT.md` na hora.
- **Usuário rejeita o candidato com uma razão de peso?** Ofereça um ADR, com a seguinte proposta: _"Quer que eu registre isso como um ADR para que revisões futuras de arquitetura não re-sugiram isso?"_ Só ofereça quando a razão seria realmente necessária por um explorador futuro para evitar re-sugerir a mesma coisa — pule razões efêmeras ("não vale a pena agora") e razões óbvias.
- **Quer explorar interfaces alternativas para o module aprofundado?** Veja [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md).
