// Shared pieces for the Tikify concept mockups: icons, status bar, dock, the mark.
const P = {
  search: 'M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.5 4.5-1.41 1.41-4.5-4.5A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z',
  plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z',
  library: 'M4 3h2.2v18H4zm5 0h2.2v18H9zm5.3.9 2.1-.7 5.7 17.1-2.1.7z',
  play: 'M8 5.3v13.4a1 1 0 0 0 1.52.85l10.6-6.7a1 1 0 0 0 0-1.7L9.52 4.45A1 1 0 0 0 8 5.3z',
  pause: 'M7 4.5h3.2a.8.8 0 0 1 .8.8v13.4a.8.8 0 0 1-.8.8H7a.8.8 0 0 1-.8-.8V5.3a.8.8 0 0 1 .8-.8zm6.8 0H17a.8.8 0 0 1 .8.8v13.4a.8.8 0 0 1-.8.8h-3.2a.8.8 0 0 1-.8-.8V5.3a.8.8 0 0 1 .8-.8z',
  next: 'M5 6.2v11.6a.9.9 0 0 0 1.4.75L15 12.75a.9.9 0 0 0 0-1.5L6.4 5.45A.9.9 0 0 0 5 6.2zM17 5h2.2v14H17z',
  prev: 'M19 6.2v11.6a.9.9 0 0 1-1.4.75L9 12.75a.9.9 0 0 1 0-1.5l8.6-5.8A.9.9 0 0 1 19 6.2zM4.8 5H7v14H4.8z',
  shuffle: 'M17 3.5l4 3.5-4 3.5V8h-1.9c-1 0-1.9.5-2.5 1.3L7.8 16c-1 1.3-2.5 2-4.1 2H2.5v-2h1.2c1 0 1.9-.5 2.5-1.3L11 8c1-1.3 2.5-2 4.1-2H17zM2.5 6h1.2c1.6 0 3.1.7 4.1 2l1 1.3-1.25 1.7-1.35-1.8C5.6 8.5 4.7 8 3.7 8H2.5zm9.9 8.7 1.2-1.7 1 1.4c.6.8 1.5 1.3 2.5 1.3H17v-2.5l4 3.5-4 3.5V18h-1.9c-1.6 0-3.1-.7-4.1-2z',
  repeat: 'M7 6h10.5V3.5l4 3.5-4 3.5V8H7a3 3 0 0 0-3 3v1H2v-1a5 5 0 0 1 5-5zm10 12H6.5v2.5l-4-3.5 4-3.5V16H17a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5z',
  heart: 'M12 20.6l-1.3-1.2C5.9 15 3 12.4 3 9.1 3 6.4 5.1 4.4 7.7 4.4c1.6 0 3.2.8 4.3 2 1.1-1.2 2.7-2 4.3-2 2.6 0 4.7 2 4.7 4.7 0 3.3-2.9 5.9-7.7 10.3z',
  heartO: 'M16.3 4.4c-1.6 0-3.2.8-4.3 2-1.1-1.2-2.7-2-4.3-2C5.1 4.4 3 6.4 3 9.1c0 3.3 2.9 5.9 7.7 10.3l1.3 1.2 1.3-1.2C18.1 15 21 12.4 21 9.1c0-2.7-2.1-4.7-4.7-4.7zm-4.2 13.6-.1.1-.1-.1C7.1 14 5 12 5 9.1 5 7.6 6.2 6.4 7.7 6.4c1.2 0 2.4.8 2.8 1.9h3c.4-1.1 1.6-1.9 2.8-1.9 1.5 0 2.7 1.2 2.7 2.7 0 2.9-2.1 4.9-6.9 8.9z',
  more: 'M5 10.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm7 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm7 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z',
  down: 'M4.6 8.3 12 15.7l7.4-7.4 1.4 1.4-8.8 8.8-8.8-8.8z',
  back: 'M15.7 4.6 8.3 12l7.4 7.4-1.4 1.4L5.5 12l8.8-8.8z',
  offline: 'M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm-1 5v6.1l-2.3-2.3-1.4 1.4L12 17.4l4.7-4.7-1.4-1.4-2.3 2.3V7.5z',
  share: 'M12 2.6l4.7 4.7-1.4 1.4-2.3-2.3V15h-2V6.4L8.7 8.7 7.3 7.3zM5 11h3v2H6v7h12v-7h-2v-2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z',
  queue: 'M3 5h13v2H3zm0 6h13v2H3zm0 6h8v2H3zm15-3.5V9l5 3.75L18 16.5z',
  link: 'M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4l-3.5 3.5a1 1 0 0 1-1.4 0zm-2.1 5.3a4 4 0 0 1-2.83-6.83l2.12-2.12 1.42 1.41-2.13 2.13a2 2 0 1 0 2.83 2.83l2.12-2.13 1.42 1.42-2.13 2.12a4 4 0 0 1-2.82 1.17zm7.95-4.47-1.42-1.41 2.13-2.13a2 2 0 1 0-2.83-2.83l-2.12 2.13-1.42-1.42 2.13-2.12a4 4 0 0 1 5.65 5.66z',
  check: 'M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.6 7.9l-1.4-1.4z',
  sparkle: 'M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',
  lock: 'M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3z',
  airplay: 'M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2.5l-1.6-2H19V6H5v9h4.1l-1.6 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm7 9 6 8H6z',
  clock: 'M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm0 2a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zM11 7h2v4.6l3.2 3.2-1.4 1.4-3.8-3.8z',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;

function statusBar(color = '#fff') {
  return `<div class="island"></div><div class="status" style="color:${color}">
    <span>9:41</span>
    <span class="r">
      <svg width="19" height="12" viewBox="0 0 19 12" fill="${color}"><rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1"/><rect x="10" y="3" width="3.2" height="9" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="${color}"><path d="M8.5 2.6c2.3 0 4.4.9 6 2.4l1.3-1.3A10.3 10.3 0 0 0 8.5.8 10.3 10.3 0 0 0 1.2 3.7L2.5 5a8.5 8.5 0 0 1 6-2.4zm0 3.6c1.3 0 2.5.5 3.5 1.4l1.3-1.3a6.7 6.7 0 0 0-9.6 0L5 7.6c1-.9 2.2-1.4 3.5-1.4zm0 3.5 2.2-2.2a3.1 3.1 0 0 0-4.4 0z"/></svg>
      <svg width="28" height="13" viewBox="0 0 28 13"><rect x=".5" y=".5" width="24" height="12" rx="3.8" fill="none" stroke="${color}" stroke-opacity=".4"/><rect x="2.2" y="2.2" width="18.5" height="8.6" rx="2.3" fill="${color}"/><path d="M26 4.3v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2z" fill="${color}" fill-opacity=".45"/></svg>
    </span></div>`;
}

function dock({ tab = 'library', mini = null, scrim = 250 } = {}) {
  const m = mini ? `<div class="mini">
      <img src="../covers/${mini.cover}.png" alt="">
      <div class="m"><div class="t">${mini.title}</div><div class="s">${mini.artist}</div></div>
      <div class="ctl">${ic('heart')}</div>
      <div class="ctl">${ic('pause')}</div>
      <div class="prog"><b></b></div>
    </div>` : '';
  const t = (k, icon, label) => `<div class="tab ${tab === k ? 'on' : ''}">${ic(icon)}<span>${label}</span></div>`;
  return `<div class="scrim" style="height:${scrim}px"></div><div class="dock">${m}
    <div class="tabs">
      ${t('library', 'library', 'Library')}
      <div class="tab-add">${ic('plus')}</div>
      ${t('search', 'search', 'Search')}
    </div></div><div class="home-ind"></div>`;
}

// The mark: sound bars whose heights trace a play triangle.
function mark(size = 64, { bg = true, id = 'mg' + Math.random().toString(36).slice(2, 7) } = {}) {
  const bars = [];
  const n = 5, x0 = 25, w = 8, step = 12;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * step, cx = x + w / 2;
    const h = Math.max(w, 2 * 31 * (83 - cx) / (83 - x0));
    bars.push(`<rect x="${x}" y="${(50 - h / 2).toFixed(2)}" width="${w}" height="${h.toFixed(2)}" rx="${w / 2}"/>`);
  }
  const big = size >= 120;
  return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a45"/><stop offset=".5" stop-color="#ff2d7a"/><stop offset="1" stop-color="#8b5cff"/></linearGradient>
      <radialGradient id="${id}b" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#2a2333"/><stop offset="1" stop-color="#07060a"/></radialGradient>
      <filter id="${id}g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${bg ? `<rect width="100" height="100" rx="23" fill="url(#${id}b)"/><rect x=".5" y=".5" width="99" height="99" rx="22.5" fill="none" stroke="#fff" stroke-opacity=".12"/>` : ''}
    <g fill="url(#${id})" ${big ? `filter="url(#${id}g)"` : ''}>${bars.join('')}</g>
  </svg>`;
}

// A waveform scrubber: deterministic bar heights, the played part lit.
let waveN = 0;
function wave(n, played, { h = 44, gap = 2.2, w = 3, lit = null, rest = 'rgba(255,255,255,.22)', seed = 3 } = {}) {
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const W = n * (w + gap) - gap;
  const id = 'wg' + (waveN++);
  const bars = Array.from({ length: n }, (_, i) => {
    const env = .35 + .65 * Math.sin(Math.PI * (i + 2) / (n + 4)) ** .6;
    const v = Math.max(.12, Math.min(1, env * (.45 + .75 * rnd())));
    const bh = v * h;
    return `<rect x="${(i * (w + gap)).toFixed(1)}" y="${((h - bh) / 2).toFixed(1)}" width="${w}" height="${bh.toFixed(1)}" rx="${w / 2}" fill="${i / n < played ? (lit || `url(#${id})`) : rest}"/>`;
  }).join('');
  return `<svg width="100%" height="${h}" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" style="display:block">
    <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" x2="${(W * played).toFixed(1)}" y1="0" y2="0"><stop offset="0" stop-color="#ff7a45"/><stop offset=".55" stop-color="#ff2d7a"/><stop offset="1" stop-color="#b48cff"/></linearGradient></defs>${bars}</svg>`;
}

const eq = () => `<span class="eq"><i style="height:55%"></i><i style="height:100%"></i><i style="height:70%"></i></span>`;
