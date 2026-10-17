'use strict';

// ---------- helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
};

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
  context: '',         // e.g. "Playlist · Gym"
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

async function loadAll() {
  const [sounds, playlists] = await Promise.all([DB.getAll('sounds'), DB.getAll('playlists')]);
  state.sounds = new Map(sounds.map((s) => [s.id, s]));
  state.playlists = playlists.sort((a, b) => a.createdAt - b.createdAt);
}

const allSoundIds = () => [...state.sounds.values()].sort((a, b) => b.addedAt - a.addedAt).map((s) => s.id);
const getPlaylist = (id) => state.playlists.find((p) => p.id === id);

// ---------- UI primitives ----------
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2600);
}

let sheetResolve = null;
function openSheet(html, onMount) {
  const backdrop = $('#sheetBackdrop');
  const sheet = $('#sheet');
  sheet.innerHTML = '<div class="sheet-handle"></div>' + html;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('open'));
  return new Promise((resolve) => {
    sheetResolve = resolve;
    onMount && onMount(sheet, closeSheet);
  });
}
function closeSheet(value) {
  const backdrop = $('#sheetBackdrop');
  backdrop.classList.remove('open');
  setTimeout(() => (backdrop.hidden = true), 200);
  const r = sheetResolve;
  sheetResolve = null;
  r && r(value);
}
$('#sheetBackdrop').addEventListener('click', (e) => {
  if (e.target.id === 'sheetBackdrop') closeSheet(null);
});

// Menu: items = [{ label, value, danger?, icon? }]
function sheetMenu(title, items, sub = '') {
  const html = `
    ${title ? `<div class="sheet-title">${esc(title)}</div>` : ''}
    ${sub ? `<div class="sheet-sub">${esc(sub)}</div>` : ''}
    <div class="sheet-list">
      ${items.map((it, i) => `<button class="sheet-item ${it.danger ? 'danger' : ''}" data-i="${i}">${it.icon || ''}<span>${esc(it.label)}</span></button>`).join('')}
    </div>`;
  return openSheet(html, (sheet, close) => {
    sheet.querySelectorAll('.sheet-item').forEach((b) =>
      b.addEventListener('click', () => close(items[+b.dataset.i].value)));
  });
}

function sheetPrompt(title, value = '', placeholder = '', okLabel = 'Save') {
  const html = `
    <div class="sheet-title">${esc(title)}</div>
    <form class="sheet-form">
      <input class="input" name="v" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="120" autocomplete="off">
      <div class="row-btns">
        <button type="button" class="btn ghost" data-cancel>Cancel</button>
        <button type="submit" class="btn primary">${esc(okLabel)}</button>
      </div>
    </form>`;
  return openSheet(html, (sheet, close) => {
    const form = $('form', sheet);
    const input = form.elements.v;
    setTimeout(() => { input.focus(); input.select(); }, 60);
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

async function savePlaylist(p) {
  await DB.put('playlists', p);
}

async function addToPlaylist(p, soundId) {
  if (p.soundIds.includes(soundId)) return false;
  p.soundIds.push(soundId);
  await savePlaylist(p);
  return true;
}

async function deleteSound(id) {
  await DB.del('sounds', id);
  await DB.del('audio', id);
  state.sounds.delete(id);
  if (coverUrls.has(id)) { URL.revokeObjectURL(coverUrls.get(id)); coverUrls.delete(id); }
  for (const p of state.playlists) {
    if (p.soundIds.includes(id)) {
      p.soundIds = p.soundIds.filter((x) => x !== id);
      await savePlaylist(p);
    }
  }
  const qi = state.queue.indexOf(id);
  if (qi !== -1) {
    const wasCurrent = qi === state.index;
    state.queue.splice(qi, 1);
    state.baseQueue = state.baseQueue.filter((x) => x !== id);
    if (qi < state.index) state.index--;
    if (wasCurrent) {
      if (state.queue.length) loadIndex(Math.min(state.index, state.queue.length - 1), !audio.paused);
      else stopPlayer();
    }
  }
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
    coverUrl: info.coverUrl,
    audioUrl: audioBlob ? null : info.audioUrl,
    sourceUrl: info.sourceUrl,
    tiktokId: info.tiktokId,
    duration: info.duration,
    addedAt: Date.now(),
  };
  await DB.put('sounds', sound);
  if (audioBlob) await DB.put('audio', { id, blob: audioBlob });
  state.sounds.set(id, sound);
  return sound;
}

// ---------- routing ----------
function currentRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('?')[0].split('/');
  return { name: parts[0] || 'library', id: parts[1] ? decodeURIComponent(parts[1]) : null };
}
function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}
window.addEventListener('hashchange', render);

