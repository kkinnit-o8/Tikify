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
};

// ---------- state ----------
const state = {
  sounds: new Map(),   // id -> sound
  playlists: [],       // [{ id, name, soundIds, createdAt }]
  queue: [],           // sound ids in play order
  baseQueue: [],       // queue before shuffling
  index: -1,
  contextId: '',       // what is playing: 'all', 'pl:<playlist id>', 'search', 'queue' or 'added'
  context: '',         // its name when playback started ("Gym"); see contextLabel()
  shuffle: false,
  repeat: 'off',       // off | all | one
};

const coverUrls = new Map(); // sound id -> object URL
function coverSrc(sound) {
  if (!sound) return 'icons/icon-192.png';
  if (sound.coverBlob) {
    if (!coverUrls.has(sound.id)) coverUrls.set(sound.id, URL.createObjectURL(sound.coverBlob));
    return coverUrls.get(sound.id);
  }
  return sound.coverUrl || 'icons/icon-192.png';
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
    const s = { ...raw, id, coverUrl: webUrl(raw.coverUrl), audioUrl: webUrl(raw.audioUrl), sourceUrl: webUrl(raw.sourceUrl, TIKTOK_HOST) };
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
  if (!el || el.closest('[inert]') || !el.getClientRects().length) return false;
  el.focus();
  return document.activeElement === el;
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
    if (!sheetActive && (!a || a === document.body || backdrop.contains(a))) restoreFocus(sheetReturn);
  }, 0);
  const r = sheetResolve;
  sheetResolve = null;
  r && r(value);
}
$('#sheetBackdrop').addEventListener('click', (e) => {
  if (e.target.id === 'sheetBackdrop') closeSheet(null);
});

