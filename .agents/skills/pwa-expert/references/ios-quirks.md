# iOS Quirks — Guia de Sobrevivência

Problemas específicos do Safari/WebKit que destroem a ilusão nativa, com soluções testadas.

---

## 🔴 Críticos (Quebram a experiência completamente)

### 1. `100vh` inclui a barra de URL

**Problema:** No Safari iOS, `100vh` calcula incluindo a barra de URL mesmo quando ela está recolhida. Ao rolar, o layout "salta".

**Solução:**
```css
/* Antes */
.container { height: 100vh; }

/* Depois */
.container { height: 100dvh; }
/* dvh = dynamic viewport height — recalcula quando barra URL aparece/some */

/* Fallback para browsers mais antigos */
.container {
  height: 100vh; /* fallback */
  height: 100dvh; /* sobrescreve se suportado */
}
```

---

### 2. Zoom automático em inputs

**Problema:** Se o `font-size` do input for menor que 16px, o iOS faz zoom automático ao focar — e não desfaz ao sair.

**Solução:**
```css
/* Em TODOS os inputs, selects e textareas */
input, select, textarea {
  font-size: 16px; /* mínimo para evitar zoom */
}

/* Se quiser texto visualmente menor, use transform */
.input-small {
  font-size: 16px;
  transform: scale(0.875);
  transform-origin: left center;
}
```

---

### 3. `position: fixed` quebra com teclado virtual

**Problema:** Quando o teclado virtual abre no iOS, elementos com `position: fixed` ficam "presos" no lugar errado — ficam acima do teclado ou somem.

**Solução:**
```js
// Use Visual Viewport API para reposicionar
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const keyboardHeight = window.innerHeight - window.visualViewport.height
    document.querySelector('[data-fixed-bottom]').style.bottom = 
      `${keyboardHeight}px`
  })
}

// Alternativa: converter fixed para sticky dentro de um scroll container
// (evita o problema completamente em muitos casos)
```

---

### 4. Status bar em modo standalone

**Problema:** Em modo standalone (app instalado), a status bar do iOS tem altura variável por dispositivo (iPhone SE vs iPhone 15 Pro Max). Usar padding fixo corta ou deixa espaço em excesso.

**Solução:**
```css
/* Use variável de safe area — ela se adapta ao dispositivo */
.app-header {
  padding-top: env(safe-area-inset-top);
}

/* Para controlar a aparência da status bar */
/* No <head>: */
/* "default" = texto escuro, fundo branco */
/* "black" = texto branco, fundo preto */
/* "black-translucent" = seu conteúdo vai embaixo da status bar */
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

---

### 5. Push Notifications — requer app instalado

**Problema:** No iOS, push notifications só funcionam se o app estiver instalado na tela inicial (iOS 16.4+). No Android, funciona no browser.

**Solução:**
```js
function canUsePush() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isInstalled = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  
  if (isIOS && !isInstalled) {
    // Mostrar instrução para instalar primeiro
    return false
  }
  
  return 'Notification' in window && 'PushManager' in navigator
}
```

---

## 🟡 Importantes (Degradam a experiência)

### 6. `<video>` abre em fullscreen por padrão

```html
<!-- Problema: vídeo abre em fullscreen nativo do iOS -->
<video src="..."></video>

<!-- Solução: adicionar playsinline -->
<video src="..." playsinline muted autoplay loop></video>
```

---

### 7. Auto-play de áudio bloqueado

**Problema:** iOS bloqueia qualquer áudio sem interação do usuário — mesmo em loops de fundo.

**Solução:**
```js
// Criar AudioContext a partir de um gesto do usuário
let audioContext = null

