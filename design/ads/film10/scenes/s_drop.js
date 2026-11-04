/* SHORT DROP EDIT (4 bars): logo hit → paste/find/save on the real Add flow → player → end card. Nothing ever holds still:
   the phone orbits and floats, words drift after they land, the camera keeps pushing, the end card keeps moving. */
(() => {
  const E = FILM.E, el = FILM.el, p = FILM.p, clamp = FILM.clamp;
  const T = TL, B = T.bars, DROP = T.DROP, END = T.dur;
  const beat = (bar, n) => B[bar - 1] + (n - 1) * T.BEAT;
  const ACC = [B[0], beat(3, 4), B[4]];                                   // the track's strongest transients in this window
  const PW = 560, PL = 260, PT = 440;
  const ICON = UI.APP + 'icons/icon-512.png';
  const BRAND = 'linear-gradient(135deg,#ff6a3d,#ff2d7a 55%,#8b5cff)';
  const SCR_W = 532 / 1170, SCR_H = 1151 / 2532;
  const sx = (cssx) => cssx * 3 * SCR_W, sy = (cssy) => cssy * 3 * SCR_H;
  // continuous phone pose (orbit + bob), parented under the scene's own moves
  const orbit = (t, k = 1) => `rotateY(${6 * k * Math.sin(t * 1.1)}deg) rotateX(${3 * k * Math.sin(t * .8 + 1)}deg) translate(0,${9 * k * Math.sin(t * 1.4)}px)`;
  const drift = (t, a = 10) => `translate(${a * Math.sin(t * 1.3)}px,${a * .5 * Math.cos(t * .9)}px)`;

  /* ---------- background ---------- */
  let plate, glow, glow2;
  FILM.scene({
    id: 'bg', t0: DROP, t1: END,
    build(root) {
      el('div', 'position:absolute;inset:0;background:#08070b', root);
      plate = el('img', 'position:absolute;left:0;top:-60px;width:1080px;height:auto;opacity:.95;will-change:transform', root); plate.src = UI.ASSETS + 'bg_glow.png'; plate.decoding = 'sync';
      UI.pending.push(plate.decode().catch(() => {}));
      glow = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 78%, rgba(255,45,122,.42), rgba(139,92,255,.12) 45%, rgba(0,0,0,0) 70%);mix-blend-mode:screen', root);
      glow2 = el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%, rgba(255,106,61,.22), rgba(0,0,0,0) 55%);mix-blend-mode:screen', root);
      el('div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.5) 100%)', root);
    },
    update(lt, t) {
      plate.style.transform = `translate(${8 * Math.sin(t * .7)}px,${-40 * p(t, DROP, END) + 6 * Math.cos(t * .6)}px) scale(${1.05 + .03 * Math.sin(t * .5)})`;
      glow.style.opacity = .35 + .65 * UI.pulse(t, ACC, .22);
      glow2.style.opacity = .25 + .75 * UI.pulse(t, B, .25);
    },
  });

  /* ---------- 1. logo hit (bar 1) ---------- */
  let flash, ring, icon, wm, tag2, g1;
  FILM.scene({
    id: 'logo', t0: B[0], t1: B[1],
    build(root) {
      g1 = el('div', 'position:absolute;inset:0;transform-origin:540px 900px;will-change:transform', root);
      ring = el('div', 'position:absolute;left:340px;top:660px;width:400px;height:400px;border-radius:50%;border:4px solid rgba(255,255,255,.65);will-change:transform', g1);
      icon = el('img', 'position:absolute;left:340px;top:660px;width:400px;height:400px;border-radius:92px;box-shadow:0 60px 140px rgba(255,45,122,.35),0 30px 60px rgba(0,0,0,.6);will-change:transform', g1); icon.src = ICON; icon.decoding = 'sync';
      UI.pending.push(icon.decode().catch(() => {}));
      wm = UI.kine(g1, 'Tikify', { y: 1110, size: 170, weight: 900, ls: -0.045 });
      tag2 = UI.kine(g1, 'Save TikTok sounds. Play them like music.', { y: 1330, size: 54, weight: 400, font: 'Instrument Serif', italic: true, ls: 0 });
      flash = el('div', 'position:absolute;inset:0;background:#fff;mix-blend-mode:screen;pointer-events:none', root);
      UI.blurWin(DROP, DROP + .3, 10); UI.blurWin(B[1] - .32, B[1] + .02, 10);
    },
    update(lt, t) {
      flash.style.opacity = .85 * (1 - E.out(2)(p(t, DROP, DROP + .11)));
      const sIn = FILM.zoom(t, DROP, DROP + .5, .28, 1, E.out(3));
      const push = 1 + .05 * E.glide(p(t, DROP + .3, B[1]));
      const qo = E.in(3)(p(t, B[1] - .32, B[1])), yOut = -1000 * qo;                 // flies up and out into the cut
      g1.style.transform = `translate(0,${yOut}px) scale(${sIn * push})`;
      const qo2 = E.in(3)(p(t - 1 / FILM.fps, B[1] - .32, B[1])); wm.blur(g1, 0, Math.min(44, Math.abs(yOut + 1000 * qo2) * FILM.fps / 900 * 14));
      icon.style.transform = `rotate(${-6 + 6 * E.out(3)(p(t, DROP, DROP + .6)) + 1.5 * Math.sin((t - DROP) * 2)}deg) scale(${1 + .015 * Math.sin((t - DROP) * 6)})`;
      const rq = p(t, DROP, DROP + .7); ring.style.transform = `scale(${1 + 2.6 * E.out(2)(rq)})`; ring.style.opacity = (1 - rq) * .9;
      UI.rise(wm, t, beat(1, 2) + .02, .035, .5); wm.box.style.opacity = t >= beat(1, 2) ? 1 : 0; wm.box.style.transform = drift(t, 6);
      UI.rise(tag2, t, beat(1, 3) + .02, .012, .45); tag2.box.style.opacity = t >= beat(1, 3) ? 1 : 0; tag2.box.style.transform = drift(t + 2, 5);
    },
    zoom(lt) { const t = lt + B[0]; return FILM.zoom(t, DROP, DROP + .5, .28, 1, E.out(3)) * (1 + .05 * E.glide(p(t, DROP + .3, B[1]))); },
  });

  /* ---------- 2. paste → find → save (bars 2–3) ---------- */
  let ph2, g2, tapPaste, tapChip, tapSave, w2a, w2b, w2c, pressed;
  const T_PASTE = beat(2, 2), T_FOUND = B[2], T_CHIP = beat(3, 2), T_SCROLL = beat(3, 2) + .2, T_SAVE = beat(3, 3) + .02, T_SAVED = beat(3, 4);
  const DSCR = T.pos.before[1] - T.pos.after[1];
  FILM.scene({
    id: 'add', t0: B[1], t1: B[3],
    build(root) {
      g2 = el('div', 'position:absolute;inset:0;transform-origin:540px 1030px;will-change:transform', root);
      const g2i = el('div', 'position:absolute;inset:0;transform-style:preserve-3d;will-change:transform', g2);
      ph2 = UI.phone(g2i, PW, PL, PT); g2.inner = g2i;
      UI.still(ph2, 'add_empty2');
      tapPaste = UI.tap(ph2, sx(367), sy(75), T_PASTE - .12);
      tapChip = UI.tap(ph2, sx(T.pos.chip[0]), sy(T.pos.chip[1] + DSCR), T_CHIP - .06);
      tapSave = UI.tap(ph2, sx(T.pos.after[0]), sy(T.pos.after[1]), T_SAVE - .08);
      pressed = el('div', `position:absolute;left:${sx(T.pos.after[0]) - 230}px;top:${sy(T.pos.after[1]) - 30}px;width:460px;height:60px;border-radius:30px;background:rgba(0,0,0,.28);display:none`, ph2.fx);
      w2a = UI.kine(root, 'PASTE THE LINK', { y: 262, size: 84, weight: 900 });
      w2b = UI.kine(root, 'FOUND IT.', { y: 232, size: 128, weight: 900, grad: true, ls: -0.05 });
      w2c = UI.kine(root, 'SAVED.', { y: 232, size: 136, weight: 900, grad: true, ls: -0.05 });
      UI.blurWin(B[1], B[1] + .45, 10); UI.blurWin(T_PASTE - .05, T_PASTE + .45, 8); UI.blurWin(T_FOUND - .05, T_FOUND + .45, 8); UI.blurWin(T_SAVED - .05, T_SAVED + .45, 8); UI.blurWin(B[3] - .25, B[3] + .3, 8);
    },
    update(lt, t) {
      // enters from below (continuing the logo's upward exit), orbits throughout, pushes into the card after FOUND IT
      const qIn = E.out(3)(p(t, B[1], B[1] + .45)), yIn = 1100 * (1 - qIn);
      const sIn = FILM.zoom(t, B[1], B[1] + .45, .8, 1, E.out(3));
      const push = FILM.zoom(t, T_FOUND, T_FOUND + .7, 1, 1.2, E.glide) / FILM.zoom(t, T_SAVE - .25, T_SAVE + .05, 1, 1.2, E.smooth);
      const snare = UI.punch(t, T_FOUND, 1.07, .34) * UI.punch(t, T_SAVED, 1.08, .34);
      const outN = FILM.needle(t, B[3], 1, 1.12, .2);
      g2.style.transform = `translate(0,${yIn}px) scale(${sIn * push * snare * outN})`;
      g2.style.transformOrigin = (t >= T_FOUND && t < T_SAVE) ? `${PL + 14 + sx(T.pos.cover[0])}px ${PT + 14 + sy(T.pos.cover[1] + (t < T_SCROLL ? DSCR : 0))}px` : '540px 1030px';
      g2.inner.style.transform = orbit(t, t < B[1] + .5 ? E.out(2)(p(t, B[1], B[1] + .5)) : 1);
      const qv = Math.abs(yIn - 1100 * (1 - E.out(3)(p(t - 1 / FILM.fps, B[1], B[1] + .45)))) * FILM.fps; w2a.blur(g2, 0, Math.min(40, qv / 900 * 12));
      pressed.style.display = 'none';
      if (t < T_PASTE) UI.still(ph2, 'add_empty2');
      else if (t < T_FOUND) UI.seq(ph2, 'add_lookup', t - T_PASTE, 'wall', .36, (1.54 - .36) / (T_FOUND - T_PASTE));
      else if (t < T_CHIP) UI.still(ph2, 'add_preview');
      else if (t < T_SCROLL) UI.still(ph2, 'add_preview_checked');
      else if (t < T_SAVED) { UI.still(ph2, 'add_preview_scrolled'); if (t >= T_SAVE - .02) pressed.style.display = 'block'; }
      else UI.seq(ph2, 'add_save', t - T_SAVED, 'wall', 1.86, 1.0);
      tapPaste(t); tapChip(t); tapSave(t);
      if (t < T_FOUND) { const q = UI.smearIn(w2a, t, T_PASTE - .02, .4, -1000); if (q >= 1) w2a.box.style.transform = drift(t, 8); w2b.box.style.opacity = 0; } else w2a.box.style.opacity = 0;
      if (t >= T_FOUND && t < T_SAVED) { const q = UI.smearIn(w2b, t, T_FOUND, .38, 1000); w2b.box.style.transform += ` scale(${UI.punch(t, T_FOUND, 1.25, .36)})`; if (q >= 1) w2b.box.style.transform = drift(t + 1, 8) + ` scale(${UI.punch(t, T_FOUND, 1.25, .36)})`; } else if (t >= T_SAVED) w2b.box.style.opacity = 0;
      if (t >= T_SAVED) { w2c.box.style.opacity = 1; const q = E.out(3)(p(t, T_SAVED, T_SAVED + .3)); w2c.box.style.transform = drift(t + 3, 8) + ` scale(${.6 + .4 * q + (UI.punch(t, T_SAVED, 1.18, .4) - 1)})`; w2c.blur(w2c.box, (1 - q) * 18, (1 - q) * 18); } else w2c.box.style.opacity = 0;
    },
    zoom(lt) { const t = lt + B[1]; return FILM.zoom(t, B[1], B[1] + .45, .8, 1, E.out(3)) * FILM.needle(t, B[3], 1, 1.12, .2); },
  });

  /* ---------- 3. player (bar 4, first half) ---------- */
  let ph3, g3, w3b;
  const T_OUT = beat(4, 4), T_SHUF = beat(4, 2), T_REP = beat(4, 3);
  FILM.scene({
    id: 'play', t0: B[3], t1: T_OUT,
    build(root) {
      g3 = el('div', 'position:absolute;inset:0;transform-origin:540px 900px;will-change:transform', root);
      const g3i = el('div', 'position:absolute;inset:0;transform-style:preserve-3d;will-change:transform', g3); g3.inner = g3i;
      ph3 = UI.phone(g3i, PW, PL, PT);
      UI.still(ph3, 'add_saved_notoast'); UI.still(ph3, 'player', ph3.img2); ph3.img2.style.display = 'block';
      w3b = UI.kine(root, 'Play it like music.', { y: 236, size: 104, weight: 400, font: 'Instrument Serif', italic: true, ls: 0 });
      UI.blurWin(T_SHUF - .03, T_SHUF + .2, 6); UI.blurWin(T_REP - .03, T_REP + .2, 6); UI.blurWin(T_OUT - .3, T_OUT + .02, 10);
    },
    update(lt, t) {
      const inN = FILM.needle(t, B[3], 1, 1.12, .2) / FILM.zoom(t, B[3] + .25, B[3] + .8, 1, 1.12, E.smooth);
      const push = FILM.zoom(t, B[3] + .1, T_OUT, 1, 1.22, E.glide);
      const qo = E.in(3)(p(t, T_OUT - .3, T_OUT)), yOut = -1100 * qo;                 // flies up and out
      g3.style.transform = `translate(0,${yOut}px) scale(${inN * push * UI.punch(t, T_SHUF, 1.04, .3) * UI.punch(t, T_REP, 1.04, .3)})`;
      g3.inner.style.transform = orbit(t, 1);
      const qo2 = E.in(3)(p(t - 1 / FILM.fps, T_OUT - .3, T_OUT)); w3b.blur(g3, 0, Math.min(44, Math.abs(yOut + 1100 * qo2) * FILM.fps / 900 * 14));
      // mirrored whip inside the screen: saved screen pans out left, the player pans in from the right
      const xo = -540 * E.in(2)(p(t, B[3] - .3, B[3])), xi = 540 * (1 - E.out(2)(p(t, B[3], B[3] + .3)));
      ph3.img.style.transform = `translate(${t < B[3] ? xo : -600}px,0)`; ph3.img.style.display = t < B[3] + .05 ? 'block' : 'none';
      ph3.img2.style.transform = `translate(${xi}px,0)`;
      UI.still(ph3, t < T_SHUF ? 'player' : t < T_REP ? 'player_shuffle' : 'z_player_shuffle_repeat1', ph3.img2);
      w3b.box.style.opacity = 1; UI.rise(w3b, t, B[3] + .02, .018, .5); w3b.box.style.transform = drift(t, 7) + ` translate(0,${-700 * qo}px)`;
    },
    zoom(lt) { const t = lt + B[3]; return FILM.needle(t, B[3], 1, 1.12, .2) / FILM.zoom(t, B[3] + .25, B[3] + .8, 1, 1.12, E.smooth) * FILM.zoom(t, B[3] + .1, T_OUT, 1, 1.22, E.glide); },
  });

  /* ---------- 4. end card (bar 4, second half → end) ---------- */
  let g6, icon6, wm6, url6, chips6 = [], ring6;
  FILM.scene({
    id: 'end', t0: T_OUT, t1: END,
    build(root) {
      g6 = el('div', 'position:absolute;inset:0;transform-origin:540px 900px;will-change:transform', root);
      ring6 = el('div', 'position:absolute;left:340px;top:640px;width:400px;height:400px;border-radius:50%;border:4px solid rgba(255,255,255,.65);will-change:transform;opacity:0', g6);
      icon6 = el('img', 'position:absolute;left:340px;top:640px;width:400px;height:400px;border-radius:92px;box-shadow:0 60px 140px rgba(255,45,122,.35),0 30px 60px rgba(0,0,0,.6);will-change:transform', g6); icon6.src = ICON; icon6.decoding = 'sync';
      wm6 = UI.kine(g6, 'Tikify', { y: 1080, size: 170, weight: 900, ls: -0.045 });
      url6 = UI.kine(g6, 'tikify.no', { y: 1290, size: 88, weight: 800, grad: true, ls: -0.03 });
      const labels = ['Free', 'No account', 'Works offline'];
      const row = el('div', 'position:absolute;left:0;top:1440px;width:1080px;display:flex;justify-content:center;gap:18px', g6);
      chips6 = labels.map((l) => { const c = el('div', 'padding:18px 32px;border-radius:999px;font:600 34px/1 Inter;color:#f2f2f5;will-change:transform', row, l); c.className = 'glass'; return c; });
      UI.blurWin(T_OUT, T_OUT + .45, 10); UI.blurWin(B[4] - .05, B[4] + .3, 8);
    },
    update(lt, t) {
      const qIn = E.out(3)(p(t, T_OUT, T_OUT + .45)), yIn = 900 * (1 - qIn);                    // comes up from below (same direction)
      const sIn = FILM.zoom(t, T_OUT, T_OUT + .45, .5, 1, E.out(3));
      const push = 1 + .06 * E.glide(p(t, T_OUT + .3, END));
      g6.style.transform = `translate(0,${yIn}px) scale(${sIn * push * UI.punch(t, B[4], 1.06, .35)})`;
      const qv = Math.abs(yIn - 900 * (1 - E.out(3)(p(t - 1 / FILM.fps, T_OUT, T_OUT + .45)))) * FILM.fps; wm6.blur(g6, 0, Math.min(40, qv / 900 * 12));
      icon6.style.transform = `rotate(${2 * Math.sin((t - T_OUT) * 1.6)}deg) scale(${1 + .02 * Math.sin((t - T_OUT) * 2.4)}) translate(0,${6 * Math.sin((t - T_OUT) * 1.2)}px)`;
      const rq = p(t, B[4], B[4] + .7); ring6.style.opacity = t >= B[4] ? (1 - rq) * .9 : 0; ring6.style.transform = `scale(${1 + 2.6 * E.out(2)(rq)})`;
      UI.rise(wm6, t, T_OUT + .12, .035, .5); wm6.box.style.opacity = t >= T_OUT + .1 ? 1 : 0; wm6.box.style.transform = drift(t, 5);
      const qu = E.out(3)(p(t, T_OUT + .28, T_OUT + .68)); url6.box.style.opacity = t >= T_OUT + .28 ? 1 : 0; url6.box.style.transform = drift(t + 2, 5) + ` translate(0,${(1 - qu) * 80}px) scale(${.8 + .2 * qu + (UI.punch(t, B[4], 1.1, .35) - 1)})`;
      chips6.forEach((c, i) => { const t0 = B[4] + i * .18, q = FILM.pop(t, t0, .5); c.style.opacity = clamp(q * 3); c.style.transform = `translate(0,${(1 - q) * 40 + 4 * Math.sin(t * 2 + i)}px) scale(${.6 + .4 * q})`; });
    },
    zoom(lt) { const t = lt + T_OUT; return FILM.zoom(t, T_OUT, T_OUT + .45, .5, 1, E.out(3)) * (1 + .06 * E.glide(p(t, T_OUT + .3, END))); },
  });
})();
