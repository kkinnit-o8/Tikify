/* Captions: one idea per beat-group, bold sans + one serif italic phrase in the brand gradient (the app's own ad voice).
   Words rise out of their baseline masks on the beat and leave upward just before the next one. No plates. */
(function () {
  const { el, E, p, clamp } = FILM;
  const CAPS = [
    [FB(9), FB(11), 'paste any', 'tiktok link'],
    [FB(11), FB(13), 'save it in', 'one tap'],
    [FB(13), FB(14), 'build your', 'playlists'],
    [FB(14), 9.5, 'play it', 'on repeat'],
    [CUT2 + 1 / 60, 11.36, 'no wifi? screen off?', 'still playing.'],
  ];
  FILM.scene({ id: 'cap', t0: FB(9) - .01, pre: .001, t1: 11.6,
    build(root) {
      root.style.zIndex = 40;
      this.caps = CAPS.map(([tin, tout, a, b]) => {
        const box = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;display:none;filter:drop-shadow(0 6px 30px rgba(0,0,0,.55))', root);
        const line = (top, css, text, grad) => {
          const l = el('div', `position:absolute;left:0;top:${top}px;width:1080px;text-align:center;white-space:nowrap;${css}`, box);
          const words = text.split(' ').map((w) => { const m = el('span', 'display:inline-block;clip-path:inset(-45% -25% -0.24em -25%);margin:0 .125em', l);
            const s = el('span', 'display:inline-block;padding:0 .04em .08em', m, w); if (grad) s.classList.add('grad'); return s; });
          return { l, words };
        };
        const A = line(214, 'font:800 84px Inter;letter-spacing:-.035em;color:#f6f3f8', a, false);
        const Bl = line(296, 'font:400 112px "Instrument Serif";font-style:italic;letter-spacing:-.01em', b, true);
        // fit long lines inside the safe width
        for (const L of [A, Bl]) { const w = L.words.reduce((s, x) => s + x.parentNode.offsetWidth, 0); if (w > 900) { const k = 900 / w; L.l.style.transform = `scale(${k})`; L.l.style.transformOrigin = '540px 50%'; } }
        return { tin, tout, box, A, B: Bl };
      });
    },
    update(lt, t) {
      for (const c of this.caps) {
        const vis = t >= c.tin && t < c.tout;
        c.box.style.display = vis ? 'block' : 'none';
        if (!vis) continue;
        const out = E.in(2.2)(p(t, c.tout - .17, c.tout));
        const all = [...c.A.words.map((w) => [w, 0]), ...c.B.words.map((w) => [w, 1])];
        all.forEach(([w, ln], i) => {
          const d0 = c.tin + i * .045 + ln * .06, r = E.soft(p(t, d0, d0 + .5));
          const y = (1 - r) * 115 - out * 120;
          w.style.transform = `translateY(${y.toFixed(1)}%)`;
        });
      }
    },
  });
})();