document.addEventListener('touchstart', () => {
  if (!audioContext) {
    audioContext = new AudioContext()
    // Agora pode reproduzir áudio
  }
}, { once: true })
```

---

### 8. `backdrop-filter` lento em dispositivos antigos

```css
/* Glassmorphism pode causar jank em iPhone 8 e anteriores */
.glass-card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  /* Fallback sem blur para devices antigos */
  @supports not (backdrop-filter: blur(10px)) {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

---

### 9. Scroll inercial inconsistente

```css
/* Garantir momentum scroll em containers scrolláveis */
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* ainda necessário em iOS antigo */
}

/* Cuidado: -webkit-overflow-scrolling: touch pode causar bugs
   onde o scroll "some" ou fica preso. Se isso acontecer: */
.scroll-container {
  transform: translateZ(0); /* força GPU layer — corrige na maioria dos casos */
}
```

---

### 10. `<select>` estilo iOS

**Problema:** `<select>` no iOS abre o picker nativo giratório, que tem visual diferente do Android e não pode ser estilizado.

**Solução:**
```jsx
// Opção 1: aceitar o comportamento nativo (recomendado — parece app nativo)
<select> ... </select>

// Opção 2: substituir por componente custom com Radix ou Headless UI
import * as Select from '@radix-ui/react-select'
// Permite estilização completa mas perde o picker nativo do iOS
```

---

### 11. Splash screen não aparece no iOS

**Problema:** Sem tags `apple-touch-startup-image` corretas por device, o iOS mostra tela branca ao abrir o app instalado.

**Solução:**
```html
<!-- Gere automaticamente em: https://progressier.com/pwa-icons-and-ios-splash-screen-generator -->
<!-- Ou use pwa-assets-generator: npm install -D @vite-pwa/assets-generator -->

<!-- Exemplo para iPhone 14 Pro Max (1290x2796) -->
<link rel="apple-touch-startup-image"
  href="/splash/apple-splash-1290-2796.png"
  media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">

<!-- Precisará de ~20 tamanhos para cobrir todos os devices iOS -->
<!-- Use um gerador automatizado -->
```

---

### 12. Rubber band / bounce effect

```css
/* Desativar bounce em toda a página (quando em modo app) */
@media (display-mode: standalone) {
  html, body {
    overscroll-behavior: none;
    position: fixed;
    width: 100%;
    overflow: hidden;
  }
  
  /* Scroll apenas em containers específicos */
  .main-scroll-area {
    overflow-y: auto;
    height: 100dvh;
    overscroll-behavior-y: contain;
  }
}
```

---

## 🟢 Refinamentos (Polimento final)

### 13. Desativar seleção de texto (como app nativo)

```css
/* Elementos de UI não devem ser selecionáveis como texto */
button, nav, .bottom-bar, .app-header {
  -webkit-user-select: none;
  user-select: none;
}

/* Mas conteúdo de texto deve continuar selecionável */
p, article, .content {
  -webkit-user-select: text;
  user-select: text;
}
```

---

### 14. Long press menu do iOS

**Problema:** Long press em imagens/links mostra menu contextual do Safari mesmo em modo standalone.

```css
/* Desativar callout em elementos que não devem ter menu contextual */
img, a.no-callout {
  -webkit-touch-callout: none;
}
```

---

### 15. Cor da barra de status por tema

```html
<!-- Adaptar cor da status bar ao modo escuro -->
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1A1A1A" media="(prefers-color-scheme: dark)">
```

---

## Checklist iOS antes de lançar

- [ ] Testado em iPhone físico (não apenas simulador)
- [ ] Instalado via "Adicionar à Tela Inicial" no Safari
- [ ] Sem barra do Safari após instalação
- [ ] Splash screen aparece (não tela branca)
- [ ] Layout não corta com notch/dynamic island
- [ ] Home indicator não cobre conteúdo importante
- [ ] Inputs não causam zoom ao focar
- [ ] Teclado virtual não esconde campos ativos
- [ ] Vídeos com `playsinline`
- [ ] Áudio só reproduz após gesto do usuário
- [ ] Gestos de swipe não conflitam com navegação do iOS
- [ ] Dark mode funcional (se suportado)