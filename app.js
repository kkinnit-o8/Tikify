'use strict';

// ---------- helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M17 3l4 4-4 4V8h-2.2l-3.1 4 3.1 4H17v-3l4 4-4 4v-3h-3.2l-3.4-4.4L7 18H3v-2h3l3.1-4L6 8H3V6h4l3.4 4.4L13.8 6H17z"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M12 3v10.6A4 4 0 1 0 14 17V7h4V3z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21 10.6 19.7C5.4 15 2 11.9 2 8.1 2 5 4.4 2.6 7.5 2.6c1.7 0 3.4.8 4.5 2.1a6 6 0 0 1 4.5-2.1C19.6 2.6 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6z"/></svg>',
  paste: '<svg viewBox="0 0 24 24"><path d="M16 3h-2.2a2 2 0 0 0-3.6 0H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 17H8V5h1v2h6V5h1z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.3 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.3-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>',
  // menu items
  next: '<svg viewBox="0 0 24 24"><path d="M3 5h13v2H3zm0 5h13v2H3zm0 5h8v2H3zm11-1v6l5-3z"/></svg>',
  playlist: '<svg viewBox="0 0 24 24"><path d="M3 6h12v2H3zm0 4h12v2H3zm0 4h8v2H3zm14-8h4v2h-2v8a3 3 0 1 1-2-2.8z"/></svg>',
  playlistAdd: '<svg viewBox="0 0 24 24"><path d="M3 6h12v2H3zm0 4h12v2H3zm0 4h8v2H3zm14 0v-3h2v3h3v2h-3v3h-2v-3h-3v-2z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M3 17.3V21h3.7L17.8 9.9l-3.7-3.7zM20.7 7a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.7 3.7z"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M11 20V7.8l-5.6 5.6L4 12l8-8 8 8-1.4 1.4L13 7.8V20z"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M13 4v12.2l5.6-5.6L20 12l-8 8-8-8 1.4-1.4 5.6 5.6V4z"/></svg>',
  remove: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM7 11h10v2H7z"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M11 4h2v8.2l3.6-3.6L18 10l-6 6-6-6 1.4-1.4 3.6 3.6zM5 18h14v2H5z"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M11 16h2V7.8l3.6 3.6L18 10l-6-6-6 6 1.4 1.4L11 7.8zM5 18h14v2H5z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3h2v2h-2zm0 4h2v6h-2z"/></svg>',
  install: '<svg viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h10V4zm4 2h2v6.2l2.1-2.1 1.4 1.4-4.5 4.5-4.5-4.5 1.4-1.4 2.1 2.1z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
};
// Decoration only: whatever shows an icon has a text or label of its own, so screen readers skip it.
for (const k in ICON) ICON[k] = ICON[k].replace('<svg ', '<svg aria-hidden="true" ');

// Mobile Safari applies :active (the press feedback on every button and row) only to elements under a
// touch listener. This one does nothing else.
document.addEventListener('touchstart', () => {}, { passive: true });

// ---------- state ----------
const state = {
  sounds: new Map(),   // id -> sound
  playlists: [],       // [{ id, name, soundIds, createdAt }]
  queue: [],           // sound ids in play order
  baseQueue: [],       // queue before shuffling
  upNext: [],          // put up next with 'Play next' and not played yet: they stay next when shuffle changes
  index: -1,
  contextId: '',       // what is playing: 'all', 'pl:<playlist id>', 'search', 'queue' or 'added'
  context: '',         // its name when playback started ("Gym"); see contextLabel()
  shuffle: false,
  repeat: 'off',       // off | all | one
};

const coverUrls = new Map(); // sound id -> object URL
// Stands in for a missing cover: the app's own art, full bleed, so it fills a square like a cover does.
const NO_COVER = 'icons/maskable-512.png';
// A cover that can't load (an expired TikTok link, offline) shows NO_COVER instead of a broken image.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName === 'IMG' && !img.src.endsWith(NO_COVER)) img.src = NO_COVER;
}, true);
function coverSrc(sound) {
  if (!sound) return NO_COVER;
  if (sound.coverBlob) {
    if (!coverUrls.has(sound.id)) coverUrls.set(sound.id, URL.createObjectURL(sound.coverBlob));
    return coverUrls.get(sound.id);
  }
  return sound.coverUrl || NO_COVER;
}

// Artwork for the full player and the lock screen, which show it square. A TikTok video thumbnail
// (3:4 or 9:16) is shown whole on a blurred copy of itself, not cropped to its middle (which often
// cuts off a head) and blown up; a cover that can't load is replaced by NO_COVER. Made once per
// sound and session; null while it is being made.
const artworks = new Map(); // sound id -> { src, sizes?, type? } | null, least recently used first
function artwork(sound) {
  const art = artworks.get(sound.id);
  if (art) { artworks.delete(sound.id); artworks.set(sound.id, art); return art; }
  if (art === undefined) {
    artworks.set(sound.id, null);
    squareArt(coverSrc(sound), sound.coverBlob && sound.coverBlob.type).then((made) => {
      // Deleted meanwhile.
      if (artworks.get(sound.id) !== null) return made.made && URL.revokeObjectURL(made.src);
      artworks.set(sound.id, made);
      while (artworks.size > 30) dropArtwork(artworks.keys().next().value); // a day on shuffle
      if (currentId() === sound.id) updateNowPlaying();
    });
  }
  return null;
}
function dropArtwork(id) {
  const art = artworks.get(id);
  if (art && art.made) URL.revokeObjectURL(art.src);
  artworks.delete(id);
}
async function squareArt(src, type) {
  const img = new Image();
  img.src = src;
  try { await img.decode(); } catch { return { src: NO_COVER, sizes: '512x512', type: 'image/png' }; }
  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (Math.abs(w - h) <= Math.max(w, h) * 0.05) return { src, sizes: `${w}x${h}`, type };
    const side = Math.min(1024, Math.max(w, h)); // the picture itself is never enlarged
    const c = document.createElement('canvas');
    c.width = c.height = side;
    const g = c.getContext('2d');
    // The background: the picture shrunk to a few pixels and stretched to the square, i.e. blurred
    // (canvas filters aren't in every Safari), so its edges seem to carry on to the sides.
    const tiny = document.createElement('canvas');
    tiny.width = tiny.height = 10;
    tiny.getContext('2d').drawImage(img, 0, 0, 10, 10);
    g.imageSmoothingQuality = 'high';
    g.drawImage(tiny, 0, 0, side, side);
    g.fillStyle = 'rgba(0, 0, 0, .25)';
    g.fillRect(0, 0, side, side);
    const k = side / Math.max(w, h);
    g.drawImage(img, (side - w * k) / 2, (side - h * k) / 2, w * k, h * k);
    const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.9));
    if (!blob) throw new Error('toBlob');
    return { src: URL.createObjectURL(blob), sizes: `${side}x${side}`, type: 'image/jpeg', made: true };
  } catch {
    return { src, type }; // as it is (a cover still on TikTok's servers can't be drawn on)
  }
}

// ---------- record validation ----------
// Backups are untrusted, and older versions stored imported records as-is, so imports and
// loadAll shape records through these. A new sound field must be added to cleanSound, or
// imports drop it.
const idOf = (v) => (typeof v === 'string' ? v : typeof v === 'number' && isFinite(v) ? String(v) : '');
const clipText = (v, max) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim().slice(0, max) : '');
const TIKTOK_HOST = /(^|\.)tiktok\.com$/i;
// Only http(s) links ever reach an href, window.open, <img> or <audio> (no javascript: or data:).
function webUrl(u, host) {
  if (typeof u !== 'string') return null;
  try {
    const url = new URL(u);
    // The original string, not url.href: re-encoding could break a signed CDN link.
    return /^https?:$/.test(url.protocol) && (!host || host.test(url.hostname)) ? u : null;
  } catch { return null; }
}

function cleanSound(s) {
  const id = s && typeof s === 'object' ? idOf(s.id) : '';
  if (!id) return null;
  return {
    id,
    title: clipText(s.title, 150) || 'TikTok sound',
    artist: clipText(s.artist, 150) || 'Unknown',
    coverBlob: null,
    coverUrl: webUrl(s.coverUrl),
    audioUrl: webUrl(s.audioUrl),
    sourceUrl: webUrl(s.sourceUrl, TIKTOK_HOST),
    tiktokId: clipText(s.tiktokId, 40) || null,
    musicId: clipText(s.musicId, 40) || null,
    duration: Number.isFinite(s.duration) && s.duration > 0 ? s.duration : 0,
    addedAt: Number.isFinite(s.addedAt) ? s.addedAt : Date.now(),
  };
}

// Also drops ids of sounds that aren't in `sounds`, so a playlist never points at a missing sound.
function cleanPlaylist(p, sounds = state.sounds) {
  const id = p && typeof p === 'object' ? idOf(p.id) : '';
  if (!id) return null;
  const ids = Array.isArray(p.soundIds) ? p.soundIds.map(idOf).filter((x) => sounds.has(x)) : [];
  return {
    id,
    name: clipText(p.name, 120) || 'Untitled playlist',
    soundIds: [...new Set(ids)],
    createdAt: Number.isFinite(p.createdAt) ? p.createdAt : Date.now(),
  };
}
const samePlaylist = (a, b) => a.id === b.id && a.name === b.name && a.createdAt === b.createdAt &&
  Array.isArray(a.soundIds) && a.soundIds.length === b.soundIds.length && a.soundIds.every((x, i) => x === b.soundIds[i]);

async function loadAll() {
  const [rawSounds, rawPlaylists] = await DB.tx(['sounds', 'playlists'], 'readonly', (t) =>
    [t.objectStore('sounds').getAll(), t.objectStore('playlists').getAll()]);
  const sounds = new Map();
  const rekeyed = []; // [oldKey, sound]: numeric ids from old imports; the DOM and routes use strings
  for (const raw of rawSounds) {
    const id = idOf(raw.id);
    if (!id) continue;
    const s = {
      ...raw,
      id,
      title: typeof raw.title === 'string' ? raw.title : clipText(raw.title, 150) || 'TikTok sound',
      artist: typeof raw.artist === 'string' ? raw.artist : clipText(raw.artist, 150) || 'Unknown',
      coverUrl: webUrl(raw.coverUrl),
      audioUrl: webUrl(raw.audioUrl),
      sourceUrl: webUrl(raw.sourceUrl, TIKTOK_HOST),
      addedAt: Number.isFinite(raw.addedAt) ? raw.addedAt : 0,
    };
    if (id !== raw.id) rekeyed.push([raw.id, s]);
    sounds.set(id, s);
  }
  // Repair playlists a bad import or an interrupted delete left behind (no name, no soundIds,
  // ids of deleted sounds), so they can't break rendering or reordering.
  const playlists = [];
  const fixed = []; // [oldKey, playlist]
  for (const raw of rawPlaylists) {
    const clean = cleanPlaylist(raw, sounds);
    if (!clean) continue;
    const p = samePlaylist(raw, clean) ? raw : { ...raw, ...clean };
    if (p !== raw) fixed.push([raw.id, p]);
    playlists.push(p);
  }
  if (rekeyed.length || fixed.length) {
    await DB.tx(['sounds', 'audio', 'playlists'], 'readwrite', (t) => {
      const [ss, as, ps] = ['sounds', 'audio', 'playlists'].map((n) => t.objectStore(n));
      for (const [old, s] of rekeyed) {
        ss.delete(old);
        ss.put(s);
        as.get(old).onsuccess = (e) => {
          const a = e.target.result;
          if (a) { as.delete(old); as.put({ ...a, id: s.id }); }
        };
      }
      for (const [old, p] of fixed) {
        if (old !== p.id) ps.delete(old);
        ps.put(p);
      }
    }).catch(() => { /* still fine in memory; tried again next launch */ });
  }
  state.sounds = sounds;
  state.playlists = playlists.sort((a, b) => a.createdAt - b.createdAt);
}

const allSoundIds = () => [...state.sounds.values()].sort((a, b) => b.addedAt - a.addedAt).map((s) => s.id);
const getPlaylist = (id) => state.playlists.find((p) => p.id === id);

// ---------- UI primitives ----------
let toastTimer;
let toastStickySince = 0; // an error toast stays until the user's next tap or key press
function toast(msg, { error = false } = {}) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('error', error);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastStickySince = error ? Date.now() : 0;
  // Give longer messages more time; errors don't time out, so they can't vanish unread.
  if (!error) toastTimer = setTimeout(hideToast, Math.min(8000, Math.max(2600, 1000 + msg.length * 60)));
}
function hideToast() {
  const el = $('#toast');
  el.classList.remove('show');
  toastStickySince = 0;
  clearTimeout(toastTimer);
  // Empty it after the fade, so a screen reader doesn't come across the old message later.
  toastTimer = setTimeout(() => (el.textContent = ''), 250);
}
const dismissStickyToast = () => {
  if (toastStickySince && Date.now() - toastStickySince > 800) hideToast();
};
document.addEventListener('pointerdown', dismissStickyToast, true);
document.addEventListener('keydown', dismissStickyToast, true);

// Polite screen reader announcement for changes that have no visible message (search results etc.).
let announceTimer;
function announce(msg) {
  const el = $('#srStatus');
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => (el.textContent = msg), 400);
}

// Safari doesn't focus buttons on tap, so the control tapped just now counts as the focused one.
let lastTap = null;
let lastTapAt = 0;
document.addEventListener('click', (e) => {
  lastTap = e.target.closest('button, a[href], summary');
  lastTapAt = Date.now();
}, true);
function invoker() {
  const a = document.activeElement;
  if (a && a !== document.body) return a;
  return Date.now() - lastTapAt < 1000 ? lastTap : null;
}

// Remember a control well enough to find it again after render() has rebuilt the view.
function focusRef(el) {
  if (!el || el === document.body || !el.isConnected) return null;
  const row = el.closest('[data-id]');
  let sel = null;
  if (el.id) sel = '#' + CSS.escape(el.id);
  else if (row) sel = `[data-id="${CSS.escape(row.dataset.id)}"] ${el.classList.contains('more') ? '.more' : '.track-main'}`;
  else if (el.dataset.go) sel = `[data-go="${CSS.escape(el.dataset.go)}"]`;
  return { el, sel };
}
function restoreFocus(ref) {
  if (!ref) return false;
  const el = ref.el.isConnected ? ref.el : ref.sel && document.querySelector(ref.sel);
  // A closing player stays on screen while it slides away: its controls don't count.
  if (!el || el.closest('[inert]') || !el.getClientRects().length || (!playerOpen && el.closest('#player'))) return false;
  el.focus();
  return document.activeElement === el;
}
// Where focus goes when the control it should return to is gone (e.g. its row was deleted).
function focusFallback() {
  const el = playerOpen ? $('#playerClose') : $('#view .pl-header h1') || $('#viewTitle');
  el.tabIndex = -1;
  el.focus({ preventScroll: true });
}

// Open overlays that own a history entry, bottom to top ('player' | 'sheet'). The entry lets the
// Android back gesture close the overlay instead of changing the view underneath it.
const overlays = [];
let sheetActive = false;
let playerOpen = false;
const overlayOpen = (o) => (o === 'sheet' ? sheetActive : playerOpen);
let releasing = 0; // our own history.go(-n) calls still in flight
let releaseTimer;
let afterRelease = null;

