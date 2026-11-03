/* Tikify ad — shared pieces: glow background, captions, touch taps, and phone screens that run Tikify's REAL
   styles.css + DOM snapshots inside Shadow DOM (window.APP_CSS / APP_STATES from app_states.js). Pure functions of t. */
(function () {
  const { p, tw, kf, E, el, clamp, lerp, hash } = FILM;
  const L = window.L = {};

  /* ---------- colour ---------- */
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  L.mix = (a, b, q) => { const A = hex(a), B = hex(b); return A.map((v, i) => Math.round(v + (B[i] - v) * q)); };
  L.rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* ---------- glow background (one canvas under everything) ----------
     GLOW: keyframes [t, '#hex', alpha, cx, cy, rx, ry]; colour and shape ease between neighbours over the gap. */
  L.GLOW = [];
  L.STREAK = null;   // {t0} — the end card's light streak
  L.bgScene = () => FILM.scene({ id: 'bg', t0: 0, t1: 1e4,          // FILM.dur is not set yet when this registers
    build(root) {
      this.c = el('canvas', 'position:absolute;left:0;top:0', root); this.c.width = FILM.W; this.c.height = FILM.H; this.x = this.c.getContext('2d');
      this.s = document.createElement('canvas'); this.s.width = FILM.W / 4; this.s.height = FILM.H / 4; this.sx = this.s.getContext('2d');
    },
    update(lt, t) {
      const x = this.x, G = L.GLOW; x.globalCompositeOperation = 'source-over'; x.fillStyle = '#050507'; x.fillRect(0, 0, FILM.W, FILM.H);
      let i = 0; while (i < G.length - 1 && G[i + 1][0] <= t) i++;
      const a = G[i], b = G[Math.min(i + 1, G.length - 1)];
      const q = b === a ? 0 : E.smooth(p(t, a[0], b[0]));
      const col = L.mix(a[1], b[1], q), al = lerp(a[2], b[2], q), cx = lerp(a[3], b[3], q), cy = lerp(a[4], b[4], q), rx = lerp(a[5], b[5], q), ry = lerp(a[6], b[6], q);
      const breath = 1 + .025 * Math.sin(t * 1.9);
      x.save(); x.translate(cx, cy); x.scale(rx * breath, ry * breath);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, L.rgba(col, al)); g.addColorStop(.38, L.rgba(col, al * .62)); g.addColorStop(.7, L.rgba(col, al * .2)); g.addColorStop(1, L.rgba(col, 0));
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 6.2832); x.fill(); x.restore();
      if (L.STREAK && t > L.STREAK.t0 - .05) this.streak(t - L.STREAK.t0);
    },
    // end-card light streak: a long band (pink → violet → cyan, Tikify's brand gradient) drawn small, blurred, upscaled
    streak(lt) {
      const s = this.sx, W = this.s.width, H = this.s.height, k = E.soft(p(lt, 0, 1.1));
      s.clearRect(0, 0, W, H); s.save();
      s.translate(W / 2 + lerp(-W * 1.1, 0, k) + 6 * Math.sin(lt * 1.3), H * .515); s.rotate(-.2 + .015 * Math.sin(lt * .9));
      const len = W * 1.9, th = H * .085 * (.55 + .45 * k);
      const g = s.createLinearGradient(-len / 2, 0, len / 2, 0);
      g.addColorStop(0, 'rgba(254,44,85,0)'); g.addColorStop(.18, 'rgba(254,44,85,.95)'); g.addColorStop(.5, 'rgba(123,44,191,.95)');
      g.addColorStop(.8, 'rgba(37,244,238,.55)'); g.addColorStop(1, 'rgba(37,244,238,0)');
      s.filter = 'blur(9px)'; s.fillStyle = g; s.beginPath(); s.ellipse(0, 0, len / 2, th, 0, 0, 6.2832); s.fill();
      s.filter = 'blur(3px)'; s.globalAlpha = .55; s.fillStyle = 'rgba(255,220,240,.55)'; s.beginPath(); s.ellipse(-len * .08, 0, len * .3, th * .16, 0, 0, 6.2832); s.fill();
      s.restore(); s.filter = 'none'; s.globalAlpha = 1;
      this.x.globalCompositeOperation = 'screen'; this.x.globalAlpha = .9 * clamp(lt / .25); this.x.drawImage(this.s, 0, 0, FILM.W, FILM.H); this.x.globalAlpha = 1; this.x.globalCompositeOperation = 'source-over';
    } });

  /* ---------- entrance / exit of any element: rise + scale + blur (never opacity alone) ---------- */
  L.enter = (e, t, t0, d = .55, o = {}) => {
    const q = E.soft(p(t, t0, t0 + d)), qa = clamp((t - t0) / (d * .45));
    const dy = (o.dy == null ? 28 : o.dy) * (1 - q), s = lerp(o.s0 == null ? .96 : o.s0, 1, q), b = (o.blur == null ? 12 : o.blur) * (1 - q);
    return { q, op: qa, tf: `translateY(${dy}px) scale(${s})`, filter: b > .3 ? `blur(${b}px)` : 'none' };
  };
  L.apply = (e, st, extra = '') => { e.style.opacity = st.op; e.style.transform = st.tf + extra; e.style.filter = st.filter; };
  L.exit = (t, t0, d = .3) => { const q = E.in(2)(p(t, t0, t0 + d)); return { q, op: 1 - q, blur: 12 * q }; };

  /* ---------- captions: words rise one by one, grey → white like the reference; exit = blur up ---------- */
  L.caption = (parent, text, { y = 300, size = 56, weight = 600, width = 920 } = {}) => {
    const box = el('div', `position:absolute;left:${(FILM.W - width) / 2}px;width:${width}px;top:${y}px;transform:translateY(-50%);text-align:center;
      font:${weight} ${size}px/1.16 Inter;letter-spacing:-.018em;color:#fff;text-shadow:0 8px 40px rgba(0,0,0,.5)`, parent);
    const words = text.split(' ').map((w, i) => { const s = el('span', 'display:inline-block;white-space:pre', box, w + (i < text.split(' ').length - 1 ? ' ' : '')); return s; });
    return { box, words };
  };
  L.capUpdate = (c, t, t0, t1, st = .085, end = '#ffffff') => {
    const x = L.exit(t, t1, .28);
    c.box.style.display = t < t0 - .05 || t > t1 + .3 ? 'none' : 'block';
    c.box.style.opacity = x.op; c.box.style.filter = x.blur > .3 ? `blur(${x.blur}px)` : 'none';
    c.words.forEach((w, i) => {
      const a = t0 + i * st, q = E.soft(p(t, a, a + .5)), g = clamp((t - a - .12) / .35);
      w.style.opacity = clamp((t - a) / .18); w.style.transform = `translateY(${(1 - q) * 22 - x.q * 14}px)`;
      w.style.filter = q < .97 ? `blur(${(1 - q) * 9}px)` : 'none';
      const c0 = L.mix('#8a8a94', end, g); w.style.color = L.rgba(c0, 1);
    });
  };

  /* ---------- touch tap: ring + dot, the pressed control squashes (0.94, 0.12 s in / 0.2 s out) ---------- */
  L.tapLayer = (parent) => {
    const d = el('div', 'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:50', parent);
    const ring = el('div', 'position:absolute;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:2.5px solid rgba(255,255,255,.9);box-sizing:border-box', d);
    const dot = el('div', 'position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,255,255,.34);box-shadow:0 0 18px rgba(255,255,255,.35)', d);
    return { d, ring, dot };
  };
  // taps: [[t, x, y]] in the layer's coordinates; one visible at a time
  L.tapUpdate = (T, taps, t) => {
    let cur = null; for (const k of taps) if (t >= k[0] - .16 && t < k[0] + .42) cur = k;
    if (!cur) { T.d.style.display = 'none'; return; }
    T.d.style.display = 'block'; T.d.style.transform = `translate(${cur[1]}px,${cur[2]}px)`;
    const a = t - cur[0];
    const qIn = E.soft(p(a, -.16, 0)), qOut = p(a, 0, .42);
    T.dot.style.opacity = a < 0 ? qIn : Math.max(0, 1 - qOut * 1.6); T.dot.style.transform = `scale(${a < 0 ? lerp(.6, 1, qIn) : lerp(1, .82, qOut)})`;
    T.ring.style.opacity = a < 0 ? 0 : (1 - E.out(2)(qOut)) * .9; T.ring.style.transform = `scale(${a < 0 ? .7 : lerp(.7, 1.9, E.out(3)(qOut))})`;
  };
  L.press = (t, tap, k = .06) => { const a = t - tap; if (a < -.08 || a > .32) return 1; return a < 0 ? 1 - k * E.soft(p(a, -.08, 0)) : 1 - k * (1 - E.smooth(p(a, 0, .3))); };

  /* ---------- phone screens: the real app in Shadow DOM ---------- */
  L.PHONE_H = 760;
  L.screen = (parent, html, cls = '') => {
    const h = el('div', `position:absolute;left:0;top:0;width:390px;height:${L.PHONE_H}px`, parent);
    if (cls) h.className = cls;
    const sr = h.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${window.APP_CSS}</style>${html}`;
    return { h, sr, $: (s) => sr.querySelector(s), $$: (s) => [...sr.querySelectorAll(s)] };
  };
  L.frag = (html, sel) => { const d = document.createElement('div'); d.innerHTML = html; const n = d.querySelector(sel); return n ? n.outerHTML : ''; };
  // rect of an element inside a screen, in the screen's own CSS px (measure with no transforms applied)
  L.rect = (S, sel) => { const e = typeof sel === 'string' ? S.$(sel) : sel, a = S.h.getBoundingClientRect(), b = e.getBoundingClientRect();
    return { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height, cx: b.left - a.left + b.width / 2, cy: b.top - a.top + b.height / 2 }; };
})();
