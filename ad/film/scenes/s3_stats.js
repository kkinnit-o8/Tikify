/* 17.45–19.15  STATS — ref: rolling counters "10,000+ downloads · 180 MB RAM usage".
   Tikify, both true: the app shell (index, css, js, manifest, sw, icons) is 269,316 bytes; saving a sound is Paste → Save. */
(function () {
  const { p, kf, E, el, clamp, lerp, TQ, rand } = FILM;
  const T0 = 17.6, T1 = 19.1;
  const STATS = [{ n: '269', unit: 'KB', label: 'the whole app', y: 800 }, { n: '2', unit: 'taps', label: 'to save a sound', y: 1160 }];
  const FS = 210;
  FILM.scene({ id: 's3', t0: T0, t1: T1, pre: 0, post: .05,
    build(root) {
      this.box = el('div', 'position:absolute;inset:0;transform-origin:540px 980px', root);
      const r = rand(77);
      this.cols = []; this.subs = [];
      STATS.forEach((s, k) => {
        const row = el('div', `position:absolute;left:0;width:1080px;top:${s.y}px;transform:translateY(-50%);display:flex;justify-content:center;align-items:baseline;gap:22px;color:#fff`, this.box);
        const num = el('div', `display:flex;font:800 ${FS}px/1 Inter;letter-spacing:-.045em;font-variant-numeric:tabular-nums`, row);
        [...s.n].forEach((ch, i) => {
          const win = el('div', `position:relative;height:${FS * 1.04}px;overflow:hidden;clip-path:inset(0 -10% 0 -10%)`, num);
          const strip = el('div', 'display:flex;flex-direction:column', win);
          const N = 9 + i * 2 + k * 2, digs = [];
          for (let j = 0; j < N; j++) digs.push(String(Math.floor(r() * 10)));
          digs.push(ch); digs.forEach((d) => el('div', `height:${FS * 1.04}px;line-height:${FS * 1.04}px`, strip, d));
          this.cols.push({ strip, n: digs.length - 1, t0: T0 + .12 + i * .08 + k * .22 });
        });
        const unit = el('div', `font:600 ${FS * .4}px/1 Inter;letter-spacing:-.02em;color:#b9b9c6`, row, s.unit);
        const lab = el('div', `position:absolute;left:0;width:1080px;top:${s.y + 150}px;text-align:center;font:500 44px/1 Inter;color:#9d9daa`, this.box, s.label);
        this.subs.push([unit, .55 + k * .22], [lab, .7 + k * .22]);
      });
    },
    update(lt, t) {
      // keeps receding like the phone did (zoom direction holds across the cut): 1.14 → 1
      const q = E.out(3)(p(t, T0, T0 + .7)), x = E.in(2)(p(t, T1 - .2, T1 + .05));
      this.box.style.transform = `scale(${FILM.zoom(q, 0, 1, 1.14, 1, E.lin) * lerp(1, .97, x)})`;
      const b = (1 - q) * 14 + x * 14;
      this.box.style.filter = b > .3 ? `blur(${b}px)` : 'none'; this.box.style.opacity = clamp((t - T0) / .2) * (1 - x);
      this.cols.forEach((c) => { const k = E.out(4)(p(t, c.t0, c.t0 + .95)); c.strip.style.transform = `translateY(${-k * c.n * FS * 1.04}px)`; });
      this.subs.forEach(([e, d]) => L.apply(e, L.enter(e, t, T0 + d, .5, { dy: 18, blur: 8 })));
    },
    zoom(lt) { return FILM.zoom(E.out(3)(p(lt + T0, T0, T0 + .7)), 0, 1, 1.14, 1, E.lin); },
  });
  FILM.cue('statsIn', T0, 'whoosh'); FILM.cue('roll1', T0 + .12, 'roll'); FILM.cue('roll2', T0 + .34, 'roll');
  FILM.cue('land1', T0 + 1.2, 'tick'); FILM.cue('land2', T0 + 1.3, 'tick');
})();