function holdOverlay(name) {
  if (overlays.includes(name)) return;
  const top = overlays.length - 1;
  // A sheet that was just closed may not have given up its entry yet: take it over.
  if (top >= 0 && !overlayOpen(overlays[top])) { overlays[top] = name; return; }
  // Chrome's back button skips entries added without a tap, so popups opened by a timer get none.
  if (releasing || (navigator.userActivation && !navigator.userActivation.isActive)) return;
  history.pushState({ ...history.state, ov: overlays.length + 1 }, '');
  overlays.push(name);
}
// Drop the history entries of overlays that have been closed in the UI.
function releaseOverlays() {
  let n = 0;
  while (overlays.length && !overlayOpen(overlays[overlays.length - 1])) { overlays.pop(); n++; }
  if (!n) return false;
  travel(n);
  return true;
}
// history.go(-n), remembering that the popstate it causes is ours and that go() must wait for it.
function travel(n) {
  releasing++;
  clearTimeout(releaseTimer);
  releaseTimer = setTimeout(() => { releasing = 1; releaseDone(); }, 1000); // in case popstate never comes
  history.go(-n);
}
function releaseDone() {
  if (!releasing || --releasing) return;
  clearTimeout(releaseTimer);
  const fn = afterRelease;
  afterRelease = null;
  fn && fn();
}

function syncInert() {
  $('#app').inert = sheetActive || playerOpen;
  $('#player').inert = sheetActive;
  document.body.classList.toggle('sheet-open', sheetActive); // moves the toast off the sheet
}

let sheetResolve = null;
let sheetHideTimer;
let sheetReturn = null;
function openSheet(html, onMount) {
  const backdrop = $('#sheetBackdrop');
  const sheet = $('#sheet');
  // A sheet opened from another one reuses the backdrop; cancel the pending hide.
  clearTimeout(sheetHideTimer);
  if (sheetResolve) { const r = sheetResolve; sheetResolve = null; r(null); }
  if (backdrop.hidden) sheetReturn = focusRef(invoker());
  sheet.innerHTML = '<div class="sheet-handle"></div>' + html;
  const title = $('.sheet-title', sheet);
  if (title) { title.id = 'sheetTitle'; sheet.setAttribute('aria-labelledby', 'sheetTitle'); }
  else sheet.removeAttribute('aria-labelledby');
  backdrop.hidden = false;
  // The element is shared: a new sheet mustn't open scrolled to where the last one was left. (Once
  // shown: a hidden element ignores this and gets its old offset back.)
  sheet.scrollTop = 0;
  requestAnimationFrame(() => backdrop.classList.add('open'));
  sheetActive = true;
  holdOverlay('sheet');
  syncInert();
  return new Promise((resolve) => {
    sheetResolve = resolve;
    onMount && onMount(sheet, closeSheet);
    if (!sheet.contains(document.activeElement)) sheet.focus({ preventScroll: true });
  });
}
function closeSheet(value) {
  if (!sheetActive) return;
  sheetActive = false;
  const backdrop = $('#sheetBackdrop');
  backdrop.classList.remove('open');
  syncInert();
  clearTimeout(sheetHideTimer);
  sheetHideTimer = setTimeout(() => {
    backdrop.hidden = true;
    releaseOverlays();
  }, 200);
  // After the caller had its turn: it may open another sheet or a new view that takes focus.
  setTimeout(() => {
    const a = document.activeElement;
    if (!sheetActive && (!a || a === document.body || backdrop.contains(a))) restoreFocus(sheetReturn) || focusFallback();
  }, 0);
  const r = sheetResolve;
  sheetResolve = null;
  r && r(value);
}
$('#sheetBackdrop').addEventListener('click', (e) => {
  if (e.target.id === 'sheetBackdrop') closeSheet(null);
});

// Drag a sheet down to close it, by its handle or anywhere while its content is scrolled to the top.
// It follows the finger; let go a third of the way down (or flick it) and it closes, else it springs back.
(() => {
  const sheet = $('#sheet');
  let drag = null;
  sheet.addEventListener('touchstart', (e) => {
    drag = null;
    const list = e.target.closest('.pick');
    if (e.touches.length !== 1 || e.target.closest('input, textarea') || sheet.scrollTop > 0 || (list && list.scrollTop > 0)) return;
    drag = { x: e.touches[0].clientX, y: e.touches[0].clientY, on: false, dy: 0, at: 0, v: 0 };
  }, { passive: true });
  sheet.addEventListener('touchmove', (e) => {
    if (!drag) return;
    const t = e.touches[0];
    const dy = t.clientY - drag.y;
    if (!drag.on) {
      // Not before it is clearly a downward drag: until then it may be a tap or a scroll.
      if (dy < -4 || Math.abs(t.clientX - drag.x) > Math.max(10, dy)) { drag = null; return; }
      if (dy < 10) return;
      drag.on = true;
      sheet.classList.add('dragging');
    }
    const now = Date.now();
    const to = Math.max(0, dy - 10);
    if (drag.at) drag.v = (to - drag.dy) / Math.max(1, now - drag.at); // px/ms, of the latest move
    drag.dy = to;
    drag.at = now;
    sheet.style.transform = `translateY(${to}px)`;
    if (e.cancelable) e.preventDefault(); // the sheet moves, not its content
  }, { passive: false });
  const end = (e) => {
    const d = drag;
    drag = null;
    if (!d || !d.on) return;
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    const flick = d.dy > 30 && d.v > 0.5 && Date.now() - d.at < 100; // still moving when let go
    if (e.type === 'touchend' && (d.dy > sheet.offsetHeight / 3 || flick)) closeSheet(null);
  };
  sheet.addEventListener('touchend', end);
  sheet.addEventListener('touchcancel', end);
})();

// Menu: items = [{ label, value, danger?, icon?, pressed? }]; `pressed` makes an item a toggle,
// ticked when true. A Cancel item is added unless one item already dismisses (value null): screen
// reader and switch users can't tap the backdrop.
function sheetMenu(title, items, sub = '') {
  const cancel = items.some((it) => it.value == null) ? '' : '<button class="sheet-item sheet-cancel" data-cancel>Cancel</button>';
  const toggle = (it) => (it.pressed == null ? '' : ` aria-pressed="${!!it.pressed}"`);
  const html = `
    ${title ? `<div class="sheet-title">${esc(title)}</div>` : ''}
    ${sub ? `<div class="sheet-sub">${esc(sub)}</div>` : ''}
    <div class="sheet-list">
      ${items.map((it, i) => `<button class="sheet-item ${it.danger ? 'danger' : ''}" data-i="${i}"${toggle(it)}><span class="sheet-ic">${it.icon || ''}</span><span>${esc(it.label)}</span>${it.pressed ? `<span class="sheet-check">${ICON.check}</span>` : ''}</button>`).join('')}
      ${cancel}
    </div>`;
  return openSheet(html, (sheet, close) => {
    sheet.querySelectorAll('.sheet-item[data-i]').forEach((b) =>
      b.addEventListener('click', () => close(items[+b.dataset.i].value)));
    const c = $('[data-cancel]', sheet);
    if (c) c.onclick = () => close(null);
  });
}

function sheetPrompt(title, value = '', placeholder = '', okLabel = 'Save') {
  const html = `
    <div class="sheet-title">${esc(title)}</div>
    <form class="sheet-form">
      <input class="input" name="v" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="120" autocomplete="off" aria-labelledby="sheetTitle" enterkeyhint="done">
      <div class="row-btns">
        <button type="button" class="btn ghost" data-cancel>Cancel</button>
        <button type="submit" class="btn primary">${esc(okLabel)}</button>
      </div>
    </form>`;
  return openSheet(html, (sheet, close) => {
    const form = $('form', sheet);
    const input = form.elements.v;
    // Synchronously, still inside the tap, or iOS won't open the keyboard.
    input.focus({ preventScroll: true });
    input.select();
    $('[data-cancel]', sheet).onclick = () => close(null);
    form.onsubmit = (e) => {
      e.preventDefault();
      const v = input.value.trim();
      close(v || null);
    };
  });
}

function sheetConfirm(title, msg, okLabel = 'Delete') {
  const html = `
    <div class="sheet-title">${esc(title)}</div>
    <div class="sheet-sub">${esc(msg)}</div>
    <div class="row-btns">
      <button class="btn ghost" data-cancel>Cancel</button>
      <button class="btn danger" data-ok>${esc(okLabel)}</button>
    </div>`;
  return openSheet(html, (sheet, close) => {
    $('[data-cancel]', sheet).onclick = () => close(false);
    $('[data-ok]', sheet).onclick = () => close(true);
  });
}

// ---------- data actions ----------
async function createPlaylist(name) {
  const p = { id: uid(), name, soundIds: [], createdAt: Date.now() };
  await DB.put('playlists', p);
  state.playlists.push(p);
  return p;
}

// Store first, and change the in-memory playlist only once that worked, so the screen never
// shows a change that would be gone after a relaunch.
async function updatePlaylist(p, changes) {
  await DB.put('playlists', { ...p, ...changes });
  Object.assign(p, changes);
}

async function addToPlaylist(p, soundId) {
  if (p.soundIds.includes(soundId)) return false;
  await updatePlaylist(p, { soundIds: [...p.soundIds, soundId] });
  return true;
}

async function deleteSound(id) {
  // One transaction: a delete that dies half-way would leave a sound without audio, or
  // playlists pointing at a sound that no longer exists.
  const touched = state.playlists.filter((p) => p.soundIds.includes(id))
    .map((p) => [p, p.soundIds.filter((x) => x !== id)]);
  await DB.tx(['sounds', 'audio', 'playlists'], 'readwrite', (t) => {
    t.objectStore('sounds').delete(id);
    t.objectStore('audio').delete(id);
    for (const [p, soundIds] of touched) t.objectStore('playlists').put({ ...p, soundIds });
  });
  state.sounds.delete(id);
  if (coverUrls.has(id)) { URL.revokeObjectURL(coverUrls.get(id)); coverUrls.delete(id); }
  dropArtwork(id);
  for (const [p, soundIds] of touched) p.soundIds = soundIds;
  if (aheadId === id) dropAhead();
  if (!state.queue.includes(id)) return;
  // Every copy leaves the queue. If it was playing, the sound after it takes its place.
  const wasCurrent = currentId() === id;
  const wasPlaying = wasCurrent && !audio.paused;
  state.index -= state.queue.slice(0, state.index).filter((x) => x === id).length;
  state.queue = state.queue.filter((x) => x !== id);
  state.baseQueue = state.baseQueue.filter((x) => x !== id);
  state.upNext = state.upNext.filter((x) => x !== id);
  if (!state.queue.length) stopPlayer();
  else if (!wasCurrent) { saveSession(); readAhead(); }
  else if (state.index < state.queue.length) loadIndex(state.index, wasPlaying);
  else loadIndex(0, wasPlaying && state.repeat === 'all'); // it was the last one: back to the top
}

// Save a looked-up TikTok sound into the library. The audio has to download (it is the offline
// copy), unless `stream` is set: then nothing is downloaded and the sound plays from its link until
// fillIn() gets it. `cover`: the cover's download, if one is already under way.
async function saveSound(info, { title, artist }, { stream = false, cover, onProgress } = {}) {
  const id = uid();
  cover = cover || downloadCover(info.coverUrls || [info.coverUrl]);
  // Both at once. A missing cover never stops the save, and a stream save only takes it if it's
  // (nearly) there: that save comes after a download that failed, and the cover's may hang too.
  const [coverBlob, audioBlob] = await Promise.all([
    stream ? Promise.race([cover, new Promise((r) => setTimeout(r, 1500, null))]) : cover,
    stream ? null : downloadAudio(info.audioUrl, onProgress),
  ]);
  const sound = {
    id,
    title: title || info.title,
    artist: artist || info.artist,
    coverBlob,
    coverUrl: webUrl(info.coverUrl),
    audioUrl: audioBlob ? null : webUrl(info.audioUrl),
    sourceUrl: webUrl(info.sourceUrl, TIKTOK_HOST),
    tiktokId: info.tiktokId,
    musicId: info.musicId || null,
    duration: info.duration,
    addedAt: Date.now(),
  };
  // Both records in one transaction, so a failed audio write (e.g. storage full) can't leave
  // an unplayable sound behind.
  await DB.tx(['sounds', 'audio'], 'readwrite', (t) => {
    t.objectStore('sounds').put(sound);
    if (audioBlob) t.objectStore('audio').put({ id, blob: audioBlob });
  });
  state.sounds.set(id, sound);
  if (state.sounds.size === 1) keepStorage();
  return sound;
}

// One retry: a phone switching between Wi-Fi and mobile data often drops the first attempt.
async function downloadAudio(url, onProgress) {
  try {
    return await TikTok.downloadBlob(url, { onProgress });
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    return TikTok.downloadBlob(url, { onProgress });
  }
}

// Tries each cover link in turn (signed CDN links fail now and then); null if none works.
async function downloadCover(urls) {
  for (const url of urls) {
    if (!webUrl(url)) continue;
    try { return await TikTok.downloadBlob(url, { kind: 'image' }); } catch { /* the next one */ }
  }
  return null;
}

// A sound saved without its cover, or without its audio (by choice), gets them the first time it
// plays online: TikTok's links expire within days, and the stored copies are what work offline.
const filledIn = new Set(); // tried this session
async function fillIn(sound) {
  const needAudio = !!sound.audioUrl;
  const needCover = !sound.coverBlob;
  if ((!needAudio && !needCover) || filledIn.has(sound.id) || repairing.has(sound.id)) return;
  filledIn.add(sound.id);
  let audioBlob = null;
  let coverBlob = null;
  try {
    [audioBlob, coverBlob] = await Promise.all([
      needAudio ? TikTok.downloadBlob(sound.audioUrl).catch(() => null) : null,
      needCover ? downloadCover([sound.coverUrl]) : null,
    ]);
    // The cover link has expired (the audio one may have too): a new lookup has fresh ones.
    if (needCover && !coverBlob && sound.sourceUrl) {
      const info = await TikTok.lookup(sound.sourceUrl);
      coverBlob = await downloadCover(info.coverUrls);
      if (needAudio && !audioBlob) audioBlob = await TikTok.downloadBlob(info.audioUrl).catch(() => null);
    }
  } catch { /* offline, or the TikTok is gone: the sound stays as it is */ }
  if ((!audioBlob && !coverBlob) || state.sounds.get(sound.id) !== sound) return;
  const changes = {};
  if (coverBlob) changes.coverBlob = coverBlob;
  if (audioBlob) changes.audioUrl = null;
  // Only if the sound is still stored, in the same transaction: a delete meanwhile must win.
  let stored = false;
  await DB.tx(['sounds', 'audio'], 'readwrite', (t) => {
    const ss = t.objectStore('sounds');
    ss.get(sound.id).onsuccess = (e) => {
      if (!e.target.result) return;
      stored = true;
      ss.put({ ...sound, ...changes });
      if (audioBlob) t.objectStore('audio').put({ id: sound.id, blob: audioBlob });
    };
  }).catch(() => {});
  if (!stored || state.sounds.get(sound.id) !== sound) return;
  Object.assign(sound, changes);
  if (!coverBlob) return;
  dropArtwork(sound.id);
  if (currentId() === sound.id) updateNowPlaying();
  render();
}

