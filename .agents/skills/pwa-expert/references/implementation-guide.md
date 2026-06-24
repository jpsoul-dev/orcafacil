# Guia de Implementação — Receitas PWA Prontas

Código completo e comentado para as implementações mais comuns. Adapte para a stack do usuário.

---

## 1. manifest.json Completo

```json
{
  "name": "Nome Completo do App",
  "short_name": "NomeApp",
  "description": "Descrição do app para lojas e instalação",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#1A73E8",
  "lang": "pt-BR",
  "dir": "ltr",
  "categories": ["productivity"],
  "icons": [
    { "src": "/icons/icon-48.png", "sizes": "48x48", "type": "image/png" },
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-256.png", "sizes": "256x256", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Tela principal do app"
    }
  ],
  "shortcuts": [
    {
      "name": "Nova ação rápida",
      "short_name": "Nova",
      "url": "/novo?source=pwa-shortcut",
      "icons": [{ "src": "/icons/shortcut-novo.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 2. Tags iOS no `<head>`

```html
<!-- Essencial para iOS — manifest não é suficiente -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<!-- Use "black-translucent" para status bar sobreposta (fullscreen visual) -->
<meta name="apple-mobile-web-app-title" content="NomeApp">

<!-- Ícones iOS por tamanho -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120.png">

<!-- Splash screens iOS (gere com pwabuilder.com ou realfavicongenerator.net) -->
<!-- iPhone 14 Pro Max -->
<link rel="apple-touch-startup-image"
  media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
  href="/splash/apple-splash-1290-2796.png">
<!-- Continue para outros dispositivos... -->

<!-- Viewport com suporte a safe areas -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- Cor da status bar no Chrome Android -->
<meta name="theme-color" content="#1A73E8">
```

---

## 3. Service Worker com Workbox (Next.js)

### Instalação
```bash
npm install next-pwa
# ou
npm install workbox-window workbox-strategies workbox-routing
```

### next.config.js com next-pwa
```js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // API calls — Network First com fallback
      urlPattern: /^https:\/\/api\./,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
        cacheableResponse: { statuses: [0, 200] }
      }
    },
    {
      // Imagens — Stale While Revalidate
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    },
    {
      // Fontes — Cache First
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
      }
    }
  ]
})

module.exports = withPWA({ /* suas configs */ })
```

### Página offline customizada
```jsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold mb-2">Sem conexão</h1>
      <p className="text-gray-500 mb-6">
        Você está offline. Verifique sua conexão e tente novamente.
      </p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Tentar novamente
      </button>
    </div>
  )
}
```

---

## 4. Safe Areas — CSS

```css
/* Variáveis de safe area — adicione ao :root */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
}

/* Layout principal */
.app-layout {
  min-height: 100dvh; /* dvh em vez de vh — funciona com barra URL do Safari */
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
}

/* Bottom navigation bar (fixa acima do home indicator) */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: var(--safe-bottom);
  background: white;
  /* Garante que não fica atrás do home indicator no iPhone */
}

/* Header fixo abaixo da status bar */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: var(--safe-top);
  /* Em standalone, a status bar faz parte do app */
}
```

---

## 5. Desativar Pull-to-Refresh do Browser

```css
/* Global — desativa o pull-to-refresh do browser */
body {
  overscroll-behavior-y: none;
}

/* Se quiser pull-to-refresh customizado apenas em containers específicos */
.scrollable-list {
  overflow-y: auto;
  overscroll-behavior-y: contain; /* pull-to-refresh customizado aqui */
}
```

```js
// Para iOS (onde overscroll-behavior tem suporte parcial)
// Previne bounce em elementos fixos
document.body.addEventListener('touchmove', (e) => {
  if (e.target === document.body) {
    e.preventDefault()
  }
}, { passive: false })
```

---

## 6. Detectar se Está em Modo Standalone (Instalado)

```js
// Hook React para detectar contexto de instalação
function usePWAContext() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS Safari
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  
  return { isStandalone, isIOS, isAndroid }
}

