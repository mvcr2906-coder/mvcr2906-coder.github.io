/* MERCADO — service worker mínimo.
   Cacheia a casca do app (HTML, manifest, ícones). JSONs SEMPRE da rede:
   cotação velha não pode parecer atual. */
const CACHE = 'mercado-v1';
const SHELL = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  /* JSON e news: rede sempre, sem fallback em cache (nada de dado velho) */
  if (url.pathname.endsWith('.json')) return;
  /* casca: cache-first */
  if (SHELL.some(p => url.pathname.endsWith(p))) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});