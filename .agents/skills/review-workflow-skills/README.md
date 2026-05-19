# Review Workflow Skills

> Pipeline de 6 fases para revisar uma codebase, capturar decisões arquiteturais incrementalmente e gerar uma SPEC implementável no fim — **sem modificar código do projeto-alvo**.

> **Se você é um agente lendo este pacote:** este README é manual humano — pula pra [WORKFLOW.md](WORKFLOW.md), que é o entry point operacional com protocolo de fases, templates de checkpoint e regras de salvamento. Use este README só pra orientação geral. Detalhes de cada fase ficam em `skills/<fase>/SKILL.md`.

---

## O que é

Pacote LionLab de skills portáteis que transforma uma sessão de conversa com agente em um processo estruturado de **review de arquitetura**. Cada fase do pipeline é uma skill independente, com vocabulário arquitetural compartilhado e disciplina de persistência incremental — o que significa que sessões longas não perdem trabalho mesmo se o contexto comprimir.

**Resultado de uma sessão:** uma SPEC implementável + 3 artefatos de checkpoint que registram o caminho até ela.

---

## Quando usar

✅ **Use este pacote quando você quer:**
- Mapear uma codebase desconhecida ("o que é esse projeto?")
- Identificar oportunidades de refatoração arquitetural com vocabulário rigoroso
- Estressar um plano de design antes de implementar
- Diagnosticar bugs difíceis com método (feedback loop → bissecção → causa raiz)
- Sair de uma sessão de review com **plano executável**, não com "boas ideias"

❌ **NÃO use quando você quer:**
- Implementar código (este pacote produz plano, não código)
- Criar PRDs/issues/tickets em sistemas externos
- Atualizar CONTEXT.md/ADRs/docs do projeto-alvo
- Code review de PR específico (use ferramenta de review de diff)
- Quick fix de uma linha

---

## Quick start (3 passos)

### 1. Coloque o pacote no projeto-alvo

```bash
# Opção A — pasta portátil (mais simples)
cp -r review-workflow-skills/ <seu-projeto>/

# Opção B — skills nativas do Claude Code
cp -r review-workflow-skills/skills/* <seu-projeto>/.claude/skills/
```

### 2. Inicie a sessão apontando o WORKFLOW

> *"Tem `review-workflow-skills/` no projeto. Lê o `WORKFLOW.md` e roda zoom-out no projeto inteiro."*

### 3. Siga as frases-gatilho conforme avança

| Fase | Frase pra falar com o agente |
|---|---|
| 1 — Mapa | *"Roda zoom-out no projeto inteiro."* |
| 2 — Análise | *"Roda improve-codebase-architecture em `<pasta>`."* |
| 2 — Escolher | *"Vamos falar do candidato N."* |
| 3 — Bug | *"Diagnostique: `<bug>`."* |
| 4 — Pressão | *"Grill me sobre este plano."* |
| 6 — SPEC | *"Gera spec da sessão."* |
| Retomar | *"Continua a review em `review-outputs/<projeto>/<sessao>/`."* |

---

## As 6 fases

```
1. zoom-out  →  2. improve-codebase-architecture  →  3. diagnose  →  4. grill-me  →  5. decisions  →  6. to-spec
   (mapa)        (análise + grilling)               (cond.)         (cond.)         (persistência)   (entregável)
```

| # | Fase | Função | Output |
|---|---|---|---|
| 1 | **zoom-out** | Mapa de alto nível: módulos, vocabulário de domínio, fluxos, hotspots | `01-zoom-out.md` |
| 2 | **improve-codebase-architecture** | Lista numerada de candidatos de aprofundamento + grilling sobre o escolhido | `02-architecture-candidates.md` + `03-decisions.md` (append) |
| 3 | **diagnose** *(condicional)* | Loop disciplinado de debug: feedback loop → hipóteses → causa raiz → teste | append em `03-decisions.md` se descobrir fricção |
| 4 | **grill-me** *(condicional)* | Entrevista pergunta-a-pergunta sobre um plano que veio de fora | append em `03-decisions.md` |
| 5 | **decisions** *(disciplina)* | Não é skill — é o append automático de cada decisão fechada nas fases 2/4 | mantém `03-decisions.md` vivo |
| 6 | **to-spec** | Lê os 3 checkpoints + re-explora codebase + gera SPEC implementável | `04-spec.md` ou `<projeto>/specs/<topic>.md` |

**Fases 3 e 4 são condicionais.** Pipeline mínimo é 1 → 2 → 6. Fases 3/4 entram quando aparece bug específico ou plano externo a estressar.

---

## Disciplina de checkpoint (a chave do pacote)

O grilling de uma decisão pode durar 30+ trocas. Sem persistência incremental, o contexto comprime e detalhes finos viram resumo lossy. Solução: salvar checkpoints **a cada marco**, não no fim.

```
review-outputs/
└── <projeto>/
    └── <YYYY-MM-DD>-<topic>/
        ├── 01-zoom-out.md                ← auto, fim da Fase 1
        ├── 02-architecture-candidates.md ← auto, candidatos saem
        ├── 03-decisions.md               ← APPEND auto, cada decisão fechada
        └── 04-spec.md                    ← Fase 6, com confirmação de path
```

**Regra de salvamento:**

| Destino | Modo |
|---|---|
| `review-outputs/...` (registro de trabalho) | **Auto silencioso** |
| `<projeto>/...` (artefato no projeto-alvo) | **Pergunta antes** |

**Como retomar amanhã:** abrir nova sessão e dizer *"continua a review em `review-outputs/<projeto>/<sessao>/`"*. O agente lê os 3 arquivos e retoma exatamente onde parou.