// Uso: mostrar banner de instalação apenas se não estiver instalado
function InstallBanner() {
  const { isStandalone, isIOS } = usePWAContext()
  
  if (isStandalone) return null // já instalado
  
  if (isIOS) {
    return <IOSInstallInstructions /> // "Toque em compartilhar > Adicionar à Tela Inicial"
  }
  
  return <AndroidInstallPrompt /> // usa beforeinstallprompt
}
```

---

## 7. Prompt de Instalação (Android/Chrome)

```js
// Hook para capturar e mostrar o prompt de instalação
import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault() // Impede o prompt automático
      setInstallPrompt(e)
      setIsInstallable(true)
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) return
    
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
      // Track instalação no analytics
    }
    setInstallPrompt(null)
  }

  return { isInstallable, triggerInstall }
}
```

---

## 8. Bottom Navigation — Padrão Nativo

```jsx
// Componente de navegação inferior no estilo nativo
// Em vez de menu hamburger ou nav lateral
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/', icon: HomeIcon, label: 'Início' },
  { href: '/buscar', icon: SearchIcon, label: 'Buscar' },
  { href: '/novo', icon: PlusCircleIcon, label: 'Novo', primary: true },
  { href: '/notificacoes', icon: BellIcon, label: 'Avisos' },
  { href: '/perfil', icon: UserIcon, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5
                touch-manipulation select-none
                ${isActive ? 'text-primary' : 'text-gray-400'}
                active:scale-95 transition-transform duration-75`}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

---

## 9. Transições de Página (sem flash branco)

```jsx
// app/layout.tsx — adicionar no layout raiz
// Usando Framer Motion para transições suaves entre rotas

import { AnimatePresence, motion } from 'framer-motion'

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2, ease: 'easeInOut' }
}

// Para navegação forward/back com direção dinâmica
export function PageTransition({ children }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} {...pageTransition}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## 10. Splash Screen Programática (fallback)

```css
/* Se não quiser gerar splash screens estáticas para todos os dispositivos iOS */
/* Use a abordagem de splash via CSS quando em standalone */

@media (display-mode: standalone) {
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: #1A73E8 url('/icons/icon-192.png') center/96px no-repeat;
    z-index: 9999;
    animation: splash-fade 0.5s ease-out 0.8s forwards;
  }
  
  @keyframes splash-fade {
    to { opacity: 0; pointer-events: none; }
  }
}
```

---

## 11. Fix Teclado Virtual iOS (inputs não cobertos)

```js
// Problema: position:fixed quebra quando teclado abre no iOS
// Solução: reposicionar elementos fixos dinamicamente

export function useVisualViewport() {
  useEffect(() => {
    if (!window.visualViewport) return
    
    const handleResize = () => {
      const offsetFromBottom = window.innerHeight - window.visualViewport.height
      
      // Move elementos fixos (ex: botão de submit) acima do teclado
      document.querySelector('.sticky-bottom')?.style.setProperty(
        'transform', `translateY(-${offsetFromBottom}px)`
      )
    }
    
    window.visualViewport.addEventListener('resize', handleResize)
    return () => window.visualViewport.removeEventListener('resize', handleResize)
  }, [])
}
```

---

## 12. Push Notifications (iOS 16.4+ e Android)

```js
// Solicitar permissão — SEMPRE após gesto do usuário
async function requestPushPermission() {
  // Verificar suporte
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('Push não suportado neste browser')
    return
  }
  
  // iOS requer que o app esteja instalado
  const isStandalone = window.navigator.standalone || 
    window.matchMedia('(display-mode: standalone)').matches
  
  if (/iPhone|iPad/.test(navigator.userAgent) && !isStandalone) {
    alert('Para receber notificações, instale o app na tela inicial primeiro.')
    return
  }
  
  const permission = await Notification.requestPermission()
  
  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
    })
    
    // Enviar subscription para o backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

---

## 13. Skeleton Screen (em vez de spinner)

```jsx
// Comportamento nativo: mostrar estrutura antes do conteúdo
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-1.5" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

// Uso: mostrar skeletons enquanto carrega
function FeedPage() {
  const { data, isLoading } = useFeed()
  
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }
  
  return <Feed data={data} />
}
```