// Asks the browser not to clear the library when the device runs low on space. Only once there
// is something to keep (by then the browser is also more likely to agree; Firefox asks the user).
function keepStorage() {
  const st = navigator.storage;
  if (!st || !st.persist || !state.sounds.size) return;
  st.persisted().then((kept) => kept || st.persist()).catch(() => {});
}

// A friendly explanation for a storage error (see db.js), for toasts.
function storageMessage(err) {
  if (err && (err.name === 'QuotaExceededError' || /quota|disk|space/i.test(err.message))) {
    return 'Not enough storage on this device for Tikify. Delete some sounds or free up space, then try again.';
  }
  if (err && err.name === 'VersionError') return 'Tikify was updated in another tab. Reload this page to continue.';
  if (err && err.opening) return 'Tikify can’t save anything in this browser. Private browsing or blocked site data? Open Tikify in Safari or Chrome normally.';
  return 'Couldn’t save your change. Please try again.';
}
DB.onblocked = () => toast('Close other Tikify tabs or windows to finish updating', { error: true });
// Safety net: a storage failure no code path handled still gets explained instead of vanishing.
window.addEventListener('unhandledrejection', (e) => {
  if (!e.reason || !e.reason.storage) return;
  toast(storageMessage(e.reason), { error: true });
  e.preventDefault(); // explained, so not an uncaught error
});

// ---------- routing ----------
// Each route entry carries its in-app depth in history.state, so Back only steps through
// Tikify's own entries; overlay entries also carry `ov` (see holdOverlay).
const TAB_OF = { __proto__: null, library: 'library', all: 'library', playlist: 'library', add: 'add', search: 'search' };

function currentRoute() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/');
  let id = null;
  try { id = parts[1] ? decodeURIComponent(parts[1]) : null; } catch { /* malformed link: treated as missing */ }
  return { name: parts[0] || 'library', id, params: new URLSearchParams(query) };
}

function go(hash, { replace = false } = {}) {
  // Let a just-closed sheet give up its history entry first, so the new view isn't stacked on it.
  if (releasing || releaseOverlays()) { afterRelease = () => go(hash, { replace }); return; }
  const oldURL = location.href;
  const depth = history.state?.depth || 0;
  if (replace) history.replaceState({ depth, ov: history.state?.ov }, '', hash);
  else if (location.hash !== hash) {
    history.pushState({ depth: depth + 1 }, '', hash);
    scrollMemo.delete(depth + 1);
  }
  render();
  // pushState doesn't fire hashchange; keep per-view listeners (e.g. the Add preview) working.
  if (location.href !== oldURL) window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
}

// Back within the app; when the previous entry isn't ours (a shared link, a fresh tab), go to `fallback`.
function goBack(fallback = '#/library') {
  if (releasing) { afterRelease = () => goBack(fallback); return; }
  if (!(history.state?.depth > 0)) return go(fallback, { replace: true });
  let n = 1;
  while (overlays.length && !overlayOpen(overlays[overlays.length - 1])) { overlays.pop(); n++; }
  travel(n);
}

window.addEventListener('popstate', () => {
  const ours = releasing > 0;
  const level = history.state?.ov || 0;
  // Back closes the top overlay instead of changing the view under it.
  while (overlays.length > level) {
    if (overlays.pop() === 'sheet') closeSheet(null); else closePlayer();
  }
  if (!ours && sheetActive && !overlays.includes('sheet')) closeSheet(null); // a sheet without an entry
  // Forward onto the entry of an overlay that is no longer open: make it a plain entry.
  if (level > overlays.length) history.replaceState({ depth: history.state?.depth || 0 }, '');
  if (location.hash !== lastRoute) render();
  releaseDone();
});
window.addEventListener('hashchange', () => {
  if (location.hash !== lastRoute) render();
});

// `scrollTitle`: the view names itself in a heading of its own (a playlist); the bar shows the title
// only once that heading has scrolled out of sight (see watchHeading), and screen readers skip it.
let headingWatch = null;
function setTop(title, { back = false, menu = null, scrollTitle = false } = {}) {
  const h1 = $('#viewTitle');
  const bar = $('.topbar');
  // A refresh of the same view keeps the title as it is, so it doesn't blink.
  const same = scrollTitle && bar.classList.contains('scroll-title') && h1.textContent === title;
  h1.textContent = title;
  if (scrollTitle) h1.setAttribute('aria-hidden', 'true'); else h1.removeAttribute('aria-hidden');
  bar.classList.toggle('scroll-title', scrollTitle);
  if (!same) bar.classList.toggle('title-hidden', scrollTitle);
  if (headingWatch) { headingWatch.disconnect(); headingWatch = null; }
  $('#backBtn').hidden = !back;
  const mb = $('#menuBtn');
  mb.hidden = !menu;
  mb.onclick = menu;
  const tab = TAB_OF[currentRoute().name];
  document.querySelectorAll('.tabbar button').forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
}
function watchHeading(heading) {
  const bar = $('.topbar');
  if (!('IntersectionObserver' in window)) return bar.classList.remove('title-hidden');
  const io = new IntersectionObserver((entries) => {
    // (not a late call for a view that has since been left)
    if (headingWatch === io) bar.classList.toggle('title-hidden', entries[entries.length - 1].isIntersecting);
  }, { root: $('#view') });
  headingWatch = io;
  io.observe(heading);
}
$('#backBtn').onclick = () => {
  const to = currentRoute().params.get('to');
  goBack(currentRoute().name === 'add' && to ? '#/playlist/' + encodeURIComponent(to) : '#/library');
};
document.querySelectorAll('.tabbar button').forEach((b) =>
  b.addEventListener('click', () => {
    const hash = '#/' + b.dataset.tab;
    if (location.hash === hash) $('#view').scrollTop = 0; else go(hash);
  }));

let lastRoute = null;
let lastDepth = 0;
const scrollMemo = new Map(); // history depth -> { route, y }, so Back returns to the same scroll position

// Renders the current route. Called again on the same route it is a refresh: scroll position and
// focus are kept, and the Add view is left alone so an unsaved preview survives.
function render() {
  const r = currentRoute();
  const view = $('#view');
  const route = location.hash;
  const changed = route !== lastRoute;
  if (!changed && r.name === 'add') return;
  if (!TAB_OF[r.name] || (r.name === 'playlist' && !getPlaylist(r.id))) return go('#/library', { replace: true });

  const depth = history.state?.depth || 0;
  const first = lastRoute === null;
  if (changed && !first) scrollMemo.set(lastDepth, { route: lastRoute, y: view.scrollTop });
  const memo = scrollMemo.get(depth);
  const y = !changed ? view.scrollTop : memo && memo.route === route ? memo.y : 0;
  const keep = !changed && view.contains(document.activeElement) ? focusRef(document.activeElement) : null;
  lastRoute = route;
  lastDepth = depth;
  view._sync = null;

  if (r.name === 'playlist') renderPlaylist(view, r.id);
  else if (r.name === 'all') renderPlaylist(view, null);
  else if (r.name === 'add') renderAdd(view);
  else if (r.name === 'search') renderSearch(view, !changed);
  else renderLibrary(view);
  view.scrollTop = y;

  const heading = view.querySelector('.pl-header h1') || $('#viewTitle');
  const name = heading.textContent.trim();
  document.title = name ? name + ' · Tikify' : 'Tikify';
  if (keep && restoreFocus(keep)) return;
  // A refresh leaves focus alone, unless the focused control is gone (its row was deleted).
  if (!changed && !keep) return;
  // On a new view, move focus to its heading (or the empty search box) so screen readers announce
  // it, unless the user is busy in an overlay.
  const a = document.activeElement;
  if (sheetActive || playerOpen || !(!a || a === document.body || $('#app').contains(a) || $('#sheetBackdrop').contains(a))) return;
  const q = r.name === 'search' && !lastQuery && $('#q');
  if (q) q.focus();
  else if (!first) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

// ---------- views ----------
function mosaic(ids, cls = '') {
  const covers = ids.slice(0, 4).map((id) => coverSrc(state.sounds.get(id)));
  if (covers.length === 0) return `<div class="cover ${cls} empty">${ICON.note}</div>`;
  if (covers.length < 4) return `<img class="cover ${cls}" src="${esc(covers[0])}" alt="">`;
  return `<div class="cover ${cls} grid">${covers.map((c) => `<img src="${esc(c)}" alt="">`).join('')}</div>`;
}

// The library lives only in this browser, which may clear it (Safari does after 7 days without a
// visit, unless Tikify is on the home screen). Once 10 sounds have been added since the last
// backup (or since "Not now"), the Library suggests making one.
function unbackedSounds() {
  const since = Math.max(localStorageGet('lastBackupAt', 0), localStorageGet('backupNudgeAt', 0));
  let n = 0;
  for (const s of state.sounds.values()) if (s.addedAt > since) n++;
  return n >= 10 ? n : 0;
}

function renderLibrary(view) {
  setTop('Your Library', { menu: settingsMenu });
  const count = state.sounds.size;
  const unbacked = storageFailure ? 0 : unbackedSounds();
  view.innerHTML = `
    ${storageFailure ? `
      <div class="error" role="alert">
        <b>Your library couldn’t be opened.</b><br>
        ${esc(storageFailure.opening ? storageMessage(storageFailure) : 'Something went wrong while reading it. Try again, or close Tikify completely and open it again.')}
        <button class="btn ghost" id="retryLoad">Try again</button>
      </div>` : ''}
    ${unbacked ? `
      <div class="backup-nudge" id="backupNudge">
        <b>Back up your sounds</b>
        <p>${unbacked} sounds are only on this device. A backup file brings them back if your browser data is cleared, or moves them to a new phone.</p>
        <div class="row-btns">
          <button class="btn ghost" id="nudgeLater">Not now</button>
          <button class="btn primary" id="nudgeExport">Export backup</button>
        </div>
      </div>` : ''}
    ${isInAppBrowser() ? `
      <div class="note warn">You’re in an app’s built-in browser, which may throw away what you save here.
        Open Tikify in ${isIOS() ? 'Safari' : 'Chrome'} instead: tap <b>⋯</b> or <b>⋮</b> and choose <b>Open in browser</b>.</div>` : ''}
    <div class="lib-actions">
      <button class="chip" id="newPl">${ICON.plus}<span>New playlist</span></button>
    </div>
    <div class="list">
      <button class="row" data-go="#/all" aria-label="All sounds, playlist, ${plural(count, 'sound')}">
        <div class="cover all-sounds">${ICON.heart}</div>
        <div class="meta"><div class="t">All sounds</div><div class="s">Playlist · ${count} sound${count === 1 ? '' : 's'}</div></div>
      </button>
      ${state.playlists.map((p) => `
        <button class="row" data-go="#/playlist/${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}, playlist, ${plural(p.soundIds.length, 'sound')}">
          ${mosaic(p.soundIds)}
          <div class="meta"><div class="t">${esc(p.name)}</div><div class="s">Playlist · ${p.soundIds.length} sound${p.soundIds.length === 1 ? '' : 's'}</div></div>
        </button>`).join('')}
    </div>
    ${count === 0 && !storageFailure ? `
      <div class="empty-state">
        <div class="big-icon">${ICON.note}</div>
        <h2>Start your collection</h2>
        <p>Copy a TikTok link, then tap <b>Add sound</b> to save the sound.</p>
        <button class="btn primary" data-go="#/add">Add your first sound</button>
        ${isIOS() && isStandalone() ? `
          <p class="from-safari">Saved sounds in Safari before installing? They stay in Safari: export a backup
            there (Your Library → ⋮), then import it here.</p>
          <button class="btn ghost" id="emptyImport">Import backup</button>` : ''}
      </div>` : ''}
  `;
  view.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => go(el.dataset.go)));
  if (storageFailure) {
    $('#retryLoad').onclick = async () => {
      try { await loadAll(); storageFailure = null; } catch (err) { storageFailure = err; toast('Still can’t open your library', { error: true }); }
      render();
      if (!storageFailure) restoreSession();
    };
  }
  if ($('#emptyImport')) $('#emptyImport').onclick = () => importInput.click();
  if (unbacked) {
    $('#nudgeExport').onclick = exportBackup;
    $('#nudgeLater').onclick = () => { localStorageSet('backupNudgeAt', Date.now()); render(); };
  }
  $('#newPl').onclick = async () => {
    const name = await sheetPrompt('Name your playlist', '', 'My playlist', 'Create');
    if (!name) return;
    const p = await createPlaylist(name);
    go('#/playlist/' + encodeURIComponent(p.id));
  };
}

function trackRow(sound, i, { playing }) {
  return `
    <div class="row track ${playing ? 'playing' : ''}" data-i="${i}" data-id="${esc(sound.id)}">
      <button class="track-main" aria-label="${esc(sound.title)}, ${esc(sound.artist)}" ${playing ? 'aria-current="true"' : ''}>
        <img class="cover" src="${esc(coverSrc(sound))}" alt="" loading="lazy">
        <div class="meta"><div class="t">${esc(sound.title)}</div><div class="s">${esc(sound.artist)}</div></div>
      </button>
      <button class="icon-btn more" aria-label="More options for ${esc(sound.title)}">${ICON.dots}</button>
    </div>`;
}

function currentId() {
  return state.queue[state.index];
}

function renderPlaylist(view, playlistId) {
  const isAll = playlistId === null;
  const p = isAll ? null : getPlaylist(playlistId);
  if (!isAll && !p) return go('#/library', { replace: true });
  const ids = isAll ? allSoundIds() : p.soundIds.filter((id) => state.sounds.has(id));
  const name = isAll ? 'All sounds' : p.name;
  // By id, not name: playlists can share a name or be renamed while playing.
  const ctx = { id: isAll ? 'all' : 'pl:' + p.id, label: name };

  setTop(name, { back: true, menu: isAll ? null : () => playlistMenu(p), scrollTitle: true });

  view.innerHTML = `
    <div class="pl-header ${isAll ? 'is-all' : ''}">
      ${isAll ? `<div class="cover xl all-sounds">${ICON.heart}</div>` : mosaic(ids, 'xl')}
      <h1 tabindex="-1">${esc(name)}</h1>
      <div class="s">${ids.length} sound${ids.length === 1 ? '' : 's'}</div>
      <div class="pl-actions">
        ${isAll ? '' : `<button class="icon-btn" id="plAdd" aria-label="Add sounds">${ICON.plus}</button>`}
        <span class="grow"></span>
        <button class="icon-btn ${state.shuffle ? 'on' : ''}" id="plShuffle" aria-label="Shuffle" aria-pressed="${state.shuffle}">${ICON.shuffle}</button>
        <button class="play-btn green" id="plPlay" aria-label="Play" ${ids.length ? '' : 'disabled'}>${ICON.play}</button>
      </div>
    </div>
    <div class="list tracks" data-ctx="${esc(ctx.id)}">
      ${ids.map((id, i) => trackRow(state.sounds.get(id), i, { playing: id === currentId() && state.contextId === ctx.id })).join('')}
    </div>
    ${ids.length === 0 ? `
      <div class="empty-state small">
        <p>${isAll ? 'No sounds yet.' : 'This playlist is empty.'}</p>
        <button class="btn primary" id="emptyAdd">${isAll ? 'Add a sound' : 'Add sounds'}</button>
      </div>` : ''}
  `;
  watchHeading($('.pl-header h1', view));

  const isThisContext = () => state.contextId === ctx.id && state.queue.length;
  const syncPlayIcon = () => {
    const btn = $('#plPlay');
    if (!btn) return;
    const playing = isThisContext() && !audio.paused;
    btn.innerHTML = playing ? ICON.pause : ICON.play;
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  };
  syncPlayIcon();
  view._sync = syncPlayIcon;

  $('#plPlay').onclick = () => {
    if (isThisContext()) return togglePlay();
    playList(ids, state.shuffle ? Math.floor(Math.random() * ids.length) : 0, ctx);
  };
  $('#plShuffle').onclick = () => setShuffle(!state.shuffle);
  const addSounds = () => (isAll ? go('#/add') : pickSoundsFor(p));
  $('#plAdd') && ($('#plAdd').onclick = addSounds);
  if ($('#emptyAdd')) {
    $('#emptyAdd').onclick = () => (isAll || !state.sounds.size ? go('#/add' + (isAll ? '' : '?to=' + encodeURIComponent(p.id))) : pickSoundsFor(p));
  }

  view.querySelectorAll('.track').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.more')) {
        soundMenu(state.sounds.get(row.dataset.id), p);
        return;
      }
      playList(ids, +row.dataset.i, ctx);
    });
  });
}