// Menu: items = [{ label, value, danger?, icon? }]. A Cancel item is added unless one item already
// dismisses (value null): screen reader and switch users can't tap the backdrop.
function sheetMenu(title, items, sub = '') {
  const cancel = items.some((it) => it.value == null) ? '' : '<button class="sheet-item sheet-cancel" data-cancel>Cancel</button>';
  const html = `
    ${title ? `<div class="sheet-title">${esc(title)}</div>` : ''}
    ${sub ? `<div class="sheet-sub">${esc(sub)}</div>` : ''}
    <div class="sheet-list">
      ${items.map((it, i) => `<button class="sheet-item ${it.danger ? 'danger' : ''}" data-i="${i}">${it.icon || ''}<span>${esc(it.label)}</span></button>`).join('')}
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
  for (const [p, soundIds] of touched) p.soundIds = soundIds;
  if (ahead && ahead.id === id) dropAhead();
  if (!state.queue.includes(id)) return;
  // Every copy leaves the queue. If it was playing, the sound after it takes its place.
  const wasCurrent = currentId() === id;
  const wasPlaying = wasCurrent && !audio.paused;
  state.index -= state.queue.slice(0, state.index).filter((x) => x === id).length;
  state.queue = state.queue.filter((x) => x !== id);
  state.baseQueue = state.baseQueue.filter((x) => x !== id);
  if (!state.queue.length) stopPlayer();
  else if (!wasCurrent) saveSession();
  else if (state.index < state.queue.length) loadIndex(state.index, wasPlaying);
  else loadIndex(0, wasPlaying && state.repeat === 'all'); // it was the last one: back to the top
}

// Save a looked-up TikTok sound into the library.
async function saveSound(info, { title, artist }, audioBlob) {
  const id = uid();
  let coverBlob = null;
  try { coverBlob = await TikTok.downloadBlob(info.coverUrl); } catch { /* fall back to URL */ }
  if (!audioBlob) {
    try { audioBlob = await TikTok.downloadBlob(info.audioUrl); } catch { /* stream from URL instead */ }
  }
  const sound = {
    id,
    title: title || info.title,
    artist: artist || info.artist,
    coverBlob,
    coverUrl: webUrl(info.coverUrl),
    audioUrl: audioBlob ? null : webUrl(info.audioUrl),
    sourceUrl: webUrl(info.sourceUrl, TIKTOK_HOST),
    tiktokId: info.tiktokId,
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
  return sound;
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
  if (e.reason && e.reason.storage) toast(storageMessage(e.reason), { error: true });
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

function setTop(title, { back = false, menu = null } = {}) {
  const h1 = $('#viewTitle');
  h1.textContent = title;
  // Playlist views name themselves in their own <h2>; an empty <h1> would be read as a blank heading.
  if (title) h1.removeAttribute('aria-hidden'); else h1.setAttribute('aria-hidden', 'true');
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
  else if (r.name === 'search') renderSearch(view);
  else renderLibrary(view);
  view.scrollTop = y;

  const heading = view.querySelector('.pl-header h1') || $('#viewTitle');
  const name = heading.textContent.trim();
  document.title = name ? name + ' · Tikify' : 'Tikify';
  if (keep) { restoreFocus(keep); return; }
  if (!changed) return;
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

function renderLibrary(view) {
  setTop('Your Library', { menu: settingsMenu });
  const count = state.sounds.size;
  view.innerHTML = `
    ${storageFailure ? `
      <div class="error" role="alert">
        <b>Your library couldn’t be opened.</b><br>
        ${esc(storageFailure.opening ? storageMessage(storageFailure) : 'Something went wrong while reading it. Try again, or close Tikify completely and open it again.')}
        <button class="btn ghost" id="retryLoad">Try again</button>
      </div>` : ''}
    <div class="lib-actions">
      <button class="chip" id="newPl">${ICON.plus}<span>New playlist</span></button>
    </div>
    <div class="list">
      <button class="row" data-go="#/all">
        <div class="cover all-sounds">${ICON.heart}</div>
        <div class="meta"><div class="t">All sounds</div><div class="s">Playlist · ${count} sound${count === 1 ? '' : 's'}</div></div>
      </button>
      ${state.playlists.map((p) => `
        <button class="row" data-go="#/playlist/${encodeURIComponent(p.id)}">
          ${mosaic(p.soundIds)}
          <div class="meta"><div class="t">${esc(p.name)}</div><div class="s">Playlist · ${p.soundIds.length} sound${p.soundIds.length === 1 ? '' : 's'}</div></div>
        </button>`).join('')}
    </div>
    ${count === 0 && !storageFailure ? `
      <div class="empty-state">
        <div class="big-icon">${ICON.note}</div>
        <h2>Start your collection</h2>
        <p>Copy a TikTok link, then tap <b>Add sound</b> to save the song.</p>
        <button class="btn primary" data-go="#/add">Add your first sound</button>
      </div>` : ''}
  `;
  view.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => go(el.dataset.go)));
  if (storageFailure) {
    $('#retryLoad').onclick = async () => {
      try { await loadAll(); storageFailure = null; } catch (err) { storageFailure = err; toast('Still can’t open your library', { error: true }); }
      render();
    };
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
      <button class="track-main" ${playing ? 'aria-current="true"' : ''}>
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

  setTop('', { back: true, menu: isAll ? null : () => playlistMenu(p) });

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
    { label: 'Add sounds from library', value: 'add', icon: ICON.plus },
    { label: 'Add new TikTok sound', value: 'new', icon: ICON.note },
    { label: 'Rename playlist', value: 'rename' },
    { label: 'Delete playlist', value: 'delete', danger: true },
  ]);
  if (v === 'add') pickSoundsFor(p);
  if (v === 'new') go('#/add?to=' + encodeURIComponent(p.id));
  if (v === 'rename') {
    const name = await sheetPrompt('Rename playlist', p.name);
    if (name) { await updatePlaylist(p, { name }); render(); updateNowPlaying(); } // "Playing from <new name>"
  }
  if (v === 'delete') {
    if (await sheetConfirm('Delete playlist?', `"${p.name}" will be removed. The sounds stay in your library.`)) {
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
    ...(sound.id === currentId() ? [] : [{ label: 'Play next', value: 'next' }]),
    { label: 'Add to playlist', value: 'add', icon: ICON.plus },
    { label: 'Edit title & artist', value: 'edit' },
  ];
  // Position among the rows the playlist actually shows, not in the raw soundIds array.
  const shown = playlist ? playlist.soundIds.filter((id) => state.sounds.has(id)) : [];
  const pos = shown.indexOf(sound.id);
  if (playlist) {
    if (pos > 0) items.push({ label: 'Move up', value: 'up' });
    if (pos !== -1 && pos < shown.length - 1) items.push({ label: 'Move down', value: 'down' });
    items.push({ label: 'Remove from this playlist', value: 'remove' });
  }
  if (sound.sourceUrl) items.push({ label: 'Open on TikTok', value: 'open' });
  items.push({ label: 'Delete from library', value: 'delete', danger: true });

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
    state.index = state.queue.indexOf(cur);
    saveSession();
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
    if (await sheetConfirm('Delete sound?', `"${sound.title}" will be removed from your library and all playlists.`)) {
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

async function addToPlaylistSheet(sound) {
  const items = [{ label: 'New playlist', value: '__new', icon: ICON.plus }]
    .concat(state.playlists.map((p) => ({
      label: p.name + (p.soundIds.includes(sound.id) ? '  ✓' : ''),
      value: p.id,
    })));
  const v = await sheetMenu('Add to playlist', items);
  if (!v) return;
  let p;
  if (v === '__new') {
    const name = await sheetPrompt('Name your playlist', '', 'My playlist', 'Create');
    if (!name) return;
    p = await createPlaylist(name);
  } else {
    p = getPlaylist(v);
  }
  const added = await addToPlaylist(p, sound.id);
  toast(added ? 'Added to ' + p.name : 'Already in ' + p.name);
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
          <input type="checkbox" value="${esc(id)}"><span class="check"></span>
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

function renderAdd(view) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const presetPlaylist = params.get('to');
  // Opened from a playlist: offer a way back to it (iPhone home screen apps have no back button).
  setTop('Add sound', { back: !!presetPlaylist });

  view.innerHTML = `
    <div class="add-wrap">
      <p class="hint">Copy the link of a TikTok video (Share → Copy link) and paste it here.</p>
      <form id="lookupForm" class="lookup">
        <input class="input" id="linkInput" type="url" inputmode="url" placeholder="https://www.tiktok.com/@user/video/…" autocomplete="off" enterkeyhint="search">
        <button type="button" class="icon-btn paste" id="pasteBtn" aria-label="Paste">${ICON.paste}</button>
      </form>
      <button class="btn primary wide" id="findBtn" form="lookupForm" type="submit">Find sound</button>
      <div id="result"></div>
      <details class="tips">
        <summary>Tips</summary>
        <ul>
          <li>On Android, after installing Tikify you can share a TikTok straight to it: <b>Share → More → Tikify</b>.</li>
          <li>Sounds are downloaded to this device, so they play offline.</li>
          <li>Short links like <code>vm.tiktok.com/…</code> work too.</li>
        </ul>
      </details>
    </div>`;

  const input = $('#linkInput');
  const form = $('#lookupForm');
  $('#pasteBtn').onclick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      input.value = TikTok.extractUrl(text) || text;
      if (TikTok.extractUrl(input.value)) form.requestSubmit();
    } catch {
      toast('Long-press the box and choose Paste');
      input.focus();
    }
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    const url = TikTok.extractUrl(input.value);
    if (!url) { toast("That doesn't look like a TikTok link", { error: true }); return; }
    input.value = url;
    input.blur(); // hide the on-screen keyboard so the preview isn't covered
    lookupAndPreview(url, presetPlaylist);
  };

  if (pendingShare) {
    input.value = pendingShare;
    pendingShare = null;
    form.requestSubmit();
  } else if (shareHadNoLink) {
    shareHadNoLink = false;
    $('#result').innerHTML = '<div class="error" role="alert">That share didn’t include a TikTok link. In TikTok, tap <b>Share → Copy link</b>, then paste it here.</div>';
  }
}

async function lookupAndPreview(url, presetPlaylist) {
  const result = $('#result');
  const findBtn = $('#findBtn');
  findBtn.disabled = true;
  stopPreview(); // its button is about to be replaced
  result.innerHTML = '<div class="loading"><div class="spinner"></div>Finding the sound…</div>';
  let info;
  try {
    info = await TikTok.lookup(url);
  } catch (err) {
    if (!result.isConnected) return;
    result.innerHTML = `<div class="error" role="alert">${esc(err.message || 'Something went wrong')}.<br>Check the link and your connection, then try again.</div>`;
    findBtn.disabled = false;
    if (document.activeElement === document.body) findBtn.focus();
    return;
  }
  if (!result.isConnected) return; // the user left the Add view meanwhile
  findBtn.disabled = false;

  const dup = [...state.sounds.values()].find((s) => s.tiktokId && s.tiktokId === info.tiktokId);
  const isOriginal = /^original sound/i.test(info.title);
  // "original sound - user" isn't a great title; suggest the video caption instead.
  const suggestTitle = isOriginal && info.videoTitle ? info.videoTitle.replace(/#\S+/g, '').trim().slice(0, 80) : '';

  result.innerHTML = `
    <div class="preview">
      <div class="preview-top">
        <img class="cover lg" src="${esc(info.coverUrl)}" alt="" referrerpolicy="no-referrer">
        <button class="play-btn green" id="previewPlay" aria-label="Play preview">${ICON.play}</button>
      </div>
      ${dup ? `<div class="note">You already saved this TikTok as “${esc(dup.title)}”.</div>` : ''}
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
      <button class="btn primary wide" id="saveBtn">Save to library</button>
    </div>`;

  // Preview with a temporary audio element so the queue isn't touched.
  const el = new Audio(info.audioUrl);
  const pBtn = $('#previewPlay');
  pBtn.onclick = () => {
    if (!el.paused) return el.pause();
    audio.pause();
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
  // Screen reader users would otherwise be left on <body>; a button (not the title field) keeps
  // the on-screen keyboard closed.
  if (document.activeElement === document.body || $('#lookupForm')?.contains(document.activeElement)) pBtn.focus();
  announce(`Found ${info.title}`);
  window.addEventListener('hashchange', stopPreview, { once: true });

  $('#useCaption') && ($('#useCaption').onclick = () => ($('#pTitle').value = suggestTitle));

  $('#pNewPl').onclick = async () => {
    const name = await sheetPrompt('Name your playlist', '', 'My playlist', 'Create');
    if (!name) return;
    const p = await createPlaylist(name);
    const lbl = document.createElement('label');
    lbl.className = 'pl-check';
    lbl.innerHTML = `<input type="checkbox" value="${esc(p.id)}" checked><span>${esc(p.name)}</span>`;
    $('#pNewPl').before(lbl);
  };

  $('#saveBtn').onclick = async () => {
    const btn = $('#saveBtn');
    btn.disabled = true;
    btn.textContent = 'Downloading…';
    stopPreview();
    try {
      const sound = await saveSound(info, { title: $('#pTitle').value.trim(), artist: $('#pArtist').value.trim() });
      const chosen = [...document.querySelectorAll('.pl-checks input:checked')].map((c) => c.value);
      for (const id of chosen) await addToPlaylist(getPlaylist(id), sound.id);
      if (sound.audioUrl) toast('Saved, but the audio could not be downloaded for offline use', { error: true });
      else toast(chosen.length ? `Saved to ${chosen.length === 1 ? getPlaylist(chosen[0]).name : chosen.length + ' playlists'}` : 'Saved to your library');
      const backTo = presetPlaylist && getPlaylist(presetPlaylist);
      $('#result').innerHTML = `
        <div class="saved">
          <div class="big-icon ok">✓</div>
          <div><b>${esc(sound.title)}</b> saved</div>
          <div class="row-btns">
            <button class="btn ghost" id="addAnother">Add another</button>
            <button class="btn primary" id="playNow">Play now</button>
          </div>
          ${backTo ? `<button class="btn ghost" id="backToPl">Back to ${esc(backTo.name)}</button>` : ''}
        </div>`;
      $('#linkInput').value = '';
      $('#addAnother').onclick = () => { $('#result').innerHTML = ''; $('#linkInput').focus(); };
      $('#playNow').onclick = () => playList([sound.id], 0, { id: 'added', label: 'Just added' });
      if (backTo) $('#backToPl').onclick = () => goBack('#/playlist/' + encodeURIComponent(backTo.id));
      if (!document.activeElement || document.activeElement === document.body) $('#playNow').focus();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Save to library';
      toast(err && err.storage ? storageMessage(err) : 'Could not save: ' + (err.message || err), { error: true });
    }
  };
}

// ----- Search view -----
let lastQuery = '';
function renderSearch(view) {
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
          <button class="row" data-go="#/playlist/${encodeURIComponent(p.id)}">
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
  run();
}

// ----- settings / backup -----
async function settingsMenu() {
  const pick = sheetMenu('Tikify', [
    ...(isStandalone() ? [] : [{ label: 'Add to home screen', value: 'install', icon: ICON.plus }]),
    { label: 'Export backup', value: 'export' },
    { label: 'Import backup', value: 'import' },
    { label: 'About', value: 'about' },
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
  if (v === 'about') {
    sheetMenu('About Tikify', [{ label: 'Close', value: null }],
      'Save TikTok sounds and listen like it’s Spotify. Your library is stored only on this device. Sound lookups use the public tikwm.com API.');
  }
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
  buildBackup(run, (i, n) => (status.textContent = `Preparing your backup… ${i} of ${n}`)).then((f) => {
    if (!f || run !== exportRun) return;
    file = f;
    status.textContent = `${plural(state.sounds.size, 'sound')}, ${fmtBytes(f.size)}. Keep the file somewhere safe, like Files, iCloud Drive or Google Drive, to restore your library on any device.`;
    okBtn.disabled = false;
    if (document.activeElement === $('#sheet')) okBtn.focus();
  }, (err) => {
    if (run !== exportRun) return;
    status.textContent = 'Couldn’t create the backup. ' + (err && err.storage ? storageMessage(err) : 'Close other apps to free up memory, then try again.');
  });
}

async function buildBackup(run, progress) {
  const sounds = [...state.sounds.values()];
  const head = JSON.stringify({ app: 'tikify', version: 2, exportedAt: Date.now(), playlists: state.playlists });
  const parts = [head.slice(0, -1) + ',"sounds":[\n'];
  let shown = 0;
  for (let i = 0; i < sounds.length; i++) {
    const { coverBlob, ...s } = sounds[i];
    const a = await DB.get('audio', s.id);
    const line = JSON.stringify({
      ...s,
      cover: coverBlob ? await blobToDataUrl(coverBlob) : null,
      audio: a && a.blob ? await blobToDataUrl(a.blob) : null,
    });
    if (run !== exportRun) return null;
    parts.push(new Blob([(i ? ',' : '') + line + '\n']));
    if (Date.now() - shown > 800) { shown = Date.now(); progress(i + 1, sounds.length); }
  }
  parts.push(']}\n');
  return new File(parts, `tikify-backup-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
}

