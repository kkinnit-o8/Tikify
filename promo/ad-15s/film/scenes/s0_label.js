/* s0 · 0 → b5 (+exit): the step label, both formats. The ref's decoding tag, one step per half-bar, screen-fixed on top
   of everything so it stays readable through the dive and into the app:
   "Love this sound?" (born from a chip on the intro; the colour snaps cyan → pink → black on the drop) → "Tap Share"
   (b1.5) → "Pick Tikify" (b2.5) → "Get the sound." (b3.5), which holds while the app finds the sound and slides out once
   the sound card has landed (b5). Its width morphs between steps (size, not scale). */
(function () {
  const { E, p, el, TQ, hash } = FILM;
  const V = FILM.H > FILM.W, DROP = T.b(1), C1 = T.b(4), B5 = T.b(5);
  const L = V ? { x: 540, y: 305, fs: 80, x2: 540, y2: 305 } : { x: 1380, y: 540, fs: 92, x2: 960, y2: 112 };
  const CAPS = [
    [0, [['Love this sound?', null]]],
    [T.b(1.5), [['Tap ', null], ['Share', '#25F4EE']]],
    [T.b(2.5), [['Pick ', null], ['Tikify', '#FF5C8A']]],
    [T.b(3.5), [['Get the ', null], ['sound.', '#25F4EE']]],
  ];
  const SCR = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+<>/=';
  const S = {};

  function chars(parent, segs) {
    const out = [];
    for (const [s, c] of segs) for (const ch of s) out.push({ ch, c, sp: el('span', 'display:inline-block', parent, ch === ' ' ? ' ' : ch) });
    return out;
  }
  function decode(list, k, t, seed, base) {           // glyphs born as random characters that resolve (quantised, 24 Hz)
    const n = list.length;
    list.forEach((o, i) => {
      if (o.ch === ' ') { o.sp.innerHTML = '&nbsp;'; return; }
      const th = i / n * .55 + hash(i * 1.7 + seed) * .25;
      if (k >= th + .2) { o.sp.textContent = o.ch; o.sp.style.fontFamily = ''; o.sp.style.color = o.c || base; o.sp.style.visibility = 'visible'; }
      else if (k >= th) { o.sp.textContent = SCR[Math.floor(hash(i * 9.1 + Math.floor(TQ(t) * 24) + seed) * SCR.length)]; o.sp.style.fontFamily = '"Geist Mono"'; o.sp.style.color = '#25F4EE'; o.sp.style.visibility = 'visible'; }
      else { o.sp.textContent = o.ch; o.sp.style.visibility = 'hidden'; }
    });
  }

  FILM.scene({
    id: 's0', t0: 0, t1: B5 + .45,
    build(root) {
      root.style.zIndex = 50;                          // above s1 and s2
      const pad = Math.round(L.fs * .36), padY = Math.round(L.fs * .22);
      S.tag = el('div', 'position:absolute;overflow:hidden;border-radius:10px;box-shadow:0 30px 70px rgba(80,30,90,.22)', root);
      S.caps = CAPS.map(([t0, segs], i) => {
        const line = el('div', `position:absolute;left:${pad}px;top:${padY}px;font:800 ${L.fs}px/1.1 "Inter Tight";letter-spacing:-.03em;white-space:nowrap;color:#fff`, S.tag);
        return { t0, line, cs: chars(line, segs), w: line.offsetWidth + 2 * pad, seed: 3 + i * 7 };
      });
      S.H = Math.round(L.fs * 1.1) + 2 * padY;
      FILM.cue('chip', .04, 'ui');
      CAPS.forEach(([t0], i) => FILM.cue('decode' + i, i ? t0 : .06, 'decode'));
    },
    update(lt, t) {
      const ci = S.caps.reduce((a, c, i) => (t >= c.t0 ? i : a), 0), cur = S.caps[ci], prev = S.caps[Math.max(0, ci - 1)];
      const born = E.soft(p(t, .02, .26));
      let w = 44 + (S.caps[0].w - 44) * E.width(p(t, .05, .4)), h = 44 + (S.H - 44) * E.smooth(p(t, .16, .4));
      if (ci > 0) { w = prev.w + (cur.w - prev.w) * E.smooth(p(t, cur.t0, cur.t0 + .2)); h = S.H; }
      const punch = t >= DROP ? 1 + .07 * (1 - E.out(3)(p(t, DROP, DROP + .32))) : 1;
      const step = ci > 0 ? 1 + .035 * (1 - E.out(3)(p(t, cur.t0, cur.t0 + .25))) : 1;
      // 16:9: glides from beside the video to the top centre during the dive, clear of the app panel
      const mq = E.smooth(p(t, 1.86, C1 + .1)), x = L.x + (L.x2 - L.x) * mq, y = L.y + (L.y2 - L.y) * mq;
      const out = E.in(2)(p(t, B5 + .1, B5 + .42));
      Object.assign(S.tag.style, { width: w + 'px', height: h + 'px', left: (x - w / 2) + 'px', top: (y - h / 2 - 300 * out) + 'px',
        transform: `scale(${born * punch * step})`, opacity: 1 - p(t, B5 + .3, B5 + .42) });
      const tq = TQ(t);
      S.tag.style.background = tq < DROP ? '#25F4EE' : tq < DROP + .17 ? '#FE2C55' : tq < DROP + .27 ? '#4A0E2A' : '#121212';
      const base = tq < DROP ? '#121212' : '#FFFFFF';
      S.caps.forEach((c, i) => {
        c.line.style.display = i === ci ? 'block' : 'none';
        if (i === ci) decode(c.cs, i === 0 ? p(t, .08, .36) : p(t, c.t0, c.t0 + .24), t, c.seed, base);
      });
    },
  });
})();
