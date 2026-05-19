---
name: to-spec
description: Gera SPEC implementável a partir dos checkpoints de uma sessão de review (01-zoom-out.md, 02-architecture-candidates.md, 03-decisions.md). Re-explora a codebase atual pra resolver paths e assinaturas. Use quando o usuário pedir "gera spec", "transforma decisões em spec", "fecha a sessão com spec" ou ao encerrar uma review com decisões fechadas.
---

# To Spec

Transforma os checkpoints de uma sessão de review em uma SPEC implementável por outro agente ou desenvolvedor.

## Pré-requisitos

A pasta `review-outputs/<projeto>/<sessao>/` deve conter:

- `01-zoom-out.md` — mapa do projeto + vocabulário de domínio
- `02-architecture-candidates.md` — lista numerada de candidatos
- `03-decisions.md` — decisões fechadas durante o grilling

Se algum estiver ausente, **pare e avise o usuário**. Não tente preencher do contexto da conversa atual — uma SPEC sem decisões persistidas é palpite, não plano.

Se o usuário não souber qual é a sessão, liste as pastas em `review-outputs/` e pergunte.

## Processo

### 1. Carregar os checkpoints

Leia os 3 arquivos. Internalize: módulos relevantes, vocabulário de domínio, candidato escolhido, decisões fechadas com suas razões.

### 2. Re-explorar a codebase atual

Os checkpoints podem ter sido escritos horas ou dias atrás. Antes de gerar a SPEC, confirme contra o estado atual:

- Os arquivos referenciados ainda existem nos paths citados?
- As assinaturas atuais batem com o que foi discutido?
- Houve mudanças relevantes desde então?

Se detectar divergência (**Drift**), anote no início da SPEC e pergunte ao usuário se quer continuar, atualizar os checkpoints, ou abortar.

### 3. Decidir onde salvar a SPEC

Pergunte ao usuário antes de escrever. Default sugerido:

- **Se o projeto-alvo já tem `specs/`, `SPEC.md` na raiz, ou padrão similar:** salvar em `<projeto>/specs/<topic>.md` — vira artefato oficial do projeto
- **Caso contrário:** salvar em `review-outputs/<sessao>/04-spec.md` — fica isolado da codebase

### 4. Gerar a SPEC usando este template

```markdown
# SPEC: <Goal em uma frase>

> **Source:** review-outputs/<projeto>/<sessao>/
> **Generated:** <YYYY-MM-DD HH:MM>
> **Drift detected:** <não / sim — descrever>

## Goal
Uma frase. O que essa SPEC entrega quando implementada.

## Context
Resumo curto de por que essa mudança existe. Referencia o `01-zoom-out.md` ao invés de copiar.

## Decisions
Tabela com as decisões fechadas no grilling:

| ID | Pergunta | Decisão | Implicação |
|---|---|---|---|

Não invente decisões. Se algo não foi resolvido, vai pra Open Questions no fim.

## Module Map
| Module | Status | Path atual → Path novo |
|---|---|---|
| Ex: MemoryService | alterado | services/memory_service.py → services/memory/service.py |
| Ex: Summarizer | novo | — → services/memory/summarization.py |

Use vocabulário arquitetural (Module/Interface/Seam/Adapter), não "componente/serviço".

## Interface Changes
Pra cada module novo ou alterado:

- Assinaturas (tipos completos, não esboço)
- Invariantes (o que sempre vale)
- Modos de erro (quais exceções, quando)
- Configuração obrigatória

## File-Level Changes (ordem de execução)

Passo a passo numerado. Cada passo deve ser executável sem ambiguidade:

1. **Criar `<arquivo>`** — propósito + esqueleto da estrutura
2. **Mover `<a>` → `<b>`** — incluir o que mantém, o que deleta
3. **Editar `<arquivo>`** — descrever a mudança específica
4. **Atualizar imports em `<arquivos chamadores>`** — antes/depois

Outro agente lê isto e implementa do passo 1 ao N. Se um passo for ambíguo, divida.

## Migration Strategy

Escolha uma e justifique:

- **Swap direto** — substitui de uma vez (baixo risco, escopo pequeno)
- **Parallel-implementation** — código novo coexiste com antigo, depois remove (risco médio)
- **Feature flag** — toggle em runtime (mudanças visíveis em produção)
- **Deprecate-and-replace** — marcar antigo deprecated, migrar chamadores aos poucos

A justificativa deve referenciar tamanho da área, número de chamadores, criticidade.

## Tests

Pra cada module afetado:

- **Categoria de dependência** (in-process / local-substituível / remoto-próprio / verdadeiramente externo) — ver DEEPENING.md
- **Estratégia de teste** — onde mora o seam de teste, qual adapter
- **Testes existentes** — quais sobrevivem, quais somem (a interface mudou)
- **Testes novos** — listar com nomes; testes batem na interface, não na implementação

## Rollback

Como reverter se algo der ruim em produção:

- Comando de revert (git/feature flag/deploy)
- Estado dos dados (migrações que precisam ser revertidas?)
- Sinal de que o rollback é necessário (métrica/log)

## Acceptance Criteria

Lista checável — o que torna isso "pronto":

- [ ] Critério 1 (verificável: comando, métrica, output)
- [ ] Critério 2
- [ ] ...

## Open Questions

Coisas não decididas no grilling e que precisam ser resolvidas antes ou durante a implementação. NÃO chute — registre como pergunta.
```

## Princípios

- **Não invente decisões.** Tudo na SPEC vem do `03-decisions.md` ou da re-exploração da codebase. Se faltar algo, vira Open Question.
- **Use vocabulário de domínio do `01-zoom-out.md`.** Não invente termos novos.
- **Use vocabulário arquitetural do LANGUAGE.md** — Module/Interface/Seam/Adapter/Depth/Leverage/Locality.
- **File-Level Changes deve ser executável.** Cada passo, lido sozinho por outro agente, deve ser implementável sem perguntas. Se for ambíguo, divida.
- **Drift é sinal vermelho.** Se a codebase mudou desde os checkpoints, a SPEC pode estar errada. Escalar antes de gerar.
- **A SPEC é entregável.** Quem lê depois (humano ou IA) implementa direto. Nada de "depois decide", "talvez", "pode ser".
