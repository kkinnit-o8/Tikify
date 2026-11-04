/* Beat grid of the soundtrack, measured from the song itself (kick every 0.61459 s, drop at 142.602 s).
   The film starts 137.685 s into the song: 8 kicks of bass-less breakdown, then the drop at t = 4.917.
   FB(k) = the frame that shows beat k (at or just before it); CUT(k) = the half-frame boundary before it. */
const AUD = { start: 137.685, P: 0.6145946, drop: 142.6019 };
const BEAT = (k) => AUD.drop - AUD.start + (k - 8) * AUD.P;
const FB = (k) => Math.floor(BEAT(k) * 30 + 0.25) / 30;
const CUTB = (k) => FB(k) - 1 / 60;
const CUT1 = CUTB(8);    // hook -> drop
const CUT2 = CUTB(16);   // player needle -> payoff scene (bass returns after the gap)
const DUR = 14.75;
// last kick at or before t (for pulses); -1 before the drop
const lastBeat = (t) => { if (t < BEAT(8)) return -1; return BEAT(8) + Math.floor((t - BEAT(8)) / AUD.P + 1e-6) * AUD.P; };
const BRAND = 'linear-gradient(135deg,#ff6a3d,#ff2d7a 50%,#8b5cff)';
// The app's mark (design/future-look/src/shared.js): sound bars whose heights trace a play triangle.
function markSVG(size, id) {
  const bars = []; const n = 5, x0 = 25, w = 8, step = 12;
  for (let i = 0; i < n; i++) { const x = x0 + i * step, cx = x + w / 2; const h = Math.max(w, 2 * 31 * (83 - cx) / (83 - x0));
    bars.push(`<g class="bar" style="transform-origin:${cx}px 50px"><rect x="${x}" y="${(50 - h / 2).toFixed(2)}" width="${w}" height="${h.toFixed(2)}" rx="${w / 2}"/></g>`); }
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block;overflow:visible">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a45"/><stop offset=".5" stop-color="#ff2d7a"/><stop offset="1" stop-color="#8b5cff"/></linearGradient>
      <radialGradient id="${id}b" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#2a2333"/><stop offset="1" stop-color="#07060a"/></radialGradient>
      <filter id="${id}g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect width="100" height="100" rx="23" fill="url(#${id}b)"/><rect x=".5" y=".5" width="99" height="99" rx="22.5" fill="none" stroke="#fff" stroke-opacity=".12"/>
    <g fill="url(#${id})" filter="url(#${id}g)">${bars.join('')}</g></svg>`;
}
// bars bounce on every kick after the drop
function pulseBars(svgRoot, t, amp = .22) {
  const lb = lastBeat(t);
  svgRoot.querySelectorAll('.bar').forEach((g, i) => {
    const dt = lb < 0 ? 9 : t - lb - i * .028; const k = dt < 0 ? 0 : Math.exp(-dt * 7.5) * Math.sin(Math.min(1, dt / .07) * Math.PI / 2);
    g.style.transform = `scaleY(${1 + amp * k})`;
  });
}
// a finger tap on the phone (screen-recording style), in phone CSS px
function tapRing(parent) {
  const w = FILM.el('div', 'position:absolute;left:0;top:0;width:0;height:0;display:none', parent);
  const dot = FILM.el('div', 'position:absolute;left:-21px;top:-21px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.42);box-shadow:0 0 0 2px rgba(255,255,255,.85),0 4px 14px rgba(0,0,0,.35)', w);
  const ring = FILM.el('div', 'position:absolute;left:-21px;top:-21px;width:42px;height:42px;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,.9)', w);
  return (t, t0, x, y) => {
    const a = t - t0;
    if (a < -.14 || a > .36) { w.style.display = 'none'; return; }
    w.style.display = 'block'; w.style.transform = `translate(${x}px,${y}px)`;
    const press = a < 0 ? FILM.lerp(1.25, .9, FILM.E.smooth(FILM.p(a, -.14, 0))) : FILM.lerp(.9, 1, FILM.E.soft(FILM.p(a, 0, .2)));
    dot.style.transform = `scale(${press})`;
    dot.style.opacity = (a < 0 ? FILM.p(a, -.14, -.07) : 1 - FILM.p(a, .14, .3)).toFixed(3);
    const r = FILM.E.soft(FILM.p(a, 0, .36));
    ring.style.transform = `scale(${1 + 1.3 * r})`; ring.style.opacity = (a < 0 ? 0 : (1 - r) * .9).toFixed(3);
  };
}