function setTop(title, { back = false, menu = null } = {}) {
  $('#viewTitle').textContent = title;
  $('#backBtn').hidden = !back;
  const mb = $('#menuBtn');
  mb.hidden = !menu;
  mb.onclick = menu;
  document.querySelectorAll('.tabbar button').forEach((b) => {
    const r = currentRoute().name;
    const tab = r === 'playlist' || r === 'all' ? 'library' : r;
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}
$('#backBtn').onclick = () => (history.length > 1 ? history.back() : go('#/library'));
document.querySelectorAll('.tabbar button').forEach((b) =>
  b.addEventListener('click', () => go('#/' + b.dataset.tab)));

function render() {
  const r = currentRoute();
  const view = $('#view');
  view.scrollTop = 0;
  if (r.name === 'playlist') return renderPlaylist(view, r.id);
  if (r.name === 'all') return renderPlaylist(view, null);
  if (r.name === 'add') return renderAdd(view);
  if (r.name === 'search') return renderSearch(view);
  return renderLibrary(view);
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
    ${count === 0 ? `
      <div class="empty-state">
        <div class="big-icon">${ICON.note}</div>
        <h2>Start your collection</h2>
        <p>Copy a TikTok link, then tap <b>Add sound</b> to save the song.</p>
        <button class="btn primary" data-go="#/add">Add your first sound</button>
      </div>` : ''}
  `;
  view.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => go(el.dataset.go)));
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
      <img class="cover" src="${esc(coverSrc(sound))}" alt="" loading="lazy">
      <div class="meta"><div class="t">${esc(sound.title)}</div><div class="s">${esc(sound.artist)}</div></div>
      <button class="icon-btn more" aria-label="Options">${ICON.dots}</button>
    </div>`;
}

function currentId() {
  return state.queue[state.index];
}

function renderPlaylist(view, playlistId) {
  const isAll = playlistId === null;
  const p = isAll ? null : getPlaylist(playlistId);
  if (!isAll && !p) return go('#/library');
  const ids = isAll ? allSoundIds() : p.soundIds.filter((id) => state.sounds.has(id));
  const name = isAll ? 'All sounds' : p.name;
  const context = isAll ? 'All sounds' : p.name;

  setTop('', { back: true, menu: isAll ? null : () => playlistMenu(p) });

  view.innerHTML = `
    <div class="pl-header ${isAll ? 'is-all' : ''}">
      ${isAll ? `<div class="cover xl all-sounds">${ICON.heart}</div>` : mosaic(ids, 'xl')}
      <h2>${esc(name)}</h2>
      <div class="s">${ids.length} sound${ids.length === 1 ? '' : 's'}</div>
      <div class="pl-actions">
        ${isAll ? '' : `<button class="icon-btn" id="plAdd" aria-label="Add sounds">${ICON.plus}</button>`}
        <span class="grow"></span>
        <button class="icon-btn ${state.shuffle ? 'on' : ''}" id="plShuffle" aria-label="Shuffle play">${ICON.shuffle}</button>
        <button class="play-btn green" id="plPlay" aria-label="Play" ${ids.length ? '' : 'disabled'}>${ICON.play}</button>
      </div>
    </div>
    <div class="list tracks">
      ${ids.map((id, i) => trackRow(state.sounds.get(id), i, { playing: id === currentId() && state.context === context })).join('')}
    </div>
    ${ids.length === 0 ? `
      <div class="empty-state small">
        <p>${isAll ? 'No sounds yet.' : 'This playlist is empty.'}</p>
        <button class="btn primary" id="emptyAdd">${isAll ? 'Add a sound' : 'Add sounds'}</button>
      </div>` : ''}
  `;

  const isThisContext = () => state.context === context && state.queue.length;
  const syncPlayIcon = () => {
    const btn = $('#plPlay');
    if (btn) btn.innerHTML = isThisContext() && !audio.paused ? ICON.pause : ICON.play;
  };
  syncPlayIcon();
  view._sync = syncPlayIcon;

  $('#plPlay').onclick = () => {
    if (isThisContext()) return togglePlay();
    playList(ids, state.shuffle ? Math.floor(Math.random() * ids.length) : 0, context);
  };
  $('#plShuffle').onclick = () => {
    setShuffle(!state.shuffle);
    $('#plShuffle').classList.toggle('on', state.shuffle);
  };
  const addSounds = () => (isAll ? go('#/add') : pickSoundsFor(p));
  $('#plAdd') && ($('#plAdd').onclick = addSounds);
  if ($('#emptyAdd')) {
    $('#emptyAdd').onclick = () => (isAll || !state.sounds.size ? go('#/add' + (isAll ? '' : '?to=' + encodeURIComponent(p.id))) : pickSoundsFor(p));
  }

  view.querySelectorAll('.track').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.more')) {
        soundMenu(state.sounds.get(row.dataset.id), p, +row.dataset.i);
        return;
      }
      playList(ids, +row.dataset.i, context);
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
    if (name) { p.name = name; await savePlaylist(p); render(); }
  }
  if (v === 'delete') {
    if (await sheetConfirm('Delete playlist?', `"${p.name}" will be removed. The sounds stay in your library.`)) {
      await DB.del('playlists', p.id);
      state.playlists = state.playlists.filter((x) => x.id !== p.id);
      go('#/library');
      toast('Playlist deleted');
    }
  }
}