async function playlistMenu(p) {
  const v = await sheetMenu(p.name, [
    { label: 'Add sounds from library', value: 'add', icon: ICON.playlistAdd },
    { label: 'Add new TikTok sound', value: 'new', icon: ICON.plus },
    { label: 'Rename playlist', value: 'rename', icon: ICON.edit },
    { label: 'Delete playlist', value: 'delete', danger: true, icon: ICON.trash },
  ]);
  if (v === 'add') pickSoundsFor(p);
  if (v === 'new') go('#/add?to=' + encodeURIComponent(p.id));
  if (v === 'rename') {
    const name = await sheetPrompt('Rename playlist', p.name);
    if (name) { await updatePlaylist(p, { name }); render(); updateNowPlaying(); } // "Playing from <new name>"
  }
  if (v === 'delete') {
    if (await sheetConfirm('Delete playlist?', `“${p.name}” will be removed. The sounds stay in your library.`)) {
      await DB.del('playlists', p.id);
      state.playlists = state.playlists.filter((x) => x.id !== p.id);
      // Step back rather than push, so Back doesn't return to the deleted playlist.
      goBack();
      toast('Playlist deleted');
    }
  }
}

async function soundMenu(sound, playlist) {
  if (!sound) return;
  const items = [
    ...(sound.id === currentId() ? [] : [{ label: 'Play next', value: 'next', icon: ICON.next }]),
    { label: 'Add to playlist', value: 'add', icon: ICON.playlistAdd },
    { label: 'Edit title & artist', value: 'edit', icon: ICON.edit },
  ];
  // Position among the rows the playlist actually shows, not in the raw soundIds array.
  const shown = playlist ? playlist.soundIds.filter((id) => state.sounds.has(id)) : [];
  const pos = shown.indexOf(sound.id);
  if (playlist) {
    if (pos > 0) items.push({ label: 'Move up', value: 'up', icon: ICON.up });
    if (pos !== -1 && pos < shown.length - 1) items.push({ label: 'Move down', value: 'down', icon: ICON.down });
    items.push({ label: 'Remove from this playlist', value: 'remove', icon: ICON.remove });
  }
  if (sound.sourceUrl) items.push({ label: 'Open on TikTok', value: 'open', icon: ICON.open });
  items.push({ label: 'Delete from library', value: 'delete', danger: true, icon: ICON.trash });

  const v = await sheetMenu(sound.title, items, sound.artist);
  if (v === 'next') {
    if (!state.queue.length) return playList([sound.id], 0, { id: 'queue', label: 'Queue' });
    // Moved rather than copied (it may be queued already), in the shuffled and the original order,
    // so it stays next when shuffle is switched.
    const cur = currentId();
    const putNext = (q) => {
      q = q.filter((x) => x !== sound.id);
      q.splice(q.indexOf(cur) + 1, 0, sound.id);
      return q;
    };
    state.queue = putNext(state.queue);
    state.baseQueue = putNext(state.baseQueue);
    state.upNext = [sound.id, ...state.upNext.filter((x) => x !== sound.id)];
    state.index = state.queue.indexOf(cur);
    saveSession();
    readAhead();
    toast('Playing next');
  }
  if (v === 'add') addToPlaylistSheet(sound);
  if (v === 'edit') editSound(sound);
  if (v === 'up' || v === 'down') {
    const ids = playlist.soundIds.slice();
    const i = ids.indexOf(sound.id);
    const j = ids.indexOf(shown[v === 'up' ? pos - 1 : pos + 1]);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await updatePlaylist(playlist, { soundIds: ids });
    render();
  }
  if (v === 'remove') {
    await updatePlaylist(playlist, { soundIds: playlist.soundIds.filter((x) => x !== sound.id) });
    render();
    toast('Removed from ' + playlist.name);
  }
  if (v === 'open') window.open(sound.sourceUrl, '_blank', 'noopener');
  if (v === 'delete') {
    if (await sheetConfirm('Delete sound?', `“${sound.title}” will be removed from your library and all playlists.`)) {
      await deleteSound(sound.id);
      render();
      toast('Sound deleted');
    }
  }
}

async function editSound(sound) {
  const html = `
    <div class="sheet-title">Edit sound</div>
    <form class="sheet-form">
      <label class="lbl" for="eTitle">Title</label>
      <input class="input" id="eTitle" name="title" value="${esc(sound.title)}" maxlength="150" enterkeyhint="next">
      <label class="lbl" for="eArtist">Artist</label>
      <input class="input" id="eArtist" name="artist" value="${esc(sound.artist)}" maxlength="150" enterkeyhint="done">
      <div class="row-btns">
        <button type="button" class="btn ghost" data-cancel>Cancel</button>
        <button type="submit" class="btn primary">Save</button>
      </div>
    </form>`;
  const res = await openSheet(html, (sheet, close) => {
    const f = $('form', sheet);
    $('[data-cancel]', sheet).onclick = () => close(null);
    f.onsubmit = (e) => {
      e.preventDefault();
      close({ title: f.elements.title.value.trim(), artist: f.elements.artist.value.trim() });
    };
  });
  if (!res) return;
  const changes = { title: res.title || sound.title, artist: res.artist || sound.artist };
  await DB.put('sounds', { ...sound, ...changes });
  Object.assign(sound, changes);
  render();
  if (currentId() === sound.id) updateNowPlaying();
}

// The playlists that hold the sound are ticked; tapping one of those takes it out again.
async function addToPlaylistSheet(sound) {
  const items = [{ label: 'New playlist', value: '__new', icon: ICON.plus }]
    .concat(state.playlists.map((p) => ({ label: p.name, value: p.id, icon: ICON.playlist, pressed: p.soundIds.includes(sound.id) })));
  const v = await sheetMenu('Add to playlist', items);
  if (!v) return;
  let p;
  if (v === '__new') {
    const name = await sheetPrompt('Name your playlist', '', 'My playlist', 'Create');
    if (!name) return;
    p = await createPlaylist(name);
  } else {
    p = getPlaylist(v);
    if (!p) return; // deleted meanwhile (in another tab)
  }
  if (p.soundIds.includes(sound.id)) {
    await updatePlaylist(p, { soundIds: p.soundIds.filter((x) => x !== sound.id) });
    toast('Removed from ' + p.name);
  } else {
    await addToPlaylist(p, sound.id);
    toast('Added to ' + p.name);
  }
  render();
}

// Choose several library sounds to add to a playlist.
async function pickSoundsFor(p) {
  const ids = allSoundIds().filter((id) => !p.soundIds.includes(id));
  if (!ids.length) {
    const v = await sheetMenu('Everything is already here', [{ label: 'Add a new TikTok sound', value: 'new', icon: ICON.plus }],
      'All sounds in your library are in this playlist.');
    if (v === 'new') go('#/add?to=' + encodeURIComponent(p.id));
    return;
  }
  const html = `
    <div class="sheet-title">Add to ${esc(p.name)}</div>
    <div class="sheet-list pick">
      ${ids.map((id) => {
        const s = state.sounds.get(id);
        return `<label class="row pick-row">
          <img class="cover" src="${esc(coverSrc(s))}" alt="">
          <div class="meta"><div class="t">${esc(s.title)}</div><div class="s">${esc(s.artist)}</div></div>
          <input type="checkbox" value="${esc(id)}" aria-label="${esc(s.title)}, ${esc(s.artist)}"><span class="check"></span>
        </label>`;
      }).join('')}
    </div>
    <div class="row-btns">
      <button class="btn ghost" data-cancel>Cancel</button>
      <button class="btn primary" data-ok>Add</button>
    </div>`;
  const chosen = await openSheet(html, (sheet, close) => {
    $('[data-cancel]', sheet).onclick = () => close(null);
    $('[data-ok]', sheet).onclick = () =>
      close([...sheet.querySelectorAll('input[type=checkbox]:checked')].map((c) => c.value));
  });
  if (!chosen || !chosen.length) return;
  await updatePlaylist(p, { soundIds: [...p.soundIds, ...chosen] });
  toast(`Added ${chosen.length} sound${chosen.length === 1 ? '' : 's'}`);
  render();
}

// ----- Add sound view -----
let pendingShare = null; // link shared into the app via the share sheet
let shareHadNoLink = false; // something was shared to Tikify, but it held no TikTok link
// Bumped by every lookup and every new Add view, so an answer that arrives late (tikwm is often
// slow) is dropped instead of replacing the newer preview.
let lookupSeq = 0;
let lookupCtl = null;
function cancelLookup() {
  lookupSeq++;
  if (lookupCtl) lookupCtl.abort();
  lookupCtl = null;
}
window.addEventListener('hashchange', () => stopPreview()); // the preview's button is gone

function renderAdd(view) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const presetPlaylist = params.get('to');
  cancelLookup();
  stopPreview();
  // Opened from a playlist: offer a way back to it (iPhone home screen apps have no back button).
  setTop('Add sound', { back: !!presetPlaylist });

  // type="text", not "url": the browser's URL check would reject share text ("Check out … https://…")
  // and links without https://, which extractUrl handles.
  view.innerHTML = `
    <div class="add-wrap">
      <p class="hint" id="linkHint">Copy the link of a TikTok video (Share → Copy link) and paste it here.</p>
      <form id="lookupForm" class="lookup" novalidate>
        <input class="input" id="linkInput" type="text" inputmode="url" aria-label="TikTok video link" aria-describedby="linkHint"
          placeholder="https://www.tiktok.com/@user/video/…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search">
        <button type="button" class="icon-btn paste" id="pasteBtn" aria-label="Paste">${ICON.paste}</button>
      </form>
      <button class="btn primary wide" id="findBtn" form="lookupForm" type="submit">Find sound</button>
      <div id="result"></div>
      <details class="tips">
        <summary>Tips</summary>
        <ul>
          <li>Use the link of a <b>video</b>. A sound’s own page or a profile won’t work: open a video that uses the sound and copy that video’s link.</li>
          <li>On Android, after installing Tikify you can share a TikTok straight to it: <b>Share → More → Tikify</b>.</li>
          <li>Sounds are downloaded to this device, so they play offline.</li>
          <li>Short links like <code>vm.tiktok.com/…</code> work too.</li>
        </ul>
      </details>
    </div>`;

  const input = $('#linkInput');
  // Called directly, not through form.requestSubmit(), which iOS 15 doesn't have.
  const submitLookup = () => {
    const url = TikTok.extractUrl(input.value);
    if (!url) {
      toast(input.value.trim() ? 'That doesn’t look like a TikTok link' : 'Paste the link of a TikTok video first', { error: true });
      return;
    }
    input.value = url;
    input.blur(); // hide the on-screen keyboard so the preview isn't covered
    lookupAndPreview(url, presetPlaylist);
  };
  $('#lookupForm').onsubmit = (e) => {
    e.preventDefault();
    submitLookup();
  };
  $('#pasteBtn').onclick = async () => {
    let text;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      // No clipboard access here (or it was refused): the system paste menu still works.
      toast('Long-press the box and choose Paste');
      input.focus();
      return;
    }
    const url = TikTok.extractUrl(text);
    // Only a TikTok link goes into the box; anything else on the clipboard (a password?) stays there.
    if (!url) return toast('No TikTok link on your clipboard. In TikTok, tap Share → Copy link.');
    input.value = url;
    submitLookup();
  };

  if (pendingShare) {
    input.value = pendingShare;
    pendingShare = null;
    submitLookup();
  } else if (shareHadNoLink) {
    shareHadNoLink = false;
    $('#result').innerHTML = '<div class="error" role="alert">That share didn’t include a TikTok link. In TikTok, tap <b>Share → Copy link</b>, then paste it here.</div>';
  }
}

// The same sound saved before: from this video, or from another video that uses it.
function findSaved(info) {
  for (const s of state.sounds.values()) {
    if ((info.tiktokId && s.tiktokId === info.tiktokId) || (info.musicId && s.musicId === info.musicId)) return s;
  }
  return null;
}

// A video caption as a title: one line, no hashtags, at most 80 characters (by code point, so
// an emoji isn't cut in half), shortened at a word where possible.
function captionTitle(caption) {
  const s = caption.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim();
  const chars = Array.from(s);
  if (chars.length <= 80) return s;
  const cut = chars.slice(0, 80).join('');
  const space = cut.lastIndexOf(' ');
  return (space > 40 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, '') + '…';
}

