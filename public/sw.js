const CACHE_NAME = 'orcafacil-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/app',
  '/offline',
  '/favicon.svg',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Evita falhar a instalação completa se um recurso opcional (como /app deslogado) falhar ou redirecionar
      const cachePromises = ASSETS_TO_CACHE.map((asset) => {
        return cache.add(asset).catch((err) => {
          console.warn(`Falha ao cachear asset inicial: ${asset}`, err);
        });
      });
      return Promise.all(cachePromises);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

  // Ignora APIs, Supabase, Hot Reload e dados RSC dinâmicos do Next.js
  // E ignora qualquer build/chunk do Next.js em ambiente de desenvolvimento local para evitar conflito de Turbopack
  if (
    url.pathname.startsWith('/api') || 
    url.hostname.includes('supabase') ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.startsWith('/_next/data') ||
    url.searchParams.has('_rsc') ||
    (isDev && url.pathname.startsWith('/_next'))
  ) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate';
  const isStaticAsset = 
    url.pathname.includes('/_next/static/') ||
    url.pathname.match(/\.(js|css|woff2|png|jpg|jpeg|svg|gif|ico)$/) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com');

  if (isNavigation) {
    // Network First para navegações, com fallback para /offline se offline
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline');
          });
        })
    );
  } else if (isStaticAsset) {
    // Cache First para arquivos estáticos, fontes e imagens locais/externas
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  } else {
    // Stale-While-Revalidate para outros requests
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Ignora falhas de rede no background
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});

