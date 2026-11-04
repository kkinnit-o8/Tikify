/* UI helpers for the Tikify film: phone mockups showing REAL app captures, sequence frames, kinetic type, logo cards. */
window.UI = (() => {
  const SP = '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad';
  const CAPS = 'file://' + SP + '/caps/';
  const ASSETS = 'file://' + SP + '/assets/';
  const APP = 'file:///home/user/Tikify/';
  const E = FILM.E, el = FILM.el, clamp = FILM.clamp, p = FILM.p;
  const SCREEN_AR = 2532 / 1170;
  const pending = [];
  const decoded = new Set();
  const flush = async () => { const ps = pending.splice(0); await Promise.all(ps); };

  // ---------- phone mockup ----------
  function phone(parent, w, left, top) {
    const bz = Math.round(w * 0.025), sw = w - 2 * bz, sh = Math.round(sw * SCREEN_AR), h = sh + 2 * bz, r = Math.round(w * 0.12);
    const wrap = el('div', `position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;transform-style:preserve-3d;will-change:transform`, parent);
    el('div', `position:absolute;inset:0;border-radius:${r}px;background:#050507;box-shadow:0 80px 150px rgba(0,0,0,.72),0 0 0 1.5px rgba(255,255,255,.13) inset`, wrap);
    const screen = el('div', `position:absolute;left:${bz}px;top:${bz}px;width:${sw}px;height:${sh}px;border-radius:${r - bz}px;overflow:hidden;background:#08070b;transform:translateZ(0)`, wrap);
    const img = el('img', `position:absolute;left:0;top:0;width:${sw}px;height:auto;display:block;will-change:transform`, screen);
    img.decoding = 'sync';
    const img2 = el('img', `position:absolute;left:0;top:0;width:${sw}px;height:auto;display:none;will-change:transform`, screen);   // second layer for whips
    img2.decoding = 'sync';
    const fx = el('div', `position:absolute;inset:0;pointer-events:none`, screen);                       // tap ripples etc. inside the screen
    el('div', `position:absolute;inset:0;border-radius:${r}px;background:linear-gradient(112deg,rgba(255,255,255,.075),rgba(255,255,255,0) 38%);pointer-events:none`, wrap);
    const ph = { wrap, screen, img, img2, fx, w, h, sw, sh, bz, left, top, cx: left + w / 2, cy: top + h / 2 };
    ph.sx = (x1170) => x1170 / 1170 * sw;            // capture px (1170 wide) → screen px
    ph.sy = (y2532) => y2532 / 2532 * sh;
    return ph;
  }
  function setSrc(img, url) {
    if (img.dataset.src === url) return;
    img.dataset.src = url; img.src = url;
    if (!decoded.has(url)) { decoded.add(url); }
    pending.push(img.decode().catch(() => {}));
  }
  const still = (ph, name, layer) => setSrc(layer || ph.img, CAPS + name + '.png');
  const seqFile = (name, i) => CAPS + name + '/' + SEQ[name].files[clamp(Math.round(i), 0, SEQ[name].files.length - 1)];
  // frame of a sequence at local time lt (seconds) using its anim or wall clock, optional speed factor and start time inside the clock
  function seqAt(name, lt, clock = 'anim', from = 0, speed = 1) {
    const T = SEQ[name][clock], want = from + lt * speed; let i = 0;
    while (i + 1 < T.length && T[i + 1] <= want + 1e-6) i++;
    return i;
  }
  const seq = (ph, name, lt, clock, from, speed, layer) => setSrc(layer || ph.img, seqFile(name, seqAt(name, lt, clock, from, speed)));

  // tap ripple inside a phone screen (screen px); returns a function (t) that draws it
  function tap(ph, x, y, t0, d = .34) {
    const dot = el('div', `position:absolute;left:${x - 46}px;top:${y - 46}px;width:92px;height:92px;border-radius:50%;background:rgba(255,255,255,.55);display:none;pointer-events:none`, ph.fx);
    const ring = el('div', `position:absolute;left:${x - 46}px;top:${y - 46}px;width:92px;height:92px;border-radius:50%;border:3px solid rgba(255,255,255,.8);display:none;pointer-events:none`, ph.fx);
    return (t) => {
      const q = p(t, t0, t0 + d);
      const on = t >= t0 - 1e-6 && q < 1;
      dot.style.display = ring.style.display = on ? 'block' : 'none';
      if (!on) return;
      dot.style.transform = `scale(${.35 + .35 * E.out(2)(q)})`; dot.style.opacity = (1 - q) * .7;
      ring.style.transform = `scale(${.5 + 1.3 * E.out(3)(q)})`; ring.style.opacity = 1 - E.in(1)(q);
    };
  }

  // ---------- kinetic type ----------
  function kine(parent, text, o = {}) {
    const { x = 540, y = 300, size = 96, weight = 900, color = '#fff', align = 'center', font = 'Inter', italic = false, ls = -0.035, width = 1040, grad = false, lh = 1.0 } = o;
    const box = el('div', `position:absolute;left:${x - width / 2}px;top:${y}px;width:${width}px;text-align:${align};font:${italic ? 'italic ' : ''}${weight} ${size}px/${lh} "${font}";letter-spacing:${ls}em;color:${color};white-space:nowrap;will-change:transform;transform-origin:50% 50%`, parent);
    const inner = el('span', 'display:inline-block;will-change:transform' + (grad ? '' : ''), box);
    if (grad) inner.className = 'grad';
    const glyphs = grad ? null : FILM.glyphs(inner, text);
    if (grad) inner.textContent = text;
    const blur = FILM.dirBlur();
    const obj = { box, inner, glyphs, blur, w: 0 };
    obj.w = box.offsetWidth;
    return obj;
  }
  // glyph rise entrance (mask) — for non-gradient words
  const rise = (k, t, t0, st = .03, d = .5) => { if (k.glyphs) FILM.riseGlyphs(k.glyphs, t, t0, st, d, 120); };
  // smear: fly in from dx with E.out(3) (speed max at t0) — blur from velocity
  function smearIn(k, t, t0, dur = .42, dx = -900, k3 = 3) {
    const q = E.out(k3)(p(t, t0, t0 + dur)), x = dx * (1 - q);
    const q2 = E.out(k3)(p(t - 1 / FILM.fps, t0, t0 + dur)), v = Math.abs(dx * (1 - q2) - x) * FILM.fps;   // px/s
    k.box.style.transform = `translate(${x}px,0)`; k.box.style.opacity = t < t0 ? 0 : 1;
    k.blur(k.box, Math.min(42, v / 900 * 14), 0);
    return q;
  }
  function smearOut(k, t, t0, dur = .3, dx = 900) {
    const q = E.in(2)(p(t, t0, t0 + dur)), x = dx * q;
    const q2 = E.in(2)(p(t - 1 / FILM.fps, t0, t0 + dur)), v = Math.abs(x - dx * q2) * FILM.fps;
    k.box.style.transform = `translate(${x}px,0)`; k.box.style.opacity = q >= 1 ? 0 : 1;
    k.blur(k.box, Math.min(42, v / 900 * 14), 0);
  }
  // scale punch on a beat (settle from s0 → 1)
  const punch = (t, t0, s0 = 1.08, d = .32) => 1 + (s0 - 1) * (1 - E.settle(p(t, t0, t0 + d))) * (t >= t0 ? 1 : 0);
  // sum of exponentially decaying pulses (kicks)
  const pulse = (t, times, tau = .16, amp = 1) => { let s = 0; for (const k of times) if (t >= k) s += amp * Math.exp(-(t - k) / tau); return Math.min(1, s); };

  // ---------- glass logo card ----------
  function card(parent, { x, y, size = 240, logo, logoW, label }) {
    const wrap = el('div', `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;transform-style:preserve-3d;will-change:transform`, parent);
    const tile = el('div', `position:absolute;inset:0;border-radius:${size * .19}px`, wrap); tile.className = 'glass';
    const im = el('img', `position:absolute;left:50%;top:50%;width:${logoW}px;height:auto;transform:translate(-50%,-50%);filter:drop-shadow(0 10px 24px rgba(0,0,0,.5))`, tile); im.src = logo; im.decoding = 'sync';
    pending.push(im.decode().catch(() => {}));
    const chip = el('div', `position:absolute;left:50%;top:${size + 18}px;transform:translate(-50%,0);padding:14px 26px;border-radius:999px;background:rgba(32,16,22,.92);border:1.5px solid rgba(255,107,122,.5);color:#ff6b7a;font:700 30px/1 Inter;white-space:nowrap;box-shadow:0 14px 30px rgba(0,0,0,.5);will-change:transform;opacity:0`, wrap);
    chip.innerHTML = `<span style="display:inline-block;width:22px;margin-right:12px;font-weight:900">✕</span>${label}`;
    const blur = FILM.dirBlur();
    return { wrap, tile, chip, blur, size };
  }

  const blurWindows = [];
  const blurWin = (t0, t1, n) => blurWindows.push([+t0.toFixed(3), +t1.toFixed(3), n]);
  const ready = async () => { await flush(); };

  return { SP, CAPS, ASSETS, APP, phone, still, seq, seqAt, seqFile, setSrc, tap, kine, rise, smearIn, smearOut, punch, pulse, card, blurWindows, blurWin, ready, flush, pending };
})();
