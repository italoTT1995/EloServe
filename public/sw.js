/**
 * EloServe PWA Service Worker
 * Proporciona resiliência offline, cache de alta performance e instalação nativa em tablets/smartphones.
 */

const CACHE_NAME = 'eloserve-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon-elogastro.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições de métodos diferentes de GET ou chamadas de API externa (Supabase)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Deixa o Supabase fazer comunicação direta com a nuvem sem interceptação de cache rígido
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Para navegações de página (SPA): tenta rede, se falhar cai no cache ou index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Para recursos estáticos (CSS, JS, Fontes, Imagens): Cache First com atualização em background (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
