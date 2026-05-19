---
name: review-workflow
description: Pacote de skills para review e análise de codebase em sequência (mapear → analisar → diagnosticar → pressionar plano → consolidar decisões → gerar SPEC). Use este arquivo como entry point para escolher a fase certa e seguir a disciplina de checkpoint.
---

# Review Workflow — Pacote de Skills

Pipeline para revisar uma codebase com profundidade crescente e produzir uma SPEC implementável no fim. Cada fase é uma skill. Você não precisa rodar todas — entre na fase que faz sentido pro problema atual.

> **Princípio:** o pacote analisa código e produz **artefatos de review** (`review-outputs/...`) e, opcionalmente, uma SPEC. Não modifica código do projeto-alvo. Não cria PRDs/issues/CONTEXT.md/ADRs no projeto.

---

## Mapa do fluxo

```
┌───────────────┐    ┌──────────────────────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────────┐    ┌─────────────┐
│ 1. zoom-out   │ →  │ 2. improve-codebase-     │ →  │ 3. diagnose  │ →  │ 4. grill-me│ →  │ 5. decisions │ →  │ 6. to-spec  │
│ "cadê eu?"    │    │    architecture          │    │ "por que tá  │    │ "esse plano│    │ append a cada│    │ SPEC final  │
│ mapa amplo    │    │ candidatos numerados     │    │  quebrado?"  │    │  aguenta?" │    │ decisão      │    │ implementável│
└───────────────┘    └──────────────────────────┘    └──────────────┘    └────────────┘    └──────────────┘    └─────────────┘
   orientação            análise estrutural              debug              pressão           persistência         entregável
                         + grilling embutido          (condicional)         de plano        (não é fase ativa)
```

A Fase 5 (**decisions**) **não é uma skill ativa** — é a disciplina de checkpoint que roda em paralelo às fases 2 e 4 (descrita abaixo).

---

## Quando usar cada fase

### Fase 1 — `zoom-out`
**Sinal de entrada:** "não conheço esta área", "como isso se encaixa?", primeira passada num módulo desconhecido.
**Saída esperada:** mapa de módulos relevantes e seus chamadores em vocabulário de domínio.
**Path:** [skills/zoom-out/SKILL.md](skills/zoom-out/SKILL.md)
**Checkpoint:** ao terminar, salvar em `01-zoom-out.md` (ver disciplina abaixo).
**Nota:** `disable-model-invocation: true` — só ativa por invocação explícita.

### Fase 2 — `improve-codebase-architecture`
**Sinal de entrada:** já tenho o mapa, agora quero **oportunidades de aprofundamento**.
**Saída esperada:** lista numerada de candidatos com Files/Problema/Solução/Benefícios + grilling em cima do candidato escolhido.
**Path:** [skills/improve-codebase-architecture/SKILL.md](skills/improve-codebase-architecture/SKILL.md)
**Suporte:**
- [LANGUAGE.md](skills/improve-codebase-architecture/LANGUAGE.md) — glossário canônico
- [DEEPENING.md](skills/improve-codebase-architecture/DEEPENING.md) — táticas de aprofundamento
- [INTERFACE-DESIGN.md](skills/improve-codebase-architecture/INTERFACE-DESIGN.md) — design alternativo

**Checkpoints:**
- Quando os candidatos numerados saem, salvar em `02-architecture-candidates.md`
- A cada decisão fechada no grilling embutido, **append em `03-decisions.md`**

### Fase 3 — `diagnose`
**Sinal de entrada:** bug específico, regressão, "isso tá quebrado".
**Saída esperada:** feedback loop reproduzível → hipóteses → causa raiz → teste de regressão.
**Path:** [skills/diagnose/SKILL.md](skills/diagnose/SKILL.md)
**Princípio:** sem feedback loop rápido (passa/falha determinístico), nada do resto funciona.
**Checkpoint:** opcional. Se a investigação descobrir fricção arquitetural, append em `03-decisions.md`.

### Fase 4 — `grill-me`
**Sinal de entrada:** plano vindo de fora da Fase 2; quer estressar antes de implementar.
**Saída esperada:** entrevista pergunta-a-pergunta com resposta recomendada do agente.
**Path:** [skills/grill-me/SKILL.md](skills/grill-me/SKILL.md)
**Checkpoint:** append em `03-decisions.md` a cada decisão fechada (mesma disciplina da Fase 2).

### Fase 6 — `to-spec`
**Sinal de entrada:** sessão de review chegou ao fim com decisões fechadas; quer transformar em plano implementável.
**Saída esperada:** `04-spec.md` (ou no projeto-alvo) com Module Map, Interface Changes, File-Level Changes, Migration, Tests, Rollback, Acceptance Criteria.
**Path:** [skills/to-spec/SKILL.md](skills/to-spec/SKILL.md)
**Pré-requisito:** os 3 checkpoints anteriores existem.

---

## Disciplina de Checkpoint

**Por que existe:** o grilling pode durar 30+ trocas. Sem persistência incremental, o contexto comprime e detalhes finos viram resumo lossy. Checkpoints incrementais protegem o trabalho e permitem retomar a sessão depois.

### Estrutura de pasta

```
review-outputs/
└── <projeto>/
    └── <YYYY-MM-DD>-<topic-slug>/
        ├── 01-zoom-out.md                ← criado APÓS Fase 1
        ├── 02-architecture-candidates.md ← criado quando candidatos saem na Fase 2
        ├── 03-decisions.md               ← APPEND a cada decisão fechada (Fases 2/4)
        └── 04-spec.md                    ← criado pela Fase 6 (ou vai pro projeto-alvo)
```

