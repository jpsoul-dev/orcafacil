# Pipeline de Review de Codebase — PRD

> Documento de referência para aplicar este pacote de skills em qualquer projeto.
> **Audiência:** o usuário/operador. Pra orientação interna do agente, ver [WORKFLOW.md](WORKFLOW.md).

---

## 1. O que é

Pipeline LionLab de **6 fases** para revisar uma codebase com profundidade crescente e terminar com uma **SPEC implementável**. Inclui duas extensões próprias (disciplina de checkpoint + `to-spec`).

```
1. zoom-out  →  2. improve-codebase-architecture  →  3. diagnose  →  4. grill-me  →  5. decisions  →  6. to-spec
   (mapa)        (análise + grilling)               (cond.)         (cond.)         (persistência)   (entregável)
```

**Pré-requisito único:** ter a pasta `review-workflow-skills/` acessível ao agente. Não depende de:
- Linguagem do projeto-alvo
- Stack específica
- Existência de `CONTEXT.md`, ADRs, ou docs prévias (lidas se existirem, ignoradas se não)
- Issue tracker, CI ou ferramentas externas

**O que o pipeline NÃO faz:**
- Não modifica código do projeto-alvo
- Não cria issues/tickets em sistemas externos
- Não atualiza CONTEXT.md/ADRs/docs do projeto
- Não escreve testes nem implementa a SPEC
- Não roda lint, build ou suite de testes

O resultado é uma **SPEC implementável** + os checkpoints que a originaram. A implementação acontece em sessão separada.

---

## 2. Estrutura do pacote

```
review-workflow-skills/
├── PIPELINE-PRD.md                                    ← este documento
├── WORKFLOW.md                                        ← entry point do agente
└── skills/
    ├── zoom-out/SKILL.md                              ← Fase 1
    ├── improve-codebase-architecture/                 ← Fase 2
    │   ├── SKILL.md
    │   ├── LANGUAGE.md                                ← glossário arquitetural
    │   ├── DEEPENING.md                               ← táticas de aprofundamento
    │   └── INTERFACE-DESIGN.md                        ← design alternativo
    ├── diagnose/SKILL.md                              ← Fase 3 (condicional)
    ├── grill-me/SKILL.md                              ← Fase 4 (condicional)
    └── to-spec/SKILL.md                               ← Fase 6
```

**Fase 5 (decisions) não tem skill própria** — é a disciplina de checkpoint executada pelo agente em paralelo às fases 2 e 4.

---

## 3. Vocabulário arquitetural

Definido em [skills/improve-codebase-architecture/LANGUAGE.md](skills/improve-codebase-architecture/LANGUAGE.md). Use estes termos exatamente — não substitua por "componente", "serviço", "API" ou "boundary".

| Termo | Significado curto |
|---|---|
| **Module** | Qualquer coisa com interface + implementação (função, classe, pacote, slice) |
| **Interface** | Tudo que o chamador precisa saber: tipos, invariantes, modos de erro, ordenação |
| **Implementation** | Corpo interno do module |
| **Depth** | Leverage por unidade de interface. Deep = muito comportamento atrás de interface pequena |
| **Seam** | Onde a interface existe; lugar onde comportamento pode ser alterado sem editar no local |
| **Adapter** | Coisa concreta que satisfaz uma interface em um seam |
| **Leverage** | Ganho dos chamadores quando um module é deep |
| **Locality** | Ganho dos mantenedores: mudanças/bugs/conhecimento concentrados num lugar |

**Princípios canônicos:**
- **Deletion test:** se eu deletar este module, a complexidade desaparece (era pass-through) ou reaparece em N chamadores (estava cumprindo papel)?
- **Interface é a superfície de teste.**
- **Um adapter = seam hipotético; dois adapters = seam real.** Não introduza seam sem variação real.

---

## 4. As 6 fases do pipeline

### Fase 1 — `zoom-out` 🗺️
**Arquivo:** [skills/zoom-out/SKILL.md](skills/zoom-out/SKILL.md)

| Item | Detalhe |
|---|---|
| **Quando entrar** | Início de qualquer sessão de review. "Não conheço esta codebase" |
| **Como invocar** | *"Roda zoom-out no projeto inteiro"* |
| **O que o agente faz** | Lê README/CONTEXT/ADRs se existirem → lista módulos top-level → identifica chamadores → extrai vocabulário de domínio |
| **Output** | Mapa em markdown + 2-4 hotspots pra Fase 2 |
| **Checkpoint** | Ao terminar, salva **automaticamente** em `review-outputs/<projeto>/<sessao>/01-zoom-out.md` |
| **Próxima fase** | Fase 2 (refatoração) ou Fase 3 (bug específico) |

