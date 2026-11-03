/* Tikify ad kit: palette, timing (VO + music), shared components. Loaded after engine.js, before the scenes. */
(function () {
  const { E, p, el, clamp, lerp } = FILM;
  const K = window.K = {};

  /* ---------- palette (Tikify brand: styles.css / icon) ---------- */
  K.C = {
    ink: '#141217', inkSoft: '#6F6A7A', paper: '#F4F2F8',
    pink: '#FE2C55', purple: '#7B2CBF', cyan: '#25F4EE',
    bg: '#121212', bg2: '#181818', bg3: '#242424', bg4: '#2E2E2E', muted: '#A7A7A7', green: '#1ED760', danger: '#F15E6C',
  };
  K.BRAND = `linear-gradient(135deg, ${K.C.pink}, ${K.C.purple} 55%, ${K.C.cyan})`;
  K.BRAND_TXT = `linear-gradient(100deg, ${K.C.pink} 0%, #C42BA0 45%, ${K.C.purple} 75%, #4D6BEA 100%)`;

  /* ---------- timing (film seconds; music starts at track 16.72 s) ---------- */
  // VO onsets from build_vo.py (energy) + Whisper word times inside phrases
  K.T = {
    // voice: Higgsfield seed_audio preset "Ainsley", speech_rate 15, ONE natural take placed untouched (no stretch, no
    // pause edits; audio/place_vo.py). "Let me guess. Here, there, everywhere. Just to find that one TikTok audio.
    // Slowed, sped up, bass boosted. Search no more."  Phrase onsets from the energy envelope, words from Whisper.
    let: .05, me: .20, guess: .34, guessEnd: .67,
    here: 1.40, there: 1.90, and: 2.30, every: 2.42, everyEnd: 2.90,
    just: 3.20, to: 3.34, find: 3.48, that: 3.64, one: 3.84, tiktok: 4.02, audio: 4.40, audioEnd: 4.91,
    slowed: 5.16, sped: 5.70, up: 5.88, bass: 6.28, boosted: 6.48, boostEnd: 7.01,
    or: 6.98,                                   // the waveform's glitch (no word: "or doesn't sound right" was cut)
    search: 7.44, no: 7.72, more: 7.96, moreEnd: 8.33,
    drop: 8.47, b808: 8.73,
    // after the drop the voice keeps going, reading the on-screen lines (second take, placed untouched)
    vTikify: 9.00, paste: 9.66, any: 9.86, tiktok2: 10.18, link: 10.60, get: 11.02, the: 11.12, exact: 11.28, sound2: 11.60,
    play: 12.84, it: 13.06, like: 13.18, music: 13.32, playlists: 14.90, works: 15.78, free: 16.80, vTikify2: 18.36, dotno: 18.78,
  };
  K.BEAT = 0.5294;                          // 113.3 BPM (slowed)
  K.bar = (n) => 8.47 + n * 4 * K.BEAT;     // post-drop bars: 8.47, 10.59, 12.71, 14.82, 16.94, 19.06
  K.beatAt = (k) => 8.47 + k * K.BEAT;

  /* ---------- word entrance: move + scale .94→1 + opacity + blur 14→0 on expo-out (nothing pops) ---------- */
  K.wordIn = (e, lt, t0, d = .55, dy = 30, blur = 12) => {
    const q = E.soft(p(lt, t0, t0 + d)), o = E.sine(clamp(p(lt, t0, t0 + d * .55)));
    e.style.opacity = o;
    e.style.transform = `translateY(${(1 - q) * dy}px) scale(${.94 + .06 * q})`;
    e.style.filter = q > .995 ? 'none' : `blur(${(1 - q) * blur}px)`;
    return q;
  };
  // exit upward with acceleration (mirror of the entrance, cubic-in)
  K.wordOut = (e, lt, t0, d = .3, dy = -60, blur = 12) => {
    const q = E.inOut(2)(p(lt, t0, t0 + d));
    if (q <= 0) return 0;
    e.style.opacity = 1 - q;
    e.style.transform = `translateY(${q * dy}px) scale(${1 - .04 * q})`;
    e.style.filter = `blur(${q * blur}px)`;
    return q;
  };
  // a line of words, each its own inline-block span: returns spans
  K.words = (parent, text, css = '') => text.split(' ').map((w, i, a) => {
    const s = el('span', `display:inline-block;white-space:pre;will-change:transform,filter,opacity;${css}`, parent, w + (i < a.length - 1 ? ' ' : ''));
    return s;
  });

  /* ---------- icons ---------- */
  K.ICON = {
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>',
    paste: '<svg viewBox="0 0 24 24"><path d="M16 3h-2.2a2 2 0 0 0-3.6 0H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 17H8V5h1v2h6V5h1z"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21 10.6 19.7C5.4 15 2 11.9 2 8.1 2 5 4.4 2.6 7.5 2.6c1.7 0 3.4.8 4.5 2.1a6 6 0 0 1 4.5-2.1C19.6 2.6 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24"><path d="M17 3l4 4-4 4V8h-2.2l-3.1 4 3.1 4H17v-3l4 4-4 4v-3h-3.2l-3.4-4.4L7 18H3v-2h3l3.1-4L6 8H3V6h4l3.4 4.4L13.8 6H17z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M6 6v12l8.5-6zM16 6h2v12h-2z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
    lib: '<svg viewBox="0 0 24 24"><path d="M4 3h2v18H4zm5 0h2v18H9zm5.5.6 1.9-.6 5.6 17.4-1.9.6z"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M9 3v12.3A3.5 3.5 0 1 0 11 18.5V8h8v6.3a3.5 3.5 0 1 0 2 3.2V3z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/></svg>',
    offline: '<svg viewBox="0 0 24 24"><path d="M11 4h2v8.2l3.6-3.6L18 10l-6 6-6-6 1.4-1.4 3.6 3.6zM5 18h14v2H5z"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M3 5h13v2H3zm0 5h13v2H3zm0 5h8v2H3zm11-1v6l5-3z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg>',
  };
  K.svg = (name, size, color = 'currentColor', css = '') =>
    K.ICON[name].replace('<svg ', `<svg style="width:${size}px;height:${size}px;fill:${color};display:block;${css}" `);

  /* ---------- covers: bokeh gradients like the app's demo covers (deterministic) ---------- */
  const PALS = [
    ['#E8335F', '#9B2FB8', '#FFB45C'], ['#4F46E5', '#06B6D4', '#A78BFA'], ['#F59E0B', '#EF4444', '#FDE68A'],
    ['#10B981', '#3B82F6', '#A7F3D0'], ['#DB2777', '#7C3AED', '#F9A8D4'], ['#0EA5E9', '#6366F1', '#BAE6FD'],
    ['#F97316', '#DB2777', '#FCD34D'], ['#14B8A6', '#8B5CF6', '#99F6E4'],
  ];
  K.cover = (seed) => {
    const [a, b, c] = PALS[seed % PALS.length], h = (k) => FILM.hash(seed * 7.13 + k);
    const blob = (k, col) => `radial-gradient(circle at ${20 + 60 * h(k)}% ${20 + 60 * h(k + 1)}%, ${col}cc 0 ${14 + 14 * h(k + 2)}%, transparent ${15 + 14 * h(k + 2)}%)`;
    return `${blob(1, c)}, ${blob(4, '#ffffff')}, ${blob(7, c)}, linear-gradient(${135 + 90 * h(9)}deg, ${a}, ${b})`;
  };
  // the TikTok sound's cover: a night-drive edit thumbnail (neon city bokeh)
  K.NIGHT = 'radial-gradient(circle at 22% 30%, #FFB86Bdd 0 7%, transparent 8%), radial-gradient(circle at 70% 22%, #FF4D8Dcc 0 9%, transparent 10%),' +
    'radial-gradient(circle at 48% 58%, #7CF3FFaa 0 6%, transparent 7%), radial-gradient(circle at 82% 66%, #FFD36Ebb 0 5%, transparent 6%),' +
    'radial-gradient(circle at 30% 78%, #C77DFFaa 0 10%, transparent 11%), radial-gradient(ellipse at 50% 120%, #FF2C7A 0, transparent 60%),' +
    'linear-gradient(170deg, #160B33 0%, #3A1260 48%, #8A1F5E 78%, #F2545B 100%)';

  /* ---------- the search capsule (hero object of the first half) ---------- */
  // box at (x, y, w, h) in its parent; returns { box, txt, caret, ico, set(text, caretOn) }
  K.capsule = (parent, x, y, w, h, { fill = '#FFFFFF', ink = K.C.ink, shadow = true } = {}) => {
    const box = el('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${h / 2}px;background:${fill};` +
      (shadow ? 'box-shadow:0 22px 60px rgba(60,30,90,.16),0 0 0 2px rgba(20,18,23,.05);' : '') + 'overflow:hidden', parent);
    const ico = el('div', `position:absolute;left:${h * .34}px;top:${h * .28}px;color:${ink};opacity:.55`, box, K.svg('search', h * .44));
    const txt = el('div', `position:absolute;left:${h * .95}px;top:0;height:${h}px;font:500 ${h * .34}px/${h}px Inter;color:${ink};white-space:pre;letter-spacing:-.01em`, box);
    const caret = el('div', `position:absolute;top:${h * .26}px;width:3px;height:${h * .48}px;background:${K.C.pink};border-radius:2px`, box);
    return { box, txt, caret, ico, h, set(s, on) { txt.textContent = s; caret.style.left = (h * .95 + txt.offsetWidth + 3) + 'px'; caret.style.opacity = on ? 1 : 0; } };
  };

  /* ---------- the Tikify icon (real artwork from icons/icon-512.png) ---------- */
  K.ICON_SRC = '../../../icons/icon-512.png';
  K.icon = (parent, size, css = '') => { const i = el('img', `position:absolute;width:${size}px;height:${size}px;${css}`, parent); i.src = K.ICON_SRC; i.alt = ''; return i; };

  /* ---------- tap indicator (a finger on glass) ---------- */
  K.touch = (parent) => {
    const t = el('div', 'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:50', parent);
    const ring = el('div', 'position:absolute;left:-46px;top:-46px;width:92px;height:92px;border-radius:50%;border:3px solid rgba(255,255,255,.85);opacity:0', t);
    const dot = el('div', 'position:absolute;left:-34px;top:-34px;width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.42);box-shadow:0 6px 24px rgba(0,0,0,.35);backdrop-filter:blur(2px)', t);
    // path: [[t, x, y], …] (screen coords inside parent); taps: [t, …]; visible window [a, b]
    return (lt, path, taps, a, b) => {
      const vis = lt >= a && lt <= b;
      t.style.display = vis ? 'block' : 'none'; if (!vis) return;
      const x = FILM.kf(lt, path.map(([tt, xx]) => [tt, xx, E.smooth])), y = FILM.kf(lt, path.map(([tt, , yy]) => [tt, yy, E.smooth]));
      // arc: lift the finger a little mid-move
      t.style.transform = `translate(${x}px,${y}px)`;
      let sq = 1, rq = 0;
      for (const tp of taps) {
        const d = lt - tp;
        if (d > -.12 && d < .32) { sq = Math.min(sq, 1 - .16 * Math.sin(Math.PI * clamp((d + .12) / .3))); }
        if (d > 0 && d < .45) rq = Math.max(rq, d / .45);
      }
      const io = Math.min(E.soft(p(lt, a, a + .25)), 1 - E.in(2)(p(lt, b - .2, b)));
      dot.style.transform = `scale(${sq * (.7 + .3 * io)})`; dot.style.opacity = io;
      ring.style.opacity = rq > 0 ? (1 - rq) * .9 * io : 0; ring.style.transform = `scale(${.6 + rq * 1.4})`;
    };
  };

  /* ---------- waveform (canvas) ---------- */
  // mode: 'live' | 'slowed' | 'sped' | 'boost' | 'glitch' ; k = 0..1 strength; returns draw(ctx, w, h, t, opts)
  K.wave = (ctx, w, h, t, o = {}) => {
    const n = o.n || 64, gap = o.gap == null ? .38 : o.gap, cw = w / n, bw = cw * (1 - gap);
    const speed = o.speed || 1, amp = o.amp == null ? 1 : o.amp, clip = o.clip || 0, glitch = o.glitch || 0, col = o.color || K.C.ink;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), env = Math.pow(Math.sin(Math.PI * (.06 + .88 * u)), .8);
      const tt = t * speed;
      let v = .5 + .5 * Math.sin(tt * 6.1 + i * .55) * Math.sin(tt * 2.3 + i * .21) + .25 * Math.sin(tt * 11.7 + i * 1.9);
      v = clamp(.12 + .88 * Math.abs(v) * env * amp, .04, 1.4);
      let hh = v * h * .92, yy = h / 2, xx = i * cw + (cw - bw) / 2;
      let c = col;
      if (clip > 0 && hh > h * (1 - .45 * clip)) { hh = h * (1 - .45 * clip); c = o.clipColor || K.C.danger; }
      if (glitch > 0) {
        const band = Math.floor(i / 6), g = FILM.hash(band * 3.7 + Math.floor(t * 14));
        if (g > 1 - .5 * glitch) { yy += (FILM.hash(band + Math.floor(t * 14) * 1.3) - .5) * h * .5 * glitch; xx += (g - .5) * cw * 3 * glitch; }
        if (FILM.hash(i * 1.1 + Math.floor(t * 20)) > 1 - .25 * glitch) hh *= .15;
      }
      ctx.fillStyle = c;
      const r = Math.min(bw / 2, hh / 2);
      ctx.beginPath(); ctx.roundRect(xx, yy - hh / 2, bw, hh, r); ctx.fill();
    }
  };

  /* ---------- captions (post-drop, top area, kept clear of TikTok's UI) ---------- */
  K.caption = (parent, y, size = 76, color = '#fff') => {
    const c = el('div', `position:absolute;left:60px;right:60px;top:${y}px;text-align:center;font:700 ${size}px "Inter Display";letter-spacing:-.03em;color:${color};line-height:1.05;white-space:nowrap`, parent);
    return c;
  };
})();
