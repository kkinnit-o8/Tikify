/* s1 · 0–1.47 · "Let me guess… you have been looking": words land on their spoken syllables (blur → sharp), the search
   capsule (the first half's hero object) rises in and types; the text whips out left at the cut while the capsule stays —
   it is carried into s2 at the same screen rect (CAP). */
(function () {
  const { E, p, el, clamp, rise, about, glide } = FILM;
  const T = K.T, CUT = T.here;
  const CAP = K.CAP = { x: 110, y: 1010, w: 860, h: 132 };            // capsule screen rect shared with s2
  const QUERY = K.QUERY = 'that one tiktok sound';
  const typeT = FILM.cadence(QUERY, .98, 1.32, 77);
  K.capDY = (t) => rise(t - .84, 200, 1500);                       // the capsule's settle, continued by s2 after the cut
  let S = {};
  FILM.scene({
    id: 's1', t0: 0, t1: CUT,
    zoom: (lt) => FILM.zoom(lt, 0, CUT, 1, 1.035, E.glide),
    build(root) {
      S.null = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      S.l1 = el('div', 'position:absolute;left:0;right:0;top:766px;text-align:center;font-size:144px;color:' + K.C.ink + ';transform-origin:540px 78px', S.null);
      S.l1.className = 'disp';
      S.w1 = K.words(S.l1, 'Let me guess…');
      S.cap = K.capsule(root, CAP.x, CAP.y, CAP.w, CAP.h);
    },
    update(lt) {
      S.null.style.transform = about(540, 960, FILM.zoom(lt, 0, CUT, 1, 1.035, E.glide));
      // line 1: three words on the VO, then carried up and quieted when line 2 starts
      [T.let, T.me, T.guess].forEach((t0, i) => K.wordIn(S.w1[i], lt, t0 - .05));
      const up = E.smooth(p(lt, .72, 1.2));                           // lifts a little to make room for the search capsule
      S.l1.style.transform = `translateY(${-90 * up}px)`;
      // whip out left (the capsule stays: it is the carried object)
      const wq = E.in(2)(p(lt, CUT - .14, CUT));
      const wx = -420 * wq;
      S.l1.parentNode.style.transform += ` translateX(${wx}px)`;
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