async function soundMenu(sound, playlist, index) {
  if (!sound) return;
  const items = [
    { label: 'Play next', value: 'next' },
    { label: 'Add to playlist', value: 'add', icon: ICON.plus },
    { label: 'Edit title & artist', value: 'edit' },
  ];
  if (playlist) {
    if (index > 0) items.push({ label: 'Move up', value: 'up' });
    if (index < playlist.soundIds.length - 1) items.push({ label: 'Move down', value: 'down' });
    items.push({ label: 'Remove from this playlist', value: 'remove' });
  }
  if (sound.sourceUrl) items.push({ label: 'Open on TikTok', value: 'open' });
  items.push({ label: 'Delete from library', value: 'delete', danger: true });

  const v = await sheetMenu(sound.title, items, sound.artist);
  if (v === 'next') {
    if (!state.queue.length) return playList([sound.id], 0, 'Queue');
    state.queue.splice(state.index + 1, 0, sound.id);
    state.baseQueue.push(sound.id);
    toast('Playing next');
  }
  if (v === 'add') addToPlaylistSheet(sound);
  if (v === 'edit') editSound(sound);
  if (v === 'up' || v === 'down') {
    const ids = playlist.soundIds;
    const j = v === 'up' ? index - 1 : index + 1;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    await savePlaylist(playlist);
    render();
  }
  if (v === 'remove') {
    playlist.soundIds = playlist.soundIds.filter((x) => x !== sound.id);
    await savePlaylist(playlist);
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
      <label class="lbl">Title</label>
      <input class="input" name="title" value="${esc(sound.title)}" maxlength="150">
      <label class="lbl">Artist</label>
      <input class="input" name="artist" value="${esc(sound.artist)}" maxlength="150">
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
  sound.title = res.title || sound.title;
  sound.artist = res.artist || sound.artist;
  await DB.put('sounds', sound);
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
  p.soundIds.push(...chosen);
  await savePlaylist(p);
  toast(`Added ${chosen.length} sound${chosen.length === 1 ? '' : 's'}`);
  render();
}

// ----- Add sound view -----
let pendingShare = null; // link shared into the app via the share sheet

function renderAdd(view) {
  setTop('Add sound');
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const presetPlaylist = params.get('to');

  view.innerHTML = `
    <div class="add-wrap">
      <p class="hint">Copy the link of a TikTok video (Share → Copy link) and paste it here.</p>
      <form id="lookupForm" class="lookup">
        <input class="input" id="linkInput" type="url" inputmode="url" placeholder="https://www.tiktok.com/@user/video/…" autocomplete="off">
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
    if (!url) { toast("That doesn't look like a TikTok link"); return; }
    input.value = url;
    lookupAndPreview(url, presetPlaylist);
  };

  if (pendingShare) {
    input.value = pendingShare;
    pendingShare = null;
    form.requestSubmit();
  }
}

async function lookupAndPreview(url, presetPlaylist) {
  const result = $('#result');
  const findBtn = $('#findBtn');
  findBtn.disabled = true;
  result.innerHTML = '<div class="loading"><div class="spinner"></div>Finding the sound…</div>';
  let info;
  try {
    info = await TikTok.lookup(url);
  } catch (err) {
    result.innerHTML = `<div class="error">${esc(err.message || 'Something went wrong')}.<br>Check the link and your connection, then try again.</div>`;
    findBtn.disabled = false;
    return;
  }
  findBtn.disabled = false;

  const dup = [...state.sounds.values()].find((s) => s.tiktokId && s.tiktokId === info.tiktokId);
  const isOriginal = /^original sound/i.test(info.title);
  // "original sound - user" isn't a great title; suggest the video caption instead.
  const suggestTitle = isOriginal && info.videoTitle ? info.videoTitle.replace(/#\S+/g, '').trim().slice(0, 80) : '';

  result.innerHTML = `
    <div class="preview">
      <div class="preview-top">
        <img class="cover lg" src="${esc(info.coverUrl)}" alt="" referrerpolicy="no-referrer">
        <button class="play-btn green" id="previewPlay" aria-label="Preview">${ICON.play}</button>
      </div>
      ${dup ? `<div class="note">You already saved this TikTok as “${esc(dup.title)}”.</div>` : ''}
      <label class="lbl">Title</label>
      <input class="input" id="pTitle" value="${esc(info.title)}" maxlength="150">
      ${suggestTitle ? `<button class="link-btn" id="useCaption">Use caption: “${esc(suggestTitle)}”</button>` : ''}
      <label class="lbl">Artist</label>
      <input class="input" id="pArtist" value="${esc(info.artist)}" maxlength="150">
      <label class="lbl">Add to playlists</label>
      <div class="pl-checks">
        ${state.playlists.map((p) => `
          <label class="pl-check"><input type="checkbox" value="${esc(p.id)}" ${p.id === presetPlaylist ? 'checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}
        <button class="chip" id="pNewPl">${ICON.plus}<span>New playlist</span></button>
      </div>
      <button class="btn primary wide" id="saveBtn">Save to library</button>
    </div>`;

  // Preview with a temporary audio element so the main player isn't interrupted.
  const preview = new Audio(info.audioUrl);
  const pBtn = $('#previewPlay');
  pBtn.onclick = () => {
    if (preview.paused) { audio.pause(); preview.play().catch(() => toast('Could not play preview')); }
    else preview.pause();
  };
  preview.onplay = () => (pBtn.innerHTML = ICON.pause);
  preview.onpause = preview.onended = () => (pBtn.innerHTML = ICON.play);
  window.addEventListener('hashchange', () => preview.pause(), { once: true });

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
    preview.pause();
    try {
      const sound = await saveSound(info, { title: $('#pTitle').value.trim(), artist: $('#pArtist').value.trim() });
      const chosen = [...document.querySelectorAll('.pl-checks input:checked')].map((c) => c.value);
      for (const id of chosen) await addToPlaylist(getPlaylist(id), sound.id);
      if (sound.audioUrl) toast('Saved, but the audio could not be downloaded for offline use');
      else toast(chosen.length ? `Saved to ${chosen.length === 1 ? getPlaylist(chosen[0]).name : chosen.length + ' playlists'}` : 'Saved to your library');
      $('#result').innerHTML = `
        <div class="saved">
          <div class="big-icon ok">✓</div>
          <div><b>${esc(sound.title)}</b> saved</div>
          <div class="row-btns">
            <button class="btn ghost" id="addAnother">Add another</button>
            <button class="btn primary" id="playNow">Play now</button>
          </div>
        </div>`;
      $('#linkInput').value = '';
      $('#addAnother').onclick = () => { $('#result').innerHTML = ''; $('#linkInput').focus(); };
      $('#playNow').onclick = () => playList([sound.id], 0, 'Just added');
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Save to library';
      toast('Could not save: ' + (err.message || err));
    }
  };
}

// ----- Search view -----
let lastQuery = '';
function renderSearch(view) {
  setTop('Search');
  view.innerHTML = `
    <div class="search-wrap">
      <input class="input search" id="q" type="search" placeholder="Songs, artists or playlists" value="${esc(lastQuery)}" autocomplete="off">
      <div id="searchResults"></div>
    </div>`;
  const q = $('#q');
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
    out.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => go(el.dataset.go)));
    out.querySelectorAll('.track').forEach((row) => row.addEventListener('click', (e) => {
      if (e.target.closest('.more')) return soundMenu(state.sounds.get(row.dataset.id), null, -1);
      playList(ids, +row.dataset.i, 'Search');
    }));
  };
  q.addEventListener('input', run);
  run();
  if (!lastQuery) setTimeout(() => q.focus(), 50);
}