---

### Fase 2 — `improve-codebase-architecture` 🏗️
**Arquivo:** [skills/improve-codebase-architecture/SKILL.md](skills/improve-codebase-architecture/SKILL.md)

| Item | Detalhe |
|---|---|
| **Quando entrar** | Tem mapa, quer oportunidades de aprofundamento |
| **Como invocar** | *"Roda improve-codebase-architecture em `<pasta>`"* |
| **O que o agente faz** | Explora a área → aplica deletion test → identifica modules shallow, seams hipotéticos → produz **lista numerada de candidatos** |
| **Output** | Candidatos com Files/Problema/Solução/Benefícios + ranking |
| **Checkpoint 1** | Quando candidatos saem → salva `02-architecture-candidates.md` |
| **Grilling embutido** | Usuário escolhe candidato → agente entra em entrevista pergunta-a-pergunta com resposta recomendada |
| **Checkpoint 2** | A cada decisão fechada → **append em `03-decisions.md`** |
| **Próxima fase** | Fase 6 (`to-spec`) quando decisões estão fechadas |

**Importante:** o agente **não propõe interfaces ainda** ao listar candidatos. Só lista e pergunta qual explorar. Quando você escolhe, entra em conversa de grilling automaticamente.

---

### Fase 3 — `diagnose` 🔬 *(condicional)*
**Arquivo:** [skills/diagnose/SKILL.md](skills/diagnose/SKILL.md)

| Item | Detalhe |
|---|---|
| **Quando entrar** | Bug específico aparece a qualquer momento da sessão |
| **Como invocar** | *"Diagnostique este bug"* |
| **O que o agente faz** | **Fase central:** construir feedback loop reproduzível (teste falhando, curl, harness, fuzz, bissecção) → hipóteses → instrumentar → corrigir → teste de regressão |
| **Output** | Causa raiz + estratégia de correção + teste preventivo |
| **Princípio crítico** | Sem feedback loop rápido, nada funciona |
| **Checkpoint** | Opcional — se descobrir fricção arquitetural, append em `03-decisions.md` |

---

### Fase 4 — `grill-me` 🔥 *(condicional)*
**Arquivo:** [skills/grill-me/SKILL.md](skills/grill-me/SKILL.md)

| Item | Detalhe |
|---|---|
| **Quando entrar** | Você tem um plano vindo de fora da Fase 2 e quer estressar |
| **Como invocar** | *"Grill me sobre este plano"* |
| **O que o agente faz** | Entrevista pergunta-a-pergunta, **uma de cada vez**, com resposta recomendada |
| **Checkpoint** | Mesma disciplina da Fase 2 — append em `03-decisions.md` |

---

### Fase 5 — `decisions` 📝 *(disciplina, não skill)*

