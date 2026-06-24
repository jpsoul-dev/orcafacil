# Dimensões de Auditoria PWA — Critérios Detalhados

## Dimensão 1: Instalabilidade

### O que verificar

**manifest.json**
- `name` e `short_name` presentes (short_name ≤ 12 chars para não cortar no ícone)
- `display: "standalone"` ou `"fullscreen"` — nunca `"browser"`
- `start_url` com parâmetro de rastreamento (`?source=pwa`)
- `background_color` e `theme_color` definidos e consistentes
- `orientation` configurado (`portrait` para a maioria dos apps)
- `scope` correto

**Ícones**
- Mínimo: 192x192 e 512x512 (PNG)
- Ideal: 48, 72, 96, 128, 192, 256, 384, 512
- Ícone maskable com `purpose: "maskable"` (safe zone de 80% do ícone)
- Para iOS: `<link rel="apple-touch-icon">` no `<head>` — manifest não é suficiente
- Ícone sem transparência para iOS (fundo sólido)

**Critérios do browser para prompt de instalação**
- HTTPS obrigatório
- Service worker registrado com fetch handler
- manifest.json válido com campos obrigatórios
- App não instalado anteriormente

**Diagnósticos comuns**
- `display: "minimal-ui"` → barra de endereço aparece → quebra a ilusão
- Ícone com transparência no iOS → fundo preto feio
- `short_name` muito longo → nome cortado no ícone
- Ausência de `apple-touch-icon` → ícone genérico no iOS

---

## Dimensão 2: Service Worker & Cache

### O que verificar

**Registro**
- SW registrado no escopo correto
- Atualização tratada (`skipWaiting` + `clients.claim`)
- Notificação ao usuário quando há nova versão disponível

**Estratégias de cache (por tipo de recurso)**

| Recurso | Estratégia ideal |
|---|---|
| App Shell (HTML, CSS, JS crítico) | Cache First |
| API com dados dinâmicos | Network First com fallback |
| Imagens | Stale While Revalidate |
| Fontes | Cache First (longa duração) |
| Conteúdo crítico offline | Pre-cache no install |

**Offline experience**
- Página offline personalizada (não a do browser)
- Feedback visual claro quando sem conexão
- Background Sync para ações feitas offline
- IndexedDB para persistência de dados offline

**Diagnósticos comuns**
- SW sem fetch handler → não bloqueia o prompt de instalação apenas; sem cache = sem offline
- Cache sem versioning → usuário fica com versão velha presa
- Ausência de página offline customizada → erro genérico do browser quebra imersão
- Pre-cache excessivo → instalação lenta, usuário desiste

---

## Dimensão 3: App Shell Architecture

### O que verificar

**App Shell Pattern**
- HTML mínimo serve instantaneamente (do cache)
- Layout estrutural (header, nav, footer) renderiza antes dos dados
- Conteúdo dinâmico preenche o shell após fetch

**Loading states**
- Skeleton screens em vez de spinners (comportamento nativo)
- Transições de página suaves (não flash branco)
- Nenhuma tela em branco durante navegação

**Percepção de performance**
- First Contentful Paint < 1.5s em 3G
- Layout shift zero (CLS = 0)
- Interação disponível rapidamente (TTI < 3.5s)

**Diagnósticos comuns**
- Spinner genérico → parece web, não app
- Flash branco entre rotas → destrói a ilusão de app nativo
- Conteúdo só renderiza após dados carregarem → percepção de lentidão

---

## Dimensão 4: Mobile UX Nativa

### O que verificar

**Viewport e layout**
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Safe areas do iOS respeitadas: `env(safe-area-inset-*)` para notch e home indicator
- Conteúdo não cortado atrás da status bar ou home indicator
- `height: 100dvh` em vez de `100vh` (evita o bug do Safari com barra de URL)

**Touch e interação**
- Touch targets mínimo 44×44px (guideline Apple) / 48×48dp (Material Design)
- Sem hover states como única indicação de interatividade
- Feedback visual imediato ao toque (`:active` states)
- Sem delay de 300ms em cliques (`touch-action: manipulation` ou FastClick)
- Swipe gestures onde fazem sentido (drawer, carrossel, delete)

**Scrolling**
- `-webkit-overflow-scrolling: touch` (momentum scroll iOS)
- `overscroll-behavior: none` para desativar pull-to-refresh do browser quando não desejado
- Scroll apenas dentro de containers, nunca o scroll da página inteira quando em standalone
- Rubber band apenas onde faz sentido

**Tipografia e legibilidade**
- Fonte mínima 16px para inputs (evita zoom automático no iOS)
- Line height adequado para mobile (1.4 a 1.6)
- Sem text-overflow sem truncamento visual

