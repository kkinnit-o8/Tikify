/* s5 · 8.47–9.53 · THE DROP. We are inside the capsule's gradient (same gradient, same scale as s4's last frame); an
   icon-shaped hole tears open from the centre and flies past the lens (still moving forward), revealing Tikify's dark
   world with the app icon flying in to meet us. The ring pulse + wordmark land on the 808 (8.73). */
(function () {
  const { E, p, el, clamp, lerp, about } = FILM;
  const T = K.T, T0 = T.drop, T1 = 9.53;
  K.ICONPOS = { x: 540, y: 860, s: 380 };
  const Z1 = 17, CW = 860 * Z1, CH = 132 * Z1;                        // the capsule at s4's final zoom (centre = frame centre)
  let S = {};
  FILM.scene({
    id: 's5', t0: T0, t1: T1,
    zoom: (lt) => FILM.zoom(lt, 0, .62, .3, 1, E.out(3)),
    build(root) {
      S.null = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      S.bloom = el('div', `position:absolute;left:${540 - 560}px;top:${K.ICONPOS.y - 560}px;width:1120px;height:1120px;border-radius:50%;` +
        `background:radial-gradient(circle, rgba(254,44,85,.55) 0, rgba(123,44,191,.45) 34%, rgba(37,244,238,.14) 56%, transparent 70%);filter:blur(30px)`, S.null);
      S.ring = el('div', `position:absolute;left:${540 - 200}px;top:${K.ICONPOS.y - 200}px;width:400px;height:400px;border-radius:30%;` +
        'border:5px solid rgba(255,255,255,.75);box-sizing:border-box', S.null);
      S.icon = K.icon(S.null, K.ICONPOS.s, `left:${540 - K.ICONPOS.s / 2}px;top:${K.ICONPOS.y - K.ICONPOS.s / 2}px;filter:drop-shadow(0 30px 60px rgba(0,0,0,.5))`);
      S.word = el('div', 'position:absolute;left:0;right:0;top:1120px;text-align:center;font-size:210px;font-weight:800;color:#fff;letter-spacing:-.04em', S.null);
      S.word.className = 'disp';
      S.g = FILM.glyphs(S.word, 'Tikify');
      // iris: the capsule's gradient with a growing icon-shaped hole, on a canvas
      S.cv = el('canvas', 'position:absolute;left:0;top:0;width:1080px;height:1920px', root); S.cv.width = 1080; S.cv.height = 1920;
      S.cx = S.cv.getContext('2d');
      // CSS 135deg gradient over the zoomed capsule box: line through the centre along (+.707,+.707), length (w+h)·.707
      const len = (CW + CH) * Math.SQRT1_2, dx = Math.SQRT1_2 * len / 2, dy = Math.SQRT1_2 * len / 2;
      S.gr = S.cx.createLinearGradient(540 - dx, 960 - dy, 540 + dx, 960 + dy);
      S.gr.addColorStop(0, K.C.pink); S.gr.addColorStop(.55, K.C.purple); S.gr.addColorStop(1, K.C.cyan);
    },
    update(lt, t) {
      // --- iris: hole grows fast from the cut (decelerating), we pass through the gradient ---
      const hq = E.out(3)(p(t, T0, T0 + .42)), hs = 2600 * hq;
      const c = S.cx; c.clearRect(0, 0, 1080, 1920);
      if (hq < 1) {
        c.fillStyle = S.gr; c.fillRect(0, 0, 1080, 1920);
        if (hs > 1) { c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.roundRect(540 - hs / 2, K.ICONPOS.y - hs / 2, hs, hs, hs * .23); c.fill(); c.globalCompositeOperation = 'source-over'; }
      }
      S.cv.style.display = hq < 1 ? 'block' : 'none';
      // --- icon flies in to meet us (log-space, decelerating), bloom swells on the 808 ---
      const z = FILM.zoom(t, T0, T0 + .62, .3, 1, E.out(3));
      S.icon.style.transform = `scale(${z})`;
      const hit = Math.exp(-Math.max(0, t - T.b808) * 3.2) * (t >= T.b808 - .02 ? 1 : 0);
      S.bloom.style.opacity = (.35 + .4 * E.smooth(p(t, T0, T0 + .5)) + .35 * hit).toFixed(3);
      S.bloom.style.transform = `scale(${(.75 + .25 * E.out(3)(p(t, T0, T0 + .6)) + .08 * hit).toFixed(4)})`;
      // ring pulse from the icon on the 808
      const rq = p(t, T.b808, T.b808 + .6);
      S.ring.style.display = rq > 0 && rq < 1 ? 'block' : 'none';
      S.ring.style.transform = `scale(${1 + 1.6 * E.out(3)(rq)})`; S.ring.style.opacity = (1 - rq) * .8;
      // wordmark: glyphs rise out of their baseline mask on the 808
      FILM.riseGlyphs(S.g, t, T.b808 - .1, .035, .5, 115);
    },
  });
  FILM.cue('drop', T0, 'hit'); FILM.cue('808', T.b808, 'hit');
})();
