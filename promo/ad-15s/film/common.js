/* Shared kit for the Tikify ad: beat grid, palette (from styles.css), icons (from app.js / index.html), cover art in the
   app's own style (gradient + translucent peach circles), a cursor with a click, and a live-target cursor path. */
(function () {
  const { E, el, p, hash } = FILM;
  const T = window.T = {};

  /* the track: "nuts (instrumental, slowed)" from 4.044 s → 106 BPM, the drop on beat 1, hits on 9, 17 and 25 */
  T.B = 60 / 106;
  T.b = (k) => k * T.B;

  T.C = { bg: '#121212', bg2: '#181818', bg3: '#242424', bg4: '#2E2E2E', muted: '#A7A7A7', green: '#1ED760',
    pink: '#FE2C55', violet: '#7B2CBF', cyan: '#25F4EE', ink: '#121212' };
  T.GRAD = 'linear-gradient(135deg,#FE2C55,#7B2CBF 55%,#25F4EE)';

  const P = {
    note: 'M12 3v10.6A4 4 0 1 0 14 17V7h4V3z',
    heart: 'M12 21 10.6 19.7C5.4 15 2 11.9 2 8.1 2 5 4.4 2.6 7.5 2.6c1.7 0 3.4.8 4.5 2.1a6 6 0 0 1 4.5-2.1C19.6 2.6 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6z',
    paste: 'M16 3h-2.2a2 2 0 0 0-3.6 0H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 17H8V5h1v2h6V5h1z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
    prev: 'M18 6v12l-8.5-6zM6 6h2v12H6z',
    next: 'M6 6v12l8.5-6zM16 6h2v12h-2z',
    shuffle: 'M17 3l4 4-4 4V8h-2.2l-3.1 4 3.1 4H17v-3l4 4-4 4v-3h-3.2l-3.4-4.4L7 18H3v-2h3l3.1-4L6 8H3V6h4l3.4 4.4L13.8 6H17z',
    repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z',
    plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
    download: 'M11 4h2v9.2l3.6-3.6L18 11l-6 6-6-6 1.4-1.4 3.6 3.6zM5 18h14v2H5z',
    back: 'M15.4 4.6 8 12l7.4 7.4-1.4 1.4L5.2 12l8.8-8.8z',
    more: 'M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    dots: 'M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    chevron: 'M4.6 8.6 12 16l7.4-7.4 1.4 1.4-8.8 8.8L3.2 10z',
    plane: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z',
    library: 'M4 3h2v18H4zm5 0h2v18H9zm5.5.6 1.9-.6 5.6 17.4-1.9.6z',
    search: 'M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    arrow: 'M5 11h11.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H5z',
  };
  T.svg = (name, size, color = '#fff', css = '') =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" style="display:block;fill:${color};${css}"><path d="${P[name]}"/></svg>`;

  /* cover art in the app's style; seeded so every worker draws the same pixels */
  const coverURL = (c1, c2, seed, circ = 'rgba(255,214,170,A)') => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 480; const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 480, 480); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 480, 480);
    const r = FILM.rand(seed);
    for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(60 + r() * 360, 60 + r() * 360, 80 + r() * 150, 0, 7); x.fillStyle = circ.replace('A', (.26 + r() * .16).toFixed(2)); x.fill(); }
    return cv.toDataURL('image/png');
  };
  T.COV = {
    night: coverURL('#3A1C9C', '#F0306E', 11),     // the hero sound, "night drive (slowed)"
    summer: coverURL('#F6A23A', '#E5405E', 5),
    walk: coverURL('#16A3B0', '#3B36B8', 23),
    skies: coverURL('#FF6FA5', '#8E3FD8', 31),
    gym: coverURL('#E8344A', '#6A1B9A', 7),
    gym2: coverURL('#B23BE0', '#2E86DE', 8),
    gym3: coverURL('#E6A11E', '#B5533A', 9),
    gym4: coverURL('#EE7A1E', '#BFAE2C', 10),
    chill: coverURL('#3B6FE0', '#6E2CBF', 13),
    chill2: coverURL('#1F8FE0', '#2B3FB8', 14),
    chill3: coverURL('#8A35D6', '#5B2C9F', 15),
    chill4: coverURL('#E2306A', '#C2551F', 16),
    road: coverURL('#F08A24', '#D9C23A', 17),
    road2: coverURL('#E8345A', '#B03A6A', 18),
    road3: coverURL('#8E3FD8', '#3F7FD8', 19),
  };
  T.img = (url, css, parent) => el('div', `background:url(${url}) center/cover;${css}`, parent);
  T.collage = (urls, size, parent, css = '') => {
    const g = el('div', `width:${size}px;height:${size}px;border-radius:${size * .08}px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;flex:none;${css}`, parent);
    return [g, urls.map((u) => T.img(u, '', g))];
  };

  /* cursor: dark arrow, white rim, cyan glow (the ref's glowing cursor in Tikify's cyan); click = squash + ring */
  T.cursor = (parent) => {
    const w = el('div', 'position:absolute;left:0;top:0;width:0;height:0;z-index:60', parent);
    const ring = el('div', 'position:absolute;left:-44px;top:-44px;width:88px;height:88px;border-radius:50%;border:4px solid #25F4EE;opacity:0;box-shadow:0 0 18px rgba(37,244,238,.6)', w);
    const a = el('div', 'position:absolute;left:-4px;top:-3px;transform-origin:4px 3px;filter:drop-shadow(0 0 12px rgba(37,244,238,.9)) drop-shadow(0 8px 14px rgba(0,0,0,.35))', w,
      '<svg width="46" height="62" viewBox="0 0 20 27" style="display:block;overflow:visible"><path d="M1.5 1.5v20.5l5.2-5 3.6 8.2 3.6-1.6-3.5-8.1h7.1z" fill="#121212" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>');
    return { w, a, ring };
  };
  T.cursorAt = (c, t, xy, clicks, hold = []) => {
    c.w.style.transform = `translate(${xy[0]}px,${xy[1]}px)`;
    let sq = 0, rs = 0, ro = 0;
    for (const tc of clicks) {
      sq = Math.max(sq, Math.sin(Math.PI * p(t, tc - .05, tc + .2)));
      const q = p(t, tc, tc + .42); if (q > 0 && q < 1) { rs = .25 + 1.1 * E.out(2)(q); ro = .95 * (1 - q); }
    }
    for (const [a, b] of hold) sq = Math.max(sq, p(t, a - .06, a) * (1 - p(t, b, b + .12)));
    c.a.style.transform = `scale(${1 - .14 * sq})`;
    c.ring.style.transform = `scale(${rs})`; c.ring.style.opacity = ro;
  };
  // keys: [t, target(t)→[x,y] | [x,y], arc?]. Targets are evaluated at the CURRENT time, so a resting cursor stays on a
  // button while the camera moves; travel eases like a hand (fast start, long settle) on a slight arc.
  const hand = E.bez(.45, 0, .18, 1);
  T.path = (t, keys, arc = .12) => {
    const at = (k) => (typeof k[1] === 'function' ? k[1](t) : k[1]);
    if (t <= keys[0][0]) return at(keys[0]);
    for (let i = 1; i < keys.length; i++) {
      if (t > keys[i][0]) continue;
      const a = at(keys[i - 1]), b = at(keys[i]), q = hand(p(t, keys[i - 1][0], keys[i][0]));
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, o = (keys[i][2] ?? arc) * d * Math.sin(Math.PI * q);
      return [a[0] + dx * q - dy / d * o, a[1] + dy * q + dx / d * o];
    }
    return at(keys[keys.length - 1]);
  };

  /* typed text: one span per char (layout stable), caret after the last visible char */
  T.typer = (parent, segs, css) => {
    const box = el('div', `position:relative;white-space:pre;${css}`, parent), spans = [];
    let str = '';
    for (const [s, color] of segs) for (const ch of s) { spans.push(el('span', color ? `color:${color}` : '', box, ch === ' ' ? ' ' : ch)); str += ch; }
    return { box, spans, str };
  };
  T.typeShow = (ty, n) => ty.spans.forEach((s, i) => (s.style.visibility = i < n ? 'visible' : 'hidden'));
  T.caretX = (ty, n) => (n <= 0 ? 0 : ty.spans[n - 1].offsetLeft + ty.spans[n - 1].offsetWidth);

  /* small helpers */
  T.bump = (t, t0, d = .22) => Math.sin(Math.PI * p(t, t0, t0 + d));      // 0→1→0 pulse
  T.mat = (tx, ty, s) => `translate(${tx}px,${ty}px) scale(${s})`;         // screen = t + s·world (origin 0 0)
  T.hash = hash;
})();
