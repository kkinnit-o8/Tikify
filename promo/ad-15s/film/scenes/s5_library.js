/* s5 · b12 → b17 (6.792 → 9.623): Your Library on pink, flying in from the needle. The saved cover is carried in and
   lands in Road trip's collage on b13; the counts tick (4 → 5, 8 → 9). Tap Road trip on b14 → an iOS-style push into the
   playlist (the cover is carried into the header), tracks rise on b14.5/b15. The cursor presses ▶ on b16.5 and HOLDS it
   through the quiet beat; it lets go on the re-drop (b17) and the player bursts out of the button. */
(function () {
  const { E, p, el, zoom } = FILM;
  const C3 = T.b(12), C4 = T.b(17);
  const PX = 320, PY = 90, PW = 1280, PH = 900;
  const W = (x, y) => [PX + x, PY + y];
  const T_LAND = T.b(13), T_TAP = T.b(14), T_PRESS = T.b(16.5);
  const ROW_Y = [270, 420, 570, 720];
  const RT = W(64 + 60, 720 + 60), RT_ROW = W(380, 720 + 60), PLAY = W(1156, 300), Q1 = W(64 + 30, 725 + 30);
  const S = {};

  function cam(t) {
    let s = zoom(t, C3, C3 + .62, .36, 1.1, E.out(4)), fx = 960, fy = 590;
    const q1 = E.smooth(p(t, 6.98, 7.75)); s *= Math.exp(Math.log(1.18 / 1.1) * q1); fx += (880 - fx) * q1; fy += (770 - fy) * q1;
    const q2 = E.smooth(p(t, T_TAP + .03, T_TAP + .7)); s *= Math.exp(Math.log(1 / 1.18) * q2); fx += (960 - fx) * q2; fy += (560 - fy) * q2;
    const q3 = E.glide(p(t, 8.9, C4)); s *= Math.exp(Math.log(1.1) * q3); fx += (1180 - fx) * q3; fy += (500 - fy) * q3;
    return { s, tx: 960 - s * fx, ty: 540 - s * fy };
  }
  const scr = (w) => (t) => { const c = cam(t); return [c.tx + c.s * w[0], c.ty + c.s * w[1]]; };
  T.S5cam = cam; T.S5PLAY = PLAY;                            // the player (s6) grows out of this button's screen position

  const row = (y, art, title, sub, cls) => `
    <div class="${cls}" style="position:absolute;left:0;top:${y}px;width:${PW}px;height:130px">
      <div class="hl" style="position:absolute;left:40px;top:-10px;width:${PW - 80}px;height:150px;border-radius:18px;background:#262626;opacity:0"></div>
      <div class="art" style="position:absolute;left:64px;top:5px;width:120px;height:120px">${art}</div>
      <div style="position:absolute;left:220px;top:22px;font:700 46px/1.1 Inter;letter-spacing:-.01em;color:#fff">${title}</div>
      <div style="position:absolute;left:220px;top:80px;font:500 33px/1.2 Inter;color:#A7A7A7;white-space:nowrap">Playlist · <span class="cnt" style="display:inline-block;vertical-align:top;height:40px;overflow:hidden"><span class="roll" style="display:block">${sub}</span></span> sounds</div>
    </div>`;
  const col = (a) => `<div style="width:120px;height:120px;border-radius:10px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr">${a.map((u) => `<div style="background:url(${u}) center/cover"></div>`).join('')}</div>`;
  const track = (y, u, t1, t2, cls) => `
    <div class="${cls}" style="position:absolute;left:0;top:${y}px;width:${PW}px;height:110px">
      <div style="position:absolute;left:64px;top:8px;width:94px;height:94px;border-radius:10px;background:url(${u}) center/cover"></div>
      <div class="tt" style="position:absolute;left:190px;top:16px;font:700 42px/1.1 Inter;color:#fff;display:flex;align-items:center;gap:14px">${t1}</div>
      <div style="position:absolute;left:190px;top:66px;font:500 31px/1.2 Inter;color:#A7A7A7">${t2}</div>
      <div style="position:absolute;left:1146px;top:30px">${T.svg('dots', 50, '#A7A7A7')}</div>
    </div>`;

  FILM.scene({
    id: 's5', t0: C3, t1: C4, post: .5,
    zoom: (lt) => cam(C3 + lt).s,
    build(root) {
      S.null = el('div', 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0', root);
      const pn = S.panel = el('div', `position:absolute;left:${PX}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:40px;background:#121212;overflow:hidden;box-shadow:0 50px 120px rgba(90,0,40,.38),0 0 0 2px rgba(255,255,255,.06)`, S.null);
      pn.innerHTML = `
        <div class="lib" style="position:absolute;inset:0">
          <div class="lh" style="position:absolute;left:64px;top:44px;font:800 64px/1 Inter;letter-spacing:-.02em;color:#fff">Your Library</div>
          <div class="lm" style="position:absolute;left:1150px;top:44px">${T.svg('more', 56)}</div>
          <div class="np" style="position:absolute;left:64px;top:144px;height:84px;padding:0 34px 0 22px;border-radius:42px;background:#2A2A2A;display:flex;align-items:center;gap:12px;font:700 33px/1 Inter;color:#fff">${T.svg('plus', 44)}New playlist</div>
          ${row(ROW_Y[0], `<div style="width:120px;height:120px;border-radius:10px;background:${T.GRAD};display:grid;place-items:center">${T.svg('heart', 60)}</div>`, 'All sounds', '<span>8</span><span style="display:block">9</span>', 'r0')}
          ${row(ROW_Y[1], col([T.COV.gym, T.COV.gym2, T.COV.gym3, T.COV.gym4]), 'Gym', '<span>5</span>', 'r1')}
          ${row(ROW_Y[2], col([T.COV.chill, T.COV.chill2, T.COV.chill3, T.COV.chill4]), 'Chill', '<span>4</span>', 'r2')}
          ${row(ROW_Y[3], col([T.COV.road, T.COV.road2, T.COV.road3, T.COV.summer]), 'Road trip', '<span>4</span><span style="display:block">5</span>', 'r3')}
        </div>
        <div class="pl" style="position:absolute;inset:0">
          <div class="ph" style="position:absolute;left:404px;top:70px">
            <div style="font:800 92px/1 Inter;letter-spacing:-.03em;color:#fff">Road trip</div>
            <div style="margin-top:18px;font:500 34px/1 Inter;color:#A7A7A7">5 sounds</div>
            <div style="margin-top:44px;display:flex;gap:44px;align-items:center">${T.svg('plus', 60)}${T.svg('shuffle', 56)}</div>
          </div>
          <div class="gp" style="position:absolute;left:${1156 - 66}px;top:${300 - 66}px;width:132px;height:132px;border-radius:66px;background:#1ED760;display:grid;place-items:center;box-shadow:0 14px 34px rgba(30,215,96,.28)">${T.svg('play', 66, '#000')}</div>
          ${track(410, T.COV.night, 'night drive (slowed)', 'mira.wav', 't0')}
          ${track(530, T.COV.summer, 'summer anthem', 'The Waves', 't1')}
          ${track(650, T.COV.walk, 'the walk home', 'Kiro', 't2')}
          ${track(770, T.COV.skies, 'pink skies loop', 'lune', 't3')}
        </div>`;
      const q = (s) => pn.querySelector(s);
      Object.assign(S, { lib: q('.lib'), pl: q('.pl'), ph: q('.ph'), gp: q('.gp'), libEls: [q('.lh'), q('.lm'), q('.np'), q('.r0'), q('.r1'), q('.r2')],
        r3: q('.r3'), hl: q('.r3 .hl'), rtArt: q('.r3 .art'), rolls: [q('.r0 .roll'), q('.r3 .roll')], tracks: [0, 1, 2, 3].map((i) => q('.t' + i)) });
      S.q1 = S.rtArt.firstElementChild.firstElementChild;            // Road trip's first quadrant: the saved cover lands here
      // the carried cover (world layer, above the panel) and the playlist header cover it becomes
      S.fly = T.img(T.COV.night, 'position:absolute;left:0;top:0;width:60px;height:60px;border-radius:6px;transform-origin:0 0;box-shadow:0 18px 40px rgba(0,0,0,.4)', S.null);
      S.big = el('div', `position:absolute;left:0;top:0;width:120px;height:120px;transform-origin:0 0`, S.null, col([T.COV.night, T.COV.road2, T.COV.road3, T.COV.summer]));
      S.cur = T.cursor(root);
      S.keys = [[7.32, [2080, 1000]], [T_TAP - .05, scr(RT_ROW), .1], [T_TAP + .22, scr(RT_ROW)], [9.28, scr(PLAY), .12], [C4 + .02, scr(PLAY)], [C4 + .5, [2150, 1250], .05]];
      FILM.cue('land', T_LAND, 'pop'); FILM.cue('tap', T_TAP, 'click'); FILM.cue('push', T_TAP + .04, 'whoosh'); FILM.cue('press', T_PRESS, 'click');
    },
    update(lt, t) {
      const c = cam(t);
      // post-roll (after the re-drop): the page sinks back and darkens under the growing player
      const rq = E.out(2)(p(t, C4, C4 + .5)), PS = scr(PLAY)(C4);
      const k = 1 - .1 * rq;
      S.null.style.transform = `translate(${PS[0]}px,${PS[1]}px) scale(${k}) translate(${-PS[0]}px,${-PS[1]}px) ` + T.mat(c.tx, c.ty, c.s);
      S.null.style.filter = rq > 0 ? `brightness(${1 - .7 * rq})` : 'none';
      S.null.style.opacity = 1 - p(t, C4 + .28, C4 + .5);
      // the saved cover is carried in from the camera side and lands in Road trip's first quadrant on b13
      const fq = p(t, 6.96, T_LAND);
      const fe = E.bez(.4, 0, .25, 1)(fq), from = [PX + 1500, PY - 360], to = Q1;
      S.fly.style.display = fq > 0 && fq < 1 ? 'block' : 'none';
      const fx = from[0] + (to[0] - 30 - from[0]) * fe - 160 * Math.sin(Math.PI * fe), fy = from[1] + (to[1] - 30 - from[1]) * fe;
      S.fly.style.transform = `translate(${fx}px,${fy}px) scale(${3.2 - 2.2 * fe}) rotate(${18 * (1 - fe)}deg)`;
      S.q1.style.backgroundImage = `url(${t >= T_LAND ? T.COV.night : T.COV.road})`;
      S.rtArt.style.transform = `scale(${1 - .06 * T.bump(t, T_LAND, .26)})`;
      S.rolls[1].style.transform = `translateY(${-40 * E.smooth(p(t, T_LAND + .05, T_LAND + .32))}px)`;
      S.rolls[0].style.transform = `translateY(${-40 * E.smooth(p(t, T_LAND + .12, T_LAND + .39))}px)`;
      // tap Road trip on b14 → push into the playlist; Road trip's art is carried into the header
      S.hl.style.opacity = .9 * p(t, T_TAP - .02, T_TAP + .04) * (1 - p(t, T_TAP + .12, T_TAP + .3));
      const nq = p(t, T_TAP + .03, T_TAP + .36);
      S.libEls.concat([S.r3]).forEach((e, i) => { const q = E.in(2)(p(nq, i * .03, .82 + i * .03)); e.style.transform = `translateX(${-1350 * q}px)`; });
      S.rtArt.style.visibility = nq > 0 ? 'hidden' : 'visible';
      const aq = E.smooth(p(t, T_TAP + .04, T_TAP + .58)), a0 = W(64, 725), a1 = W(64, 64);
      S.big.style.display = nq > 0 ? 'block' : 'none';
      S.big.style.transform = `translate(${a0[0] + (a1[0] - a0[0]) * aq}px,${a0[1] + (a1[1] - a0[1]) * aq}px) scale(${1 + 1.5 * aq})`;
      S.big.style.filter = `drop-shadow(0 ${24 * aq}px ${50 * aq}px rgba(0,0,0,${.45 * aq}))`;
      S.pl.style.display = nq > 0 ? 'block' : 'none';
      const hq = E.soft(p(t, T_TAP + .27, T_TAP + .85)); S.ph.style.transform = `translateX(${900 * (1 - hq)}px)`;
      S.gp.style.transform = `translateX(${900 * (1 - E.soft(p(t, T_TAP + .31, T_TAP + .9)))}px) scale(${1 - .1 * p(t, T_PRESS - .05, T_PRESS) + .1 * E.out(3)(p(t, C4, C4 + .2))})`;
      S.tracks.forEach((r, i) => { const q = E.soft(p(t, T.b(14.5) + i * .08, T.b(14.5) + .6 + i * .08)); r.style.transform = `translateY(${70 * (1 - q)}px)`; r.style.opacity = Math.min(1, q * 1.8); });
      T.cursorAt(S.cur, t, T.path(t, S.keys), [T_TAP], [[T_PRESS, C4]]);
    },
  });
})();
