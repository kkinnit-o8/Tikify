// Keeps the app shell offline. Sounds themselves live in IndexedDB.
// The shell is served from the cache straight away, so the installed app opens instantly even on a
// connection that hangs, and always as one consistent version. Each launch checks the server: if any
// shell file changed, the whole new set is stored and the page offers a reload. The page asks for
// that check once its scripts run; a launch that never asks (a release whose scripts fail) gets it
// from the worker itself, so a fixed release still arrives with the next launch.
// So a release needs no version bump here; bump CACHE only to start over with an empty cache.

// Cache Storage is shared by every app on this origin (github.io): only touch caches named PREFIX….
const PREFIX = 'tikify-';
const CACHE = PREFIX + 'v4';
const SHELL = [
  './',
  'styles.css',
  'app.js',
  'db.js',
  'tiktok.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];
const abs = (u) => new URL(u, self.location).href;
const SHELL_URLS = new Set(SHELL.map(abs));
const HOME = abs('./');

// Fetched past the HTTP cache: GitHub Pages lets browsers reuse files for 10 minutes, which could
// mix an old file into a new release.
const fetchFresh = (u) => fetch(u, { cache: 'no-cache' }).then((res) => {
  if (!res.ok || res.redirected) throw new Error(`${u}: ${res.status}`);
  return res;
});

// The whole shell, every file read to its end, or an error: nothing is stored until all of it has
// arrived, so a dropped connection can't leave half a release in the cache.
async function download() {
  const res = await Promise.all(SHELL.map(fetchFresh));
  const bodies = await Promise.all(res.map((r) => r.clone().arrayBuffer()));
  return { res, bodies };
}
const store = (cache, res) => Promise.all(SHELL.map((u, i) => cache.put(u, res[i])));

self.addEventListener('install', (e) => {
  // While CACHE keeps its name, this is the cache the current worker serves from.
  e.waitUntil(
    download()
      .then(async ({ res }) => store(await caches.open(CACHE), res))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const sameBytes = (a, b) => {
  if (a.byteLength !== b.byteLength) return false;
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
};

// Downloads the whole shell; if anything differs from the cached copy, stores the new set and says so.
let checking = null;
let checkedAt = 0;
function check() {
  checking = checking || (async () => {
    const cache = await caches.open(CACHE);
    const { res, bodies } = await download();
    checkedAt = Date.now();
    const old = await Promise.all(SHELL.map((u) => cache.match(u).then((r) => r && r.arrayBuffer())));
    if (bodies.every((b, i) => old[i] && sameBytes(b, old[i]))) return false;
    await store(cache, res);
    return true;
  })().finally(() => { checking = null; });
  return checking;
}
const checkAndTell = () => check()
  .then((updated) => updated && self.clients.matchAll({ type: 'window' }))
  .then((wins) => wins && wins.forEach((w) => w.postMessage('updated')))
  .catch(() => { /* offline or the server is down: keep what we have */ });

let askedAt = 0;
self.addEventListener('message', (e) => {
  if (e.data !== 'check') return;
  askedAt = Date.now();
  e.waitUntil(checkAndTell());
});

// A launch from the cache whose page hasn't asked for a check after a few seconds: its scripts
// failed. Not straight away, so the page's own files still come from the cache, all from one release.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function checkUnasked(since) {
  await sleep(4000);
  if (askedAt >= since || Date.now() - checkedAt < 60e3) return;
  await checkAndTell();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Opening the app (also with share-target ?text=… or index.html) gets the one cached page. Other
  // URLs aren't intercepted: other paths get the server's 404 page, other files the network.
  const page = req.mode === 'navigate' && url.origin === self.location.origin &&
    (url.pathname === new URL(HOME).pathname || url.href.split('?')[0] === abs('index.html'));
  const key = page ? HOME : url.search ? null : SHELL_URLS.has(url.href) && url.href;
  if (!key) return;
  const answer = caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(key);
    if (hit) return { res: hit, cached: true };
    // Not cached (yet, or no longer): fetch it and keep it for next time.
    const res = await fetch(req);
    if (res.ok && !res.redirected && res.type === 'basic') {
      await cache.put(key, res.clone()).catch(() => {});
    }
    return { res, cached: false };
  });
  e.respondWith(answer.then((a) => a.res));
  if (page) {
    const since = Date.now();
    e.waitUntil(answer.then((a) => a.cached && checkUnasked(since), () => {}));
  }
});
