/* 9:16 · s8 · b22 → 15.0: end card. The lock-screen cover is carried (pixel-identical copy at its rect), lifts, flies to the
   centre and becomes the Tikify icon by a diagonal wipe while the pastel world floods back from it (bookends the
   opener). The icon makes room on b23 and the wordmark rises; tagline; pills on b24; on the last hit (b25) the note
   bounces and a shine crosses the CTA. Clean hold to 15.0. */
(function () {
  const { E, p, el, lerp } = FILM;
  const C6 = T.b(22), B23 = T.b(23), B24 = T.b(24), B25 = T.b(25);
  const IS = 176, IC = [540, 760];                 // icon size and the point it flies to (the flood origin)
  T.END_ICON = IC;
  const S = {};

  FILM.scene({
    id: 's8', t0: C6, t1: 15,
    zoom: (lt) => 1 + .03 * E.glide(p(C6 + lt, B23, 15)),
    build(root) {
      // the pastel world floods OVER the lock screen from the point the icon flies to (brand fringe on the front)
      S.flood = el('div', 'position:absolute;inset:0;background:#F7F4FA', root);
      S.fb = [['#FFC7D7', 1300, 200, 300], ['#DCCDFF', 1200, 1000, 520], ['#C8F4F0', 1300, 900, 1650], ['#FFE3EC', 1100, 100, 1500]].map(([c, r, x, y]) =>
        el('div', `position:absolute;left:${x - r / 2}px;top:${y - r / 2}px;width:${r}px;height:${r}px;border-radius:50%;background:radial-gradient(circle,${c} 0%,${c}CC 40%,${c}00 70%)`, S.flood));
      S.fringe = el('div', 'position:absolute;inset:0', root);
      S.cam = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 960px', root);
      // lockup: icon + wordmark, measured so the pair is centred
      S.word = el('div', 'position:absolute;top:0;left:0;font:800 200px/1 "Inter Tight";letter-spacing:-.05em;color:#121212;white-space:nowrap', S.cam);
      S.wg = FILM.glyphs(S.word, 'Tikify');
      const ww = S.word.offsetWidth, gap = 38, total = IS + gap + ww;
      S.LX = 540 - total / 2;                            // icon's final left
      S.WL = S.LX + IS + gap; S.word.style.left = S.WL + 'px'; S.word.style.top = (IC[1] - 108) + 'px';
      // the carried cover → icon
      S.ic = el('div', 'position:absolute;left:0;top:0;overflow:hidden;transform-origin:0 0', S.cam);
      S.icCov = T.img(T.COV.summer, 'position:absolute;inset:0', S.ic);
      S.icFace = el('div', `position:absolute;inset:0;background:${T.GRAD};display:grid;place-items:center`, S.ic);
      S.note = el('div', 'transform-origin:50% 80%', S.icFace, T.svg('note', 111));
      S.shadow = el('div', 'position:absolute;left:0;top:0;border-radius:50%;background:rgba(60,20,80,.22);filter:blur(30px)', S.cam);
      S.cam.insertBefore(S.shadow, S.ic);
      // tagline, pills, legal line
      S.tag = el('div', 'position:absolute;left:0;width:1080px;top:920px;text-align:center;font:600 58px/1.22 Inter;letter-spacing:-.01em;color:rgba(18,18,18,.82);white-space:nowrap', S.cam);
      S.tg = FILM.glyphs(el('div', '', S.tag), 'Your TikTok sounds,').concat(FILM.glyphs(el('div', '', S.tag), 'played like music.'));
      S.pills = el('div', 'position:absolute;left:0;width:1080px;top:1110px;display:flex;flex-direction:column;align-items:center;gap:24px', S.cam);
      S.p1 = el('div', 'height:96px;padding:0 42px;border-radius:48px;box-shadow:inset 0 0 0 3px rgba(18,18,18,.16);background:rgba(255,255,255,.55);font:600 38px/96px Inter;color:#121212;white-space:nowrap', S.pills, 'Free · No account · Works offline');
      S.p2 = el('div', 'position:relative;overflow:hidden;height:96px;padding:0 40px 0 46px;border-radius:48px;background:#121212;font:700 40px/96px Inter;color:#fff;display:flex;align-items:center;gap:14px;white-space:nowrap', S.pills, `tikify.no${T.svg('arrow', 40)}`);
      S.shine = el('div', 'position:absolute;top:-20px;left:0;width:90px;height:140px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:skewX(-20deg)', S.p2);
      S.legal = el('div', 'position:absolute;left:0;width:1080px;top:1400px;text-align:center;font:500 24px/1 Inter;color:rgba(18,18,18,.5)', S.cam, 'Tikify is not affiliated with TikTok.');
      FILM.cue('lift', C6, 'whoosh'); FILM.cue('word', B23, 'whoosh'); FILM.cue('pills', B24, 'pop'); FILM.cue('final', B25, 'pop');
    },
    update(lt, t) {
      S.cam.style.transform = `scale(${1 + .03 * E.glide(p(t, B23, 15))})`;
      const fl = E.smooth(p(t, C6 + .04, C6 + .7)), R = fl * 2350;
      S.flood.style.clipPath = fl >= 1 ? 'none' : `circle(${R}px at ${IC[0]}px ${IC[1]}px)`;
      S.fb.forEach((b, i) => { b.style.transform = `translate(${36 * Math.sin(t * .55 + i * 1.8)}px,${28 * Math.cos(t * .45 + i * 1.2)}px)`; });
      const fa = Math.sin(Math.PI * fl);
      S.fringe.style.display = fl > 0 && fl < 1 ? 'block' : 'none';
      S.fringe.style.background = `radial-gradient(circle at ${IC[0]}px ${IC[1]}px, rgba(254,44,85,0) ${Math.max(0, R - 120)}px, rgba(254,44,85,${.5 * fa}) ${Math.max(0, R - 60)}px, rgba(123,44,191,${.55 * fa}) ${Math.max(0, R - 22)}px, rgba(37,244,238,${.5 * fa}) ${R}px, rgba(37,244,238,0) ${R + 40}px)`;
      // carry: from the widget cover rect to the centre (lift first), then make room for the wordmark on b23
      const [x0, y0, s0] = T.COVER_AT_C6, c0 = [x0 + s0 / 2, y0 + s0 / 2];
      const fq = E.smooth(p(t, C6 + .02, B23 - .06)), mq = E.smooth(p(t, B23, B23 + .55));
      const size = lerp(s0, IS, E.smooth(p(t, C6, B23 - .1)));
      const cx = lerp(lerp(c0[0], IC[0], fq), S.LX + IS / 2, mq), cy = lerp(c0[1], IC[1], fq) - 46 * Math.sin(Math.PI * fq);
      const lift = 1 + .08 * Math.sin(Math.PI * p(t, C6, B23));
      Object.assign(S.ic.style, { width: size + 'px', height: size + 'px', borderRadius: lerp(18, 50, fq) + 'px' });
      S.ic.style.transform = `translate(${cx}px,${cy}px) scale(${lift}) translate(${-size / 2}px,${-size / 2}px)`;
      Object.assign(S.shadow.style, { width: size + 'px', height: size * .4 + 'px', opacity: .4 + .6 * fq });
      S.shadow.style.transform = `translate(${cx - size / 2}px,${cy + size * .42 + 14 * lift}px) scale(${1.1 - .08 * (lift - 1)})`;
      // cover → icon: a diagonal wipe from the top-left (a state change, not a fade)
      const w = E.smooth(p(t, C6 + .14, C6 + .5)) * 150;
      S.icFace.style.clipPath = `polygon(0 0, ${w * 2}% 0, 0 ${w * 2}%)`;
      if (w >= 149) S.icFace.style.clipPath = 'none';
      const nb = T.bump(t, B25 - .02, .32);
      S.note.style.transform = `translateY(${-16 * nb}px) scale(${1 + .06 * nb},${1 - .05 * nb})`;
      // wordmark on b23, tagline, pills on b24 (≤4 % overshoot), shine on b25
      FILM.riseGlyphs(S.wg, t, B23 + .02, .04, .6);
      S.word.style.clipPath = `inset(-40% -10% -30% ${Math.max(0, cx + IS * .5 + 6 - S.WL)}px)`;   // letters come out from behind the icon
      FILM.riseGlyphs(S.tg, t, B23 + .32, .012, .55);
      [S.p1, S.p2].forEach((e, i) => { const q = p(t, B24 + i * .07, B24 + .5 + i * .07); e.style.transform = `translateY(${36 * (1 - E.soft(q))}px) scale(${.9 + .1 * E.back(1)(q)})`; e.style.opacity = Math.min(1, q * 2.2); });
      S.shine.style.transform = `translateX(${lerp(-160, 520, E.inOut(2)(p(t, B25, B25 + .55)))}px) skewX(-20deg)`;
      S.legal.style.opacity = .9 * E.soft(p(t, B24 + .2, B24 + .7));
    },
  });
})();
