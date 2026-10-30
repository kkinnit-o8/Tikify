/* 9:16 · s4 · b9 → b12 (5.094 → 6.792): the big hit, stacked for a vertical frame. Opens inside the ✓ chip (×40 so the
   chip fills 1080×1920), pulls out to "Saved to / Road trip." typed big; on b10 the camera pulls back and the second
   message types under it; then a needle INTO "offline." lands on b12. Typing times use the 16:9 strings, so the
   soundtrack's key clicks match both cuts. */
(function () {
  const { E, p, el, zoom, cadence, typedN, caretOn } = FILM;
  const C2 = T.b(9), C3 = T.b(12), B10 = T.b(10);
  const S = {};
  const T1 = cadence('Saved to Road trip.', 5.2, 5.6, 77), T2 = cadence('Downloaded. Works offline.', 5.93, 6.4, 91);
  const ND = 6.5, CH = 120, GAP = 30, LH = 156, FS = 150;

  function msg(root, chipBg, icon, iconColor, segs) {
    const box = el('div', 'position:absolute;left:0;top:0', root);
    const chip = el('div', `width:${CH}px;height:${CH}px;border-radius:30px;display:grid;place-items:center;background:${chipBg}`, box, T.svg(icon, 76, iconColor));
    const ty = T.typer(box, segs, `margin-top:${GAP}px;font:800 ${FS}px/${LH}px "Inter Tight";letter-spacing:-.035em;color:#fff`);
    const caret = el('div', `position:absolute;width:11px;height:${LH - 24}px;border-radius:4px;background:#fff`, ty.box);
    return { box, chip, ty, caret };
  }
  const caretXY = (ty, n) => { if (n <= 0) return [0, 0]; const s = ty.spans[n - 1]; return s.textContent === '\n' ? [0, s.offsetTop + LH] : [s.offsetLeft + s.offsetWidth, s.offsetTop]; };

  function cam(t) {
    const qa = E.out(3)(p(t, C2, C2 + .62)), s = Math.exp(Math.log(40) * (1 - qa));
    const fin = [540 + (S.PIV[0] - S.AC[0]), 960 + (S.PIV[1] - S.AC[1])];
    const ps = [540 + (fin[0] - 540) * qa, 960 + (fin[1] - 960) * qa];
    let c = { s, tx: ps[0] - s * S.PIV[0], ty: ps[1] - s * S.PIV[1] };
    if (t >= C2 + .62) {
      const qb = E.smooth(p(t, B10, B10 + .58)), sb = Math.exp(Math.log(.74) * qb);
      const fx = S.AC[0] + (S.BC[0] - S.AC[0]) * qb, fy = S.AC[1] + (S.BC[1] - S.AC[1]) * qb;
      c = { s: sb, tx: 540 - sb * fx, ty: 960 - sb * fy };
    }
    const zN = zoom(t, ND, C3, 1, 9, E.in(4)), px = c.tx + c.s * S.NP[0], py = c.ty + c.s * S.NP[1];
    return { s: c.s * zN, tx: px + zN * (c.tx - px), ty: py + zN * (c.ty - py) };
  }

  FILM.scene({
    id: 's4', t0: C2, t1: C3,
    zoom: (lt) => cam(C2 + lt).s,
    build(root) {
      S.null = el('div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0', root);
      S.a = msg(S.null, T.GRAD, 'check', '#fff', [['Saved to\n', null], ['Road trip.', '#FF5C8A']]);
      S.b = msg(S.null, '#25F4EE', 'download', '#121212', [['Downloaded.\nWorks ', null], ['offline.', '#25F4EE']]);
      const wa = S.a.ty.box.offsetWidth, wb = S.b.ty.box.offsetWidth, ha = CH + GAP + 2 * LH, gap = 90;
      const X0 = 540 - Math.max(wa, wb) / 2, YA = 960 - (2 * ha + gap) / 2, YB = YA + ha + gap;
      S.a.box.style.left = X0 + 'px'; S.a.box.style.top = YA + 'px';
      S.b.box.style.left = X0 + 'px'; S.b.box.style.top = YB + 'px';
      S.AC = [X0 + wa / 2, YA + ha / 2]; S.BC = [540, YA + ha + gap / 2];
      S.PIV = [X0 + CH / 2 - 22, YA + CH / 2 - 30];             // inside the chip's pink corner, clear of the ✓ (checked at ×40)
      const off = S.b.ty.spans.slice(-8), o0 = off[0], o1 = off[off.length - 2];
      S.NP = [X0 + (o0.offsetLeft + o1.offsetLeft + o1.offsetWidth) / 2, YB + CH + GAP + o0.offsetTop + LH / 2];
      T1.forEach((tc) => FILM.cue('key', tc, 'key')); T2.forEach((tc) => FILM.cue('key', tc, 'key'));
      FILM.cue('pull', B10, 'whoosh'); FILM.cue('chip2', 5.86, 'pop'); FILM.cue('needle2', C3, 'riser');
    },
    update(lt, t) {
      const c = cam(t);
      S.null.style.transform = T.mat(c.tx, c.ty, c.s);
      const n1 = typedN(T1, t), n2 = typedN(T2, t);
      T.typeShow(S.a.ty, n1); T.typeShow(S.b.ty, n2);
      const [ax, ay] = caretXY(S.a.ty, n1), [bx, by] = caretXY(S.b.ty, n2);
      S.a.caret.style.left = (ax + 8) + 'px'; S.a.caret.style.top = (ay + 14) + 'px';
      S.a.caret.style.opacity = t < 5.12 ? 0 : t < 5.9 ? caretOn(t, 5.62) : 0;
      S.b.caret.style.left = (bx + 8) + 'px'; S.b.caret.style.top = (by + 14) + 'px';
      S.b.caret.style.opacity = t < 5.9 ? 0 : caretOn(t, 6.42);
      const cq = E.soft(p(t, 5.84, 6.3));
      S.b.chip.style.transform = `scale(${.4 + .6 * cq}) rotate(${-14 * (1 - cq)}deg)`;
      S.b.chip.style.opacity = Math.min(1, cq * 2.5);
    },
  });
})();
