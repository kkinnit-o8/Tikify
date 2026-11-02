/* Tikify TikTok ad v2 (dark, smooth) — shared look + components. 1080×1920, 30 fps, timed to the supplied track
   (beat 0.3595 s ≈ 167 BPM, first beat 0.23 s, a bar = 4 beats = 1.438 s; breakdown 3.11–4.54, drop 4.54).
   Look: near-black world lit by brand-coloured glows; dark glass surfaces with glowing gradient rims (after the reference ad).
   Motion: soft eases only, scenes overlap with zoom-blur hand-offs, nothing slams or bounces. */
(function () {
  const { el, E, p, clamp, lerp, about } = FILM;
  const T = window.T = {};
  T.W = 1080; T.H = 1920; T.BT = 0.3595;
  T.B = (n) => 0.23 + n * T.BT;                               // beat n (bars at n = 0, 4, 8, …)
  T.C = { pink: '#FE2C55', purp: '#7B2CBF', cyan: '#25F4EE', green: '#1ED760', ink: '#15101E', text: '#F5F1FB', muted: '#A39AB6', bg: '#08060D' };
  T.GRAD = 'linear-gradient(135deg,#FE2C55 0%,#7B2CBF 55%,#25F4EE 100%)';
  T.GRADW = 'linear-gradient(100deg,#FF5A7A 0%,#C77DFF 50%,#5CF7F2 100%)';     // lighter, for gradient text on black
  const hexA = T.hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  T.mix = (a, b, q) => { const A = rgb(a), B2 = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B2[i] - v) * q).toString(16).padStart(2, '0')).join(''); };

  // a smooth beat envelope (soft attack, long decay) — drives bars and breathing, never a hard pulse
  T.env = (t, k = .24) => { const x = (t - .23) / T.BT; if (x < 0) return 0; const s = (x - Math.floor(x)) * T.BT; return s < .05 ? E.sine(s / .05) : Math.exp(-(s - .05) / k); };
  T.breath = (t) => .5 - .5 * Math.cos(2 * Math.PI * (t - .23) / (2 * T.BT));       // half-time sway (0.72 s), 0..1

  T.ICO = {
    play: 'M8 5v14l11-7z', pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
    next: 'M6 6v12l8.5-6zM16 6h2v12h-2z', prev: 'M18 6v12l-8.5-6zM6 6h2v12H6z',
    shuffle: 'M17 3l4 4-4 4V8h-2.2l-3.1 4 3.1 4H17v-3l4 4-4 4v-3h-3.2l-3.4-4.4L7 18H3v-2h3l3.1-4L6 8H3V6h4l3.4 4.4L13.8 6H17z',
    repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z',
    note: 'M12 3v10.6A4 4 0 1 0 14 17V7h4V3z',
    heart: 'M12 21 10.6 19.7C5.4 15 2 11.9 2 8.1 2 5 4.4 2.6 7.5 2.6c1.7 0 3.4.8 4.5 2.1a6 6 0 0 1 4.5-2.1C19.6 2.6 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6z',
    paste: 'M16 3h-2.2a2 2 0 0 0-3.6 0H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 17H8V5h1v2h6V5h1z',
    plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
    down: 'M4.6 8.6 12 16l7.4-7.4 1.4 1.4-8.8 8.8L3.2 10z',
    download: 'M11 4h2v8.2l3.6-3.6L18 10l-6 6-6-6 1.4-1.4 3.6 3.6zM5 18h14v2H5z',
    playlist: 'M3 6h12v2H3zm0 4h12v2H3zm0 4h8v2H3zm14-8h4v2h-2v8a3 3 0 1 1-2-2.8z',
    share: 'M14 4.5V9C7.5 9.8 4.2 14 3 19.5c2.6-3.4 6-4.9 11-4.9v4.4l7.5-7.25z',
    comment: 'M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.5 21l4.4-2.3c1 .2 2 .3 3.1.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z',
    link: 'M9.9 14.1a1 1 0 0 1 0-1.4l2.8-2.8a1 1 0 1 1 1.4 1.4l-2.8 2.8a1 1 0 0 1-1.4 0zM7.8 19.8a4 4 0 0 1-2.8-6.8l2.1-2.1 1.4 1.4-2.1 2.1a2 2 0 1 0 2.8 2.8l2.1-2.1 1.4 1.4-2.1 2.1a4 4 0 0 1-2.8 1.2zm9.1-6.7-1.4-1.4 2.1-2.1a2 2 0 1 0-2.8-2.8l-2.1 2.1-1.4-1.4 2.1-2.1a4 4 0 1 1 5.7 5.7z',
    plane: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',
    wifi: 'M12 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0-4.6c1.9 0 3.6.8 4.9 2l-1.6 1.6A4.7 4.7 0 0 0 12 15.6c-1.3 0-2.4.5-3.3 1.4l-1.6-1.6a6.9 6.9 0 0 1 4.9-2zm0-4.6c3.1 0 5.9 1.3 8 3.3l-1.6 1.6A9 9 0 0 0 12 11a9 9 0 0 0-6.4 2.7L4 12.1a11.2 11.2 0 0 1 8-3.3zM12 4c4.4 0 8.3 1.7 11.2 4.5l-1.6 1.6A13.5 13.5 0 0 0 12 6.2a13.5 13.5 0 0 0-9.6 3.9L.8 8.5A15.7 15.7 0 0 1 12 4z',
    replay: 'M12 5V1.5L7 6l5 4.5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z',
    lock: 'M17 9V7A5 5 0 0 0 7 7v2H5v13h14V9zm-8-2a3 3 0 0 1 6 0v2H9z',
    search: 'M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    library: 'M4 3h2v18H4zm5 0h2v18H9zm5.5.6 1.9-.6 5.6 17.4-1.9.6z',
  };
  T.svg = (d, fill = 'currentColor') => `<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;overflow:visible"><path fill="${fill}" d="${T.ICO[d] || d}"/></svg>`;
  T.dots = (fill = 'currentColor') => `<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block"><g fill="${fill}"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></g></svg>`;
  T.ico = (parent, name, x, y, s, color, extra = '') => el('div', `position:absolute;left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;color:${color};${extra}`, parent, name === 'dots' ? T.dots() : T.svg(name));

  // cover art like the app's (warm gradients + soft bokeh circles), seeded
  const PAL = { gym: ['#ff2f55', '#ff8a3d'], chill: ['#3d6bff', '#a23dff'], road: ['#ffb02e', '#ff4f3d'], dance: ['#a43dff', '#ff3d9b'], vibe: ['#ff3d6e', '#ffc53d'], wave: ['#2ec5ff', '#6b3dff'], night: ['#6b3dff', '#ff3d8a'] };
  let gid = 0;
  const coverG = (key, seed, x = 0, y = 0, s = 100) => {
    const [a, b] = PAL[key], r = FILM.rand(seed * 7 + 3), id = 'cg' + (gid++);
    let c = '';
    ['#ffd6a8', '#ffffff', '#ffe27a'].forEach((f) => { c += `<circle cx="${x + (.15 + r() * .7) * s}" cy="${y + (.15 + r() * .7) * s}" r="${(.2 + r() * .22) * s}" fill="${f}" opacity="${(.3 + r() * .22).toFixed(2)}"/>`; });
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="url(#${id})"/>${c}`;
  };
  T.cover = (key, seed) => `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style="display:block">${coverG(key, seed)}</svg>`;
  T.mosaic = (keys, seed) => `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style="display:block">${keys.map((k, i) => coverG(k, seed + i, (i % 2) * 50, Math.floor(i / 2) * 50, 50)).join('')}</svg>`;

  // the app icon: brand gradient squircle + beamed eighth notes, lit
  T.NOTES = '<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block"><g fill="#fff"><path d="M36 25 L84 13 L84 27 L36 39 Z"/><rect x="36" y="27" width="8.5" height="47"/><rect x="75.5" y="15" width="8.5" height="48"/><ellipse cx="29" cy="74" rx="15.5" ry="12.5" transform="rotate(-20 29 74)"/><ellipse cx="68" cy="63" rx="15.5" ry="12.5" transform="rotate(-20 68 63)"/></g></svg>';
  T.appIcon = (parent, size, glow = 1) => {
    const d = el('div', `position:absolute;left:${-size / 2}px;top:${-size / 2}px;width:${size}px;height:${size}px;border-radius:${size * .225}px;background:${T.GRAD};box-shadow:0 0 ${size * .25 * glow}px rgba(254,44,85,${.45 * glow}),0 0 ${size * .6 * glow}px rgba(123,44,191,${.5 * glow}),inset 0 0 0 ${Math.max(2, size * .01)}px rgba(255,255,255,.22)`, parent);
    el('div', `position:absolute;left:19%;top:21%;width:60%;height:60%;filter:drop-shadow(0 ${size * .02}px ${size * .04}px rgba(60,0,60,.35))`, d, T.NOTES);
    return d;
  };

  T.at = (parent, x, y, css = '') => el('div', `position:absolute;left:${x}px;top:${y}px;width:0;height:0;${css}`, parent);

  // dark glass with a glowing brand rim (the reference ad's pills, in Tikify's colours)
  T.GLASS = (r, glow = 1) => `box-sizing:border-box;border-radius:${r}px;border:3px solid transparent;background:linear-gradient(180deg,rgba(38,30,52,.96),rgba(17,13,25,.96)) padding-box, ${T.GRAD} border-box;box-shadow:0 0 ${28 * glow}px rgba(254,44,85,${.30 * glow}),0 0 ${70 * glow}px rgba(123,44,191,${.32 * glow}),0 30px 60px rgba(0,0,0,.55)`;
  T.GLASS2 = (r) => `box-sizing:border-box;border-radius:${r}px;background:linear-gradient(180deg,rgba(40,33,54,.92),rgba(20,16,28,.92));box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.09),0 24px 50px rgba(0,0,0,.5)`;

  // the dark world: near-black with a soft top light and drifting brand-coloured glows (overscanned for zoom hand-offs)
  T.bg = (parent, cols, top = '#2A1E3D') => {
    const L = el('div', `position:absolute;left:-30%;top:-30%;width:160%;height:160%;overflow:hidden;background:radial-gradient(60% 34% at 50% 20%, ${top} 0%, #0E0A16 60%, ${T.C.bg} 100%)`, parent);
    const bs = cols.map(([c, a, r]) => el('div', `position:absolute;left:0;top:0;width:${2 * r}px;height:${2 * r}px;border-radius:50%;background:radial-gradient(closest-side, ${hexA(c, a)} 0%, ${hexA(c, a * .45)} 45%, ${hexA(c, 0)} 100%)`, L));
    el('div', 'position:absolute;inset:0;background:radial-gradient(75% 55% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)', L);
    const FX = [.2, .82, .28, .76, .5], FY = [.26, .4, .74, .66, .52], OX = 324, OY = 576;
    const f = (t) => bs.forEach((b, i) => {
      const r = cols[i][2], x = OX + T.W * FX[i % 5] + 110 * Math.sin(t * (.32 + i * .07) + i * 1.7) - r, y = OY + T.H * FY[i % 5] + 150 * Math.cos(t * (.27 + i * .06) + i * 2.3) - r;
      b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    });
    f.layer = L; return f;
  };

  // centred text block, auto-fitted to maxW, vertically centred on y. Returns {wrap, span, h}
  T.text = (parent, html, { y, size, maxW = 920, color, cls = 'U', lh = .92, x = 540, align = 'center', css = '' }) => {
    const wrap = el('div', `position:absolute;left:${x - 540}px;top:0;width:1080px;text-align:${align};transform-origin:${540}px 0`, parent);
    const s = el('span', `display:inline-block;font-size:${size}px;line-height:${lh};color:${color};white-space:nowrap;${css}`, wrap, html);
    s.className = cls;
    const w = s.offsetWidth; if (w > maxW) s.style.fontSize = (size * maxW / w).toFixed(1) + 'px';
    const h = s.offsetHeight; wrap.style.top = (y - h / 2) + 'px'; wrap.style.transformOrigin = `540px ${h / 2}px`;
    return { wrap, span: s, h };
  };
  // headline whose glyphs rise from their own baseline mask (soft, no overshoot)
  T.rise = (parent, str, { y, size, color = T.C.text, cls = 'Bh', maxW = 920, glow = 'rgba(190,120,255,.35)' }) => {
    const wrap = el('div', `position:absolute;left:0;top:0;width:1080px;text-align:center;filter:drop-shadow(0 0 22px ${glow})`, parent);
    const line = el('div', `display:inline-block;font-size:${size}px;line-height:1.02;color:${color};white-space:nowrap`, wrap);
    line.className = cls;
    const g = FILM.glyphs(line, str);
    const w = line.offsetWidth; if (w > maxW) line.style.fontSize = (size * maxW / w).toFixed(1) + 'px';
    wrap.style.top = (y - line.offsetHeight / 2) + 'px';
    return { wrap, g, update: (lt, t0, st = .03, d = .62) => FILM.riseGlyphs(g, lt, t0, st, d, 115) };
  };
  // soft entrance of any element: rise + scale 1.05→1 + blur 14→0 + opacity, expo-out
  T.blurIn = (e, lt, t0, d = .6, dist = 46, from = 1.05, blur = 14) => {
    const q = E.soft(p(lt, t0, t0 + d));
    e.style.opacity = Math.min(1, q * 1.7).toFixed(3);
    e.style.transform = `translateY(${((1 - q) * dist).toFixed(1)}px) scale(${(from + (1 - from) * q).toFixed(4)})`;
    e.style.filter = q < .98 ? `blur(${((1 - q) * blur).toFixed(2)}px)` : 'none';
    return q;
  };

  // a finger tap: a soft glowing dot settles, a light ring ripples out — no squash
  T.tap = (parent) => {
    const a = T.at(parent, 0, 0, 'z-index:30');
    const disc = el('div', 'position:absolute;left:-36px;top:-36px;width:72px;height:72px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.55),rgba(255,255,255,.18) 70%);box-shadow:0 0 26px rgba(255,255,255,.45),inset 0 0 0 2px rgba(255,255,255,.75)', a);
    const ring = el('div', 'position:absolute;left:-36px;top:-36px;width:72px;height:72px;border-radius:50%;border:3px solid rgba(255,255,255,.9);box-sizing:border-box;box-shadow:0 0 18px rgba(255,255,255,.5)', a);
    return (lt, t0, x, y) => {
      const on = lt > t0 - .26 && lt < t0 + .62; a.style.display = on ? 'block' : 'none'; if (!on) return;
      a.style.left = x + 'px'; a.style.top = y + 'px';
      const arr = E.soft(p(lt, t0 - .26, t0)), out = E.sine(p(lt, t0 + .08, t0 + .45));
      disc.style.transform = `scale(${(1.2 - .2 * arr - .08 * Math.sin(Math.PI * p(lt, t0, t0 + .3))).toFixed(4)})`; disc.style.opacity = (arr * (1 - out)).toFixed(3);
      const rq = E.out(2)(p(lt, t0, t0 + .6)); ring.style.transform = `scale(${(.7 + 1.9 * rq).toFixed(3)})`; ring.style.opacity = lt < t0 ? 0 : (.9 * (1 - E.sine(rq))).toFixed(3);
    };
  };
  T.press = (lt, t0, k = .035) => 1 - k * Math.sin(Math.PI * p(lt, t0, t0 + .3));

  // 7-bar wave in brand colours, smooth (soft attack, long release, slow per-bar sway)
  T.wave = (parent, x, y, { n = 7, bw = 9, gap = 7, hmax = 54, hmin = 12, color = T.GRAD } = {}) => {
    const a = T.at(parent, x, y);
    const bars = [...Array(n)].map((_, i) => el('div', `position:absolute;left:${i * (bw + gap) - (n * (bw + gap) - gap) / 2}px;top:0;width:${bw}px;height:${hmax}px;margin-top:${-hmax / 2}px;border-radius:${bw / 2}px;background:${color};background-size:${n * (bw + gap)}px ${hmax}px;background-position:${-i * (bw + gap)}px 0;transform-origin:50% 50%;box-shadow:0 0 10px rgba(254,44,85,.35)`, a));
    return (t, on = 1) => bars.forEach((b, i) => {
      const e = T.env(t - i * .03), sway = .5 + .5 * Math.sin(t * 2.6 + i * 1.15);
      const h = hmin + (hmax - hmin) * on * clamp(.2 + .35 * sway + .45 * e * (.6 + .4 * Math.sin(i * 2.4 + 1)));
      b.style.transform = `scaleY(${(h / hmax).toFixed(3)})`;
    });
  };

  // the hero "sound pill": spinning cover disc + title + wave, dark glass with a glowing rim
  T.soundPill = (parent, { title, sub, w = 700, h = 128, key = 'gym', seed = 3 }) => {
    const pll = el('div', `position:absolute;left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;${T.GLASS(h / 2)}`, parent);
    const ds = h - 30;
    const disc = el('div', `position:absolute;left:12px;top:12px;width:${ds}px;height:${ds}px;border-radius:50%;overflow:hidden;box-shadow:0 0 20px rgba(254,44,85,.4)`, pll, T.cover(key, seed));
    el('div', `position:absolute;left:${12 + ds / 2 - 9}px;top:${12 + ds / 2 - 9}px;width:18px;height:18px;border-radius:50%;background:#15101E;box-shadow:0 0 0 4px rgba(255,255,255,.18)`, pll);
    const tt = el('div', `position:absolute;left:${ds + 32}px;top:${h * .2}px;font:800 ${h * .27}px Inter;letter-spacing:-.02em;color:${T.C.text};white-space:nowrap`, pll, title);
    const st = el('div', `position:absolute;left:${ds + 32}px;top:${h * .55}px;font:600 ${h * .2}px Inter;color:${T.C.muted};white-space:nowrap`, pll, sub);
    const wv = T.wave(pll, w - 10 - 70, h / 2 - 3, { hmax: h * .42, hmin: h * .1, bw: 8, gap: 6 });
    return { el: pll, title: tt, sub: st, update: (t, on = 1) => { disc.style.transform = `rotate(${(t * 90) % 360}deg)`; wv(t, on); } };
  };

  // phone frame with a dark app screen; content is laid out in logical 390-px-wide units (like the real app) and scaled
  T.phone = (parent, w = 580) => {
    const h = w * 2.07, bz = w * .028, sw = w - 2 * bz, k = sw / 390, LH = (h - 2 * bz) / k;
    const f = el('div', `position:absolute;left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;border-radius:${w * .15}px;background:linear-gradient(145deg,#3a3446,#0b0a10 38%,#1b1824);box-shadow:0 0 0 1.5px rgba(255,255,255,.16),0 0 90px rgba(123,44,191,.45),0 0 160px rgba(254,44,85,.22),0 60px 120px rgba(0,0,0,.7),inset 0 0 0 2px rgba(255,255,255,.14)`, parent);
    const scr = el('div', `position:absolute;left:${bz}px;top:${bz}px;width:${sw}px;height:${h - 2 * bz}px;border-radius:${w * .15 - bz}px;background:#121212;overflow:hidden`, f);
    const ui = el('div', `position:absolute;left:0;top:0;width:390px;height:${LH}px;transform:scale(${k});transform-origin:0 0;font-family:Inter;color:#fff`, scr);
    const isl = el('div', 'position:absolute;left:50%;top:10px;width:104px;height:30px;margin-left:-52px;border-radius:15px;background:#000;z-index:20', ui);
    return { f, scr, ui, k, w, h, bz, LH, isl, X: (x) => -w / 2 + bz + x * k, Y: (y) => -h / 2 + bz + y * k };
  };
  T.status = (ui, color = '#fff') => {
    const s = el('div', `position:absolute;left:0;top:0;width:390px;height:44px;color:${color};z-index:15`, ui);
    el('div', 'position:absolute;left:34px;top:14px;font:600 15px Inter', s, '9:41');
    const r = el('div', 'position:absolute;right:28px;top:17px;height:12px;display:flex;gap:5px;align-items:flex-end', s);
    [4, 6, 8, 11].forEach((hh) => el('div', `width:3px;height:${hh}px;border-radius:1px;background:${color}`, r));
    el('div', `width:22px;height:11px;border-radius:3px;border:1.5px solid ${color};box-sizing:border-box;margin-left:6px;padding:1.5px`, r, `<div style="width:80%;height:100%;background:${color};border-radius:1px"></div>`);
    return s;
  };

  /* zoom-blur hand-off between overlapping scenes (both sides keep zooming forward, so the direction never flips):
     incoming: scale inS→1 (expo-out), blur→0, opacity in over the first half; outgoing: scale 1→outS (ease-in), blur up. */
  T.H2 = .2;    // half-width of every hand-off (scenes declare pre/post = T.H2)
  T.transVals = (lt, dur, o = {}) => {
    const h = o.h == null ? T.H2 : o.h; let s = 1, b = 0, op = 1;
    if (!o.noIn) {
      s *= lerp(o.inS == null ? .86 : o.inS, 1, E.out(3)(p(lt, -h, h + .25)));
      b += (o.inBlur == null ? 16 : o.inBlur) * (1 - E.out(2)(p(lt, -h, h)));
      op *= E.sine(p(lt, -h, h * .6));
    }
    if (!o.noOut) {
      s *= lerp(1, o.outS == null ? 1.14 : o.outS, E.in(2)(p(lt, dur - h - .2, dur + h)));
      b += (o.outBlur == null ? 16 : o.outBlur) * E.in(2)(p(lt, dur - h, dur + h));
    }
    return { s, b, op };
  };
  T.trans = (root, lt, dur, o = {}) => {
    const v = T.transVals(lt, dur, o);
    root.style.transformOrigin = '0 0';
    root.style.transform = about(o.px == null ? 540 : o.px, o.py == null ? 960 : o.py, v.s);
    root.style.filter = v.b > .4 ? `blur(${v.b.toFixed(2)}px)` : 'none';
    root.style.opacity = v.op.toFixed(3);
    return v;
  };
})();