---

## Vocabulário arquitetural

Todo o pipeline usa estes termos com precisão. **Não substitua** por "componente", "serviço", "API" ou "boundary" — a consistência é o que faz a conversa convergir rápido.

| Termo | Significado curto |
|---|---|
| **Module** | Qualquer coisa com interface + implementação (função, classe, pacote) |
| **Interface** | Tudo que o chamador precisa saber: tipos, invariantes, modos de erro, ordenação |
| **Implementation** | Corpo interno do module |
| **Depth** | Leverage por unidade de interface. **Deep** = muito comportamento atrás de interface pequena |
| **Seam** | Onde a interface existe; lugar onde comportamento muda sem editar in-place |
| **Adapter** | Coisa concreta que satisfaz uma interface em um seam |
| **Leverage** | Ganho dos chamadores quando um module é deep |
| **Locality** | Ganho dos mantenedores: bugs/mudanças/conhecimento concentrados num lugar |

**3 princípios canônicos:**
- **Deletion test** — se eu deletar este module, a complexidade some (era pass-through) ou reaparece em N chamadores (estava cumprindo papel)?
- **Interface é a superfície de teste** — chamadores e testes cruzam o mesmo seam
- **Um adapter = seam hipotético; dois adapters = seam real** — não introduza seam sem variação real

Glossário completo: [skills/improve-codebase-architecture/LANGUAGE.md](skills/improve-codebase-architecture/LANGUAGE.md).

---

## Estrutura do pacote

```
review-workflow-skills/
├── README.md                                      ← você está aqui
├── PIPELINE-PRD.md                                ← manual humano detalhado
├── WORKFLOW.md                                    ← entry point pro agente (templates de checkpoint)
└── skills/
    ├── zoom-out/SKILL.md                          ← Fase 1
    ├── improve-codebase-architecture/             ← Fase 2
    │   ├── SKILL.md
    │   ├── LANGUAGE.md                            ← glossário arquitetural
    │   ├── DEEPENING.md                           ← táticas de aprofundamento
    │   └── INTERFACE-DESIGN.md                    ← design alternativo de interfaces
    ├── diagnose/SKILL.md                          ← Fase 3
    ├── grill-me/SKILL.md                          ← Fase 4
    └── to-spec/SKILL.md                           ← Fase 6
```

---

## Quando ler qual doc

| Você é... | Leia primeiro |
|---|---|
| **Humano querendo entender o pipeline** | Este README |
| **Humano querendo detalhes operacionais** | [PIPELINE-PRD.md](PIPELINE-PRD.md) |
| **Agente abrindo a pasta numa sessão nova** | [WORKFLOW.md](WORKFLOW.md) — tem o protocolo + templates |
| **Agente precisando de vocabulário arquitetural** | [skills/improve-codebase-architecture/LANGUAGE.md](skills/improve-codebase-architecture/LANGUAGE.md) |
| **Agente em fase específica** | `skills/<fase>/SKILL.md` correspondente |

---

## Exemplo de sessão real

Sessão executada no projeto `Agent Smith v6.2` durante a montagem deste pacote:

```
[Usuário] "Roda zoom-out no projeto inteiro"
   ↓
[Agente] Mapa: stack polyglot Next.js + FastAPI + Docling, 31 services, 6 hotspots
   ↓ ✓ 01-zoom-out.md

[Usuário] "Roda nos services"
   ↓
[Agente] 6 candidatos numerados. Top: split do memory_service (68KB)
   ↓ ✓ 02-architecture-candidates.md

[Usuário] "Split memory services vamos falar deles"
   ↓
[Agente] Pergunta 1: "duplicação sync/async é histórica ou deliberada?"
[Usuário] "histórica"
   ↓ ✓ append D1: colapsar pra async-only

[Agente] Pergunta 2: "Opção A (split em 2) vs Opção B (deep module único)?"
[Usuário] "opção A"
   ↓ ✓ append D2: subpacote services/memory/ com service.py + summarization.py + long_term.py

[Agente] Forma proposta + 3 sub-perguntas pendentes
   ...
[Usuário] "Gera spec"
   ↓
[Agente] Lê os 3 checkpoints, re-explora codebase, gera 04-spec.md
```

A sessão demonstrou: nenhum arquivo do projeto-alvo modificado, decisões persistidas tornaram a sessão retomável, output final pronto pra ser implementado por outro agente.

---

## Limites

- **Não modifica código.** Só lê.
- **Não cria docs no projeto-alvo** (exceto SPEC final, com confirmação explícita).
- **Não roda lint, build ou testes.**
- **Não publica em issue tracker.**
- Skills de geração de PRD/issues, triagem, atualização de docs e TDD **foram propositalmente excluídas** deste pacote — para mantê-lo focado em "review puro + entregável final".

---

## Sobre o pacote

Pacote **LionLab** de review de arquitetura. Mantém duas extensões próprias além das skills de fase:
- **Disciplina de checkpoint incremental** (descrita em [WORKFLOW.md](WORKFLOW.md))
- **Skill `to-spec`** (descrita em [skills/to-spec/SKILL.md](skills/to-spec/SKILL.md))

A escolha de quais skills entram (e quais não) é deliberada: o pacote prioriza **análise estrutural + entregável implementável** sobre geração de documentação de produto.

---

## Pra começar agora

```
"Tem `review-workflow-skills/` no projeto. Lê o WORKFLOW.md e roda zoom-out no projeto inteiro."
```

Resto sai por conversa.
