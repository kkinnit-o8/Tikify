/* Tikify TikTok ad — shared look + components. 1080×1920, 30 fps, timed to the supplied track
   (beat 0.3595 s ≈ 167 BPM, first beat 0.23 s, a bar = 4 beats = 1.438 s; breakdown 3.11–4.54, drop 4.54). */
(function () {
  const { el, E, p, clamp } = FILM;
  const T = window.T = {};
  T.W = 1080; T.H = 1920; T.BT = 0.3595;
  T.B = (n) => 0.23 + n * T.BT;                               // beat n (bars at n = 0, 4, 8, …)
  T.C = { pink: '#FE2C55', purp: '#7B2CBF', cyan: '#25F4EE', green: '#1ED760', ink: '#15101E', paper: '#FFF4F8', white: '#FFFFFF', muted: '#a7a7a7' };
  T.GRAD = 'linear-gradient(135deg,#FE2C55 0%,#7B2CBF 55%,#25F4EE 100%)';
  // backgrounds for white type: pink → magenta → purple, cyan only as a corner glow (white on cyan fails contrast)
  T.GRADV = 'radial-gradient(70% 45% at 100% 100%, rgba(37,244,238,.55) 0%, rgba(37,244,238,0) 100%), radial-gradient(60% 40% at 0% 0%, rgba(255,138,61,.45) 0%, rgba(255,138,61,0) 100%), linear-gradient(180deg,#FE2C55 0%,#C02A92 42%,#7B2CBF 78%,#6236D8 100%)';

  // beat envelope: 1 on each beat, decays in ~0.12 s (drives bars, pulses)
  T.env = (t, k = .12) => { const x = (t - .23) / T.BT; if (x < 0) return 0; return Math.exp(-((x - Math.floor(x)) * T.BT) / k); };

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
    link: 'M10.6 13.4a1 1 0 0 0 1.4 0l4-4a3 3 0 0 0-4.2-4.2l-1.5 1.5 1.4 1.4 1.5-1.5a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 0 0 1.4zm2.8-2.8a1 1 0 0 0-1.4 0l-4 4a3 3 0 0 0 4.2 4.2l1.5-1.5-1.4-1.4-1.5 1.5a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 0 0-1.4z',
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

  // the app icon: brand gradient squircle + beamed eighth notes
  T.NOTES = '<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block"><g fill="#fff"><path d="M36 25 L84 13 L84 27 L36 39 Z"/><rect x="36" y="27" width="8.5" height="47"/><rect x="75.5" y="15" width="8.5" height="48"/><ellipse cx="29" cy="74" rx="15.5" ry="12.5" transform="rotate(-20 29 74)"/><ellipse cx="68" cy="63" rx="15.5" ry="12.5" transform="rotate(-20 68 63)"/></g></svg>';
  T.appIcon = (parent, size, shadow = true) => {
    const d = el('div', `position:absolute;left:${-size / 2}px;top:${-size / 2}px;width:${size}px;height:${size}px;border-radius:${size * .225}px;background:${T.GRAD};${shadow ? `box-shadow:0 ${size * .12}px ${size * .3}px rgba(90,20,120,.35)` : ''}`, parent);
    el('div', `position:absolute;left:19%;top:21%;width:60%;height:60%`, d, T.NOTES);
    return d;
  };

  // anchor: a zero-size positioned point (children are centred on it with negative margins)
  T.at = (parent, x, y, css = '') => el('div', `position:absolute;left:${x}px;top:${y}px;width:0;height:0;${css}`, parent);

  // drifting soft colour blobs (the "world layer" of light scenes)
  const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  T.hexA = hexA;
  T.blobs = (parent, base, cols) => {
    const L = el('div', `position:absolute;inset:0;overflow:hidden;background:${base}`, parent);
    const bs = cols.map(([c, a, r]) => el('div', `position:absolute;left:0;top:0;width:${2 * r}px;height:${2 * r}px;border-radius:50%;background:radial-gradient(closest-side, ${hexA(c, a)} 0%, ${hexA(c, a * .55)} 45%, ${hexA(c, 0)} 100%)`, L));
    const FX = [.12, .9, .2, .85, .55], FY = [.12, .3, .82, .7, .5];
    return (t) => bs.forEach((b, i) => {
      const r = cols[i][2], x = T.W * FX[i % 5] + 130 * Math.sin(t * (.55 + i * .13) + i * 1.7) - r, y = T.H * FY[i % 5] + 170 * Math.cos(t * (.45 + i * .11) + i * 2.3) - r;
      b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    });
  };

  // centred text block, auto-fitted to maxW, vertically centred on y. Returns {wrap, span}
  T.text = (parent, html, { y, size, maxW = 920, color, cls = 'U', lh = .92, x = 540, align = 'center' }) => {
    const wrap = el('div', `position:absolute;left:${x - 540}px;top:0;width:1080px;text-align:${align};transform-origin:${540}px 0`, parent);
    const s = el('span', `display:inline-block;font-size:${size}px;line-height:${lh};color:${color};white-space:nowrap`, wrap, html);
    s.className = cls;
    const w = s.offsetWidth; if (w > maxW) s.style.fontSize = (size * maxW / w).toFixed(1) + 'px';
    const h = s.offsetHeight; wrap.style.top = (y - h / 2) + 'px'; wrap.style.transformOrigin = `540px ${h / 2}px`;
    return { wrap, span: s, h };
  };
  // headline whose glyphs rise from their own baseline mask (soft, no overshoot)
  T.rise = (parent, str, { y, size, color, cls = 'Bh', maxW = 920 }) => {
    const wrap = el('div', `position:absolute;left:0;top:0;width:1080px;text-align:center`, parent);
    const line = el('div', `display:inline-block;font-size:${size}px;line-height:1.02;color:${color};white-space:nowrap`, wrap);
    line.className = cls;
    const g = FILM.glyphs(line, str);
    const w = line.offsetWidth; if (w > maxW) line.style.fontSize = (size * maxW / w).toFixed(1) + 'px';
    wrap.style.top = (y - line.offsetHeight / 2) + 'px';
    return { wrap, g, update: (lt, t0, st = .025, d = .5) => FILM.riseGlyphs(g, lt, t0, st, d, 120) };
  };

  // slam: scale 1.45 → 1 decelerating from t0 (the hit), with a tiny tilt
  T.slam = (lt, t0, from = 1.45, d = .3) => FILM.zoom(lt, t0, t0 + d, from, 1, E.out(3));

  // a finger tap: soft disc arrives, squashes on contact at t0, ring expands
  T.tap = (parent) => {
    const a = T.at(parent, 0, 0, 'z-index:30');
    const disc = el('div', 'position:absolute;left:-40px;top:-40px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 6px 24px rgba(20,10,40,.35),inset 0 0 0 3px rgba(255,255,255,.9)', a);
    const ring = el('div', 'position:absolute;left:-40px;top:-40px;width:80px;height:80px;border-radius:50%;border:5px solid rgba(255,255,255,.95);box-sizing:border-box', a);
    return (lt, t0, x, y) => {
      const on = lt > t0 - .16 && lt < t0 + .42; a.style.display = on ? 'block' : 'none'; if (!on) return;
      a.style.left = x + 'px'; a.style.top = y + 'px';
      const arr = E.soft(p(lt, t0 - .16, t0)), out = p(lt, t0 + .12, t0 + .4);
      const sq = lt < t0 ? 1.25 - .25 * arr : 1 - .12 * Math.sin(Math.PI * p(lt, t0, t0 + .16));
      disc.style.transform = `scale(${sq})`; disc.style.opacity = (Math.min(1, arr * 1.4) * (1 - out)).toFixed(3);
      const rq = E.out(2)(p(lt, t0, t0 + .4)); ring.style.transform = `scale(${.8 + 1.6 * rq})`; ring.style.opacity = lt < t0 ? 0 : (1 - rq).toFixed(3);
    };
  };

  // 7-bar wave in brand colours, height driven by the beat envelope
  T.wave = (parent, x, y, { n = 7, bw = 9, gap = 7, hmax = 54, hmin = 12, color = T.GRAD } = {}) => {
    const a = T.at(parent, x, y);
    const bars = [...Array(n)].map((_, i) => el('div', `position:absolute;left:${i * (bw + gap) - (n * (bw + gap) - gap) / 2}px;top:0;width:${bw}px;height:${hmax}px;margin-top:${-hmax / 2}px;border-radius:${bw / 2}px;background:${color};background-size:${n * (bw + gap)}px ${hmax}px;background-position:${-i * (bw + gap)}px 0;transform-origin:50% 50%`, a));
    return (t, on = 1) => bars.forEach((b, i) => {
      const e = T.env(t - i * .018, .16), w = .45 + .55 * Math.abs(Math.sin(t * 7.3 + i * 1.9)) * (.6 + .4 * Math.sin(t * 3.1 + i));
      const h = hmin + (hmax - hmin) * on * clamp(.25 * w + .75 * e * (.55 + .45 * Math.sin(i * 2.4 + 1)) + .15 * w);
      b.style.transform = `scaleY(${(h / hmax).toFixed(3)})`;
    });
  };

  // the hero "sound pill": spinning cover disc + title + wave, white with a brand ring
  T.soundPill = (parent, { title, sub, w = 700, h = 128, key = 'gym', seed = 3 }) => {
    const pll = el('div', `position:absolute;left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;box-sizing:border-box;border-radius:${h / 2}px;border:5px solid transparent;background:linear-gradient(#fff,#fff) padding-box, ${T.GRAD} border-box;box-shadow:0 26px 60px rgba(123,44,191,.28)`, parent);
    const ds = h - 34;
    const disc = el('div', `position:absolute;left:12px;top:12px;width:${ds}px;height:${ds}px;border-radius:50%;overflow:hidden`, pll, T.cover(key, seed));
    el('div', `position:absolute;left:${12 + ds / 2 - 9}px;top:${12 + ds / 2 - 9}px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(0,0,0,.12)`, pll);
    const tt = el('div', `position:absolute;left:${ds + 32}px;top:${h * .2}px;font:800 ${h * .27}px Inter;letter-spacing:-.02em;color:${T.C.ink};white-space:nowrap`, pll, title);
    const st = el('div', `position:absolute;left:${ds + 32}px;top:${h * .55}px;font:600 ${h * .2}px Inter;color:#7a7385;white-space:nowrap`, pll, sub);
    const wv = T.wave(pll, w - 10 - 70, h / 2 - 5, { hmax: h * .42, hmin: h * .1, bw: 8, gap: 6 });
    return { el: pll, title: tt, sub: st, update: (t, on = 1) => { disc.style.transform = `rotate(${(t * 150) % 360}deg)`; wv(t, on); } };
  };

  // phone frame with a dark app screen; content is laid out in logical 390-px-wide units (like the real app) and scaled
  T.phone = (parent, w = 580) => {
    const h = w * 2.07, bz = w * .028, sw = w - 2 * bz, k = sw / 390, LH = (h - 2 * bz) / k;
    const f = el('div', `position:absolute;left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;border-radius:${w * .15}px;background:linear-gradient(145deg,#2a2a33,#0b0b0e 40%,#16161c);box-shadow:0 70px 140px rgba(70,20,110,.38),0 20px 40px rgba(20,10,40,.25),inset 0 0 0 2px rgba(255,255,255,.18)`, parent);
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
})();
