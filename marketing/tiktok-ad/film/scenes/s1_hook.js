/* s1 · 0–1.40 · THE HOOK: "Let me guess…". Frame 0 is already alive: a drift of music-app windows (the Spotify and
   SoundCloud logos among them) floats past the camera at different depths while the camera dollies forward, and
   "Let me / guess…" slams in huge, one word per spoken syllable (scale 1.35→1 + blur → sharp, no overshoot). In the
   pause after "guess" the text lifts and the search capsule (the first half's hero object) rises in and types; at the
   cut the text and windows whip out left while the capsule stays — it is carried into s2 at the same screen rect. */
(function () {
  const { E, p, el, clamp, rise, about } = FILM;
  const T = K.T, CUT = T.here;
  const CAP = K.CAP = { x: 110, y: 1010, w: 860, h: 132 };            // capsule screen rect shared with s2
  const QUERY = K.QUERY = 'that one tiktok sound';
  const typeT = FILM.cadence(QUERY, .98, 1.32, 77);
  K.capDY = (t) => rise(t - .84, 200, 1500);                       // the capsule's settle, continued by s2 after the cut
  // floating windows: [name, x, y, width, depth 0 (far) … 1 (near), rotation°, theme index]
  const FLOAT = [['Spotify', -90, 150, 500, .55, -5, 0], ['SoundCloud', 640, 300, 520, .75, 4, 1], ['Apple Music', -150, 1230, 470, .35, 3, 2],
    ['YouTube Music', 760, 1290, 460, .45, -4, 3], ['SoundCloud', 40, 1610, 420, .2, 6, 1], ['Spotify', 600, 1580, 520, .9, -3, 0]];
  let S = {};
  FILM.scene({
    id: 's1', t0: 0, t1: CUT,
    zoom: (lt) => FILM.zoom(lt, 0, CUT, 1, 1.06, E.out(2)),
    build(root) {
      S.null = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      S.float = FLOAT.map(([name, x, y, w, d, r, th]) => {
        const holder = el('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w * 700 / 940}px`, S.null);
        const card = K.win(holder, 0, 0, name, K.THEMES[th], false);
        card.style.transformOrigin = '0 0'; card.style.transform = `scale(${w / 940})`;
        holder.__d = d; holder.__r = r; holder.__cx = x + w / 2; holder.__cy = y + w * 350 / 940;
        return holder;
      });
      S.txt = el('div', 'position:absolute;left:0;right:0;top:0;bottom:0', S.null);
      const line = (top) => { const l = el('div', `position:absolute;left:0;right:0;top:${top}px;text-align:center;font-size:198px;color:${K.C.ink};` +
        'text-shadow:0 0 50px rgba(255,255,255,.9),0 0 18px rgba(255,255,255,.8)', S.txt); l.className = 'disp'; return l; };
      S.w1 = K.words(line(586), 'Let me').concat(K.words(line(790), 'guess…'));
      S.cap = K.capsule(root, CAP.x, CAP.y, CAP.w, CAP.h);
    },
    update(lt) {
      // camera: already moving on frame 0 — a forward dolly that settles (in-scene depth, neutral by the cut)
      const z = FILM.zoom(lt, 0, CUT, 1, 1.06, E.out(2));
      S.null.style.transform = about(540, 960, z);
      // floating windows: parallax drift + depth of field (near ones bigger, blurrier, faster)
      S.float.forEach((h) => {
        const d = h.__d, dz = Math.pow(z, .5 + 1.6 * d), dy = -(30 + 90 * d) * lt, dx = (h.__cx - 540) * (dz - 1) * .6;
        h.style.transform = `translate(${dx}px,${dy}px) rotate(${h.__r + 2 * Math.sin(lt * 1.3 + d * 5)}deg) scale(${dz})`;
        h.style.filter = `blur(${(3 + 9 * Math.abs(d - .5) * 2).toFixed(1)}px)`;
        h.style.opacity = (.55 + .35 * d).toFixed(2);
      });
      // "Let me / guess…": each word slams in on its syllable (from 1.35×, blurred → sharp), then the lines lift for the capsule
      [T.let, T.me, T.guess].forEach((t0, i) => {
        const e = S.w1[i], q = E.out(4)(p(lt, t0 - .07, t0 + .26)), o = clamp(p(lt, t0 - .07, t0 + .06));
        e.style.opacity = o; e.style.transform = `scale(${1 + .35 * (1 - q)})`; e.style.filter = q > .995 ? 'none' : `blur(${(1 - q) * 18}px)`;
      });
      const up = E.smooth(p(lt, .70, 1.25));
      S.txt.style.transform = `translateY(${-112 * up}px)`;
      // whip out left (the capsule stays: it is the carried object)
      const wq = E.in(2)(p(lt, CUT - .14, CUT));
      S.null.style.transform += ` translateX(${-420 * wq}px)`;
      S.null.style.filter = wq > .02 ? `blur(${wq * 10}px)` : 'none';
      // capsule: linear rise + inertial bounce, width grows from a square about its centre
      const wp = E.width(p(lt, .86, 1.3)), W = CAP.h + (CAP.w - CAP.h) * wp, y = rise(lt - .84, 200, 1500);
      const vis = lt >= .84;
      S.cap.box.style.display = vis ? 'block' : 'none';
      S.cap.box.style.left = (CAP.x + (CAP.w - W) / 2) + 'px'; S.cap.box.style.width = W + 'px';
      S.cap.box.style.top = (CAP.y + y) + 'px';
      S.cap.box.style.opacity = clamp(p(lt, .84, .96));
      S.cap.txt.style.opacity = clamp(p(lt, .96, 1.04));
      const n = FILM.typedN(typeT, lt);
      S.cap.set(QUERY.slice(0, n), lt > .94);
    },
  });
  FILM.cue('whoosh', CUT - .1, 'whoosh');
})();
