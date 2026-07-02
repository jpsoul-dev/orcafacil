# Relatório de Auditoria de Segurança — [Nome do Projeto]

**Data:** [DD/MM/AAAA] · **Escopo:** [ex: repositório completo, branch main] · **Metodologia:** Whitebox (revisão de código-fonte) · **Auditor:** Security Audit Expert (Claude)

---

## Resumo Executivo

[3-5 linhas: postura geral de segurança do projeto, o principal risco encontrado, e um veredito direto sobre se a aplicação está pronta para produção/dados sensíveis/pagamentos ou não. Seja honesto — se está bom, diga que está bom.]

**Contagem de achados:** 🔴 [N] Crítico(s) · 🟠 [N] Alto(s) · 🟡 [N] Médio(s) · 🔵 [N] Baixo(s) · ⚪ [N] Informativo(s)

**Top 3 prioridades:**
1. [achado mais urgente em uma linha]
2. [segundo mais urgente]
3. [terceiro mais urgente]

---

## 🔴 Achados Críticos

### [SEC-01] [Título curto e direto]

- **Severidade:** 🔴 Crítico
- **Categoria:** [ex: Segredos Expostos / Autorização / IDOR / Autenticação / Injeção / Pagamentos]
- **Localização:** `[caminho/do/arquivo.ts]`, linha [N]
- **Descrição:** [o que está errado, em termos técnicos claros e específicos]
- **Cenário de exploração:** [narrativa curta: quem é o atacante, o que ele já precisa ter/saber, qual ação ele executa, o que ele ganha com isso]
- **Evidência:**
  ```typescript
  // trecho real do código do projeto
  ```
- **Correção sugerida:**
  ```typescript
  // trecho corrigido, pronto para aplicar
  ```
- **Referência:** [ex: OWASP A01:2021 – Broken Access Control / CWE-639]

[repetir bloco para cada achado crítico]

---

## 🟠 Achados de Alta Severidade

[mesmo formato de bloco acima, prefixo SEC-XX contínuo]

---

## 🟡 Achados de Média Severidade

[mesmo formato]

---

## 🔵 Achados de Baixa Severidade / Hardening

[mesmo formato — pode ser mais sucinto, sem necessariamente cenário de exploração completo]

---

## ⚪ Observações e Notas de Conformidade

[Notas sobre LGPD (se aplicável — ex: dados pessoais coletados sem política de privacidade vinculada, ausência de mecanismo de exclusão de conta/dados) e outros pontos que merecem decisão consciente do time sem serem exatamente vulnerabilidades técnicas.]

---

## ✅ Pontos Fortes

[O que já está implementado corretamente. Sempre incluir, mesmo que a lista seja curta — reconhecer o que protege a aplicação é parte de um relatório confiável, não só apontar falhas.]

- [ponto forte 1]
- [ponto forte 2]

---

## 📋 Plano de Ação Priorizado

**Corrigir antes de qualquer deploy adicional:**
- [ ] [SEC-01] [ação]
- [ ] [SEC-02] [ação]

**Corrigir nesta semana:**
- [ ] [SEC-XX] [ação]

**Quando houver disponibilidade (hardening):**
- [ ] [SEC-XX] [ação]

---

## Apêndice — Escopo e Limitações

[O que foi e não foi coberto nesta auditoria. Ex: "Esta auditoria cobriu revisão estática do código-fonte (whitebox). Não incluiu teste de penetração ativo contra ambiente de produção, teste de infraestrutura de rede/DNS, nem análise dinâmica de dependências de terceiros além da checagem de versões conhecidas. Recomenda-se revisão periódica conforme o código evolui."]
