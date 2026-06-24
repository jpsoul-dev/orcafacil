# Template — Relatório de Auditoria PWA

Use este template para gerar o relatório final. Preencha todas as seções com base na análise real do projeto. Não deixe placeholders — substitua ou remova seções que não se aplicam.

O arquivo gerado deve se chamar `pwa-audit-report.md`.

---

```markdown
# Relatório de Auditoria PWA
**Projeto:** [nome do projeto]  
**Data:** [data]  
**Auditado por:** PWA Expert  
**Stack:** [tecnologias identificadas]

---

## Resumo Executivo

[2-4 parágrafos diretos. O que foi analisado. Diagnóstico geral honesto. O principal problema que impede a experiência nativa hoje. O que o usuário vai ganhar ao implementar as recomendações.]

### Score por Dimensão

| Dimensão | Score | Status |
|---|---|---|
| Instalabilidade | X/10 | 🔴 Crítico / 🟡 Parcial / 🟢 OK |
| Service Worker & Cache | X/10 | |
| App Shell Architecture | X/10 | |
| Mobile UX Nativa | X/10 | |
| Performance Mobile | X/10 | |
| Funcionalidades Nativas | X/10 | |
| iOS Quirks | X/10 | |
| **TOTAL** | **X/70** | |

**Diagnóstico geral:** [Uma frase que resume o estado atual — ex: "Aplicação responsiva com estrutura básica de PWA mas sem experiência nativa real."]

---

## O que já está bem ✅

[Liste o que o projeto já tem correto. Seja específico. Ex: "manifest.json presente com display standalone", "service worker registrado", "ícones 192 e 512 configurados". Isso mostra que você leu o código de verdade.]

---

## Diagnóstico por Dimensão

### 1. Instalabilidade — [Score]/10

**Status atual:**
[Descrição do que foi encontrado — o que tem, o que falta, o que está errado]

**Problemas identificados:**
- ❌ [problema específico com localização no código se possível]
- ⚠️ [problema menor ou melhoria]

**Impacto na experiência nativa:**
[Como esse problema aparece para o usuário final — "O usuário não recebe o prompt de instalação porque..."]

---

### 2. Service Worker & Cache — [Score]/10

[mesmo formato]

---

### 3. App Shell Architecture — [Score]/10

[mesmo formato]

---

### 4. Mobile UX Nativa — [Score]/10

[mesmo formato]

---

### 5. Performance Mobile — [Score]/10

[mesmo formato]

---

### 6. Funcionalidades Nativas — [Score]/10

[mesmo formato]

---

### 7. iOS Quirks — [Score]/10

[mesmo formato]

---

## Plano de Implementação

Priorizado por **impacto na ilusão nativa** × **esforço de implementação**.

### 🔴 Prioridade 1 — Crítico (Faça agora)

Esses itens são bloqueantes. Sem eles, a experiência não é PWA.

#### [Título da ação]
**Problema:** [O que está errado]  
**Solução:**

```[linguagem]
// código completo e comentado
```

**Impacto esperado:** [O que muda para o usuário após implementar]

---

#### [Próxima ação crítica]
[mesmo formato]

---

### 🟡 Prioridade 2 — Alto impacto (Esta sprint)

Esses itens melhoram significativamente a percepção nativa.

#### [Título da ação]
[mesmo formato com código]

---

### 🟢 Prioridade 3 — Refinamentos (Próximas sprints)

Polimento final para a experiência premium.

#### [Título da ação]
[mesmo formato com código]

---

## Checklist de Validação

Após implementar, use para verificar se está correto:

### Instalação
- [ ] Prompt de instalação aparece no Chrome Android após visitar o app
- [ ] App instala sem barra de endereço
- [ ] Ícone aparece na tela inicial com visual correto
- [ ] Splash screen aparece ao abrir (não tela branca)
- [ ] Ícone maskable não corta elementos importantes

### iOS Específico
- [ ] Testar "Adicionar à Tela Inicial" no Safari iOS
- [ ] Abrir app instalado — sem barra do Safari
- [ ] Splash screen aparece no iOS
- [ ] Ícone apple-touch-icon correto (sem transparência)
- [ ] `100dvh` ou equivalente — sem corte no bottom

### Offline
- [ ] Desligar WiFi após carregar — app continua funcionando
- [ ] Tela offline customizada aparece (não erro do browser)
- [ ] Ações feitas offline sincronizam ao voltar online

### Performance
- [ ] Lighthouse mobile score ≥ 90 em Performance
- [ ] Nenhum layout shift visível ao carregar
- [ ] Transições entre páginas sem flash branco

### UX Mobile
- [ ] Todos os botões ≥ 44px de área de toque
- [ ] Sem zoom automático ao focar inputs
- [ ] Pull-to-refresh do browser desativado onde necessário
- [ ] Safe areas respeitadas (notch, home indicator)

---

## Ferramentas Recomendadas

| Ferramenta | Para que serve |
|---|---|
| Chrome DevTools → Application → Manifest | Validar manifest.json |
| Chrome DevTools → Application → Service Workers | Debug do SW |
| Lighthouse (mobile) | Score geral e Core Web Vitals |
| PWABuilder (pwabuilder.com) | Validação e geração de assets |
| Workbox | Biblioteca para service worker |
| web.dev/measure | Análise de performance |
| BrowserStack | Teste em iPhone real sem ter o device |

---

## Próximos Passos

1. [Ação concreta 1 — o que fazer primeiro]
2. [Ação concreta 2]
3. [Ação concreta 3]
4. Após implementar as prioridades 1 e 2, rode o Lighthouse mobile e compartilhe os resultados para refinarmos.

---

*Relatório gerado pelo PWA Expert — Para dúvidas sobre implementação de qualquer item acima, compartilhe o trecho de código e o especialista orientará a implementação.*
```