function saveBackupFile(file, close) {
  const done = (msg) => { localStorageSet('lastBackupAt', Date.now()); close(true); toast(msg); };
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

async function importSound(raw, count) {
  const sound = cleanSound(raw);
  if (!sound) { count.invalid++; return; }
  if (state.sounds.has(sound.id)) { count.existing++; return; }
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
  const count = { added: 0, existing: 0, invalid: 0, playlists: 0 };
  let shown = Date.now();
  toast('Importing backup…');
  try {
    // Every record is checked before it is stored; a storage error (e.g. full) stops the import.
    const data = await readBackup(file, async (raw) => {
      await importSound(raw, count);
      if (Date.now() - shown > 1500) { shown = Date.now(); toast(`Importing backup… ${plural(count.added, 'sound')}`); }
    });
    for (const raw of Array.isArray(data.playlists) ? data.playlists : []) {
      const p = cleanPlaylist(raw);
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
let currentObjectUrl = null;

function playList(ids, index, context) {
  if (!ids.length) return;
  state.context = context;
  state.baseQueue = ids.slice();
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
    if (on) {
      const rest = state.queue.filter((id) => id !== cur);
      state.queue = [cur, ...shuffleArr(rest)];
      state.index = 0;
    } else {
      state.queue = state.baseQueue.slice();
      state.index = Math.max(0, state.queue.indexOf(cur));
    }
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
  const b = $('#repeatBtn');
  b.classList.toggle('on', mode !== 'off');
  b.setAttribute('aria-pressed', mode !== 'off');
  b.setAttribute('aria-label', mode === 'one' ? 'Repeat one' : 'Repeat');
  $('#repeatOne').hidden = mode !== 'one';
}

function localStorageSet(k, v) { try { localStorage.setItem('tikify.' + k, JSON.stringify(v)); } catch { /* ignore */ } }
function localStorageGet(k, d) { try { const v = localStorage.getItem('tikify.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } }

let loadToken = 0;
async function loadIndex(i, autoplay) {
  state.index = i;
  const sound = state.sounds.get(currentId());
  if (!sound) return;
  const token = ++loadToken;
  updateNowPlaying();

  let src = null;
  const rec = await DB.get('audio', sound.id).catch(() => null); // unreadable: try the stream link
  if (token !== loadToken) return;
  if (rec && rec.blob) {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = URL.createObjectURL(rec.blob);
    src = currentObjectUrl;
  } else {
    src = sound.audioUrl;
  }
  audio.src = src;
  audio.dataset.id = sound.id;
  if (autoplay) {
    try { await audio.play(); } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') repairAndRetry(sound, token);
    }
  }
}

// If a sound was saved without its audio (or the link expired), look it up again and store it.
let repairing = false;
async function repairAndRetry(sound, token) {
  if (repairing || !sound.sourceUrl) { toast("Couldn't play this sound", { error: true }); return; }
  repairing = true;
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
    if (!stored || state.sounds.get(sound.id) !== sound) return;
    sound.audioUrl = null;
    if (token === loadToken) await loadIndex(state.index, true);
  } catch {
    toast("Couldn't play this sound", { error: true });
  } finally {
    repairing = false;
  }
}

audio.addEventListener('error', () => {
  const sound = state.sounds.get(audio.dataset.id);
  if (sound && audio.src) repairAndRetry(sound, loadToken);
});

function next(auto = false) {
  if (!state.queue.length) return;
  if (auto && state.repeat === 'one') { audio.currentTime = 0; audio.play(); return; }
  if (state.index < state.queue.length - 1) loadIndex(state.index + 1, true);
  else if (state.repeat === 'all' || !auto) {
    if (state.shuffle && state.queue.length > 1) state.queue = shuffleArr(state.queue.slice());
    loadIndex(0, state.repeat === 'all' || !auto);
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
}
function prev() {
  if (audio.currentTime > 3 || state.index === 0) { audio.currentTime = 0; return; }
  loadIndex(state.index - 1, true);
}
function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}
function stopPlayer() {
  audio.pause();
  audio.removeAttribute('src');
  state.queue = [];
  state.index = -1;
  $('#miniPlayer').hidden = true;
  closePlayer();
}

audio.addEventListener('ended', () => next(true));
audio.addEventListener('play', syncPlayState);
audio.addEventListener('pause', syncPlayState);
audio.addEventListener('timeupdate', syncProgress);
audio.addEventListener('loadedmetadata', async () => {
  syncProgress();
  const sound = state.sounds.get(audio.dataset.id);
  if (sound && isFinite(audio.duration) && Math.round(audio.duration) !== sound.duration) {
    sound.duration = Math.round(audio.duration);
    DB.put('sounds', sound).catch(() => { /* only a cached duration */ });
  }
});

function updateNowPlaying() {
  const sound = state.sounds.get(currentId());
  if (!sound) return;
  const cover = coverSrc(sound);
  $('#miniPlayer').hidden = false;
  document.body.classList.add('has-mini');
  $('#miniCover').src = cover;
  $('#miniTitle').textContent = sound.title;
  $('#miniArtist').textContent = sound.artist;
  $('#playerCover').src = cover;
  $('#playerBg').style.backgroundImage = `url(${JSON.stringify(cover)})`; // quotes in a URL can't break out
  $('#playerTitle').textContent = sound.title;
  $('#playerArtist').textContent = sound.artist;
  $('#playerContext').textContent = state.context ? 'Playing from ' + state.context : 'Playing';
  const link = $('#openTiktok');
  link.hidden = !sound.sourceUrl;
  link.href = sound.sourceUrl || '#';

  $('#miniOpen').setAttribute('aria-label', `${sound.title}, ${sound.artist}. Open player`);
  document.querySelectorAll('.track').forEach((r) => {
    const on = r.dataset.id === sound.id;
    r.classList.toggle('playing', on);
    const b = $('.track-main', r);
    if (b) { if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: sound.title,
      artist: sound.artist,
      album: state.context || 'Tikify',
      artwork: [{ src: cover, sizes: '512x512' }],
    });
  }
}

function syncPlayState() {
  const playing = !audio.paused;
  for (const b of [$('#miniPlay'), $('#playBtn')]) {
    b.innerHTML = playing ? ICON.pause : ICON.play;
    b.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  const view = $('#view');
  view._sync && view._sync();
}

let seeking = false;
function syncProgress() {
  const d = audio.duration || 0;
  const t = audio.currentTime || 0;
  $('#miniProgressBar').style.width = d ? (t / d) * 100 + '%' : '0';
  if (!seeking) $('#seek').value = d ? Math.round((t / d) * 1000) : 0;
  $('#curTime').textContent = fmtTime(t);
  $('#durTime').textContent = fmtTime(d);
  if (!seeking) $('#seek').setAttribute('aria-valuetext', `${fmtTime(t)} of ${fmtTime(d)}`);
  updateSeekFill();
  if ('mediaSession' in navigator && d && navigator.mediaSession.setPositionState) {
    try { navigator.mediaSession.setPositionState({ duration: d, position: Math.min(t, d), playbackRate: audio.playbackRate }); } catch { /* ignore */ }
  }
}
function updateSeekFill() {
  const s = $('#seek');
  s.style.setProperty('--fill', (s.value / 10) + '%');
}

const seek = $('#seek');
seek.addEventListener('input', () => {
  seeking = true;
  updateSeekFill();
  const t = fmtTime((seek.value / 1000) * (audio.duration || 0));
  $('#curTime').textContent = t;
  seek.setAttribute('aria-valuetext', `${t} of ${fmtTime(audio.duration)}`);
});
seek.addEventListener('change', () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  seeking = false;
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
  p.hidden = false;
  requestAnimationFrame(() => p.classList.add('open'));
  holdOverlay('player');
  syncInert();
  $('#playerClose').focus({ preventScroll: true });
}
function closePlayer() {
  if (!playerOpen) return;
  playerOpen = false;
  const p = $('#player');
  p.classList.remove('open');
  clearTimeout(playerHideTimer);
  playerHideTimer = setTimeout(() => (p.hidden = true), 250);
  syncInert();
  releaseOverlays();
  const a = document.activeElement;
  if (!a || a === document.body || p.contains(a)) restoreFocus(playerReturn) || restoreFocus(focusRef($('#miniOpen')));
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

// swipe down to close full player
(() => {
  let startY = null;
  const p = $('#player');
  p.addEventListener('touchstart', (e) => {
    if (e.target.closest('input')) return;
    startY = e.touches[0].clientY;
  }, { passive: true });
  p.addEventListener('touchend', (e) => {
    if (startY !== null && e.changedTouches[0].clientY - startY > 90) closePlayer();
    startY = null;
  });
})();

if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  const set = (a, h) => { try { ms.setActionHandler(a, h); } catch { /* unsupported */ } };
  set('play', () => audio.play());
  set('pause', () => audio.pause());
  set('previoustrack', prev);
  set('nexttrack', () => next());
  set('seekto', (d) => { audio.currentTime = d.seekTime; });
  set('seekbackward', (d) => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
  set('seekforward', (d) => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10)); });
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
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  localStorageSet('installed', true);
  toast('Tikify was added to your home screen');
});

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// In-app browsers (TikTok, Instagram, …) can't install web apps.
const isInAppBrowser = () => /tiktok|musical_ly|bytedance|instagram|fban|fbav|snapchat|line\//i.test(navigator.userAgent);

const IOS_SHARE = '<svg class="inline-ic" viewBox="0 0 24 24"><path d="M12 2l4 4-1.4 1.4L13 5.8V15h-2V5.8L9.4 7.4 8 6zM5 10h3v2H6v8h12v-8h-2v-2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1z"/></svg>';
const ADD_BOX = '<svg class="inline-ic" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5zm6 3h2v3h3v2h-3v3h-2v-3H8v-2h3z"/></svg>';

async function showInstallPrompt() {
  let steps = '';
  let action = '';
  if (isInAppBrowser()) {
    steps = `<ol class="install-steps">
      <li>Tap <b>⋯</b> (top right) and choose <b>Open in browser</b>.</li>
      <li>Then add Tikify to your home screen from there.</li></ol>`;
  } else if (deferredInstall) {
    action = '<button class="btn primary wide" data-install>Install Tikify</button>';
  } else if (isIOS()) {
    steps = `<ol class="install-steps">
      <li>Tap the <b>Share</b> button ${IOS_SHARE} in Safari's toolbar.</li>
      <li>Scroll down and tap <b>Add to Home Screen</b> ${ADD_BOX}.</li>
      <li>Tap <b>Add</b>. Then open Tikify from your home screen.</li></ol>`;
  } else {
    steps = `<ol class="install-steps">
      <li>Open your browser menu <b>⋮</b>.</li>
      <li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li></ol>`;
  }
  const html = `
    <div class="install">
      <img class="install-icon" src="icons/icon-192.png" alt="">
      <div class="install-badge">Recommended</div>
      <div class="sheet-title center">Add Tikify to your home screen</div>
      <ul class="install-perks">
        <li>Opens full screen, just like a real app</li>
        <li>Your sounds play offline</li>
        <li>Keeps your library safer from being cleared by the browser</li>
        ${isIOS() ? '' : '<li>Share TikToks straight to Tikify</li>'}
      </ul>
      ${steps}
      ${action}
      <button class="btn ghost wide" data-later>${action ? 'Not now' : 'Got it'}</button>
    </div>`;
  const choice = await openSheet(html, (sheet, close) => {
    $('[data-later]', sheet).onclick = () => close('later');
    const btn = $('[data-install]', sheet);
    if (btn) btn.onclick = () => close('install');
  });
  if (choice === 'install' && deferredInstall) {
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    deferredInstall = null;
    if (outcome !== 'accepted') localStorageSet('installDismissedAt', Date.now());
  } else {
    localStorageSet('installDismissedAt', Date.now());
  }
}

// Ask on first visit, then again at most every 3 days until installed.
function maybeShowInstallPrompt() {
  if (isStandalone() || localStorageGet('installed', false)) return;
  const last = localStorageGet('installDismissedAt', 0);
  if (Date.now() - last < 3 * 24 * 60 * 60 * 1000) return;
  setTimeout(() => {
    if ($('#sheetBackdrop').hidden && !isStandalone()) showInstallPrompt();
  }, 2500);
}

// ---------- boot ----------
function readShareTarget() {
  const params = new URLSearchParams(location.search);
  const shared = ['url', 'text', 'title'].map((k) => params.get(k)).filter(Boolean).join(' ');
  if (!shared) return;
  const url = TikTok.extractUrl(shared);
  history.replaceState(null, '', location.pathname + '#/add');
  if (url) pendingShare = url; else shareHadNoLink = true;
}

let storageFailure = null; // why the library couldn't be opened; the Library view explains it

(async function boot() {
  // First, so the shell gets cached for offline use even if storage or rendering fails below.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
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

  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  maybeShowInstallPrompt();
})();
