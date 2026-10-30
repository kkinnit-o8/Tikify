/* 9:16 · s5 · b12 → b17 (6.792 → 9.623): Your Library in the app's own phone layout (with its tab bar). The saved cover
   lands in Road trip on b13, the counts tick; tap Road trip on b14 → push into the playlist (the art is carried into the
   big header cover, as in the app); tracks rise on b14.5/b15; ▶ pressed on b16.5, held, released on the re-drop. */
(function () {
  const { E, p, el, zoom } = FILM;
  const C3 = T.b(12), C4 = T.b(17);
  const PX = 60, PY = 250, PW = 960, PH = 1340;
  const W = (x, y) => [PX + x, PY + y];
  const T_LAND = T.b(13), T_TAP = T.b(14), T_PRESS = T.b(16.5);
  const ROW_Y = [270, 450, 630, 810], AS = 140;
  const RT_ROW = W(400, 810 + 80), PLAY = W(820, 712), Q1 = W(56 + AS / 4, 820 + AS / 4);
  const S = {};

  function cam(t) {
    let s = zoom(t, C3, C3 + .62, .36, 1.06, E.out(4)), fx = 540, fy = PY + 640;
    const q1 = E.smooth(p(t, 6.98, 7.75)); s *= Math.exp(Math.log(1.12 / 1.06) * q1); fy += (PY + 760 - fy) * q1;
    const q2 = E.smooth(p(t, T_TAP + .03, T_TAP + .7)); s *= Math.exp(Math.log(1 / 1.12) * q2); fy += (PY + PH / 2 - fy) * q2;
    const q3 = E.glide(p(t, 8.9, C4)); s *= Math.exp(Math.log(1.08) * q3); fx += (640 - fx) * q3; fy += (PY + 780 - fy) * q3;
    return { s, tx: 540 - s * fx, ty: 960 - s * fy };
  }
  const scr = (w) => (t) => { const c = cam(t); return [c.tx + c.s * w[0], c.ty + c.s * w[1]]; };
  T.S5cam = cam; T.S5PLAY = PLAY;

  const col = (a, n) => `<div style="width:${n}px;height:${n}px;border-radius:12px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr">${a.map((u) => `<div style="background:url(${u}) center/cover"></div>`).join('')}</div>`;
  const row = (y, art, title, sub, cls) => `
    <div class="${cls}" style="position:absolute;left:0;top:${y}px;width:${PW}px;height:160px">
      <div class="hl" style="position:absolute;left:30px;top:-6px;width:${PW - 60}px;height:172px;border-radius:20px;background:#262626;opacity:0"></div>
      <div class="art" style="position:absolute;left:56px;top:10px;width:${AS}px;height:${AS}px">${art}</div>
      <div style="position:absolute;left:230px;top:30px;font:700 50px/1.1 Inter;letter-spacing:-.01em;color:#fff">${title}</div>
      <div style="position:absolute;left:230px;top:94px;font:500 35px/1.2 Inter;color:#A7A7A7;white-space:nowrap">Playlist · <span style="display:inline-block;vertical-align:top;height:42px;overflow:hidden"><span class="roll" style="display:block">${sub}</span></span> sounds</div>
    </div>`;
  const track = (y, u, t1, t2, cls) => `
    <div class="${cls}" style="position:absolute;left:0;top:${y}px;width:${PW}px;height:112px">
      <div style="position:absolute;left:56px;top:8px;width:96px;height:96px;border-radius:10px;background:url(${u}) center/cover"></div>
      <div style="position:absolute;left:182px;top:16px;font:700 42px/1.1 Inter;color:#fff">${t1}</div>
      <div style="position:absolute;left:182px;top:66px;font:500 31px/1.2 Inter;color:#A7A7A7">${t2}</div>
      <div style="position:absolute;left:840px;top:30px">${T.svg('dots', 50, '#A7A7A7')}</div>
    </div>`;

  FILM.scene({
    id: 's5', t0: C3, t1: C4, post: .5,
    zoom: (lt) => cam(C3 + lt).s,
    build(root) {
      S.null = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0', root);
      const pn = el('div', `position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:44px;background:#121212;overflow:hidden;box-shadow:0 50px 120px rgba(90,0,40,.38),0 0 0 2px rgba(255,255,255,.06)`, S.null);
      pn.innerHTML = `
        <div class="lib" style="position:absolute;inset:0">
          <div class="lh" style="position:absolute;left:56px;top:48px;font:800 68px/1 Inter;letter-spacing:-.02em;color:#fff">Your Library</div>
          <div class="lm" style="position:absolute;left:850px;top:50px">${T.svg('more', 56)}</div>
          <div class="np" style="position:absolute;left:56px;top:148px;height:86px;padding:0 34px 0 22px;border-radius:43px;background:#2A2A2A;display:flex;align-items:center;gap:12px;font:700 34px/1 Inter;color:#fff">${T.svg('plus', 46)}New playlist</div>
          ${row(ROW_Y[0], `<div style="width:${AS}px;height:${AS}px;border-radius:12px;background:${T.GRAD};display:grid;place-items:center">${T.svg('heart', 70)}</div>`, 'All sounds', '<span>8</span><span style="display:block">9</span>', 'r0')}
          ${row(ROW_Y[1], col([T.COV.gym, T.COV.gym2, T.COV.gym3, T.COV.gym4], AS), 'Gym', '<span>5</span>', 'r1')}
          ${row(ROW_Y[2], col([T.COV.chill, T.COV.chill2, T.COV.chill3, T.COV.chill4], AS), 'Chill', '<span>4</span>', 'r2')}
          ${row(ROW_Y[3], col([T.COV.road, T.COV.road2, T.COV.road3, T.COV.summer], AS), 'Road trip', '<span>4</span><span style="display:block">5</span>', 'r3')}
        </div>
        <div class="pl" style="position:absolute;inset:0">
          <div class="ph" style="position:absolute;left:56px;top:472px">
            <div style="font:800 92px/1 Inter;letter-spacing:-.03em;color:#fff">Road trip</div>
            <div style="margin-top:20px;font:500 36px/1 Inter;color:#A7A7A7">5 sounds</div>
            <div style="margin-top:46px;display:flex;gap:56px;align-items:center">${T.svg('plus', 62)}${T.svg('shuffle', 58)}</div>
          </div>
          <div class="gp" style="position:absolute;left:${820 - 70}px;top:${712 - 70}px;width:140px;height:140px;border-radius:70px;background:#1ED760;display:grid;place-items:center;box-shadow:0 14px 34px rgba(30,215,96,.28)">${T.svg('play', 70, '#000')}</div>
          ${track(800, T.COV.night, 'night drive (slowed)', 'mira.wav', 't0')}
          ${track(912, T.COV.summer, 'summer anthem', 'The Waves', 't1')}
          ${track(1024, T.COV.walk, 'the walk home', 'Kiro', 't2')}
          ${track(1136, T.COV.skies, 'pink skies loop', 'lune', 't3')}
        </div>
        <div class="tab" style="position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(180deg,rgba(18,18,18,0),#0a0a0a 40%);display:flex;justify-content:space-around;align-items:center;padding-top:20px">
          <div style="display:grid;justify-items:center;gap:8px;font:700 26px/1 Inter;color:#fff">${T.svg('library', 50)}Library</div>
          <div style="display:grid;justify-items:center;gap:8px;font:500 26px/1 Inter;color:#A7A7A7"><div style="width:110px;height:66px;border-radius:18px;background:${T.GRAD};display:grid;place-items:center">${T.svg('plus', 46)}</div>Add sound</div>
          <div style="display:grid;justify-items:center;gap:8px;font:500 26px/1 Inter;color:#A7A7A7">${T.svg('search', 50, '#A7A7A7')}Search</div>
        </div>`;
      const q = (s) => pn.querySelector(s);
      Object.assign(S, { pl: q('.pl'), ph: q('.ph'), gp: q('.gp'), libEls: [q('.lh'), q('.lm'), q('.np'), q('.r0'), q('.r1'), q('.r2')],
        r3: q('.r3'), hl: q('.r3 .hl'), rtArt: q('.r3 .art'), rolls: [q('.r0 .roll'), q('.r3 .roll')], tracks: [0, 1, 2, 3].map((i) => q('.t' + i)) });
      S.q1 = S.rtArt.firstElementChild.firstElementChild;
      S.fly = T.img(T.COV.night, `position:absolute;left:0;top:0;width:${AS / 2}px;height:${AS / 2}px;border-radius:6px;transform-origin:0 0;box-shadow:0 18px 40px rgba(0,0,0,.4)`, S.null);
      S.big = el('div', `position:absolute;left:0;top:0;width:${AS}px;height:${AS}px;transform-origin:0 0`, S.null, col([T.COV.night, T.COV.road2, T.COV.road3, T.COV.summer], AS));
      S.cur = T.cursor(root);
      S.keys = [[7.32, [1180, 1700]], [T_TAP - .05, scr(RT_ROW), .1], [T_TAP + .22, scr(RT_ROW)], [9.28, scr(PLAY), .12], [C4 + .02, scr(PLAY)], [C4 + .5, [1250, 2150], .05]];
      FILM.cue('land', T_LAND, 'pop'); FILM.cue('tap', T_TAP, 'click'); FILM.cue('push', T_TAP + .04, 'whoosh'); FILM.cue('press', T_PRESS, 'click');
    },
    update(lt, t) {
      const c = cam(t);
      const rq = E.out(2)(p(t, C4, C4 + .5)), PS = scr(PLAY)(C4), k = 1 - .1 * rq;
      S.null.style.transform = `translate(${PS[0]}px,${PS[1]}px) scale(${k}) translate(${-PS[0]}px,${-PS[1]}px) ` + T.mat(c.tx, c.ty, c.s);
      S.null.style.filter = rq > 0 ? `brightness(${1 - .7 * rq})` : 'none';
      S.null.style.opacity = 1 - p(t, C4 + .28, C4 + .5);
      // the saved cover is carried in and lands in Road trip's first quadrant on b13
      const fq = p(t, 6.96, T_LAND), fe = E.bez(.4, 0, .25, 1)(fq), from = W(1060, -420), to = Q1;
      S.fly.style.display = fq > 0 && fq < 1 ? 'block' : 'none';
      const fx = from[0] + (to[0] - AS / 4 - from[0]) * fe - 140 * Math.sin(Math.PI * fe), fy = from[1] + (to[1] - AS / 4 - from[1]) * fe;
      S.fly.style.transform = `translate(${fx}px,${fy}px) scale(${3.2 - 2.2 * fe}) rotate(${18 * (1 - fe)}deg)`;
      S.q1.style.backgroundImage = `url(${t >= T_LAND ? T.COV.night : T.COV.road})`;
      S.rtArt.style.transform = `scale(${1 - .06 * T.bump(t, T_LAND, .26)})`;
      S.rolls[1].style.transform = `translateY(${-42 * E.smooth(p(t, T_LAND + .05, T_LAND + .32))}px)`;
      S.rolls[0].style.transform = `translateY(${-42 * E.smooth(p(t, T_LAND + .12, T_LAND + .39))}px)`;
      // tap Road trip on b14 → push into the playlist; its art is carried into the header cover
      S.hl.style.opacity = .9 * p(t, T_TAP - .02, T_TAP + .04) * (1 - p(t, T_TAP + .12, T_TAP + .3));
      const nq = p(t, T_TAP + .03, T_TAP + .36);
      S.libEls.concat([S.r3]).forEach((e, i) => { const q = E.in(2)(p(nq, i * .03, .82 + i * .03)); e.style.transform = `translateX(${-1050 * q}px)`; });
      S.rtArt.style.visibility = nq > 0 ? 'hidden' : 'visible';
      const aq = E.smooth(p(t, T_TAP + .04, T_TAP + .58)), a0 = W(56, 820), a1 = W(280, 48), big = 400 / AS;
      S.big.style.display = nq > 0 ? 'block' : 'none';
      S.big.style.transform = `translate(${a0[0] + (a1[0] - a0[0]) * aq}px,${a0[1] + (a1[1] - a0[1]) * aq}px) scale(${1 + (big - 1) * aq})`;
      S.big.style.filter = `drop-shadow(0 ${24 * aq}px ${50 * aq}px rgba(0,0,0,${.45 * aq}))`;
      S.pl.style.display = nq > 0 ? 'block' : 'none';
      const hq = E.soft(p(t, T_TAP + .27, T_TAP + .85)); S.ph.style.transform = `translateX(${1000 * (1 - hq)}px)`;
      S.gp.style.transform = `translateX(${1000 * (1 - E.soft(p(t, T_TAP + .31, T_TAP + .9)))}px) scale(${1 - .1 * p(t, T_PRESS - .05, T_PRESS) + .1 * E.out(3)(p(t, C4, C4 + .2))})`;
      S.tracks.forEach((r, i) => { const q = E.soft(p(t, T.b(14.5) + i * .08, T.b(14.5) + .6 + i * .08)); r.style.transform = `translateY(${70 * (1 - q)}px)`; r.style.opacity = Math.min(1, q * 1.8); });
      T.cursorAt(S.cur, t, T.path(t, S.keys), [T_TAP], [[T_PRESS, C4]]);
    },
  });
})();