async function lookupAndPreview(url, presetPlaylist) {
  cancelLookup(); // the newest lookup wins, whichever answer arrives first
  const seq = lookupSeq;
  const ctl = (lookupCtl = new AbortController());
  const result = $('#result');
  const findBtn = $('#findBtn');
  const stale = () => seq !== lookupSeq || !result.isConnected;
  findBtn.disabled = true;
  stopPreview(); // its button is about to be replaced
  result.innerHTML = '<div class="loading"><div class="spinner"></div>Finding the sound…</div>';
  announce('Finding the sound…');
  let info;
  try {
    info = await TikTok.lookup(url, { signal: ctl.signal });
  } catch (err) {
    if (stale()) return;
    result.innerHTML = `<div class="error" role="alert">${esc(err && err.problem ? err.message : 'Something went wrong. Please try again.')}</div>`;
    findBtn.disabled = false;
    if (document.activeElement === document.body) findBtn.focus();
    return;
  }
  if (stale()) return; // a newer lookup, or the user left the Add view
  findBtn.disabled = false;

  const dup = findSaved(info);
  // "original sound - user" isn't a great title; suggest the video caption instead.
  const suggestTitle = info.isOriginal && info.videoTitle ? captionTitle(info.videoTitle) : '';

  result.innerHTML = `
    <div class="preview">
      <h2 class="sr-only" tabindex="-1">${dup ? 'Already in your library' : 'Found'}: ${esc(info.title)}</h2>
      <div class="preview-top">
        <img class="cover lg" src="${esc(webUrl(info.coverUrl) || NO_COVER)}" alt="" referrerpolicy="no-referrer">
        <button class="play-btn green" id="previewPlay" aria-label="Play preview">${ICON.play}</button>
      </div>
      ${dup ? `<div class="note">Already in your library as “${esc(dup.title)}”.</div>` : ''}
      <label class="lbl" for="pTitle">Title</label>
      <input class="input" id="pTitle" value="${esc(info.title)}" maxlength="150" enterkeyhint="next">
      ${suggestTitle ? `<button class="link-btn" id="useCaption">Use caption: “${esc(suggestTitle)}”</button>` : ''}
      <label class="lbl" for="pArtist">Artist</label>
      <input class="input" id="pArtist" value="${esc(info.artist)}" maxlength="150" enterkeyhint="done">
      <fieldset class="pl-fieldset">
        <legend class="lbl">Add to playlists</legend>
        <div class="pl-checks">
          ${state.playlists.map((p) => `
            <label class="pl-check"><input type="checkbox" value="${esc(p.id)}" ${p.id === presetPlaylist ? 'checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}
          <button class="chip" id="pNewPl">${ICON.plus}<span>New playlist</span></button>
        </div>
      </fieldset>
      <div id="saveError"></div>
      ${dup ? '<button class="btn primary wide" id="useSaved">Use the saved sound</button>' : ''}
      <button class="btn ${dup ? 'ghost' : 'primary'} wide" id="saveBtn">${dup ? 'Save another copy' : 'Save to library'}</button>
    </div>`;

  // Everything below works on this card only: by the time a tap or a download finishes, a newer
  // lookup may have replaced it, or the user may be on another view.
  const card = $('.preview', result);
  const q = (sel) => $(sel, card);

  // Preview with a temporary audio element so the queue isn't touched. It loads only when played:
  // most finds are saved without a listen, and saving downloads the sound anyway.
  const el = new Audio();
  el.preload = 'none';
  el.src = info.audioUrl;
  const pBtn = q('#previewPlay');
  pBtn.onclick = () => {
    if (!el.paused) return el.pause();
    pausePlayback();
    el.play().catch((err) => {
      if (err.name === 'AbortError') return;
      stopPreview();
      toast('Could not play preview', { error: true });
    });
  };
  const icon = () => {
    pBtn.innerHTML = el.paused ? ICON.play : ICON.pause;
    pBtn.setAttribute('aria-label', el.paused ? 'Play preview' : 'Pause preview');
  };
  el.onplay = () => { icon(); startPreview(el, info); };
  el.onpause = () => { icon(); syncPreviewState(); };
  el.onended = () => { icon(); if (preview && preview.el === el) stopPreview(); };
  // Screen reader users would otherwise be left on <body>. The card's hidden heading, not a control:
  // it keeps the on-screen keyboard closed, and gets no focus ring (a launch from the share sheet
  // has had no tap yet, so a focused button would show one).
  const heading = q('h2');
  if (document.activeElement === document.body || $('#lookupForm')?.contains(document.activeElement)) heading.focus();
  else announce(heading.textContent);

  if (suggestTitle) q('#useCaption').onclick = () => (q('#pTitle').value = suggestTitle);

  q('#pNewPl').onclick = async () => {
    const name = await sheetPrompt('Name your playlist', '', 'My playlist', 'Create');
    if (!name) return;
    const p = await createPlaylist(name);
    const lbl = document.createElement('label');
    lbl.className = 'pl-check';
    lbl.innerHTML = `<input type="checkbox" value="${esc(p.id)}" checked><span>${esc(p.name)}</span>`;
    q('#pNewPl').before(lbl);
  };

  const saveBtn = q('#saveBtn');
  const useSaved = q('#useSaved');
  const chosenIds = () => [...card.querySelectorAll('.pl-checks input:checked')].map((c) => c.value);
  const busy = (on) => { for (const b of card.querySelectorAll('#saveBtn, #useSaved, #saveStream')) b.disabled = on; };

  // From here on the sound is in the library: nothing may offer to save it again.
  async function finish(sound, chosen, existing) {
    const added = [];
    const already = [];
    const failed = [];
    for (const id of chosen) {
      const p = getPlaylist(id);
      if (!p) continue;
      try { (await addToPlaylist(p, sound.id) ? added : already).push(p.name); } catch { failed.push(p.name); }
    }
    const where = (names) => (names.length === 1 ? names[0] : plural(names.length, 'playlist'));
    if (failed.length) {
      toast(`${existing ? 'Couldn’t' : 'Saved, but couldn’t'} add it to ${failed.join(', ')}. Try again from the sound’s menu.`, { error: true });
    } else if (existing) {
      toast(added.length ? `Added to ${where(added)}` : `It’s already in ${already.length ? where(already) : 'your library'}`);
    } else if (sound.audioUrl) {
      toast('Saved. It needs internet to play until it can be downloaded.');
    } else {
      toast(added.length ? `Saved to ${where(added)}` : 'Saved to your library');
    }
    // The user went on to another view or lookup meanwhile: refresh what's on screen instead.
    if (!card.isConnected) return render();
    const backTo = presetPlaylist && getPlaylist(presetPlaylist);
    result.innerHTML = `
      <div class="saved">
        <div class="big-icon ok" aria-hidden="true">✓</div>
        <div><b>${esc(sound.title)}</b> ${existing ? 'is in your library' : 'saved'}</div>
        ${sound.audioUrl ? '<div class="note">It plays only with internet for now. Tikify downloads it the next time it plays online.</div>' : ''}
        <div class="row-btns">
          <button class="btn ghost" id="addAnother">Add another</button>
          <button class="btn primary" id="playNow">Play now</button>
        </div>
        ${backTo ? `<button class="btn ghost" id="backToPl">Back to ${esc(backTo.name)}</button>` : ''}
      </div>`;
    // Not a next link the user put in the box while this one was saving.
    const box = $('#linkInput');
    if (TikTok.extractUrl(box.value) === url) box.value = '';
    $('#addAnother').onclick = () => { result.innerHTML = ''; $('#linkInput').focus(); };
    $('#playNow').onclick = () => playList([sound.id], 0, { id: 'added', label: 'Just added' });
    if (backTo) $('#backToPl').onclick = () => goBack('#/playlist/' + encodeURIComponent(backTo.id));
    if (!document.activeElement || document.activeElement === document.body) $('#playNow').focus();
  }

  // One cover download per preview: "Try again" and "Save without downloading" reuse it.
  let cover = null;
  async function save(stream) {
    // Read the form now: the user may leave the Add view while the sound downloads.
    const fields = { title: q('#pTitle').value.trim(), artist: q('#pArtist').value.trim() };
    const chosen = chosenIds();
    busy(true);
    saveBtn.textContent = stream ? 'Saving…' : 'Downloading…';
    q('#saveError').innerHTML = '';
    stopPreview();
    cover = cover || downloadCover(info.coverUrls || [info.coverUrl]);
    let sound;
    try {
      sound = await saveSound(info, fields, {
        stream,
        cover,
        onProgress: (p) => (saveBtn.textContent = `Downloading… ${Math.round(p * 100)}%`),
      });
    } catch (err) {
      busy(false);
      const why = err && err.storage ? storageMessage(err) : err && err.problem ? err.message : 'Something went wrong. Please try again.';
      if (!card.isConnected) return toast(`Couldn’t save “${fields.title || info.title}”. ${why}`, { error: true });
      saveBtn.textContent = 'Try again';
      if (err && err.storage) return toast(why, { error: true });
      // Without the download it can still be kept as a link, which works online (for now).
      q('#saveError').innerHTML = `<div class="error" role="alert">Couldn’t download the sound. ${esc(why)}
        <button class="btn ghost" id="saveStream">Save without downloading</button></div>`;
      q('#saveStream').onclick = () => save(true);
      return;
    }
    finish(sound, chosen, false);
  }

  saveBtn.onclick = () => save(false);
  if (useSaved) {
    useSaved.onclick = () => {
      if (!state.sounds.has(dup.id)) return save(false); // deleted meanwhile
      // It's in the library already: without a playlist there is nothing to do.
      if (!chosenIds().length) return toast('Pick a playlist to add it to');
      busy(true);
      stopPreview();
      finish(dup, chosenIds(), true);
    };
  }
}

// ----- Search view -----
let lastQuery = '';
function renderSearch(view, refresh) {
  // A refresh (a save finishing, a cover arriving) updates only the results: a new search box would
  // move the caret while the user types and, on iPhone, close the keyboard.
  const form = refresh && $('#searchForm', view);
  if (form && form._run) return form._run();
  setTop('Search');
  view.innerHTML = `
    <div class="search-wrap">
      <form role="search" id="searchForm">
        <input class="input search" id="q" type="search" placeholder="Songs, artists or playlists" value="${esc(lastQuery)}" aria-label="Search your sounds and playlists" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
      </form>
      <div id="searchResults"></div>
    </div>`;
  const q = $('#q');
  // The keyboard's Search key just hides the keyboard: results are already live.
  $('#searchForm').onsubmit = (e) => { e.preventDefault(); q.blur(); };
  const run = () => {
    lastQuery = q.value;
    const term = q.value.trim().toLowerCase();
    const out = $('#searchResults');
    if (!term) {
      out.innerHTML = state.sounds.size ? '<p class="hint center">Search your saved sounds.</p>' : '<p class="hint center">Nothing saved yet.</p>';
      return;
    }
    const pls = state.playlists.filter((p) => p.name.toLowerCase().includes(term));
    const ids = allSoundIds().filter((id) => {
      const s = state.sounds.get(id);
      return (s.title + ' ' + s.artist).toLowerCase().includes(term);
    });
    out.innerHTML = `
      <div class="list">
        ${pls.map((p) => `
          <button class="row" data-go="#/playlist/${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}, playlist">
            ${mosaic(p.soundIds)}
            <div class="meta"><div class="t">${esc(p.name)}</div><div class="s">Playlist</div></div>
          </button>`).join('')}
      </div>
      <div class="list tracks">${ids.map((id, i) => trackRow(state.sounds.get(id), i, { playing: id === currentId() })).join('')}</div>
      ${!pls.length && !ids.length ? '<p class="hint center">No matches.</p>' : ''}`;
    const n = pls.length + ids.length;
    announce(n ? `${n} result${n === 1 ? '' : 's'}` : 'No matches');
    out.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => go(el.dataset.go)));
    out.querySelectorAll('.track').forEach((row) => row.addEventListener('click', (e) => {
      if (e.target.closest('.more')) return soundMenu(state.sounds.get(row.dataset.id), null);
      playList(ids, +row.dataset.i, { id: 'search', label: 'Search' });
    }));
  };
  q.addEventListener('input', run);
  $('#searchForm')._run = run;
  run();
}

// ----- settings / backup -----
async function settingsMenu() {
  const pick = sheetMenu('Tikify', [
    ...(isStandalone() ? [] : [{ label: installWords().menu, value: 'install', icon: ICON.install }]),
    { label: 'Export backup', value: 'export', icon: ICON.download },
    { label: 'Import backup', value: 'import', icon: ICON.upload },
    { label: 'About', value: 'about', icon: ICON.info },
  ], `${plural(state.sounds.size, 'sound')} · ${plural(state.playlists.length, 'playlist')} · stored on this device`);
  const sub = $('#sheet .sheet-sub');
  const line = (t) => sub.appendChild(Object.assign(document.createElement('div'), { textContent: t }));
  const usage = line('');
  line(lastBackupText());
  storageSummary().then((t) => (usage.textContent = t), () => {});
  const v = await pick;
  if (v === 'install') showInstallPrompt();
  if (v === 'export') exportBackup();
  if (v === 'import') importInput.click();
  if (v === 'about') showAbout();
}

// Shown in About, so a screenshot tells which release a phone runs and how it lays out the screen.
const VERSION = '1.1.1';
function aboutTech() {
  const v = measureViewport();
  const where = isStandalone() ? 'Home Screen app' : 'browser';
  return `Version ${VERSION} · ${where} · screen ${v.screenW}×${v.screenH} · window ${v.innerW}×${v.innerH} · ` +
    `bottom ${v.edge} · gap ${getComputedStyle(document.documentElement).getPropertyValue('--ios-gap').trim() || '0px'}`;
}

function showAbout() {
  openSheet(`
    <div class="sheet-title">About Tikify</div>
    <div class="about">
      <p>Save TikTok sounds and listen to them like music: playlists, shuffle, repeat, offline.</p>
      <p><b>Privacy.</b> Your library is stored only on this device. A link you look up is sent to
        tikwm.com, a free third-party service, to find its sound; the audio and cover are then
        downloaded from TikTok’s servers. No account and no analytics.</p>
      <p><b>Not affiliated with TikTok or Spotify.</b> Tikify is an independent project. It isn’t
        made, endorsed or sponsored by TikTok, ByteDance or Spotify. TikTok is a trademark of
        ByteDance Ltd. and Spotify a trademark of Spotify AB.</p>
      <p>Save sounds for your own listening only, and respect the rights of their creators.</p>
      <p class="about-tech">${aboutTech()}</p>
    </div>
    <button class="btn ghost wide" data-cancel>Close</button>`, (sheet, close) => {
    $('[data-cancel]', sheet).onclick = () => close(null);
  });
}

function fmtBytes(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' GB';
  if (n >= 1e6) return Math.round(n / 1e6) + ' MB';
  return Math.round(n / 1e3) + ' KB';
}

// How much room the library takes, and whether the browser may clear it to free up space.
async function storageSummary() {
  const st = navigator.storage;
  if (!st || !st.estimate) return '';
  const [{ usage = 0, quota = 0 }, kept] = await Promise.all([st.estimate(), st.persisted ? st.persisted() : false]);
  return `${fmtBytes(usage)} used${quota ? ' of ' + fmtBytes(quota) : ''} · ${kept ? '' : 'not '}protected from clearing` +
    (quota && quota < 300e6 ? '. Space is tight here (private window?)' : '');
}

function lastBackupText() {
  const at = localStorageGet('lastBackupAt', 0);
  if (!at) return 'No backup yet. Export one to keep your sounds safe.';
  const days = Math.floor((Date.now() - at) / 864e5);
  return 'Last backup ' + (days < 1 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago');
}

const blobToDataUrl = (blob) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = () => rej(r.error);
  r.readAsDataURL(blob);
});
const parseJSON = (s) => { try { return JSON.parse(s); } catch { return null; } };

// A backup is one JSON file with each sound on its own line. It is built from one small Blob
// per sound, never as one giant string, which fails past a few hundred MB (and gets the app
// killed on iPhone long before that). Import reads it back line by line.
let exportRun = 0;
function exportBackup() {
  const run = ++exportRun;
  let file = null;
  openSheet(`
    <div class="sheet-title">Export backup</div>
    <div class="sheet-sub" id="backupStatus" role="status">Preparing your backup…</div>
    <div class="row-btns">
      <button class="btn ghost" data-cancel>Cancel</button>
      <button class="btn primary" data-ok disabled>Save backup</button>
    </div>`, (sheet, close) => {
    $('[data-cancel]', sheet).onclick = () => close(null);
    // Straight from the tap: the share sheet needs a fresh user gesture.
    $('[data-ok]', sheet).onclick = () => file && saveBackupFile(file, close);
  }).then(() => { if (run === exportRun) exportRun++; }); // closing the sheet stops the export
  const status = $('#backupStatus');
  const okBtn = $('#sheet [data-ok]');
  buildBackup(run, (i, n) => (status.textContent = `Preparing your backup… ${i} of ${n}`)).then((b) => {
    if (!b || run !== exportRun) return;
    file = b.file;
    status.textContent = `${plural(state.sounds.size, 'sound')}, ${fmtBytes(file.size)}. ` + (b.unreadable
      ? `${plural(b.unreadable, 'sound')} couldn’t be read on this device, so ${b.unreadable === 1 ? 'it is' : 'they are'} saved without audio. `
      : '') + 'Keep the file somewhere safe, like Files, iCloud Drive or Google Drive, to restore your library on any device.';
    okBtn.disabled = false;
    if (document.activeElement === $('#sheet')) okBtn.focus();
  }, (err) => {
    if (run !== exportRun) return;
    status.textContent = 'Couldn’t create the backup. ' + (err && err.storage
      ? (err.opening ? storageMessage(err) : 'Your library couldn’t be read. Close Tikify completely, open it again and try again.')
      : 'Close other apps to free up memory, then try again.');
  });
}

async function buildBackup(run, progress) {
  const sounds = [...state.sounds.values()];
  const head = JSON.stringify({ app: 'tikify', version: 2, exportedAt: Date.now(), playlists: state.playlists });
  const parts = [head.slice(0, -1) + ',"sounds":[\n'];
  let shown = 0;
  let unreadable = 0;
  // A stored file can become unreadable (WebKit loses them now and then). That sound is backed up
  // without it, rather than failing the whole backup; once restored, playing it downloads it again.
  const dataUrl = (blob) => (blob ? blobToDataUrl(blob).catch(() => null) : null);
  for (let i = 0; i < sounds.length; i++) {
    const { coverBlob, ...s } = sounds[i];
    const a = await DB.get('audio', s.id);
    const audioData = await dataUrl(a && a.blob);
    if (a && a.blob && !audioData) unreadable++;
    const line = JSON.stringify({ ...s, cover: await dataUrl(coverBlob), audio: audioData });
    if (run !== exportRun) return null;
    parts.push(new Blob([(i ? ',' : '') + line + '\n']));
    if (Date.now() - shown > 800) { shown = Date.now(); progress(i + 1, sounds.length); }
  }
  parts.push(']}\n');
  const file = new File(parts, `tikify-backup-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
  return { file, unreadable };
}

function saveBackupFile(file, close) {
  const done = (msg) => {
    localStorageSet('lastBackupAt', Date.now());
    $('#backupNudge')?.remove();
    close(true);
    toast(msg);
  };
  // On iPhone the share sheet's "Save to Files" is the dependable way to keep a file.
  if (isIOS() && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'Tikify backup' }).then(() => done('Backup saved'), (err) => {
      if (err.name === 'AbortError') return; // share sheet dismissed: Save stays available
      downloadFile(file);
      done('Backup downloaded');
    });
    return;
  }
  downloadFile(file);
  done('Backup downloaded');
}

