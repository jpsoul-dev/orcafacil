# Relatório de Auditoria de Performance — [Nome do Projeto]

**Data:** [DD/MM/AAAA] · **Escopo:** [ex: varredura completa / rota /catalog / sintoma relatado] · **Ambiente(s) analisado(s):** [dev local / staging / produção]
**Metodologia:** Whitebox (revisão de código-fonte) [+ sintomas relatados pelo usuário, se aplicável] · **Auditor:** Performance Audit Expert (Claude)

---

## Resumo Executivo

[3-5 linhas: postura geral de performance do projeto, o gargalo mais impactante encontrado, e um veredito direto sobre se a experiência atual está dentro do aceitável para os Core Web Vitals. Seja honesto — se está bom, diga que está bom.]

**Contagem de achados:** 🔴 [N] Crítico(s) · 🟠 [N] Alto(s) · 🟡 [N] Médio(s) · 🔵 [N] Baixo(s) · ⚪ [N] Informativo(s)

**Top 3 prioridades:**
1. [achado de maior impacto perceptível em uma linha]
2. [segundo]
3. [terceiro]

**Core Web Vitals (se medidos com Lighthouse/Speed Insights ou estimados a partir do código):**

| Métrica | Valor | Faixa |
|---|---|---|
| LCP | [Xs] | [🟢 Bom / 🟡 Precisa melhorar / 🔴 Ruim] |
| INP | [Xms] | [🟢 / 🟡 / 🔴] |
| CLS | [X] | [🟢 / 🟡 / 🔴] |
| TTFB | [Xs] | [🟢 / 🟡 / 🔴] |

_Se não houver dados medidos, remover a tabela e indicar no Apêndice que os valores acima não puderam ser confirmados nesta rodada — recomendar Lighthouse/Speed Insights para a próxima._

---

## 🔴 Achados Críticos

### [PERF-01] [Título curto e direto]

- **Severidade:** 🔴 Crítico
- **Categoria:** [Rendering / Cache / Data Fetching / Bundle / Banco de Dados / Infra / Client Runtime]
- **Localização:** `[caminho/do/arquivo.tsx]`, linha [N]
- **Ambiente onde se manifesta:** [dev local / staging / produção / todos]
- **Descrição:** [o que está acontecendo, em termos técnicos claros e específicos]
- **Impacto:** [métrica afetada e magnitude aproximada]
- **Evidência:**
  ```typescript
  // trecho real do código do projeto
  ```
- **Correção sugerida:**
  ```typescript
  // trecho corrigido, pronto para aplicar
  ```
- **Como validar a correção:** [ex: medir novamente com Lighthouse, comparar tempo de resposta]

[repetir bloco para cada achado crítico]

---

## 🟠 Achados de Alta Severidade

[mesmo formato de bloco acima, prefixo PERF-XX contínuo]

---

## 🟡 Achados de Média Severidade

[mesmo formato]

---

## 🔵 Achados de Baixa Severidade / Hardening

[mesmo formato — pode ser mais sucinto]

---

## ⚪ Observações e Notas

[Pontos que merecem decisão consciente do time sem serem exatamente gargalos confirmados — ex: suspeita de índice de banco ausente sem acesso para confirmar, falta de monitoramento de Web Vitals em produção, decisões arquiteturais.]

---

## ✅ Pontos Fortes

[O que já está bem otimizado. Sempre incluir, mesmo que a lista seja curta — reconhecer o que já funciona bem é parte de um relatório confiável, não só apontar problemas.]

- [ponto forte 1]
- [ponto forte 2]

---

## 📋 Plano de Ação Priorizado

**Corrigir antes do próximo deploy:**
- [ ] [PERF-01] [ação]
- [ ] [PERF-02] [ação]

**Corrigir nesta semana:**
- [ ] [PERF-XX] [ação]

**Quando houver disponibilidade (hardening):**
- [ ] [PERF-XX] [ação]

---

## Apêndice — Escopo e Limitações

[O que foi e não foi coberto nesta auditoria. Ex: "Esta auditoria cobriu revisão estática do código-fonte (whitebox) do escopo indicado. Não incluiu medição ao vivo de Core Web Vitals em produção — recomenda-se rodar Lighthouse/Vercel Speed Insights e anexar os resultados numa próxima rodada. Suspeitas de índice de banco ausente não puderam ser confirmadas sem acesso a `EXPLAIN ANALYZE` no ambiente real."]