**Não é uma skill ativa.** É a disciplina de checkpoint que roda em paralelo às fases 2 e 4. Veja [seção 6](#6-disciplina-de-checkpoint) abaixo.

---

### Fase 6 — `to-spec` 🛠️
**Arquivo:** [skills/to-spec/SKILL.md](skills/to-spec/SKILL.md)

| Item | Detalhe |
|---|---|
| **Quando entrar** | Decisões estão fechadas; quer transformar em plano implementável |
| **Como invocar** | *"Gera spec da sessão"* / *"Fecha com SPEC"* |
| **Pré-requisito** | `01-zoom-out.md`, `02-architecture-candidates.md`, `03-decisions.md` existem |
| **O que o agente faz** | Lê os 3 checkpoints → re-explora codebase atual → checa drift → gera SPEC |
| **Output** | `04-spec.md` (em `review-outputs/`) ou `<projeto>/specs/<topic>.md` (no projeto-alvo) — agente pergunta antes |
| **SPEC contém** | Goal, Decisions, Module Map, Interface Changes, File-Level Changes, Migration, Tests, Rollback, Acceptance Criteria, Open Questions |

---

## 5. Estrutura de outputs

```
review-outputs/
└── <projeto>/                                    ← nome da raiz do projeto-alvo
    └── <YYYY-MM-DD>-<topic-slug>/                ← uma sessão de review
        ├── 01-zoom-out.md                        ← Fase 1 (auto)
        ├── 02-architecture-candidates.md         ← Fase 2 entrada (auto)
        ├── 03-decisions.md                       ← Fases 2/4, append-only (auto)
        └── 04-spec.md                            ← Fase 6 (com confirmação)
```

`<topic-slug>` é frase curta do que a sessão revisou: `services-memory`, `auth-cleanup`, `ucp-providers`.

A SPEC pode alternativamente ir pra **dentro do projeto-alvo** se o projeto já tem padrão `specs/` ou `SPEC.md` na raiz. O agente pergunta antes.

---

## 6. Disciplina de Checkpoint

### Por que existe

O grilling de uma decisão arquitetural pode durar 30+ trocas. Sem persistência incremental:
- Contexto comprime → detalhes finos viram resumo lossy
- Sessão fechada → trabalho perdido
- Não dá pra retomar amanhã

Checkpoint incremental resolve os três.

### Regras

| Quando | Arquivo | Modo |
|---|---|---|
| Fim da Fase 1 | `01-zoom-out.md` | **Auto, silencioso** |
| Candidatos saem na Fase 2 | `02-architecture-candidates.md` | **Auto, silencioso** |
| Decisão fechada no grilling | `03-decisions.md` | **Append auto, silencioso** |
| Geração de SPEC | `04-spec.md` ou `<projeto>/specs/...` | **Pergunta antes** — caminho varia |

A regra: tudo em `review-outputs/` é silencioso (registro de trabalho, não toca o projeto). Tudo que pode tocar o projeto-alvo pede confirmação.

### Como retomar uma sessão

```
[Nova sessão, dia seguinte]
> "Continua a review em review-outputs/agent-smith/2026-05-02-services-memory/"

[Agente lê os 3 arquivos]
> "Tenho 2 decisões fechadas (D1: sync/async histórico → colapsar; 
>  D2: Opção A — split externo). Pergunta 3 ainda aberta: 
>  forma da fachada (orquestradora vs delegação). Continuamos daí?"
```

Esse é o ganho real do checkpoint incremental — sessão deixa de ser efêmera.

### Templates dos checkpoints

Definidos em [WORKFLOW.md](WORKFLOW.md#disciplina-de-checkpoint).

---

## 7. Sequência típica de uma sessão completa

```
[Usuário] "Roda zoom-out no projeto"
   ↓
[Agente] mapa + vocabulário + 2-4 hotspots
   ↓ ✓ checkpoint salvo: 01-zoom-out.md
   ↓
[Usuário] "Roda improve-codebase-architecture em <hotspot>"
   ↓
[Agente] lista 5-7 candidatos numerados
   ↓ ✓ checkpoint salvo: 02-architecture-candidates.md
   ↓
[Usuário] "Vamos falar do candidato N"
   ↓
[Agente] entra em grilling embutido:
   • Pergunta 1 com resposta recomendada
   • [Usuário responde]
   ↓ ✓ append em 03-decisions.md (D1)
   • Pergunta 2 com resposta recomendada
   • [Usuário responde]
   ↓ ✓ append em 03-decisions.md (D2)
   • ... (percorre árvore de design)
   ↓
[Usuário] "Gera spec"
   ↓
[Agente] Lê os 3 checkpoints + re-explora codebase
   "Salvar em review-outputs/.../04-spec.md ou em <projeto>/specs/?"
   ↓
[Usuário] decide
   ↓
[Agente] gera SPEC
   ↓
[FIM] — implementação acontece em outra sessão
```

---

## 8. Sessão de validação executada

Pipeline foi validado neste projeto (`Agent Smith v6.2`) na seguinte sequência:

| Passo | Comando do usuário | Output do agente | Checkpoint gerado |
|---|---|---|---|
| 1 | *"ativa a skill"* | Mapa de `agent-smith-v6-deploy/` (stack polyglot, 31 services, 6 hotspots) | `01-zoom-out.md` |
| 2 | *"roda nos services"* | 6 candidatos numerados, top: split memory_service | `02-architecture-candidates.md` |
| 3 | *"split memory services"* | Pergunta 1: dualidade sync/async histórica? | (D1 pendente) |
| 4 | *"historica"* | Pergunta 2: Opção A vs B? | append D1 |
| 5 | *"opção A"* | Forma proposta + 3 sub-perguntas | append D2 |
| 6 | *"PRD do pipeline"* | Geração deste documento | — |

A sessão demonstrou: nenhum arquivo do projeto-alvo modificado, cada fase produziu artefato consumível pela seguinte, decisões persistidas tornaram a sessão retomável.

---

## 9. Como instalar em projeto novo

### Opção A — Pasta portátil (recomendado pra teste)

1. Copie `review-workflow-skills/` pra raiz do projeto-alvo
2. Abra sessão e mande:
   > *"Tem `review-workflow-skills/` no projeto. Lê `WORKFLOW.md` e roda zoom-out no projeto inteiro."*
3. Siga as frases-gatilho da seção 10 conforme avança

**Vantagem:** funciona em qualquer agente com leitura de arquivos.
**Desvantagem:** invocação manual; agente não auto-descobre skills.

### Opção B — Skills nativas do Claude Code

1. Mova `review-workflow-skills/skills/*` pra `.claude/skills/` (projeto) ou `~/.claude/skills/` (global)
2. Estrutura final:
   ```
   .claude/skills/
   ├── zoom-out/SKILL.md
   ├── improve-codebase-architecture/SKILL.md (+ LANGUAGE/DEEPENING/INTERFACE-DESIGN)
   ├── diagnose/SKILL.md
   ├── grill-me/SKILL.md
   └── to-spec/SKILL.md
   ```
3. Claude Code auto-descobre via frontmatter
4. Mantenha `WORKFLOW.md` + `PIPELINE-PRD.md` em local lido pelo agente (raiz do projeto, ou referenciado em CLAUDE.md)

**Vantagem:** auto-discovery; menor fricção.
**Desvantagem:** específico do Claude Code.

### Opção híbrida (recomendada pra uso contínuo)

Mantém `review-workflow-skills/` na raiz (com docs) **e** copia `skills/*` pra `.claude/skills/`. Skills auto-descobrem; documentos servem de manual humano e referência do pipeline.

---

## 10. Frases-gatilho prontas

| Fase | Frase |
|---|---|
| 0 — Setup | *"Tem `review-workflow-skills/` no projeto. Lê `WORKFLOW.md` antes de começar."* |
| 1 — Zoom-out | *"Roda zoom-out no projeto inteiro."* |
| 2 — Architecture | *"Roda improve-codebase-architecture em `<pasta>`."* |
| 2 — Avançar pra candidato | *"Vamos falar do candidato N."* |
| 3 — Diagnose | *"Diagnostique: `<bug>`."* |
| 4 — Grill | *"Grill me sobre este plano: `<plano>`."* |
| 6 — Spec | *"Gera spec da sessão."* / *"Fecha com SPEC."* |
| Retomar | *"Continua a review em `review-outputs/<projeto>/<sessao>/`."* |

---

## 11. Limites e quando NÃO usar

| Cenário | O que usar em vez |
|---|---|
| Implementar a SPEC gerada | Sessão separada — pipeline produz plano, não código |
| Criar PRD ou issues no tracker | Skill dedicada de geração de PRD/issues — fora deste pacote por escolha |
| Atualizar CONTEXT.md / ADRs | Skill dedicada de manutenção de docs — fora deste pacote |
| TDD / desenvolvimento test-first | Skill dedicada de TDD — fora deste pacote |
| Code review de PR específico | Pipeline diferente — revisão de diff, não de codebase |
| Quick fix de uma linha | Direto, sem pipeline |

---

## 12. Checklist pra "está pronto pra usar em outro projeto"

- [ ] `review-workflow-skills/` está na raiz do projeto-alvo (Opção A) ou `.claude/skills/` populado (Opção B)
- [ ] Agente tem acesso de leitura à pasta
- [ ] Frase de abertura aponta `WORKFLOW.md` ou invoca skill diretamente
- [ ] Pasta `review-outputs/` será criada na raiz do projeto-alvo (gerada automaticamente)
- [ ] Não há expectativa de que o pipeline edite código
- [ ] SPEC final será levada manualmente pra sessão de implementação

---

## 13. Referência rápida — arquivos do pacote

| Path | Função |
|---|---|
| [PIPELINE-PRD.md](PIPELINE-PRD.md) | Este doc — manual humano do pipeline |
| [WORKFLOW.md](WORKFLOW.md) | Entry point do agente — mapa do fluxo + disciplina de checkpoint |
| [skills/zoom-out/SKILL.md](skills/zoom-out/SKILL.md) | Fase 1 — orientação |
| [skills/improve-codebase-architecture/SKILL.md](skills/improve-codebase-architecture/SKILL.md) | Fase 2 — entry |
| [skills/improve-codebase-architecture/LANGUAGE.md](skills/improve-codebase-architecture/LANGUAGE.md) | Glossário arquitetural canônico |
| [skills/improve-codebase-architecture/DEEPENING.md](skills/improve-codebase-architecture/DEEPENING.md) | Categorias de dependência + disciplina de seam |
| [skills/improve-codebase-architecture/INTERFACE-DESIGN.md](skills/improve-codebase-architecture/INTERFACE-DESIGN.md) | "Design It Twice" — sub-agentes paralelos |
| [skills/diagnose/SKILL.md](skills/diagnose/SKILL.md) | Fase 3 — debug disciplinado |
| [skills/grill-me/SKILL.md](skills/grill-me/SKILL.md) | Fase 4 — pressão de plano |
| [skills/to-spec/SKILL.md](skills/to-spec/SKILL.md) | Fase 6 — gera SPEC implementável |
