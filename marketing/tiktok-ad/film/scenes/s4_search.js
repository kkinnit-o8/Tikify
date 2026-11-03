/* s4 · 7.60–8.47 · "Search no more."  The flattened waveform line grows into the search capsule (frame centre), the old
   query types back in and gets struck through on "more", then the camera dives INTO the capsule (x⁵, ×17) while its fill
   turns into Tikify's gradient — at the cut the frame is solid gradient, and s5 flies on through it (the drop). */
(function () {
  const { E, p, el, clamp, lerp, about } = FILM;
  const T = K.T, T0 = 7.30, T1 = T.drop;
  const L = K.LINE, H = 132, CY = L.y, X0 = L.x - L.w / 2;
  const typeT = FILM.cadence(K.QUERY, 7.36, 7.60, 91);
  const Z1 = 17, DIVE0 = 8.22;
  let S = {};
  FILM.scene({
    id: 's4', t0: T0, t1: T1,
    zoom: (lt) => FILM.zoom(lt, DIVE0 - T0, T1 - T0, 1, Z1, E.in(6)),
    build(root) {
      S.null = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      S.search = el('div', `position:absolute;left:0;right:0;top:470px;text-align:center;font-size:200px;color:${K.C.ink}`, S.null, 'Search');
      S.search.className = 'disp';
      S.nm = el('div', `position:absolute;left:0;right:0;top:668px;text-align:center;font-size:200px;font-weight:800`, S.null);
      S.nm.className = 'disp';
      const grad = `background:${K.BRAND_TXT};-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:.08em`;
      S.wNo = K.words(S.nm, 'no more.', grad);
      S.cap = K.capsule(S.null, X0, CY - H / 2, L.w, H);
      S.grad = el('div', `position:absolute;inset:0;background:${K.BRAND};opacity:0`, S.cap.box);
      S.cap.box.insertBefore(S.grad, S.cap.box.firstChild);
      S.strike = el('div', `position:absolute;left:${H * .95 - 8}px;top:${H / 2 - 3}px;height:6px;border-radius:3px;background:${K.C.pink};width:0`, S.cap.box);
    },
    update(lt, t) {
      // capsule grows out of the line: height 6 → 132 (soft), the line's ink becomes the capsule's shadowed white body
      const g = E.soft(p(t, T0, T0 + .3));
      const h = lerp(6, H, g);
      S.cap.box.style.top = (CY - h / 2) + 'px'; S.cap.box.style.height = h + 'px'; S.cap.box.style.borderRadius = h / 2 + 'px';
      S.cap.box.style.background = g < .35 ? K.C.ink : '#fff';
      S.cap.ico.style.opacity = .55 * clamp(p(t, T0 + .12, T0 + .26));
      S.cap.set(K.QUERY.slice(0, FILM.typedN(typeT, t)), t > 7.34 && t < 8.1);
      // "Search" / "no more."
      K.wordIn(S.search, t, T.search - .06, .38, 34);
      K.wordIn(S.wNo[0], t, T.no - .05, .34, 34);
      K.wordIn(S.wNo[1], t, T.more - .05, .34, 34);
      // the search gets struck through on "more"
      const sw = E.smooth(p(t, T.more - .02, T.more + .2));
      S.strike.style.width = (S.cap.txt.offsetWidth + 16) * sw + 'px';
      S.cap.txt.style.opacity = 1 - .45 * sw;
      // dive INTO the capsule (pivot = its centre = frame centre); fill turns into the brand gradient as it fills the frame
      const z = FILM.zoom(t, DIVE0, T1, 1, Z1, E.in(6));
      S.null.style.transform = about(L.x, CY, z);
      const gq = E.smooth(p(t, 8.26, 8.44));
      S.grad.style.opacity = gq;
      S.cap.ico.style.opacity = (+S.cap.ico.style.opacity) * (1 - gq);
      S.cap.txt.style.opacity = (1 - .45 * sw) * (1 - gq); S.strike.style.opacity = 1 - gq;
    },
  });
  FILM.cue('riser→drop', T1, 'riser');
})();
