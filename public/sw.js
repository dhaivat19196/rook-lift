/* Rook Lift service worker. Hand-written, no dependencies.
 * - Precaches the app shell routes, their /_next/static assets and the Stockfish engine on install.
 * - Cache-first for /_next/static/* and /engine/*.
 * - Network-first with cache fallback for navigations / HTML / RSC payloads.
 * - Never touches cross-origin requests (api.chess.com, supabase, ...).
 */
const VERSION = 'v1';
const SHELL = 'cc-shell-' + VERSION;
const STATIC = 'cc-static-' + VERSION;

const ROUTES = ['/', '/train/', '/insights/', '/profile/', '/onboarding/', '/session/', '/match/', '/review/', '/puzzles/', '/guard/', '/endgames/'];
const ASSETS = [
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/engine/stockfish-19-lite-single.js',
  '/engine/stockfish-19-lite-single.wasm',
  '/engine/COPYING.txt',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL);
      const stat = await caches.open(STATIC);
      const found = new Set();
      await Promise.all(
        ROUTES.map(async (route) => {
          try {
            const res = await fetch(route, { cache: 'reload' });
            if (!res.ok) return;
            const copy = res.clone();
            const html = await res.text();
            await shell.put(route, copy);
            for (const m of html.matchAll(/\/_next\/static\/[^"'\\\s)]+/g)) found.add(m[0]);
          } catch (e) {
            /* offline during install: skip */
          }
        }),
      );
      await Promise.all(
        [...found].map(async (u) => {
          try {
            if (await stat.match(u)) return;
            const r = await fetch(u);
            if (r.ok) await stat.put(u, r);
          } catch (e) {
            /* ignore */
          }
        }),
      );
      await Promise.all(
        ASSETS.map(async (u) => {
          try {
            const r = await fetch(u);
            if (r.ok) await stat.put(u, r);
          } catch (e) {
            /* ignore */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, STATIC]);
      for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(req) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true }));
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const url = new URL(req.url);
      const path = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
      const page = (await cache.match(path)) || (await cache.match('/'));
      if (page) return page;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never cache api.chess.com, supabase, etc.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/engine/') || /\.(png|svg|webmanifest)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (url.pathname === '/sw.js') return;
  event.respondWith(networkFirst(req));
});
