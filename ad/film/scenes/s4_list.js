/* 15.04–16.88  LIST (a line lights on each half-beat, the last on beat 26) — ref: "Free. / Open source. / No account. / No ads or telemetry." lit one line at a time.
   Tikify (all true per its README): Free. / No account. / No ads. / Works offline. */
(function () {
  const { p, E, el, clamp, lerp, TQ } = FILM;
  const T0 = L.B(24), T1 = L.B(27) - .02, LINES = ['Free.', 'No account.', 'No ads.', 'Works offline.'], FS = 108, STEP = L.P / 2, H0 = L.B(24) + L.P / 2;
  L.GLOW.push([15.2, '#6c5ce7', .55, 560, 920, 620, 600], [16.85, '#7b4fd6', .5, 540, 960, 600, 600]);
  FILM.scene({ id: 's4', t0: T0, t1: T1, pre: 0, post: .05,
    build(root) {
      this.box = el('div', 'position:absolute;inset:0;transform-origin:540px 920px', root);
      const col = el('div', `position:absolute;left:0;top:920px;width:1080px;transform:translateY(-50%);display:flex;justify-content:center`, this.box);
      const inner = el('div', `font:700 ${FS}px/1.14 Inter;letter-spacing:-.035em`, col);
      this.lines = LINES.map((s) => el('div', 'white-space:nowrap', inner, s));
      LINES.forEach((s, i) => FILM.cue('line' + i, H0 + i * STEP, 'tick'));
    },
    update(lt, t) {
      const x = E.in(2)(p(t, T1 - .22, T1 + .05));
      this.box.style.opacity = 1 - x; this.box.style.filter = x > .01 ? `blur(${x * 14}px)` : 'none'; this.box.style.transform = `scale(${lerp(1, .97, x)})`;
      this.lines.forEach((e, i) => {
        const st = L.enter(e, t, T0 + i * .06, .55, { dy: 34, blur: 10, s0: .98 }); L.apply(e, st);
        const a = H0 + i * STEP, last = i === LINES.length - 1;
        const on = clamp((TQ(t) - a + .02) / .1) * (last ? 1 : 1 - clamp((TQ(t) - a - STEP + .02) / .1));
        e.style.color = L.rgba(L.mix('#4b4b57', '#ffffff', on), 1);
      });
    },
  });
})();