function downloadFile(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}

// The input lives in index.html: iOS may never deliver 'change' to a detached input, which can
// be garbage collected while the document picker is open.
const importInput = $('#importInput');
importInput.addEventListener('change', () => {
  const file = importInput.files[0];
  importInput.value = ''; // so picking the same file again still counts as a change
  if (file) importBackup(file);
});

async function* fileLines(file, chunk = 1 << 20) {
  const dec = new TextDecoder();
  let buf = '';
  for (let pos = 0; pos < file.size; pos += chunk) {
    const part = dec.decode(await file.slice(pos, pos + chunk).arrayBuffer(), { stream: true });
    const nl = part.lastIndexOf('\n');
    if (nl === -1) { buf += part; continue; }
    const lines = (buf + part.slice(0, nl)).split('\n');
    buf = part.slice(nl + 1);
    yield* lines;
  }
  buf += dec.decode();
  if (buf) yield buf;
}

// Calls onSound for each sound record and returns the backup's other data. Reads line by line
// (see exportBackup); older single-line backups and hand-edited files are parsed whole.
async function readBackup(file, onSound) {
  const lines = fileLines(file);
  const first = ((await lines.next()).value || '').trimEnd();
  // The head of a line-per-sound backup ends with `"sounds":[`.
  let data = first.endsWith('[') ? parseJSON(first + ']}') : null;
  const streamed = !!data;
  if (!streamed) data = parseJSON(first) || (file.size < 64e6 ? parseJSON(await file.text()) : null);
  if (!data || data.app !== 'tikify') throw new Error('This file isn’t a Tikify backup.');
  if (streamed) {
    for await (const l of lines) {
      const line = l.trim().replace(/^,/, '');
      if (line && line !== ']}') await onSound(parseJSON(line));
    }
  } else {
    for (const s of Array.isArray(data.sounds) ? data.sounds : []) await onSound(s);
  }
  return data;
}

// Only base64 data: URLs are decoded (nothing is fetched from the network), and a type a
// browser could open as a page (HTML, SVG, …) is stored as plain bytes instead.
async function blobFromDataUrl(url, safeType) {
  const m = typeof url === 'string' && /^data:([\w.+-]+\/[\w.+-]+)?[^,]*;base64,/i.exec(url.slice(0, 200));
  if (!m) return null;
  try {
    const blob = await (await fetch(url)).blob();
    const type = (m[1] || '').toLowerCase();
    return new Blob([blob], { type: safeType.test(type) ? type : 'application/octet-stream' });
  } catch { return null; }
}