// ----- settings / backup -----
async function settingsMenu() {
  const v = await sheetMenu('Tikify', [
    ...(isStandalone() ? [] : [{ label: 'Add to home screen', value: 'install', icon: ICON.plus }]),
    { label: 'Export backup', value: 'export' },
    { label: 'Import backup', value: 'import' },
    { label: 'About', value: 'about' },
  ], `${state.sounds.size} sounds · ${state.playlists.length} playlists · stored on this device`);
  if (v === 'install') showInstallPrompt();
  if (v === 'export') exportBackup();
  if (v === 'import') importBackup();
  if (v === 'about') {
    sheetMenu('About Tikify', [{ label: 'Close', value: null }],
      'Save TikTok sounds and listen like it’s Spotify. Your library is stored only on this device. Sound lookups use the public tikwm.com API.');
  }
}

const blobToDataUrl = (blob) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = () => rej(r.error);
  r.readAsDataURL(blob);
});
const dataUrlToBlob = async (url) => (await fetch(url)).blob();

async function exportBackup() {
  toast('Preparing backup…');
  const sounds = [];
  for (const s of state.sounds.values()) {
    const a = await DB.get('audio', s.id);
    sounds.push({
      ...s,
      coverBlob: undefined,
      cover: s.coverBlob ? await blobToDataUrl(s.coverBlob) : null,
      audio: a ? await blobToDataUrl(a.blob) : null,
    });
  }
  const data = JSON.stringify({ app: 'tikify', version: 1, exportedAt: Date.now(), sounds, playlists: state.playlists });
  const blob = new Blob([data], { type: 'application/json' });
  const name = `tikify-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Tikify backup' }); return; } catch { /* fall through to download */ }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'tikify') throw new Error('Not a Tikify backup');
      let added = 0;
      for (const s of data.sounds || []) {
        if (state.sounds.has(s.id)) continue;
        const { audio: audioData, cover, ...rest } = s;
        const sound = { ...rest, coverBlob: cover ? await dataUrlToBlob(cover) : null };
        await DB.put('sounds', sound);
        if (audioData) await DB.put('audio', { id: s.id, blob: await dataUrlToBlob(audioData) });
        state.sounds.set(s.id, sound);
        added++;
      }
      for (const p of data.playlists || []) {
        const existing = getPlaylist(p.id);
        if (existing) {
          existing.soundIds = [...new Set([...existing.soundIds, ...p.soundIds])];
          await savePlaylist(existing);
        } else {
          await DB.put('playlists', p);
          state.playlists.push(p);
        }
      }
      toast(`Imported ${added} sound${added === 1 ? '' : 's'}`);
      render();
    } catch (err) {
      toast('Import failed: ' + (err.message || err));
    }
  };
  input.click();
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
  $('#shuffleBtn').classList.toggle('on', on);
}

function setRepeat(mode) {
  state.repeat = mode;
  localStorageSet('repeat', mode);
  $('#repeatBtn').classList.toggle('on', mode !== 'off');
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
  const rec = await DB.get('audio', sound.id);
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
  if (repairing || !sound.sourceUrl) { toast("Couldn't play this sound"); return; }
  repairing = true;
  toast('Re-downloading sound…');
  try {
    const info = await TikTok.lookup(sound.sourceUrl);
    const blob = await TikTok.downloadBlob(info.audioUrl);
    await DB.put('audio', { id: sound.id, blob });
    sound.audioUrl = null;
    await DB.put('sounds', sound);
    if (token === loadToken) await loadIndex(state.index, true);
  } catch {
    toast("Couldn't play this sound");
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
    DB.put('sounds', sound);
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
  $('#playerBg').style.backgroundImage = `url("${cover}")`;
  $('#playerTitle').textContent = sound.title;
  $('#playerArtist').textContent = sound.artist;
  $('#playerContext').textContent = state.context ? 'Playing from ' + state.context : 'Playing';
  const link = $('#openTiktok');
  link.hidden = !sound.sourceUrl;
  link.href = sound.sourceUrl || '#';

  document.querySelectorAll('.track').forEach((r) => r.classList.toggle('playing', r.dataset.id === sound.id));

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
  $('#miniPlay').innerHTML = playing ? ICON.pause : ICON.play;
  $('#playBtn').innerHTML = playing ? ICON.pause : ICON.play;
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
  $('#curTime').textContent = fmtTime((seek.value / 1000) * (audio.duration || 0));
});
seek.addEventListener('change', () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  seeking = false;
});

function openPlayer() {
  const p = $('#player');
  p.hidden = false;
  requestAnimationFrame(() => p.classList.add('open'));
}
function closePlayer() {
  const p = $('#player');
  p.classList.remove('open');
  setTimeout(() => (p.hidden = true), 250);
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
  if (s) soundMenu(s, null, -1);
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
  if (e.target.matches('input, textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  if (e.key === 'Escape') { if (!$('#sheetBackdrop').hidden) closeSheet(null); else closePlayer(); }
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
  if (url) pendingShare = url;
}

(async function boot() {
  readShareTarget();
  await loadAll();
  state.shuffle = localStorageGet('shuffle', false);
  setShuffle(state.shuffle);
  setRepeat(localStorageGet('repeat', 'off'));
  syncPlayState();
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  maybeShowInstallPrompt();
})();
