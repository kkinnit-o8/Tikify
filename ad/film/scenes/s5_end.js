/* 16.90–18.84  END CARD (on the last downbeat, held through the track's fade) — ref: light streak, "Riff" lockup, riff.hs.vc, platform icons, @handle.
   Tikify: brand-gradient streak (pink → violet → cyan), icon + Tikify, tikify.no, where it installs, the free pitch. */
(function () {
  const { p, E, el, clamp, lerp } = FILM;
  const T0 = L.B(27);
  L.STREAK = { t0: T0 };
  L.GLOW.push([17.0, '#7b2cbf', .34, 540, 980, 640, 520], [18.84, '#7b2cbf', .3, 540, 980, 660, 540]);
  FILM.scene({ id: 's5', t0: T0, t1: 18.84, pre: 0,
    build(root) {
      const sh = 'text-shadow:0 8px 48px rgba(0,0,0,.45)';
      this.wm = el('div', `position:absolute;left:0;top:800px;width:1080px;display:flex;justify-content:center;align-items:center;gap:26px;transform:translateY(-50%)`, root);
      this.icon = el('img', 'width:118px;height:118px;filter:drop-shadow(0 14px 34px rgba(0,0,0,.45))', this.wm); this.icon.src = '../../icons/icon-512.png';
      const w = el('div', `font:800 120px/1 Inter;letter-spacing:-.05em;color:#fff;display:flex;padding-bottom:6px;${sh}`, this.wm);
      this.l1 = FILM.glyphs(w, 'Tikify');
      const u = el('div', `position:absolute;left:0;top:972px;width:1080px;display:flex;justify-content:center;font:800 138px/1 Inter;letter-spacing:-.045em;color:#fff;transform:translateY(-50%);${sh}`, root);
      this.l2 = FILM.glyphs(u, 'tikify.no');
      this.pl = el('div', `position:absolute;left:0;top:1110px;width:1080px;display:flex;justify-content:center;gap:18px;font:600 40px/1 Inter;color:#fff`, root);
      ['iPhone', 'Android'].forEach((s) => el('div', 'padding:16px 30px;border-radius:999px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16)', this.pl, s));
      this.cta = el('div', `position:absolute;left:0;top:1236px;width:1080px;text-align:center;font:500 40px/1.3 Inter;color:#d2d2dc;${sh}`, root, 'Free. Add it to your Home Screen.');
    },
    update(lt, t) {
      const iq = E.soft(p(t, T0 + .02, T0 + .55));
      this.icon.style.transform = `scale(${lerp(.4, 1, iq)}) rotate(${lerp(-12, 0, iq)}deg)`; this.icon.style.opacity = clamp(iq * 3);
      FILM.riseGlyphs(this.l1, t, T0 + .06, .035, .55, 140);
      FILM.riseGlyphs(this.l2, t, T0 + .24, .035, .6, 140);
      L.apply(this.pl, L.enter(this.pl, t, T0 + .55, .55, { dy: 26, blur: 10 }));
      L.apply(this.cta, L.enter(this.cta, t, T0 + .72, .55, { dy: 22, blur: 10 }));
    },
  });
  FILM.cue('end', T0, 'beat');
})();