async function importSound(raw, count, known, sameAs) {
  const sound = cleanSound(raw);
  if (!sound) { count.invalid++; return; }
  if (state.sounds.has(sound.id)) { count.existing++; return; }
  // Saved on this device too (from a backup of another phone, say): keep the copy that's here,
  // and let the backup's playlists point at it.
  const here = (sound.tiktokId && known.get('v' + sound.tiktokId)) || (sound.musicId && known.get('m' + sound.musicId));
  if (here) { sameAs.set(sound.id, here); count.existing++; return; }
  const blob = await blobFromDataUrl(raw.audio, /^(audio|video)\//);
  sound.coverBlob = await blobFromDataUrl(raw.cover, /^image\/(?!svg)/);
  if (blob) sound.audioUrl = null;
  else if (!sound.audioUrl && !sound.sourceUrl) { count.invalid++; return; } // nothing it could ever play
  await DB.tx(['sounds', 'audio'], 'readwrite', (t) => {
    t.objectStore('sounds').put(sound);
    if (blob) t.objectStore('audio').put({ id: sound.id, blob });
  });
  state.sounds.set(sound.id, sound);
  count.added++;
}

let importing = false;
async function importBackup(file) {
  if (importing) return toast('Still importing the previous backup…');
  importing = true;
  const restoring = !state.sounds.size; // onto an empty library: everything is in that file already
  const count = { added: 0, existing: 0, invalid: 0, playlists: 0 };
  // The sounds that were here before this import, by TikTok video and by sound. Only those: two
  // copies kept on purpose in the backup both come back.
  const known = new Map();
  for (const s of state.sounds.values()) {
    if (s.tiktokId) known.set('v' + s.tiktokId, s.id);
    if (s.musicId) known.set('m' + s.musicId, s.id);
  }
  const sameAs = new Map(); // backup sound id -> the id of the same sound already here
  let shown = Date.now();
  toast('Importing backup…');
  try {
    // Every record is checked before it is stored; a storage error (e.g. full) stops the import.
    const data = await readBackup(file, async (raw) => {
      await importSound(raw, count, known, sameAs);
      if (Date.now() - shown > 1500) { shown = Date.now(); toast(`Importing backup… ${plural(count.added, 'sound')}`); }
    });
    for (const raw of Array.isArray(data.playlists) ? data.playlists : []) {
      const soundIds = raw && Array.isArray(raw.soundIds) ? raw.soundIds.map((x) => sameAs.get(idOf(x)) || x) : [];
      const p = cleanPlaylist(raw && { ...raw, soundIds });
      if (!p) { count.invalid++; continue; }
      const existing = getPlaylist(p.id);
      if (!existing) {
        await DB.put('playlists', p);
        state.playlists.push(p);
        count.playlists++;
        continue;
      }
      const ids = [...new Set([...existing.soundIds, ...p.soundIds])];
      if (ids.length > existing.soundIds.length) await updatePlaylist(existing, { soundIds: ids });
    }
    let msg = `Imported ${plural(count.added, 'sound')}` + (count.playlists ? ` and ${plural(count.playlists, 'playlist')}` : '');
    if (count.existing) msg += `. ${count.existing} already in your library`;
    if (count.invalid) msg += `. Skipped ${count.invalid} invalid entr${count.invalid === 1 ? 'y' : 'ies'}`;
    toast(msg + '.');
    if (restoring && count.added) { localStorageSet('backupNudgeAt', Date.now()); keepStorage(); }
  } catch (err) {
    const why = err && err.storage ? storageMessage(err) : (err && err.message) || 'The file couldn’t be read.';
    toast((count.added ? `Import stopped after ${plural(count.added, 'sound')}. ` : 'Couldn’t import. ') + why, { error: true });
  } finally {
    importing = false;
    state.playlists.sort((a, b) => a.createdAt - b.createdAt);
    render();
  }
}

// ---------- player ----------
const audio = $('#audio');
const seek = $('#seek');
let currentObjectUrl = null;

// ctx = { id, label }: what is being played (see state.contextId).
function playList(ids, index, ctx) {
  if (!ids.length) return;
  state.contextId = ctx.id;
  state.context = ctx.label;
  state.baseQueue = ids.slice();
  state.upNext = [];
  if (state.shuffle) {
    const first = ids[index];
    const rest = ids.filter((_, i) => i !== index);
    shuffleArr(rest);
    state.queue = [first, ...rest];
    index = 0;
  } else {
    state.queue = ids.slice();
  }
  loadIndex(index, true);
}

// The playing playlist's name now: it may have been renamed since playback started.
function contextLabel() {
  const p = state.contextId.startsWith('pl:') && getPlaylist(state.contextId.slice(3));
  return p ? p.name : state.context;
}

function shuffleArr(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setShuffle(on) {
  state.shuffle = on;
  localStorageSet('shuffle', on);
  if (state.queue.length) {
    const cur = currentId();
    // What the user put up next stays right after the current sound, in either order.
    const up = state.upNext.filter((id) => id !== cur && state.queue.includes(id));
    const rest = (on ? state.queue : state.baseQueue).filter((id) => !up.includes(id));
    if (on) {
      state.queue = [cur, ...up, ...shuffleArr(rest.filter((id) => id !== cur))];
    } else {
      rest.splice(rest.indexOf(cur) + 1, 0, ...up);
      state.queue = rest;
    }
    state.index = Math.max(0, state.queue.indexOf(cur));
    saveSession();
    readAhead();
  }
  // Both the full player's and the open playlist's shuffle buttons.
  document.querySelectorAll('#shuffleBtn, #plShuffle').forEach((b) => {
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
}

function setRepeat(mode) {
  state.repeat = mode;
  localStorageSet('repeat', mode);
  // Repeat one loops in the element itself: no script has to run when the sound ends, which a
  // locked iPhone may not get around to.
  audio.loop = mode === 'one';
  if (state.queue.length) readAhead();
  const b = $('#repeatBtn');
  b.classList.toggle('on', mode !== 'off');
  b.setAttribute('aria-pressed', mode !== 'off');
  b.setAttribute('aria-label', mode === 'one' ? 'Repeat one' : 'Repeat');
  $('#repeatOne').hidden = mode !== 'one';
}

function localStorageSet(k, v) { try { localStorage.setItem('tikify.' + k, JSON.stringify(v)); } catch { /* ignore */ } }
function localStorageGet(k, d) { try { const v = localStorage.getItem('tikify.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }

// Where playback was, so a relaunch (iOS often closes home screen apps in the background) comes
// back to the same sound and position, paused.
let sessionSavedAt = 0;
function saveSession() {
  sessionSavedAt = Date.now();
  if (!state.queue.length) return localStorageSet('session', null);
  localStorageSet('session', {
    queue: state.queue,
    baseQueue: state.baseQueue,
    upNext: state.upNext,
    index: state.index,
    contextId: state.contextId,
    context: state.context,
    t: Math.floor(resumeAt ?? (audio.currentTime || 0)),
  });
}

function restoreSession() {
  const s = localStorageGet('session', null);
  if (!s || !Array.isArray(s.queue)) return;
  const known = (ids) => (Array.isArray(ids) ? ids.filter((id) => state.sounds.has(id)) : []);
  const queue = known(s.queue);
  if (!queue.length) return;
  let index = queue.indexOf(s.queue[s.index]);
  const at = index === -1 ? 0 : Math.max(0, +s.t || 0);
  // The sound that was playing has been deleted: continue with the one after it.
  if (index === -1) index = Math.min(queue.length - 1, known(s.queue.slice(0, s.index)).length);
  const base = known(s.baseQueue);
  state.queue = queue;
  state.baseQueue = base.length ? base : queue.slice();
  state.upNext = known(s.upNext);
  state.contextId = typeof s.contextId === 'string' ? s.contextId : '';
  state.context = typeof s.context === 'string' ? s.context : '';
  loadIndex(index, false, { at });
}

// The next sound's audio, read while this one plays, so the switch when it ends doesn't wait for
// IndexedDB: a locked iPhone may suspend the page during that wait.
let ahead = null;   // { id, url }
let aheadId = null; // the sound being read ahead
function readAhead() {
  // At the end, repeat all goes back to the top (shuffle deals the queue again, so that can't be known).
  const wrap = state.repeat === 'all' && !state.shuffle ? state.queue[0] : null;
  const id = state.queue[state.index + 1] || wrap || null;
  if (id === aheadId) return;
  dropAhead();
  aheadId = id;
  if (!id) return;
  DB.get('audio', id).then((rec) => {
    if (aheadId === id && !ahead && rec && rec.blob) ahead = { id, url: URL.createObjectURL(rec.blob) };
  }, () => { /* read again when it's needed */ });
}
function dropAhead() {
  if (ahead) URL.revokeObjectURL(ahead.url);
  ahead = aheadId = null;
}

function setObjectUrl(url) {
  if (currentObjectUrl && currentObjectUrl !== url) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = url;
}
// Really unload: without load(), the element keeps the old sound and Play would start it again.
function unloadAudio() {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
}

let loadToken = 0;
let wantPlay = false;   // playback was asked for, so a source that fails gets repaired
let advancing = false;  // the queue moved on by itself, so a sound that can't play is skipped
let resumeAt = null;    // where the sound being loaded starts (a restored session)
let audioUnlocked = false;

async function loadIndex(i, autoplay, { auto = false, at = 0 } = {}) {
  state.index = i;
  const sound = state.sounds.get(currentId());
  if (!sound) return;
  state.upNext = state.upNext.filter((id) => id !== sound.id); // it is playing now
  const token = ++loadToken;
  wantPlay = autoplay;
  advancing = auto;
  resumeAt = at;
  seeking = false;
  // iOS lets a script start an element only once it has been played inside a tap, and the
  // IndexedDB read below ends the tap. So start it now, empty: it plays once the source is set.
  if (autoplay && !audioUnlocked) { unloadAudio(); audio.play().catch(() => {}); }
  updateNowPlaying();

  let src = null;
  if (ahead && ahead.id === sound.id) {
    src = ahead.url;
    ahead = aheadId = null;
    setObjectUrl(src);
  } else {
    const rec = await DB.get('audio', sound.id).catch(() => null); // unreadable: try the stream link
    if (token !== loadToken) return;
    if (rec && rec.blob) src = URL.createObjectURL(rec.blob);
    else src = sound.audioUrl;
    setObjectUrl(rec && rec.blob ? src : null);
  }
  audio.dataset.id = sound.id;
  if (!src) { // nothing stored and no link (e.g. a backup entry without audio)
    unloadAudio();
    saveSession();
    if (wantPlay) repairAndRetry(sound);
    return;
  }
  if (!autoplay && !audio.paused) audio.pause();
  audio.src = src;
  saveSession();
  readAhead();
  if (!autoplay) return;
  try { await audio.play(); } catch (err) {
    // A source that can't be played reports through 'error', and is repaired there.
    if (err.name === 'NotAllowedError' && token === loadToken) {
      wantPlay = false;
      syncPlayState();
      toast('Tap play to start');
    }
  }
}

// If a sound was saved without its audio (or the link expired), look it up again and store it.
const repairing = new Set(); // sound ids being downloaded again
const repaired = new Set();  // repaired this session: if one still fails, it isn't tried again
async function repairAndRetry(sound) {
  if (repairing.has(sound.id)) return; // the attempt under way reports how it went
  if (!sound.sourceUrl || repaired.has(sound.id)) return playFailed(sound);
  repairing.add(sound.id);
  toast('Re-downloading sound…');
  try {
    const info = await TikTok.lookup(sound.sourceUrl);
    const blob = await TikTok.downloadBlob(info.audioUrl);
    if (state.sounds.get(sound.id) !== sound) return; // deleted meanwhile: don't bring it back
    // Write only if the sound is still stored, in the same transaction: a delete that committed
    // during the download must win.
    let stored = false;
    await DB.tx(['sounds', 'audio'], 'readwrite', (t) => {
      const sounds = t.objectStore('sounds');
      sounds.get(sound.id).onsuccess = (e) => {
        if (!e.target.result) return;
        stored = true;
        sounds.put({ ...sound, audioUrl: null });
        t.objectStore('audio').put({ id: sound.id, blob });
      };
    });
    // No longer stored (deleted in another tab): reported or skipped like any sound that can't play.
    if (!stored || state.sounds.get(sound.id) !== sound) return playFailed(sound);
    sound.audioUrl = null;
    repaired.add(sound.id);
    repairing.delete(sound.id); // before playing: if the new copy fails too, that is reported
    if (currentId() === sound.id && wantPlay) loadIndex(state.index, true, { auto: advancing });
  } catch {
    playFailed(sound);
  } finally {
    repairing.delete(sound.id);
  }
}

// A sound that can't be played: skipped when the queue got to it by itself, otherwise reported.
let skipped = 0; // in a row, so a queue where nothing plays stops instead of going round
function playFailed(sound) {
  if (currentId() !== sound.id || !wantPlay) return; // moved on meanwhile
  if (advancing && skipped < state.queue.length - 1) {
    skipped++;
    toast('Skipped a sound that can’t be played');
    next(true);
    return;
  }
  skipped = 0;
  wantPlay = false;
  audio.pause();
  syncPlayState();
  toast("Couldn't play this sound", { error: true });
}

audio.addEventListener('error', () => {
  const sound = state.sounds.get(audio.dataset.id);
  // A sound loaded paused (a restored session) is repaired once Play is pressed.
  if (sound && sound.id === currentId() && wantPlay && audio.getAttribute('src')) repairAndRetry(sound);
});

function next(auto = false) {
  if (!state.queue.length) return;
  if (state.index < state.queue.length - 1) return loadIndex(state.index + 1, true, { auto });
  // Past the end: back to the top, and playing on only with repeat all (or a tap on Next).
  if (state.shuffle && state.queue.length > 1) {
    const last = currentId();
    const q = shuffleArr(state.queue.slice());
    if (q[0] === last) { // not the sound that just ended again
      const j = 1 + Math.floor(Math.random() * (q.length - 1));
      [q[0], q[j]] = [q[j], q[0]];
    }
    state.queue = q;
  }
  loadIndex(0, state.repeat === 'all' || !auto, { auto });
}
function prev() {
  if (!state.queue.length) return;
  if (audio.currentTime > 3 || state.index === 0) { audio.currentTime = 0; return; }
  loadIndex(state.index - 1, true);
}
// Play, or load again a sound that failed (its link may work now, or it gets repaired).
function resume() {
  if (!state.queue.length) return;
  if (audio.error || !audio.getAttribute('src')) return loadIndex(state.index, true);
  wantPlay = true;
  audio.play().catch(() => { /* reported through 'error' */ });
}
// A pause the user asked for: a source that fails while paused isn't repaired and restarted.
function pausePlayback() {
  wantPlay = false;
  audio.pause();
}
function togglePlay() {
  if (audio.paused || audio.error) resume(); else pausePlayback();
}
function stopPlayer() {
  loadToken++; // a load still under way mustn't bring it back
  wantPlay = false;
  unloadAudio();
  delete audio.dataset.id;
  setObjectUrl(null);
  dropAhead();
  Object.assign(state, { queue: [], baseQueue: [], upNext: [], index: -1, contextId: '', context: '' });
  $('#miniPlayer').hidden = true;
  document.body.classList.remove('has-mini');
  if ('mediaSession' in navigator && !preview) navigator.mediaSession.metadata = null;
  closePlayer();
  syncPlayState();
  syncProgress();
  saveSession();
}

audio.addEventListener('ended', () => next(true));
audio.addEventListener('play', () => { stopPreview(); syncPlayState(); });
audio.addEventListener('playing', () => {
  audioUnlocked = true;
  skipped = 0;
  const sound = state.sounds.get(audio.dataset.id);
  if (sound) fillIn(sound);
});
audio.addEventListener('pause', () => { syncPlayState(); saveSession(); });
audio.addEventListener('timeupdate', () => {
  syncProgress();
  if (Date.now() - sessionSavedAt > 5000) saveSession();
});
audio.addEventListener('loadedmetadata', async () => {
  if (resumeAt != null) {
    if (resumeAt > 0 && resumeAt < audio.duration - 1) audio.currentTime = resumeAt;
    resumeAt = null;
  }
  syncProgress();
  const sound = state.sounds.get(audio.dataset.id);
  if (sound && isFinite(audio.duration) && Math.round(audio.duration) !== sound.duration) {
    sound.duration = Math.round(audio.duration);
    DB.put('sounds', sound).catch(() => { /* only a cached duration */ });
  }
});
document.addEventListener('visibilitychange', () => document.hidden && saveSession());
window.addEventListener('pagehide', saveSession);

function updateNowPlaying() {
  const sound = state.sounds.get(currentId());
  if (!sound) return;
  const cover = coverSrc(sound);
  const art = artwork(sound) || { src: cover };
  const label = contextLabel();
  $('#miniPlayer').hidden = false;
  document.body.classList.add('has-mini');
  $('#miniCover').src = cover;
  $('#miniTitle').textContent = sound.title;
  $('#miniArtist').textContent = sound.artist;
  $('#playerCover').src = art.src;
  $('#playerBg').style.backgroundImage = `url(${JSON.stringify(art.src)})`; // quotes in a URL can't break out
  $('#playerTitle').textContent = sound.title;
  $('#playerArtist').textContent = sound.artist;
  $('#playerContext').textContent = label ? 'Playing from ' + label : 'Playing';
  const link = $('#openTiktok');
  link.hidden = !sound.sourceUrl;
  link.href = sound.sourceUrl || '#';

  $('#miniOpen').setAttribute('aria-label', `${sound.title}, ${sound.artist}. Open player`);
  // In a playlist view only the rows of the playlist that is playing; in search results by sound.
  document.querySelectorAll('.track').forEach((r) => {
    const list = r.closest('[data-ctx]');
    const on = r.dataset.id === sound.id && (!list || list.dataset.ctx === state.contextId);
    r.classList.toggle('playing', on);
    const b = $('.track-main', r);
    if (b) { if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }
  });

  if ('mediaSession' in navigator && !preview) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: sound.title,
      artist: sound.artist,
      album: label || 'Tikify',
      // Its real size and type: Android picks artwork by them.
      artwork: [art.sizes ? { src: art.src, sizes: art.sizes, type: art.type || '' } : { src: art.src }],
    });
  }
}

function syncPlayState() {
  const playing = !audio.paused;
  for (const b of [$('#miniPlay'), $('#playBtn')]) {
    b.innerHTML = playing ? ICON.pause : ICON.play;
    b.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }
  if ('mediaSession' in navigator && !preview) {
    navigator.mediaSession.playbackState = !state.queue.length ? 'none' : playing ? 'playing' : 'paused';
  }
  const view = $('#view');
  view._sync && view._sync();
}

// The Add view's preview plays in its own element. While it plays it owns the lock screen,
// notification and headphone controls, so those never act on a library sound nobody hears.
let preview = null; // { el, info }
function startPreview(el, info) {
  if (preview && preview.el !== el) preview.el.pause();
  preview = { el, info };
  pausePlayback();
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession;
  ms.metadata = new MediaMetadata({
    title: info.title,
    artist: info.artist,
    album: 'Preview',
    artwork: info.coverUrl ? [{ src: info.coverUrl }] : [],
  });
  try { ms.setPositionState(); } catch { /* the library sound's position would show otherwise */ }
  syncPreviewState();
}
function syncPreviewState() {
  if (preview && 'mediaSession' in navigator) navigator.mediaSession.playbackState = preview.el.paused ? 'paused' : 'playing';
}
// Ends the preview and hands the controls back to the library player.
function stopPreview() {
  if (!preview) return;
  const { el } = preview;
  preview = null;
  el.pause();
  if (!('mediaSession' in navigator)) return;
  if (currentId()) updateNowPlaying(); else navigator.mediaSession.metadata = null;
  syncPlayState();
  syncProgress();
}

let seeking = false; // the seek bar is being dragged: it shows the finger, not the playback position
function syncProgress() {
  const d = audio.duration || 0;
  const t = audio.currentTime || 0;
  $('#miniProgressBar').style.width = d ? (t / d) * 100 + '%' : '0';
  $('#durTime').textContent = fmtTime(d);
  if (!seeking) {
    seek.value = d ? Math.round((t / d) * 1000) : 0;
    $('#curTime').textContent = fmtTime(t);
    seek.setAttribute('aria-valuetext', `${fmtTime(t)} of ${fmtTime(d)}`);
  }
  updateSeekFill();
  if ('mediaSession' in navigator && d && !preview && navigator.mediaSession.setPositionState) {
    try { navigator.mediaSession.setPositionState({ duration: d, position: Math.min(t, d), playbackRate: audio.playbackRate }); } catch { /* ignore */ }
  }
}
function updateSeekFill() {
  seek.style.setProperty('--fill', (seek.value / 10) + '%');
}

function seekInput() {
  seeking = true;
  updateSeekFill();
  const t = fmtTime((seek.value / 1000) * (audio.duration || 0));
  $('#curTime').textContent = t;
  seek.setAttribute('aria-valuetext', `${t} of ${fmtTime(audio.duration)}`);
}
seek.addEventListener('input', seekInput);
// A drag released where it started fires no 'change', so every way a drag can end commits it.
let seekPointer = null;
const seekCommit = () => {
  seekPointer = null;
  if (!seeking) return;
  seeking = false;
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  syncProgress();
};
for (const type of ['change', 'pointerup', 'pointercancel', 'touchend', 'touchcancel', 'blur']) seek.addEventListener(type, seekCommit);
// On iPhone a range input only follows a drag that starts on its small thumb: make a tap or a
// drag anywhere on the bar seek too. (Android's own slider already does.)
const seekToPointer = (e) => {
  const r = seek.getBoundingClientRect();
  const thumb = 14; // as in styles.css: the thumb's centre runs from thumb/2 to width - thumb/2
  seek.value = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left - thumb / 2) / (r.width - thumb))) * 1000);
  seekInput();
};
seek.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || !isIOS() || !audio.duration) return;
  seekPointer = e.pointerId;
  seekToPointer(e);
});
seek.addEventListener('pointermove', (e) => { if (e.pointerId === seekPointer) seekToPointer(e); });
// The slider's own step is 1/1000 of the sound: arrow keys skip 5 s instead, Page Up/Down a tenth.
seek.addEventListener('keydown', (e) => {
  const d = audio.duration;
  const by = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: d / 10, PageDown: -d / 10 }[e.key];
  if (!d || by == null) return;
  e.preventDefault();
  audio.currentTime = Math.min(d, Math.max(0, audio.currentTime + by));
  syncProgress();
});

// The full player is a modal dialog: the page behind it is inert and focus moves in and back out.
let playerHideTimer;
let playerReturn = null;
function openPlayer() {
  if (playerOpen) return;
  const p = $('#player');
  clearTimeout(playerHideTimer); // reopened while still sliding down
  playerReturn = focusRef(invoker());
  playerOpen = true;
  document.body.classList.add('player-open'); // moves the toast off the controls
  p.hidden = false;
  requestAnimationFrame(() => p.classList.add('open'));
  holdOverlay('player');
  syncInert();
  $('#playerClose').focus({ preventScroll: true });
}
function closePlayer() {
  if (!playerOpen) return;
  playerOpen = false;
  document.body.classList.remove('player-open');
  const p = $('#player');
  p.classList.remove('open');
  clearTimeout(playerHideTimer);
  playerHideTimer = setTimeout(() => (p.hidden = true), 250);
  syncInert();
  releaseOverlays();
  const a = document.activeElement;
  if (!a || a === document.body || p.contains(a)) restoreFocus(playerReturn) || restoreFocus(focusRef($('#miniOpen'))) || focusFallback();
}

$('#miniPlayer').addEventListener('click', (e) => {
  if (e.target.closest('#miniPlay')) return togglePlay();
  if (e.target.closest('#miniNext')) return next();
  openPlayer();
});
$('#playerClose').onclick = closePlayer;
$('#playBtn').onclick = togglePlay;
$('#nextBtn').onclick = () => next();
$('#prevBtn').onclick = prev;
$('#shuffleBtn').onclick = () => setShuffle(!state.shuffle);
$('#repeatBtn').onclick = () => setRepeat({ off: 'all', all: 'one', one: 'off' }[state.repeat]);
$('#playerMore').onclick = () => {
  const s = state.sounds.get(currentId());
  if (s) soundMenu(s, null);
};

