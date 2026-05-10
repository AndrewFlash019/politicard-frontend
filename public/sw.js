/* PolitiScore service worker.
 *
 * Strategy:
 *   - Static assets (JS/CSS/images, /, /index.html, /manifest.json):
 *       cache-first, fall back to network.
 *   - Same-origin /api or backend calls (cross-origin to politicard-backend):
 *       network-first, fall back to cache, then to offline.html.
 *   - Cache versioned by CACHE_NAME — bump to invalidate.
 */

const CACHE_NAME = 'politiscore-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const isApiRequest = (url) =>
  url.pathname.startsWith('/api/') ||
  url.host.includes('politicard-backend.onrender.com') ||
  url.host.includes('supabase.co');

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type !== 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw _;
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('/offline.html');
    throw _;
  }
}