**Formulários**
- `inputmode` correto em inputs numéricos, telefone, email
- `autocomplete` e `autocapitalize` configurados
- Labels sempre visíveis (não apenas placeholder)
- Teclado virtual não cobre campos ativos (scroll automático ou padding dinâmico)

**Navegação**
- Bottom navigation bar em vez de menu hamburger (padrão nativo)
- Back button/gesture funcional
- Feedback de navegação (transições de slide, não apenas fade)

**Diagnósticos comuns**
- `100vh` no iOS → layout quebra quando barra URL aparece/some
- Inputs com font-size < 16px → zoom automático indesejado no iOS
- Pull-to-refresh do browser ativo → quebra gestos customizados
- Menu hamburger em mobile → não é nativo, é web

---

## Dimensão 5: Performance Mobile

### O que verificar

**Core Web Vitals (mobile)**
- LCP < 2.5s
- FID < 100ms / INP < 200ms
- CLS < 0.1

**Bundle e loading**
- Code splitting por rota
- Lazy loading de componentes pesados
- Bundle JS < 150KB inicial (comprimido)
- Imagens em formato moderno (WebP, AVIF)
- Imagens com `width` e `height` declarados (evita CLS)
- Fontes com `font-display: swap` ou `optional`
- Preload de recursos críticos

**Runtime performance**
- Sem jank em scroll (60fps)
- Animações com `transform` e `opacity` (GPU-accelerated)
- Sem `width/height` animados (causa reflow)
- `will-change` usado com parcimônia

**Diagnósticos comuns**
- Animações com `top/left/margin` → jank visível em mid-range Android
- Fontes sem `font-display` → FOUT/FOIT visível
- Imagens sem dimensões → CLS alto → layout pulando
- Bundle JS monolítico → TTI alto → app "travado" ao abrir

---

## Dimensão 6: Funcionalidades Nativas

### Inventário de APIs Web

| API | Suporte iOS | Suporte Android | Notas |
|---|---|---|---|
| Push Notifications | iOS 16.4+ (apenas em PWA instalada) | Amplo | Requer permissão explícita |
| Web Share API | iOS 12.2+ | Android 6+ | Ideal para compartilhar conteúdo |
| Camera / MediaDevices | Bom | Bom | `getUserMedia` |
| Geolocation | Bom | Bom | HTTPS obrigatório |
| Web Payments | Limitado iOS | Bom Android | Apple Pay via Safari Pay |
| File System Access | Não | Chrome 86+ | Alternativa: `<input type="file">` |
| Web Bluetooth | Não | Chrome | Não disponível iOS |
| Vibration API | Não | Bom | Feedback háptico |
| Screen Wake Lock | iOS 16.4+ | Bom | Evita tela apagar |
| Badge API | iOS 16.4+ | Bom | Número no ícone |
| Background Sync | Não iOS | Bom | Fallback: retry ao voltar online |

### O que verificar
- Quais APIs o app usa ou deveria usar
- Fallbacks para iOS quando API não disponível
- Permissões solicitadas apenas quando necessário e com contexto
- Nunca pedir permissão na carga inicial

---

## Dimensão 7: iOS Quirks — Armadilhas Específicas do Safari

### Lista de problemas conhecidos

**Viewport e layout**
- `100vh` inclui barra de URL → use `100dvh` ou `window.innerHeight`
- Status bar em `standalone` tem altura variável por dispositivo (use `env(safe-area-inset-top)`)
- Teclado virtual não redimensiona viewport no iOS → posicionamento `position: fixed` quebra

**Service Worker**
- SW suspende após ~30s sem atividade em background
- Push notifications só funcionam se app estiver instalado (iOS 16.4+)
- `pushManager.subscribe()` deve ser chamado de gesto do usuário
- Quota de cache limitada (até ~50MB por origem)

**Formulários e inputs**
- Input com `font-size < 16px` causa zoom automático
- `position: fixed` em elementos com foco pula para posição errada quando teclado abre
- `<select>` nativo abre picker diferente do Android
- Auto-fill de senhas pode quebrar validações custom

**Scroll e gestos**
- `-webkit-overflow-scrolling: touch` às vezes causa bugs de scroll fantasma
- `overscroll-behavior` não respeitado em todos os contextos
- Rubber band effect do iOS pode conflitar com pull-to-refresh custom

**Animações e visual**
- `-webkit-` prefixes ainda necessários para alguns transforms
- `backdrop-filter` pode ser lento em dispositivos antigos
- `position: sticky` se comporta diferente dentro de flex containers

**Audio e Media**
- Auto-play de áudio bloqueado sem interação do usuário
- `<video>` inicia em fullscreen por padrão (use `playsinline`)
- MediaSession API para controles na tela de bloqueio

**Workarounds e soluções**
- Use `@supports` para feature detection
- Biblioteca `detect-browser` para casos extremos
- Sempre testar em iPhone físico (simulador não reproduz todos os bugs)
- Safari Technology Preview para testar features futuras