`<projeto>` é o nome da raiz do projeto-alvo. `<topic-slug>` é uma frase curta sobre o que a sessão revisou (ex: `services-memory`, `auth-cleanup`).

### Quando salvar (modo automático)

| Momento | Arquivo | Como |
|---|---|---|
| Fim da Fase 1 | `01-zoom-out.md` | Salvar **automaticamente** sem perguntar. Mostrar `✓ checkpoint salvo: 01-zoom-out.md` |
| Lista de candidatos saiu na Fase 2 | `02-architecture-candidates.md` | **Automaticamente** |
| Decisão fechada no grilling | `03-decisions.md` | **Append automático** (modo silencioso) |
| Geração de SPEC | `04-spec.md` ou `<projeto>/specs/...` | **Perguntar antes** — caminho varia por projeto |

A regra: tudo que vai pra `review-outputs/` é silencioso. Tudo que pode tocar o projeto-alvo precisa de confirmação.

### Template de cada checkpoint

#### `01-zoom-out.md`
```markdown
# Zoom-out: <projeto>
**Data:** <YYYY-MM-DD>

## O que é o sistema
<resumo de 2-3 frases>

## Vocabulário de domínio
<tabela termo → significado, extraído do README/CONTEXT/ADRs ou inferido>

## Mapa de módulos top-level
<por subdiretório/pacote: o que faz, dependências>

## Fluxos principais
<chamadores: quem invoca quem nos cenários típicos>

## Hotspots de complexidade
<2-4 áreas que pediriam Fase 2>

## O que não foi mapeado
<honestidade sobre buracos da exploração>
```

#### `02-architecture-candidates.md`
```markdown
# Architecture Candidates: <projeto>/<área>
**Data:** <YYYY-MM-DD>
**Source:** 01-zoom-out.md

## Candidato 1 — <título>
- **Files:** ...
- **Problema:** ...
- **Solução:** ...
- **Benefícios (locality/leverage/testes):** ...

## Candidato 2 — ...

## Ranking de payoff/risco
| # | Candidato | Payoff | Risco |

## Escolha do usuário
<candidato N — preencher quando usuário escolher>
```

#### `03-decisions.md` (append-only)

Inicia com header. Cada decisão fechada vira uma seção `## DN — ...` apendada no fim:

```markdown
# Decisions: <projeto>/<área>
**Data início:** <YYYY-MM-DD>
**Candidato escolhido:** <referência ao 02-...>

---

## D1 — <pergunta resumida>
- **Pergunta:** <pergunta completa do agente>
- **Opções consideradas:** <A, B, C>
- **Decisão:** <escolhida>
- **Razão:** <justificativa do usuário ou aceitação da recomendação do agente>
- **Implica:** <consequências pro design subsequente>
- **Timestamp:** <HH:MM>

---

## D2 — ...
```

#### `04-spec.md`
Definido pelo `to-spec` skill — ver [skills/to-spec/SKILL.md](skills/to-spec/SKILL.md).

### Como retomar uma sessão

Em uma nova sessão, o usuário aponta a pasta:

> *"Continua a review em `review-outputs/agent-smith/2026-05-02-services-memory/`"*

O agente:
1. Lê os 3 arquivos existentes
2. Identifica em qual fase a sessão parou (última decisão em `03-decisions.md` indica progresso do grilling)
3. Resume o estado pro usuário em 2-3 linhas
4. Aguarda comando: continuar grilling? gerar SPEC? abrir nova ramificação?

---

## Sequência típica de uma sessão completa

1. **Usuário pede review de uma área da codebase**
2. Claude entra em **`zoom-out`** → produz mapa → **salva `01-zoom-out.md`**
3. Claude entra em **`improve-codebase-architecture`** → lista candidatos → **salva `02-architecture-candidates.md`** → usuário escolhe → **grilling embutido** → cada decisão fechada → **append em `03-decisions.md`**
4. *(Se um bug específico aparecer)* → desvia pra **`diagnose`** → volta pro fluxo
5. *(Se um plano vier de fora)* → **`grill-me`** → mesma disciplina de append em `03-decisions.md`
6. Quando decisões estão fechadas → usuário pede **`to-spec`** → gera **`04-spec.md`** (ou no projeto-alvo)
7. Implementação fica fora deste pacote.

---

## O que este pacote NÃO faz

- Não modifica código do projeto-alvo durante a review
- Não cria issues/tickets em issue tracker
- Não atualiza CONTEXT.md, ADRs ou docs do projeto-alvo
- Não roda lint/build/testes
- Não implementa a SPEC gerada (esse é trabalho de outra sessão)

Os artefatos em `review-outputs/` são registros da review, não documentação do projeto. A SPEC final pode ir pro projeto-alvo se você decidir (default: pasta `specs/` se existir).

---

## Como instalar

### Opção A — Pasta portátil (recomendada para teste)
Copie `review-workflow-skills/` pra raiz do projeto-alvo. Aponte na primeira mensagem:
> *"Tem `review-workflow-skills/` aqui. Lê `WORKFLOW.md` e roda zoom-out no projeto."*

### Opção B — Skills nativas do Claude Code
Mova `skills/*` pra `.claude/skills/` (projeto) ou `~/.claude/skills/` (global). Auto-discovery via frontmatter.

Ver [PIPELINE-PRD.md](PIPELINE-PRD.md) para detalhes operacionais e exemplos.