// Swipe down to close the full player: one finger, mostly downward, not starting on the seek bar.
// Each touch starts afresh, so a cancelled one can't leave a stale start point behind.
(() => {
  let start = null;
  const p = $('#player');
  p.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    start = e.touches.length === 1 && !e.target.closest('input') ? { x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  p.addEventListener('touchcancel', () => (start = null));
  p.addEventListener('touchend', (e) => {
    if (!start) return;
    const t = e.changedTouches[0];
    const dy = t.clientY - start.y;
    const dx = Math.abs(t.clientX - start.x);
    start = null;
    if (dy > 90 && dy > 2 * dx) closePlayer();
  });
})();

if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  const set = (a, h) => { try { ms.setActionHandler(a, h); } catch { /* unsupported */ } };
  // While an Add view preview plays, play, pause and seeking act on it; changing track ends it.
  set('play', () => (preview ? preview.el.play().catch(() => {}) : resume()));
  set('pause', () => (preview ? preview.el.pause() : pausePlayback()));
  set('previoustrack', () => { stopPreview(); prev(); });
  set('nexttrack', () => { stopPreview(); next(); });
  set('seekto', (d) => { (preview ? preview.el : audio).currentTime = d.seekTime; });
  // No seekbackward/seekforward: with those, iOS shows ±10 s buttons in place of previous and
  // next on the lock screen, and 10 s is most of a TikTok sound.
}

document.addEventListener('keydown', (e) => {
  // Before the field check, so Escape also works from a sheet's text field or the seek bar.
  if (e.key === 'Escape') {
    if (sheetActive) { e.preventDefault(); closeSheet(null); } else closePlayer();
    return;
  }
  // Space plays/pauses only when it wouldn't activate or type into the focused control.
  if (e.code !== 'Space' || sheetActive || e.target.closest('button, a[href], input, textarea, select, summary, label, [contenteditable], [role=button]')) return;
  e.preventDefault();
  togglePlay();
});

// ---------- install (PWA) prompt ----------
let deferredInstall = null; // Chrome/Edge/Android hand us this so we can show the real install dialog
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  // Chrome offers it only after the user has been here a little while: that's when to ask.
  maybeShowInstallPrompt();
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  localStorageSet('installed', true);
  toast(installWords().done);
});

const UA = navigator.userAgent;
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () =>
  /iphone|ipad|ipod/i.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = () => /android/i.test(UA);
// In-app browsers (TikTok, Instagram, the Google app, Android app web views, …) can't install web
// apps, and what they store may be thrown away.
const isInAppBrowser = () =>
  /tiktok|musical_ly|bytedance|trill|instagram|fban|fbav|fb_iab|snapchat|line\/|micromessenger|pinterest|linkedinapp|gsa\/|; wv\)/i.test(UA);
const otherIOSBrowser = () => /crios|fxios|edgios|opios/i.test(UA); // Chrome, Firefox, … on iOS
const isMacSafari = () => !isIOS() && /macintosh/i.test(UA) && /version\/[\d.]+.*safari/i.test(UA);

// iOS 26 bug in Home Screen apps: the page is laid out as if the status bar took up space, but is
// drawn from the top of the screen, so everything pinned to the bottom stops short of the screen's
// edge. Measure the shortfall (0 where the bug isn't) and let the bottom bars reach past it.
let gapProbe = null;
function measureViewport() {
  if (!gapProbe) {
    gapProbe = document.createElement('div');
    gapProbe.setAttribute('aria-hidden', 'true');
    gapProbe.style.cssText = 'position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;pointer-events:none';
    document.body.append(gapProbe);
  }
  const portrait = window.innerHeight > window.innerWidth;
  const screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  const edge = Math.round(gapProbe.getBoundingClientRect().top); // where "bottom: 0" really is
  return { screenW: screen.width, screenH, innerW: window.innerWidth, innerH: window.innerHeight, edge, gap: Math.round(screenH - edge) };
}
function fitIOSViewport() {
  if (!/iphone|ipod/i.test(UA) || !isStandalone()) return;
  // The on-screen keyboard skews the measurement: keep the last one until it closes.
  if (document.activeElement && document.activeElement.matches('input, textarea, [contenteditable]')) return;
  const { gap } = measureViewport();
  document.documentElement.style.setProperty('--ios-gap', (gap > 0 && gap <= 100 ? gap : 0) + 'px');
}

// A phone puts an installed Tikify on its home screen; a computer has none.
function installWords() {
  if (isIOS() || isAndroid() || isInAppBrowser()) {
    return { menu: 'Add to home screen', title: 'Add Tikify to your home screen', opens: 'Opens full screen, just like a real app', done: 'Tikify was added to your home screen' };
  }
  const where = isMacSafari() ? { menu: 'Add to Dock', title: 'Add Tikify to your Dock' } : { menu: 'Install Tikify', title: 'Install Tikify as an app' };
  return { ...where, opens: 'Opens in its own window, like a real app', done: 'Tikify is installed' };
}

const IOS_SHARE = '<svg class="inline-ic" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2l4 4-1.4 1.4L13 5.8V15h-2V5.8L9.4 7.4 8 6zM5 10h3v2H6v8h12v-8h-2v-2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1z"/></svg>';
const ADD_BOX = '<svg class="inline-ic" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5zm6 3h2v3h3v2h-3v3h-2v-3H8v-2h3z"/></svg>';

// How to install from this browser. `auto`: worth offering without being asked (there is a way to
// install here, and it isn't the one-tap dialog Chrome/Edge hand over later via beforeinstallprompt).
function installHow() {
  const steps = (...li) => `<ol class="install-steps">${li.map((l) => `<li>${l}</li>`).join('')}</ol>`;
  if (isInAppBrowser()) {
    return { auto: true, steps: steps(
      `Tap <b>⋯</b> or <b>⋮</b> and choose <b>Open in ${isIOS() ? 'Safari' : 'Chrome'}</b> or <b>Open in browser</b>.`,
      'Then add Tikify to your home screen from there.') };
  }
  if (isIOS()) {
    return { auto: true, steps: steps(
      otherIOSBrowser()
        ? `Tap <b>Share</b> ${IOS_SHARE} in the address bar or the <b>⋯</b> menu.`
        : `Tap <b>Share</b> ${IOS_SHARE} in Safari’s toolbar. On iOS 26, tap <b>⋯</b> first.`,
      `Tap <b>Add to Home Screen</b> ${ADD_BOX}. Scroll down or tap <b>View More</b> if you don’t see it.`,
      'Tap <b>Add</b>. Then open Tikify from your home screen.') };
  }
  const chromium = 'onbeforeinstallprompt' in window;
  if (isAndroid()) {
    return { auto: !chromium, steps: steps('Tap <b>⋮</b> to open the browser menu.', 'Choose <b>Install app</b> or <b>Add to Home screen</b>.') };
  }
  // Desktop: not where Tikify is meant to be used, so only when asked (or Chrome/Edge's own dialog).
  if (chromium) return { auto: false, steps: steps('Click the install icon in the address bar, or open the browser menu and choose <b>Install Tikify</b>.') };
  if (isMacSafari()) return { auto: false, steps: steps('In the menu bar, choose <b>File → Add to Dock</b>.') };
  return { auto: false, steps: '<p class="install-none">This browser can’t install web apps. Open Tikify in Chrome, Edge or Safari to install it.</p>' };
}

// iOS gives a Home Screen app its own storage: nothing saved in Safari carries over.
function iosStorageWarning() {
  if (!isIOS() || isInAppBrowser()) return '';
  const here = otherIOSBrowser() ? 'this browser' : 'Safari';
  const n = state.sounds.size;
  if (!n) return `<div class="install-warn"><b>Install first, then add sounds:</b> the Home Screen app has its own storage, so sounds saved in ${here} won’t be in it.</div>`;
  return `<div class="install-warn"><b>Your ${plural(n, 'sound')} won’t come along:</b> the Home Screen app has its own storage. Export a backup now, then use <b>Import backup</b> in the installed app.
    <button class="btn ghost" data-export>Export backup</button></div>`;
}

async function showInstallPrompt() {
  const install = deferredInstall;
  const words = installWords();
  const html = `
    <div class="install">
      <img class="install-icon" src="icons/icon-192.png" alt="">
      <div class="install-badge">Recommended</div>
      <div class="sheet-title center">${words.title}</div>
      <ul class="install-perks">
        <li>${words.opens}</li>
        <li>Your sounds play offline</li>
        <li>Keeps your library safer from being cleared by the browser</li>
        ${isAndroid() && !isInAppBrowser() ? '<li>Share TikToks straight to Tikify</li>' : ''}
      </ul>
      ${iosStorageWarning()}
      ${install ? '' : installHow().steps}
      <div class="install-actions">
        ${install ? '<button class="btn primary wide" data-install>Install Tikify</button>' : ''}
        <button class="btn ghost wide" data-later>${install ? 'Not now' : 'Got it'}</button>
      </div>
    </div>`;
  const choice = await openSheet(html, (sheet, close) => {
    $('[data-later]', sheet).onclick = () => close('later');
    const btn = $('[data-install]', sheet);
    if (btn) btn.onclick = () => close('install');
    const exp = $('[data-export]', sheet);
    if (exp) exp.onclick = () => close('export');
  });
  if (choice === 'install' && install) {
    deferredInstall = null; // it can only be used once
    install.prompt();
    const { outcome } = await install.userChoice;
    if (outcome !== 'accepted') installDismissed();
    return;
  }
  installDismissed();
  if (choice === 'export') exportBackup();
}
function installDismissed() {
  localStorageSet('installDismissedAt', Date.now());
  localStorageSet('installDismissals', localStorageGet('installDismissals', 0) + 1);
}

// Ask on first visit (on Chrome/Edge: once they offer their one-tap install), then again at most
// every 3 days, and only three times: it stays in the Library menu (⋮ → Add to home screen).
let installAsked = false;
function maybeShowInstallPrompt() {
  if (!booted || installAsked || isStandalone() || localStorageGet('installed', false)) return;
  if (localStorageGet('installDismissals', 0) >= 3) return;
  if (Date.now() - localStorageGet('installDismissedAt', 0) < 3 * 864e5) return;
  if (!deferredInstall && !installHow().auto) return;
  installAsked = true;
  setTimeout(() => {
    // Not over a sound the user is busy adding (a lookup, preview or save) or the full player:
    // it is asked again next launch.
    const busy = playerOpen || (currentRoute().name === 'add' && $('#result').childElementCount > 0);
    if ($('#sheetBackdrop').hidden && !isStandalone() && !busy) showInstallPrompt();
  }, 2500);
}

// ---------- offline shell & updates ----------
// sw.js serves the app from its cache and, when asked, checks the server for a new release. A new
// one is used from the next launch; the bar offers to switch to it now.
let swReg = null;
let updateCheckedAt = 0;
function startServiceWorker() {
  const sw = navigator.serviceWorker;
  if (!sw) return;
  const hadController = !!sw.controller;
  sw.register('sw.js').then((reg) => { swReg = reg; }).catch(() => {});
  sw.addEventListener('message', (e) => e.data === 'updated' && showUpdateBar());
  // A new sw.js took over (it comes with a freshly downloaded shell).
  sw.addEventListener('controllerchange', () => hadController && showUpdateBar());
  checkForUpdate();
  // Home Screen apps can stay open for days: check again when Tikify comes back to the front.
  document.addEventListener('visibilitychange', () => document.hidden || checkForUpdate());
}
function checkForUpdate() {
  if (Date.now() - updateCheckedAt < 15 * 60e3) return;
  updateCheckedAt = Date.now();
  const ctl = navigator.serviceWorker.controller;
  if (ctl) ctl.postMessage('check');
  if (swReg) swReg.update().catch(() => {});
}
let updateOffered = false;
function showUpdateBar() {
  // Once per launch: a release can announce itself twice (new files, then a new sw.js).
  if (updateOffered) return;
  updateOffered = true;
  const bar = $('#updateBar');
  bar.hidden = false;
  document.body.classList.add('has-update');
  announce('A new version of Tikify is ready. Reload to use it.');
}
$('#updateReload').onclick = () => location.reload(); // pagehide saves what's playing, and it comes back paused
$('#updateLater').onclick = () => {
  const bar = $('#updateBar');
  const hadFocus = bar.contains(document.activeElement);
  bar.hidden = true;
  document.body.classList.remove('has-update');
  if (hadFocus) focusFallback();
};

// ---------- boot ----------
// Something shared to Tikify (Android share sheet → manifest share_target): its TikTok link goes
// to the Add view.
function readShare(params) {
  const shared = ['url', 'text', 'title'].map((k) => params.get(k)).filter(Boolean).join(' ');
  if (!shared) return false;
  const url = TikTok.extractUrl(shared);
  if (url) pendingShare = url; else shareHadNoLink = true;
  return true;
}
function readShareTarget() {
  if (readShare(new URLSearchParams(location.search))) history.replaceState(null, '', location.pathname + '#/add');
}

// With the manifest's launch_handler "focus-existing", Chrome hands a share or a shortcut to the
// window that is already open instead of reloading it, so what's playing keeps playing.
function receiveLaunches() {
  if (!('launchQueue' in window)) return;
  let own = location.href; // this page's own launch: readShareTarget handles it
  window.launchQueue.setConsumer(({ targetURL }) => {
    const mine = targetURL === own;
    own = null;
    if (!targetURL || mine) return;
    const u = new URL(targetURL);
    const share = readShare(u.searchParams);
    if (!share && (!u.hash || u.hash === location.hash)) return;
    if (sheetActive) closeSheet(null);
    closePlayer();
    if (!share) go(u.hash);
    else if (currentRoute().name === 'add') renderAdd($('#view')); // a new Add view for the new link
    else go('#/add');
  });
}

let storageFailure = null; // why the library couldn't be opened; the Library view explains it
let booted = false;

(async function boot() {
  // iOS can settle the Home Screen app's viewport after launch or on resume, without a resize event.
  fitIOSViewport();
  [300, 1000, 3000].forEach((ms) => setTimeout(fitIOSViewport, ms));
  window.addEventListener('resize', fitIOSViewport);
  window.addEventListener('pageshow', fitIOSViewport);
  window.addEventListener('orientationchange', () => setTimeout(fitIOSViewport, 300));
  document.addEventListener('focusout', () => setTimeout(fitIOSViewport, 300));
  document.addEventListener('visibilitychange', () => document.hidden || setTimeout(fitIOSViewport, 300));
  // First, so the shell gets cached for offline use even if storage or rendering fails below.
  startServiceWorker();
  receiveLaunches();
  readShareTarget();
  // Start from a plain route entry: after a reload, an overlay's entry has no open overlay.
  const { ov, ...navState } = history.state || {};
  history.replaceState({ ...navState, depth: navState.depth || 0 }, '', location.hash || '#/library');
  try { await loadAll(); } catch (err) { storageFailure = err; }
  state.shuffle = localStorageGet('shuffle', false);
  setShuffle(state.shuffle);
  setRepeat(localStorageGet('repeat', 'off'));
  syncPlayState();
  try {
    render();
  } catch (err) {
    $('#view').innerHTML = `<div class="empty-state"><h2>Something went wrong</h2>
      <p>Tikify couldn’t show your library (${esc(err && err.message)}).</p>
      <button class="btn primary" id="reloadBtn">Reload</button></div>`;
    $('#reloadBtn').onclick = () => location.reload();
  }
  if (!storageFailure) restoreSession(); // paused, where it was when the app was last closed

  keepStorage();
  booted = true;
  maybeShowInstallPrompt();
})();
