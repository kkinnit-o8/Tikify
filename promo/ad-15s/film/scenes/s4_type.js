/* s4 · b9 → b12 (5.094 → 6.792): the big hit. The frame is solid gradient on the cut (inside the Save button), so this
   shot may come OUT of colour: it opens inside the ✓ chip (×30) and pulls out to the first line, typed big; on b10 the
   camera pulls back and the second line types under it (the ref's "Found a continuity error" pattern); then a needle
   INTO "offline." lands on b12. */
(function () {
  const { E, p, el, zoom, cadence, typedN, caretOn } = FILM;
  const C2 = T.b(9), C3 = T.b(12), B10 = T.b(10);
  const S = {};
  const T1 = cadence('Saved to Road trip.', 5.2, 5.6, 77), T2 = cadence('Downloaded. Works offline.', 5.93, 6.4, 91);
  const ND = 6.5;

  function line(root, chipBg, icon, iconColor, segs) {
    const row = el('div', 'position:absolute;left:0;top:0;display:flex;align-items:center;gap:40px;white-space:nowrap', root);
    const chip = el('div', `width:132px;height:132px;border-radius:32px;flex:none;display:grid;place-items:center;background:${chipBg}`, row, T.svg(icon, 84, iconColor));
    const ty = T.typer(row, segs, 'font:800 136px/1.06 "Inter Tight";letter-spacing:-.035em;color:#fff');
    const caret = el('div', 'position:absolute;top:10px;width:10px;height:126px;border-radius:4px;background:#fff', ty.box);
    return { row, chip, ty, caret };
  }

  function cam(t) {
    // A: out of the chip (pivot slides from the frame centre to its place while the zoom settles)
    const qa = E.out(3)(p(t, C2, C2 + .62)), s = Math.exp(Math.log(30) * (1 - qa));
    const fin = [960 + (S.PIV[0] - S.L1C[0]), 540 + (S.PIV[1] - S.L1C[1])];
    const ps = [960 + (fin[0] - 960) * qa, 540 + (fin[1] - 540) * qa];
    let c = { s, tx: ps[0] - s * S.PIV[0], ty: ps[1] - s * S.PIV[1] };
    if (t >= C2 + .62) {
      // B: pull back to the two-line block
      const qb = E.smooth(p(t, B10, B10 + .58)), sb = Math.exp(Math.log(.72) * qb);
      const fx = S.L1C[0] + (S.BC[0] - S.L1C[0]) * qb, fy = S.L1C[1] + (S.BC[1] - S.L1C[1]) * qb;
      c = { s: sb, tx: 960 - sb * fx, ty: 540 - sb * fy };
    }
    // C: needle into "offline."
    const zN = zoom(t, ND, C3, 1, 9, E.in(4)), px = c.tx + c.s * S.NP[0], py = c.ty + c.s * S.NP[1];
    return { s: c.s * zN, tx: px + zN * (c.tx - px), ty: py + zN * (c.ty - py) };
  }

  FILM.scene({
    id: 's4', t0: C2, t1: C3,
    zoom: (lt) => cam(C2 + lt).s,
    build(root) {
      S.null = el('div', 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0', root);
      S.a = line(S.null, T.GRAD, 'check', '#fff', [['Saved to ', null], ['Road trip.', '#FF5C8A']]);
      S.b = line(S.null, '#25F4EE', 'download', '#121212', [['Downloaded. Works ', null], ['offline.', '#25F4EE']]);
      const w1 = S.a.row.offsetWidth, w2 = S.b.row.offsetWidth, h = 140;
      const X0 = 960 - Math.max(w1, w2) / 2, Y1 = 540 - (200 + h) / 2;
      S.a.row.style.left = X0 + 'px'; S.a.row.style.top = Y1 + 'px';
      S.b.row.style.left = X0 + 'px'; S.b.row.style.top = (Y1 + 200) + 'px';
      S.L1C = [X0 + w1 / 2, Y1 + h / 2]; S.BC = [960, Y1 + (200 + h) / 2];
      S.PIV = [X0 + 66 - 22, Y1 + h / 2 - 28];                 // inside the chip's pink corner, clear of the ✓
      const off = S.b.ty.spans.slice(-8), o0 = off[0], o1 = off[off.length - 2];  // "offline" without the period
      S.NP = [X0 + 132 + 40 + (o0.offsetLeft + o1.offsetLeft + o1.offsetWidth) / 2, Y1 + 200 + h / 2 + 4];
      T1.forEach((tc) => FILM.cue('key', tc, 'key')); T2.forEach((tc) => FILM.cue('key', tc, 'key'));
      FILM.cue('pull', B10, 'whoosh'); FILM.cue('chip2', 5.86, 'pop'); FILM.cue('needle2', C3, 'riser');
    },
    update(lt, t) {
      const c = cam(t);
      S.null.style.transform = T.mat(c.tx, c.ty, c.s);
      const n1 = typedN(T1, t), n2 = typedN(T2, t);
      T.typeShow(S.a.ty, n1); T.typeShow(S.b.ty, n2);
      S.a.caret.style.left = (T.caretX(S.a.ty, n1) + 8) + 'px';
      S.a.caret.style.opacity = t < 5.12 ? 0 : t < 5.9 ? caretOn(t, 5.62) : 0;
      S.b.caret.style.left = (T.caretX(S.b.ty, n2) + 8) + 'px';
      S.b.caret.style.opacity = t < 5.9 ? 0 : caretOn(t, 6.42);
      const cq = E.soft(p(t, 5.84, 6.3));
      S.b.chip.style.transform = `scale(${.4 + .6 * cq}) rotate(${-14 * (1 - cq)}deg)`;
      S.b.chip.style.opacity = Math.min(1, cq * 2.5);
    },
  });
})();
