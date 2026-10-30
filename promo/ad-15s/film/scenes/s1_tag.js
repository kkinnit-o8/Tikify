/* s1 · 0 → b4 (2.264): pastel field. On the one-beat intro a cyan chip is born from a ring and grows into the tag; on the
   DROP (b1) it snaps cyan → pink → wine → black and "Tikify" decodes; on b2 the second line opens; on b2.5 five sound
   covers arc in and are swallowed by the ♪ icon, and the camera dives INTO the icon (×48, x⁴, speed peak on the cut) —
   the frame is the icon's pink-violet gradient on the cut, and the next shot keeps flying forward. */
(function () {
  const { E, p, el, zoom, about, TQ, hash } = FILM;
  const C1 = T.b(4), DROP = T.b(1), B2 = T.b(2), B25 = T.b(2.5);
  const CX = 960, CY = 515, PADX = 34, PADY = 26, ICON = 92;
  const SCR = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+<>/=';
  const L1 = [['Tikify', null]], L2 = [['» ', '#25F4EE'], ['TikTok sounds, on repeat', null], [' «', '#25F4EE']];
  const S = {};

  function chars(parent, segs) {
    const out = [];
    for (const [s, c] of segs) for (const ch of s) out.push({ ch, c, sp: el('span', 'display:inline-block', parent, ch === ' ' ? ' ' : ch) });
    return out;
  }
  function decode(list, k, t, seed, base) {           // glyphs born as random characters that resolve (quantised, 24 Hz)
    const n = list.length;
    list.forEach((o, i) => {
      if (o.ch === ' ') { o.sp.innerHTML = '&nbsp;'; return; }
      const th = i / n * .55 + hash(i * 1.7 + seed) * .25;
      if (k >= th + .2) { o.sp.textContent = o.ch; o.sp.style.fontFamily = ''; o.sp.style.color = o.c || base; o.sp.style.visibility = 'visible'; }
      else if (k >= th) { o.sp.textContent = SCR[Math.floor(hash(i * 9.1 + Math.floor(TQ(t) * 24) + seed) * SCR.length)]; o.sp.style.fontFamily = '"Geist Mono"'; o.sp.style.color = '#25F4EE'; o.sp.style.visibility = 'visible'; }
      else { o.sp.textContent = o.ch; o.sp.style.visibility = 'hidden'; }
    });
  }

  FILM.scene({
    id: 's1', t0: 0, t1: C1,
    zoom: (lt) => S.z ? S.z(lt) : 1,
    build(root) {
      S.par = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);     // soft blobs, parallax ^0.6
      S.blobs = [
        ['#FFB8CC', 1180, 820, -140], ['#D9C6FF', 980, 230, 470], ['#BFF3EE', 900, 1560, 860], ['#FFD9E4', 700, 1500, 60],
      ].map(([c, r, x, y]) => el('div', `position:absolute;left:${x - r / 2}px;top:${y - r / 2}px;width:${r}px;height:${r}px;border-radius:50%;background:radial-gradient(circle,${c} 0%,${c}D9 38%,${c}00 70%)`, S.par));
      S.null = el('div', 'position:absolute;inset:0;transform-origin:0 0', root);
      S.ringA = el('div', `position:absolute;left:${CX}px;top:${CY}px;width:0;height:0`, S.null);
      S.ring = el('div', 'position:absolute;left:-200px;top:-200px;width:400px;height:400px;border-radius:50%;border:3px solid rgba(255,255,255,.95);box-shadow:0 0 40px rgba(255,255,255,.9),inset 0 0 30px rgba(255,255,255,.7)', S.ringA);
      S.tag = el('div', 'position:absolute;overflow:hidden;border-radius:10px;box-shadow:0 30px 70px rgba(80,30,90,.18)', S.null);
      S.l1 = el('div', `position:absolute;left:${PADX}px;top:${PADY}px;display:flex;align-items:center;gap:24px;white-space:nowrap`, S.tag);
      S.icon = el('div', `width:${ICON}px;height:${ICON}px;border-radius:24px;background:${T.GRAD};flex:none;display:grid;place-items:center`, S.l1, T.svg('note', 58));
      S.w1 = el('div', 'font:800 104px/1 "Inter Tight";letter-spacing:-.03em;color:#fff', S.l1);
      S.c1 = chars(S.w1, L1);
      S.l2 = el('div', `position:absolute;left:${PADX + 4}px;top:${PADY + ICON + 18}px;font:600 46px/1.15 Inter;letter-spacing:-.01em;white-space:nowrap;color:#fff`, S.tag);
      S.c2 = chars(S.l2, L2);
      const l1w = S.l1.offsetWidth, l2w = S.l2.offsetWidth + 4;
      S.W0 = 44; S.W1 = l1w + 2 * PADX; S.W2 = Math.max(l1w, l2w) + 2 * PADX;
      S.H1 = ICON + 2 * PADY; S.H2 = ICON + 18 + 53 + 2 * PADY + 4;
      // the dive target: a point inside the icon's pink corner, clear of the note glyph (checked at ×48)
      const ix = CX - S.W2 / 2 + PADX + ICON / 2, iy = CY - S.H2 / 2 + PADY + ICON / 2;
      S.IC = [ix, iy]; S.PT = [ix - 22, iy - 18];
      // five sound covers, arcing in from the left like a string of beads
      S.dots = [T.COV.night, T.COV.summer, T.COV.walk, T.COV.skies, T.COV.road].map((u, i) =>
        T.img(u, `position:absolute;left:-30px;top:-30px;width:60px;height:60px;border-radius:50%;box-shadow:0 0 0 4px #fff,0 10px 24px rgba(60,20,80,.25)`, S.null));
      S.arr = S.dots.map((_, i) => 1.86 + i * .072);           // arrival times at the icon
      S.z = (lt) => { const q1 = E.smooth(p(lt, 1.5, 1.98)); return (1 + .08 * q1) * zoom(lt, 1.88, C1 - 1 / 30, 1, 62 / 1.08, E.in(3.5)); };   // ×62 on the last frame: solid gradient
      FILM.cue('chip', .04, 'ui'); FILM.cue('decode1', DROP, 'decode'); FILM.cue('decode2', B2, 'decode');
      S.arr.forEach((a, i) => FILM.cue('dot' + i, a, 'pop')); FILM.cue('dive', C1, 'riser');
    },
    update(lt) {
      const t = lt;
      S.blobs.forEach((b, i) => { b.style.transform = `translate(${40 * Math.sin(t * .6 + i * 1.9)}px,${30 * Math.cos(t * .5 + i * 1.3)}px)`; });
      // ring: the chip's birth (a soft ring of light expanding from the centre on the intro)
      const rq = p(t, 0, .62);
      S.ringA.style.transform = `scale(${.12 + .95 * E.out(2)(rq)})`; S.ringA.style.opacity = rq <= 0 || rq >= 1 ? 0 : .85 * (1 - rq) * Math.min(1, rq * 6);
      // tag size: square chip → line 1 on the intro, punch on the drop, second line on b2
      const born = E.soft(p(t, .03, .3));
      let W = S.W0 + (S.W1 - S.W0) * E.width(p(t, .1, DROP - .01)), H = S.W0 + (S.H1 - S.W0) * E.smooth(p(t, .26, DROP - .01));
      const q2 = E.smooth(p(t, B2, B2 + .34)); W += (S.W2 - S.W1) * q2; H += (S.H2 - S.H1) * q2;
      const punch = 1 + .07 * (1 - E.out(3)(p(t, DROP, DROP + .32))) * (t >= DROP ? 1 : 0);
      S.tag.style.width = W + 'px'; S.tag.style.height = H + 'px'; S.tag.style.left = (CX - W / 2) + 'px'; S.tag.style.top = (CY - H / 2) + 'px';
      S.tag.style.transform = `scale(${born * punch})`;
      // colour cycle, quantised so the blur never mixes two states: cyan → (drop) pink → wine → black
      const tq = TQ(t), col = tq < DROP ? '#25F4EE' : tq < DROP + .17 ? '#FE2C55' : tq < DROP + .27 ? '#4A0E2A' : '#121212';
      S.tag.style.background = col;
      const base = tq < DROP ? '#121212' : '#FFFFFF';
      decode(S.c1, p(t, .12, DROP + .3) * (t < DROP ? .62 : 1), t, 3, base);
      decode(S.c2, p(t, B2 + .03, B2 + .45), t, 9, base);
      S.icon.style.transform = `scale(${E.soft(p(t, DROP, DROP + .4)) * (1 + .1 * S.arr.reduce((a, ta) => Math.max(a, T.bump(t, ta, .2)), 0))})`;
      // dots: cubic arcs from off-screen left over the tag into the icon, accelerating in, swallowed on arrival
      S.dots.forEach((d, i) => {
        const t0 = B25 - .05 + i * .072, u = p(t, t0, S.arr[i]);
        if (u <= 0 || u >= 1) { d.style.display = 'none'; return; }
        d.style.display = 'block';
        const e = E.bez(.3, 0, .7, 1)(u), [ex, ey] = S.IC;
        const P0 = [-90, 760 - i * 26], P1 = [260 + i * 30, 150 - i * 12], P2 = [ex - 120, ey - 340], P3 = [ex, ey];
        const m = 1 - e, x = m * m * m * P0[0] + 3 * m * m * e * P1[0] + 3 * m * e * e * P2[0] + e * e * e * P3[0];
        const y = m * m * m * P0[1] + 3 * m * m * e * P1[1] + 3 * m * e * e * P2[1] + e * e * e * P3[1];
        const s = 1.15 - .25 * e - .7 * p(u, .86, 1);
        d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${-40 + 80 * e}deg)`;
      });
      // camera null: move the pivot onto the icon first, then dive (the needle) — overlapping at ≈0.45
      const q1 = E.smooth(p(t, 1.5, 1.98)), dx = (960 - S.PT[0]) * q1, dy = (540 - S.PT[1]) * q1, z = S.z(t);
      S.null.style.transform = about(S.PT[0], S.PT[1], z, dx, dy);
      S.par.style.transform = about(S.PT[0], S.PT[1], Math.pow(z, .6), dx * .6, dy * .6);
    },
  });
})();
